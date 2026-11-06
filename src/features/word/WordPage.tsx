import { useState } from 'react';
import type { Word } from '../../domain/vocabulary';
import { repository } from '../../data/repository';
import { useAsync } from '../../hooks/useAsync';
import { Button, EmptyState, ErrorNotice, Icon, IconButton, Loading } from '../../components/ui';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { MeaningContent } from './MeaningContent';

interface Props {
  id: string;
  savedWord?: Word;
  onBack: () => void;
  onAdd: (word: Word) => Promise<void>;
  onChanged: () => void;
  onNotify: (message: string) => void;
}

export function WordPage({ id, savedWord, onBack, onAdd, onChanged, onNotify }: Props) {
  const result = useAsync(signal => repository.getWord(id, signal), [id]);
  const [editedWord, setEditedWord] = useState<Word>();
  const [activeId, setActiveId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const word = editedWord ?? savedWord ?? result.data;
  const active = word?.meanings.find(item => item.id === activeId) ?? word?.meanings[0];

  async function removeMeaning() {
    if (!word || !active || busy) return;
    if (savedWord && word.meanings.length === 1) { setConfirmDelete(true); return; }
    setError(''); setBusy(true);
    try {
      const updated = savedWord ? await repository.deleteMeaning(id, active.id) :
        { ...word, meanings: word.meanings.filter(item => item.id !== active.id) };
      setEditedWord(updated); setActiveId(updated.meanings[0]?.id);
      if (savedWord) onChanged();
      onNotify(savedWord ? 'Meaning permanently removed from your card.' : 'Meaning removed from this draft.');
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not remove meaning.'); }
    finally { setBusy(false); }
  }

  async function removeWord() {
    setBusy(true); setError('');
    try { await repository.deleteWord(id); onChanged(); onNotify('Word removed from your library.'); onBack(); }
    catch (error) { setConfirmDelete(false); setError(error instanceof Error ? error.message : 'Could not remove word.'); }
    finally { setBusy(false); }
  }

  async function add() {
    if (!word) return;
    setBusy(true); setError('');
    try { await onAdd(word); }
    catch (error) { setError(error instanceof Error ? error.message : 'Could not add word.'); }
    finally { setBusy(false); }
  }

  return <section className="page word-page" aria-label="Word card">
    <div className="flex items-center justify-between">
      <IconButton icon="back" label="Back" onClick={onBack} />
      {savedWord && <IconButton icon="trash" label="Delete word" disabled={busy} onClick={() => setConfirmDelete(true)} />}
    </div>
    {error && <ErrorNotice message={error} />}
    {result.loading && !word ? <Loading label="Opening word card…" /> : !word ?
      <ErrorNotice message={result.error ?? 'Word not found.'} onRetry={result.retry} /> : <>
      {word.meanings.length > 0 && <div className="meaning-controls">
        <div className="segmented-control" role="tablist" aria-label="Word meanings">
          {word.meanings.map((meaning, index) => <button key={meaning.id} role="tab" id={`tab-${meaning.id}`}
            aria-selected={active?.id === meaning.id} aria-controls={`panel-${meaning.id}`}
            tabIndex={active?.id === meaning.id ? 0 : -1} onClick={() => setActiveId(meaning.id)}
            onKeyDown={event => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
              event.preventDefault();
              const count = word.meanings.length;
              const target = event.key === 'Home' ? 0 : event.key === 'End' ? count - 1 :
                (index + (event.key === 'ArrowRight' ? 1 : -1) + count) % count;
              const next = word.meanings[target]; setActiveId(next.id);
              document.getElementById(`tab-${next.id}`)?.focus();
            }}>meaning {index + 1}</button>)}
        </div>
        <label className={`keep-meaning ${busy ? 'opacity-60' : ''}`}>
          <span>Keep this meaning to the word card.</span>
          <input aria-label="Keep this meaning to the word card" type="checkbox" checked disabled={busy}
            onChange={() => void removeMeaning()} /><span className="checkbox-mark"><Icon name="check" /></span>
        </label>
      </div>}
      {active ? <MeaningContent word={word.text} meaning={active} /> :
        <EmptyState title="No meanings selected">Go back and reopen this word to start a new draft.</EmptyState>}
      {!savedWord && <div className="bottom-action"><Button className="w-full" disabled={busy || !word.meanings.length} onClick={() => void add()}>
        <Icon name="plus" />{busy ? 'Adding…' : 'Add This Word'}</Button></div>}
    </>}
    {confirmDelete && <ConfirmDialog title={`Remove “${word?.text ?? 'this word'}”?`}
      description="This word and its saved meanings will be removed from your library." busy={busy}
      onCancel={() => setConfirmDelete(false)} onConfirm={() => void removeWord()} />}
  </section>;
}
