import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type IconName = 'search' | 'chevron' | 'plus' | 'back' | 'trash' | 'check' | 'close' | 'result-plus' | 'result-chevron';

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return <img src={`/assets/${name}.svg`} alt="" aria-hidden="true" className={`icon icon-${name} ${className}`} />;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'add' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  children: ReactNode;
};

export function Button({ variant = 'primary', size = 'large', className = '', ...props }: ButtonProps) {
  return <button className={`button button-${variant} button-${size} ${className}`} {...props} />;
}

export function IconButton({ icon, label, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName; label: string }) {
  return <button className="icon-button" aria-label={label} title={label} {...props}><Icon name={icon} /></button>;
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="empty-state"><span className="empty-mark" aria-hidden="true">Aa</span>
    <h2>{title}</h2><div className="text-muted text-sm leading-7">{children}</div></div>;
}

export function Loading({ label = 'Loading your words…' }: { label?: string }) {
  return <div className="loading" role="status"><span className="spinner" />{label}</div>;
}

export function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="error-notice" role="alert"><p>{message}</p>
    {onRetry && <Button variant="secondary" size="small" onClick={onRetry}>Try again</Button>}</div>;
}
