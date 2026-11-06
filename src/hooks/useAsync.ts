import { useEffect, useState } from 'react';

export function useAsync<T>(load: (signal: AbortSignal) => Promise<T>, dependencies: unknown[]) {
  const [state, setState] = useState<{ data?: T; loading: boolean; error?: string }>({ loading: true });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true });
    load(controller.signal).then(data => {
      if (!controller.signal.aborted) setState({ data, loading: false });
    }).catch(error => {
      if (!controller.signal.aborted) setState({ loading: false, error: error instanceof Error ? error.message : 'Something went wrong.' });
    });
    return () => controller.abort();
  }, [...dependencies, attempt]);
  return { ...state, retry: () => setAttempt(value => value + 1) };
}
