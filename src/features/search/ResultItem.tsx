import type { Word } from '../../domain/vocabulary';
import { Button, Icon } from '../../components/ui';

interface Props {
  word: Word;
  status: 'new' | 'added' | 'just-added';
  busy: boolean;
  onAdd: () => void;
  onOpen: () => void;
}

export function ResultItem({ word, status, busy, onAdd, onOpen }: Props) {
  return <article className={`result-item ${status === 'new' ? 'is-new' : ''}`} aria-label={word.text}>
    <div className="min-w-0 flex flex-col items-start gap-1">
      <span className={`status-badge status-${status}`}>
        {status === 'new' ? 'New' : status === 'just-added' ? 'Just added' : 'Already Added'}
      </span>
      <h3 className="word-title">{word.text}</h3>
      {word.meanings[0]?.translation && <p className="translation-small" lang="fa" dir="rtl">{word.meanings[0].translation}</p>}
    </div>
    <div className="flex shrink-0 flex-col items-stretch gap-2">
      {status === 'new' && <Button variant="add" size="small" disabled={busy} onClick={onAdd}>
        {busy ? 'Adding…' : 'Add word'}<Icon name="result-plus" /></Button>}
      <Button variant={status === 'new' ? 'secondary' : 'ghost'} size="small" onClick={onOpen}>
        View word<Icon name="result-chevron" /></Button>
    </div>
  </article>;
}
