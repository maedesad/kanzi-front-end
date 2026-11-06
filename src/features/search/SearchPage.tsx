import { useState } from 'react';
import type { SearchResults, Word } from '../../domain/vocabulary';
import { repository } from '../../data/repository';
import { useAsync } from '../../hooks/useAsync';
import { SearchBar } from '../../components/SearchBar';
import { EmptyState, ErrorNotice, Icon, IconButton, Loading } from '../../components/ui';
import { ResultItem } from './ResultItem';

interface Props {
  discover: boolean;
  library: Word[];
  revision: number;
  justAdded: Set<string>;
  initialQuery: string;
  onQuery: (value: string) => void;
  onBack: () => void;
  onOpen: (id: string) => void;
  onAdd: (word: Word) => Promise<void>;
}

export function SearchPage(props: Props) {
  const { discover, initialQuery, onQuery, library, revision } = props;
  const bilingual = repository.capabilities.translations;
  const [value, setValue] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const result = useAsync<SearchResults>(async signal => {
    if (!query) return { match: [], suggested: [] };
    return discover ? repository.searchWords(query, signal) :
      { match: await repository.listWords(query, signal), suggested: [] };
  }, [query, discover, revision]);
  const total = (result.data?.match.length ?? 0) + (result.data?.suggested.length ?? 0);
  async function add(word: Word) {
    setBusyId(word.id); setError('');
    try { await props.onAdd(word); } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not add this word.');
    } finally { setBusyId(null); }
  }
  function renderWord(word: Word) {
    if (!discover) return <button key={word.id} className="word-row text-left" onClick={() => props.onOpen(word.id)}>
      <span className="min-w-0"><span className="word-title block">{word.text}</span>
        <span className="phonetic">{word.meanings[0]?.pronunciation}</span></span><Icon name="chevron" /></button>;
    const saved = library.some(item => item.id === word.id);
    return <ResultItem key={word.id} word={word} busy={busyId !== null}
      status={!saved ? 'new' : props.justAdded.has(word.id) ? 'just-added' : 'added'}
      onAdd={() => void add(word)} onOpen={() => props.onOpen(word.id)} />;
  }
  return <section className="page search-page" aria-label={discover ? 'Add new vocabulary' : 'Search your library'}>
    <IconButton icon="back" label="Back to library" onClick={props.onBack} />
    {discover && <header className="page-header"><h1>Add New Vocabulary</h1>
      <p className="search-description">{bilingual ? <>Search for a word in your second language <strong>or enter its meaning in your first language</strong> to discover matching vocabulary.</> :
        'Search for an English word to create its vocabulary card. Translations and suggested words are not available yet.'}</p></header>}
    <SearchBar value={value} onChange={setValue} autoFocus placeholder={bilingual ? 'English or فارسی' : 'Type an English word…'} onSearch={next => {
      setQuery(next); onQuery(next); setError('');
    }} />
    {error && <ErrorNotice message={error} />}
    {result.error && <ErrorNotice message={result.error} onRetry={result.retry} />}
    {query && result.loading ? <Loading label="Finding your words…" /> : !result.error && query ? <>
      <p className="caption" role="status">Found {total} {total === 1 ? 'word' : 'words'}</p>
      {!total ? <EmptyState title="No matching words"><p>{bilingual ? 'Try another English word or Persian meaning.' : 'Try another English word.'}</p></EmptyState> :
        <div className="search-sections">{(['match', 'suggested'] as const).map(group => {
          const words = result.data?.[group] ?? [];
          return words.length ? <section key={group} aria-label={group === 'match' ? 'Match' : 'Suggested'}>
            {discover && <h2 className="section-title">{group === 'match' ? 'Match' : 'Suggested'}</h2>}
            <div className="word-grid">{words.map(renderWord)}</div></section> : null;
        })}</div>}
    </> : !query && <EmptyState title={discover ? 'Find your next word' : 'Find a familiar word'}>
      <p>{bilingual ? 'Search in English or فارسی.' : 'Search in English.'}</p>{discover && <p className="mt-1">{bilingual ? 'Try “present”, “هدیه” or “responsibility”.' : 'Try “present” or “responsibility”.'}</p>}
    </EmptyState>}
  </section>;
}
