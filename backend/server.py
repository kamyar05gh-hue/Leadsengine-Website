from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import asyncio
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Annotated, Any, Optional

import bcrypt
import jwt
import requests
from bson import ObjectId
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, BeforeValidator, EmailStr, Field, ConfigDict
from starlette.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("leadsengine")

client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]

JWT_ALGORITHM = "HS256"
app = FastAPI(title="Leadsengine API")
api_router = APIRouter(prefix="/api")

PyObjectId = Annotated[str, BeforeValidator(str)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    @classmethod
    def from_mongo(cls, doc: dict):
        return cls.model_validate(doc)


class User(BaseDocument):
    email: str
    name: str
    role: str


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    user: User


# ---------------------------------------------------------------- auth helpers


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "type": "access",
    }
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> User:
    token = request.cookies.get("access_token")
    if not token:
        header = request.headers.get("Authorization", "")
        if header.startswith("Bearer "):
            token = header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        doc = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if not doc:
        raise HTTPException(status_code=401, detail="User not found")
    return User.from_mongo(doc)


MAX_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


async def check_lockout(identifier: str) -> None:
    doc = await db.login_attempts.find_one({"identifier": identifier})
    if not doc:
        return
    if doc.get("count", 0) >= MAX_ATTEMPTS:
        last = doc.get("last_attempt")
        if isinstance(last, str):
            last = datetime.fromisoformat(last)
        if last and datetime.now(timezone.utc) - last < timedelta(minutes=LOCKOUT_MINUTES):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")
        await db.login_attempts.delete_one({"identifier": identifier})


# ---------------------------------------------------------------- auth routes


@api_router.get("/")
async def root():
    return {"service": "leadsengine", "status": "ok"}


@api_router.post("/auth/login", response_model=TokenOut)
async def login(payload: LoginInput, request: Request):
    email = payload.email.lower()
    identifier = f"{request.client.host if request.client else 'unknown'}:{email}"
    await check_lockout(identifier)
    doc = await db.users.find_one({"email": email})
    if not doc or not verify_password(payload.password, doc["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"last_attempt": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await db.login_attempts.delete_one({"identifier": identifier})
    user = User.from_mongo(doc)
    return TokenOut(access_token=create_access_token(str(doc["_id"]), email), user=user)


@api_router.get("/auth/me", response_model=User)
async def me(user: User = Depends(get_current_user)):
    return user


# ---------------------------------------------------------------- analytics

POSTHOG_HOST = os.environ.get("POSTHOG_API_HOST", "https://eu.i.posthog.com")
POSTHOG_PROJECT_ID = os.environ.get("POSTHOG_PROJECT_ID", "")
POSTHOG_PERSONAL_KEY = os.environ.get("POSTHOG_PERSONAL_API_KEY", "")


def pv(days: int) -> str:
    return (
        f"event = '$pageview' AND timestamp >= now() - INTERVAL {days} DAY"
    )


QUERIES: dict[str, str] = {
    "summary": (
        "SELECT uniq(person_id) AS visitors, count() AS pageviews, "
        "uniq(properties.$session_id) AS sessions FROM events WHERE {pv}"
    ),
    "daily": (
        "SELECT toDate(timestamp) AS day, uniq(person_id) AS visitors, count() AS pageviews, "
        "uniq(properties.$session_id) AS sessions FROM events WHERE {pv} GROUP BY day ORDER BY day"
    ),
    "channels": (
        "SELECT coalesce(nullIf(properties.$channel_type, ''), 'Direct') AS label, "
        "uniq(properties.$session_id) AS value FROM events WHERE {pv} GROUP BY label ORDER BY value DESC"
    ),
    "top_pages": (
        "SELECT properties.$pathname AS label, count() AS value, "
        "uniq(properties.$session_id) AS sessions FROM events WHERE {pv} "
        "GROUP BY label ORDER BY value DESC LIMIT 12"
    ),
    "devices": (
        "SELECT coalesce(nullIf(properties.$device_type, ''), 'Desktop') AS label, "
        "uniq(person_id) AS value FROM events WHERE {pv} GROUP BY label ORDER BY value DESC"
    ),
    "os": (
        "SELECT coalesce(nullIf(properties.$os, ''), 'Unknown') AS label, uniq(person_id) AS value "
        "FROM events WHERE {pv} GROUP BY label ORDER BY value DESC LIMIT 8"
    ),
    "browsers": (
        "SELECT coalesce(nullIf(properties.$browser, ''), 'Unknown') AS label, uniq(person_id) AS value "
        "FROM events WHERE {pv} GROUP BY label ORDER BY value DESC LIMIT 8"
    ),
    "countries": (
        "SELECT coalesce(nullIf(properties.$geoip_country_name, ''), 'Unknown') AS label, "
        "uniq(person_id) AS value FROM events WHERE {pv} GROUP BY label ORDER BY value DESC LIMIT 10"
    ),
    "cities": (
        "SELECT coalesce(nullIf(properties.$geoip_city_name, ''), 'Unknown') AS label, "
        "uniq(person_id) AS value FROM events WHERE {pv} GROUP BY label ORDER BY value DESC LIMIT 10"
    ),
    "conversions": (
        "SELECT countIf(position(coalesce(properties.$el_class, ''), 'pm-cta-btn') > 0) AS primary_clicks, "
        "uniqIf(properties.$session_id, position(coalesce(properties.$el_class, ''), 'pm-cta-btn') > 0) AS primary_sessions, "
        "countIf(position(coalesce(properties.$el_class, ''), 'pm-cta') > 0 "
        "AND position(coalesce(properties.$el_class, ''), 'pm-cta-btn') = 0) AS widget_clicks, "
        "uniqIf(properties.$session_id, position(coalesce(properties.$el_class, ''), 'pm-cta') > 0 "
        "AND position(coalesce(properties.$el_class, ''), 'pm-cta-btn') = 0) AS widget_sessions "
        "FROM events WHERE event = '$autocapture' AND timestamp >= now() - INTERVAL {days} DAY"
    ),
    "web_vitals": (
        "SELECT quantile(0.75)(toFloat64OrNull(toString(properties.$web_vitals_LCP_value))) AS lcp, "
        "quantile(0.75)(toFloat64OrNull(toString(properties.$web_vitals_INP_value))) AS inp, "
        "quantile(0.75)(toFloat64OrNull(toString(properties.$web_vitals_CLS_value))) AS cls, "
        "quantile(0.75)(toFloat64OrNull(toString(properties.$web_vitals_FCP_value))) AS fcp "
        "FROM events WHERE event = '$web_vitals' AND timestamp >= now() - INTERVAL {days} DAY"
    ),
    "daily_lcp": (
        "SELECT toDate(timestamp) AS day, "
        "quantile(0.75)(toFloat64OrNull(toString(properties.$web_vitals_LCP_value))) AS lcp "
        "FROM events WHERE event = '$web_vitals' AND timestamp >= now() - INTERVAL {days} DAY "
        "GROUP BY day ORDER BY day"
    ),
    "exceptions": (
        "SELECT coalesce(nullIf(properties.$exception_message, ''), 'Unknown') AS label, count() AS value "
        "FROM events WHERE event = '$exception' AND timestamp >= now() - INTERVAL {days} DAY "
        "GROUP BY label ORDER BY value DESC LIMIT 10"
    ),
    "active_now": (
        "SELECT uniq(person_id) AS value FROM events "
        "WHERE event = '$pageview' AND timestamp >= now() - INTERVAL 5 MINUTE"
    ),
}


def run_hogql(sql: str) -> dict[str, Any]:
    url = f"{POSTHOG_HOST}/api/projects/{POSTHOG_PROJECT_ID}/query/"
    res = requests.post(
        url,
        headers={"Authorization": f"Bearer {POSTHOG_PERSONAL_KEY}", "Content-Type": "application/json"},
        json={"query": {"kind": "HogQLQuery", "query": sql}},
        timeout=25,
    )
    if res.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"PostHog error {res.status_code}")
    return res.json()


@api_router.get("/analytics/{dataset}")
async def analytics(dataset: str, days: int = 30, user: User = Depends(get_current_user)):
    if dataset not in QUERIES:
        raise HTTPException(status_code=404, detail="Unknown dataset")
    if not POSTHOG_PERSONAL_KEY or not POSTHOG_PROJECT_ID:
        raise HTTPException(status_code=503, detail="posthog_not_configured")
    sql = QUERIES[dataset].format(pv=pv(days), days=days)
    payload = await asyncio.to_thread(run_hogql, sql)
    columns = [str(c) for c in payload.get("columns", [])]
    rows = [dict(zip(columns, row)) for row in payload.get("results", [])]
    return {"dataset": dataset, "days": days, "columns": columns, "rows": rows}


# ---------------------------------------------------------------- startup

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    email = os.environ["ADMIN_EMAIL"].lower()
    password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": email})
    if existing is None:
        await db.users.insert_one(
            {
                "email": email,
                "password_hash": hash_password(password),
                "name": "Leadsengine Admin",
                "role": "admin",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        logger.info("Seeded dashboard admin %s", email)
    elif not verify_password(password, existing["password_hash"]):
        await db.users.update_one(
            {"email": email}, {"$set": {"password_hash": hash_password(password)}}
        )
        logger.info("Updated dashboard admin password")


@app.on_event("shutdown")
async def shutdown():
    client.close()
