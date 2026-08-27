/**
 * The Leads Engine / Future Media team, shown on the main page (a compact
 * grid) and on the "Über uns" page (the same grid, lower emphasis).
 *
 * `role` is the English default. A German-specific phrasing lives in
 * `about.roles` in each dictionary — see `useTeamRole` in `components/Team.tsx`
 * — so a title like "CTO & AI & Software Engineer" is not just a literal
 * translation of the English but written the way it would actually be said.
 *
 * PHOTOS live in `public/team/<slug>.{jpg,png,webp}` — not bundled through
 * Vite — because the same file has to be reachable from the statically
 * generated "Über uns" page (plain Node, no bundler) as well as from this
 * React component. A member with no file yet renders as an initial instead
 * of a broken image; see `public/team/README.md` for exact filenames.
 */
export type TeamMember = {
  slug: string;
  name: string;
  role: string;
};

export const TEAM: TeamMember[] = [
  { slug: "elias", name: "Elias", role: "CEO & Founder" },
  { slug: "livia", name: "Livia", role: "Marketing Manager" },
  { slug: "alex", name: "Alex", role: "Growth & Sales" },
  { slug: "mohie", name: "Mohie", role: "CTO & AI/Software Engineer" },
  { slug: "lara", name: "Lara", role: "Customer Support" },
  { slug: "daniel", name: "Daniel", role: "AI & Software Engineer" },
  { slug: "mahboob", name: "Mahboob", role: "Data Security Advisor" },
];
