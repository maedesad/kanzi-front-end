import type { Meaning } from '../../domain/vocabulary';

function HighlightedExample({ text, word }: { text: string; word: string }) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(\\b${escaped}\\w*\\b)`, 'gi'));
  return <>{parts.map((part, index) => index % 2 ? <strong key={index}>{part}</strong> : part)}</>;
}

export function MeaningContent({ word, meaning }: { word: string; meaning: Meaning }) {
  return <div className="meaning-content" role="tabpanel" id={`panel-${meaning.id}`} aria-labelledby={`tab-${meaning.id}`}>
    <header className="word-heading"><h1>{word}</h1><p className="word-pronunciation">{meaning.pronunciation}</p>
      {meaning.translation ? <p className="word-translation" lang="fa" dir="rtl">{meaning.translation}</p> :
        <p className="text-xs text-muted">Translation not available yet.</p>}</header>
    <section><h2 className="reading-title">Definition:</h2><p className="reading-text mt-2">{meaning.definition}</p></section>
    <section><h2 className="reading-title">Examples:</h2>
      <ol className="example-list">{meaning.examples.map((example, index) =>
        <li className="example-card reading-text" key={index}><HighlightedExample text={example} word={word} /></li>)}</ol>
    </section>
  </div>;
}
