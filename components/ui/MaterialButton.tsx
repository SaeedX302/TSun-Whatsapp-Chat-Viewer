import React from 'react';
import { useRipple } from '../../hooks/useRipple';

type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface MaterialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  filled:
    'bg-primary-500 text-white shadow-m3-1 hover:bg-primary-600 active:bg-primary-700 disabled:bg-slate-300 dark:disabled:bg-white/10',
  tonal:
    'bg-primary-100 text-primary-900 hover:bg-primary-200 active:bg-primary-300 dark:bg-primary-500/20 dark:text-primary-100 dark:hover:bg-primary-500/30',
  outlined:
    'border border-slate-300 text-slate-700 hover:bg-slate-900/5 active:bg-slate-900/10 dark:border-white/20 dark:text-white dark:hover:bg-white/10',
  text: 'text-primary-700 hover:bg-primary-500/10 active:bg-primary-500/20 dark:text-primary-200',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm rounded-full',
  md: 'h-11 px-6 text-sm rounded-full',
  lg: 'h-12 px-7 text-base rounded-full',
};

/**
 * Material Design 3 button with ripple feedback and a 44px+ touch target, so it
 * is comfortable to hit with a thumb on an Android phone.
 */
export const MaterialButton: React.FC<MaterialButtonProps> = ({
  variant = 'filled',
  size = 'md',
  icon,
  fullWidth,
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
      {...ripple}
      className={[
        'ripple-host inline-flex items-center justify-center gap-2 font-medium tracking-wide',
        'transition-[background-color,box-shadow,transform] duration-200 ease-m3',
        'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-dark',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon}
      {children}
    </button>
  );
};

export default MaterialButton;
