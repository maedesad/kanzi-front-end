import { useEffect, useRef } from 'react';
import { Button } from './ui';

interface Props {
  title: string;
  description: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({ title, description, busy, onCancel, onConfirm }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); return () => dialog.current?.close(); }, []);
  return <dialog ref={dialog} className="confirm-dialog" aria-labelledby="dialog-title"
    onCancel={event => { event.preventDefault(); if (!busy) onCancel(); }}>
    <h2 id="dialog-title">{title}</h2><p className="text-sm text-muted leading-6 mt-2">{description}</p>
    <div className="flex justify-end gap-2 mt-6">
      <Button autoFocus size="medium" disabled={busy} onClick={onCancel}>Cancel</Button>
      <Button variant="secondary" size="medium" disabled={busy} onClick={onConfirm}>
        {busy ? 'Removing…' : 'Remove'}
      </Button>
    </div>
  </dialog>;
}
