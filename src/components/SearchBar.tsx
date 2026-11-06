import { useRef, type FormEvent } from 'react';
import { Button, Icon, IconButton } from './ui';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  autoFocus?: boolean;
  busy?: boolean;
  placeholder?: string;
}

export function SearchBar({ value, onChange, onSearch, autoFocus, busy, placeholder = 'English or فارسی' }: Props) {
  const input = useRef<HTMLInputElement>(null);
  function submit(event: FormEvent) { event.preventDefault(); onSearch(value.trim()); }
  return <form className="search-form" role="search" onSubmit={submit}>
    <div className="search-field">
      <Icon name="search" />
      <input ref={input} autoFocus={autoFocus} aria-label="Search vocabulary" dir="auto"
        placeholder={placeholder} value={value} onChange={event => onChange(event.target.value)} />
      {value && <IconButton icon="close" label="Clear search" onClick={() => {
        onChange(''); onSearch(''); input.current?.focus();
      }} />}
    </div>
    <Button type="submit" size="medium" disabled={busy || !value.trim()}>Search</Button>
  </form>;
}
