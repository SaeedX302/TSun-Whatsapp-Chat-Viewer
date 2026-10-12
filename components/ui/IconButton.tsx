import React from 'react';
import { useRipple } from '../../hooks/useRipple';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: Android/TalkBack users need a label for icon-only buttons. */
  label: string;
  variant?: 'standard' | 'filled' | 'tonal';
  /** Touch target size; M3 minimum is 48dp. */
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-9 w-9 [&>*]:w-4 [&>*]:h-4',
  md: 'h-11 w-11 [&>*]:w-5 [&>*]:h-5',
  lg: 'h-12 w-12 [&>*]:w-6 [&>*]:h-6',
};

const VARIANT_CLASSES: Record<'standard' | 'filled' | 'tonal', string> = {
  standard:
    'text-slate-700 hover:bg-slate-900/8 active:bg-slate-900/12 dark:text-white dark:hover:bg-white/10 dark:active:bg-white/15',
  filled: 'bg-primary-500 text-white shadow-m3-1 hover:bg-primary-600',
  tonal:
    'bg-primary-100 text-primary-900 hover:bg-primary-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15',
};

/** Material icon button: circular ripple, 48dp touch target, accessible label. */
export const IconButton: React.FC<IconButtonProps> = ({
  label,
  variant = 'standard',
  size = 'md',
  className = '',
  children,
  disabled,
  ...rest
}) => {
  const ripple = useRipple(!disabled);

  return (
    <button
      {...rest}
      disabled={disabled}
      aria-label={label}
      title={label}
      {...ripple}
      className={[
        'ripple-host inline-flex shrink-0 items-center justify-center rounded-full',
        'transition-colors duration-200 ease-m3 active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASSES[variant],
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

export default IconButton;
