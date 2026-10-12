import React from 'react';
import { useRipple } from '../../hooks/useRipple';

export interface FabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required for screen readers / TalkBack. */
  label: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'surface';
  children: React.ReactNode;
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-10 w-10 [&>*]:w-4 [&>*]:h-4',
  md: 'h-14 w-14 [&>*]:w-6 [&>*]:h-6',
  lg: 'h-16 w-16 [&>*]:w-7 [&>*]:h-7',
};

/**
 * Material floating action button. Sized at 56dp (the M3 default) so it is
 * comfortably reachable with a thumb on a phone in one-handed use.
 */
export const Fab: React.FC<FabProps> = ({
  label,
  size = 'md',
  variant = 'primary',
  className = '',
  children,
  ...rest
}) => {
  const ripple = useRipple();

  return (
    <button
      {...rest}
      aria-label={label}
      title={label}
      {...ripple}
      className={[
        'ripple-host inline-flex items-center justify-center rounded-2xl',
        'shadow-m3-3 transition-transform duration-200 ease-m3-emphasized active:scale-90',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-dark',
        variant === 'primary'
          ? 'bg-primary-500 text-white hover:bg-primary-600'
          : 'bg-white text-slate-800 dark:bg-slate-800 dark:text-white',
        SIZE_CLASSES[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  );
};

export default Fab;
