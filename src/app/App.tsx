import { useEffect, useRef, useState } from 'react';
import type { Word } from '../domain/vocabulary';
import { isDemo, repository } from '../data/repository';
import { useLibrary } from '../hooks/useLibrary';
import { useNavigation, type Route } from './navigation';
import { LibraryPage } from '../features/library/LibraryPage';
import { SearchPage } from '../features/search/SearchPage';
import { WordPage } from '../features/word/WordPage';
import { ErrorNotice, Loading } from '../components/ui';

export function App() {
  const { route, navigate } = useNavigation();
  const library = useLibrary();
  const [justAdded, setJustAdded] = useState(new Set<string>());
  const [queries, setQueries] = useState({ search: '', discover: '' });
  const [toast, setToast] = useState('');
  const returnRoute = useRef<Route>({ page: 'library' });
  const mutationLock = useRef(false);
  const lastWords = useRef<Word[]>([]);
  const hasLoadedLibrary = useRef(false);
  if (library.data) { lastWords.current = library.words; hasLoadedLibrary.current = true; }
  const words = library.data ?? lastWords.current;

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const handler = () => library.refresh();
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [library.refresh]);
  useEffect(() => {
    document.title = route.page === 'word' ? 'Kanzi · Word Card' : route.page === 'discover' ? 'Kanzi · Discover Words' : 'Kanzi · Vocabulary Library';
    document.querySelector<HTMLElement>('main')?.focus();
  }, [route]);

  async function addWord(word: Word) {
    if (mutationLock.current) throw new Error('Another word is being saved. Please try again.');
    mutationLock.current = true;
    try {
      await repository.addWord(word.id, word.meanings.map(meaning => meaning.id));
      setJustAdded(previous => new Set(previous).add(word.id));
      library.refresh(); setToast(`“${word.text}” added to your library.`);
    } finally { mutationLock.current = false; }
  }
  function openWord(id: string) { returnRoute.current = route; navigate({ page: 'word', id }); }
  function openDiscover() {
    setJustAdded(new Set()); setQueries(previous => ({ ...previous, discover: '' }));
    navigate({ page: 'discover' });
  }
  return <div className="app-shell">
    <a className="skip-link" href="#main-content" onClick={event => {
      event.preventDefault(); document.getElementById('main-content')?.focus();
    }}>Skip to content</a>
    <header className="app-bar"><button className="brand" onClick={() => navigate({ page: 'library' })} aria-label="Kanzi home">
      <span className="brand-symbol" aria-hidden="true">k<span>.</span></span><span>kanzi</span></button>
      <span className="brand-caption">A little word. A wider world.</span>
      <span className="language-pair">EN <span aria-hidden="true">↔</span> <span lang="fa" className="font-persian">فا</span></span>
    </header>
    <main id="main-content" tabIndex={-1}>
      {route.page === 'library' && <LibraryPage words={words} loading={library.loading && !words.length}
        error={library.error} onRetry={library.retry} onSearch={() => navigate({ page: 'search' })}
        onAdd={openDiscover} onOpen={openWord} />}
      {(route.page === 'search' || route.page === 'discover') && <SearchPage key={route.page}
        discover={route.page === 'discover'} library={words} revision={library.revision}
        justAdded={justAdded} initialQuery={queries[route.page]}
        onQuery={value => setQueries(previous => ({ ...previous, [route.page]: value }))}
        onBack={() => navigate({ page: 'library' })} onOpen={openWord} onAdd={addWord} />}
      {route.page === 'word' && (!hasLoadedLibrary.current ?
        <div className="page">{library.error ? <ErrorNotice message={library.error} onRetry={library.retry} /> : <Loading />}</div> :
        <WordPage key={route.id} id={route.id} savedWord={words.find(word => word.id === route.id)}
          onBack={() => navigate(returnRoute.current)} onAdd={addWord} onChanged={library.refresh} onNotify={setToast} />)}
    </main>
    {toast && <div className="toast" role="status">{toast}</div>}
    <footer className="app-footer">{isDemo ? 'Demo preview · Sample vocabulary stored in this browser.' : 'Your words, growing with you.'}</footer>
  </div>;
}
