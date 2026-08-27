import { useEffect, useRef, useState, type DependencyList } from 'react';

export interface LiveQueryState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

/**
 * Runs `fn` on mount and whenever `deps` change (pass the app's 30 s `tick`
 * plus `days`). Stale responses are ignored via a request id + cancel flag,
 * so a slow earlier request can never overwrite a newer one.
 */
export function useLiveQuery<T>(fn: () => Promise<T>, deps: DependencyList): LiveQueryState<T> {
  const [state, setState] = useState<LiveQueryState<T>>({
    data: null,
    error: null,
    loading: true,
  });
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const reqId = useRef(0);

  useEffect(() => {
    const id = ++reqId.current;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    fnRef
      .current()
      .then((data) => {
        if (!cancelled && reqId.current === id) {
          setState({ data, error: null, loading: false });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled && reqId.current === id) {
          setState((s) => ({
            data: s.data,
            error: err instanceof Error ? err : new Error(String(err)),
            loading: false,
          }));
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps are the contract
  }, deps);

  return state;
}
