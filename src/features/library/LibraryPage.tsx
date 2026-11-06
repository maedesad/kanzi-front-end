import type { Word } from '../../domain/vocabulary';
import { Button, EmptyState, ErrorNotice, Icon, Loading } from '../../components/ui';

interface Props {
  words: Word[];
  loading: boolean;
  error?: string;
  onRetry: () => void;
  onSearch: () => void;
  onAdd: () => void;
  onOpen: (id: string) => void;
}

export function LibraryPage({ words, loading, error, onRetry, onSearch, onAdd, onOpen }: Props) {
  return <section className="page library-page" aria-labelledby="page-title">
    <header className="page-header"><h1 id="page-title">Vocabulary Library</h1>
      <p className="caption">{words.length} {words.length === 1 ? 'word' : 'words'}</p></header>
    <button className="search-trigger" onClick={onSearch}><Icon name="search" />Search Vocabulary</button>
    {loading ? <Loading /> : error ? <ErrorNotice message={error} onRetry={onRetry} /> :
      words.length ? <div className="word-grid">{words.map(word =>
        <button className="word-row text-left" key={word.id} onClick={() => onOpen(word.id)}>
          <span className="min-w-0"><span className="word-title block">{word.text}</span>
            <span className="phonetic block">{word.meanings[0]?.pronunciation}</span></span>
          <Icon name="chevron" />
        </button>)}</div> : <EmptyState title="Your first word starts here">
        Add a word to begin building your vocabulary library.</EmptyState>}
    <div className="bottom-action"><Button className="w-full" onClick={onAdd}><Icon name="plus" />Add New Word</Button></div>
  </section>;
}
