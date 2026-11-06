import { useEffect, useState } from 'react';

export type Route = { page: 'library' | 'search' | 'discover' } | { page: 'word'; id: string };

function readRoute(): Route {
  const hash = location.hash.slice(1);
  if (hash.startsWith('/word/')) {
    try { return { page: 'word', id: decodeURIComponent(hash.slice(6)) }; } catch { return { page: 'library' }; }
  }
  return { page: hash === '/discover' ? 'discover' : hash === '/search' ? 'search' : 'library' };
}

export function useNavigation() {
  const [route, setRoute] = useState<Route>(readRoute);
  useEffect(() => {
    const update = () => { setRoute(readRoute()); window.scrollTo({ top: 0 }); };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  function navigate(next: Route) {
    location.hash = next.page === 'word' ? `/word/${encodeURIComponent(next.id)}` : `/${next.page}`;
  }
  return { route, navigate };
}
