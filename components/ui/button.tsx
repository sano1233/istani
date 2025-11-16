import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-bold transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-primary text-background-dark hover:bg-primary/90': variant === 'primary',
            'bg-white/10 text-white hover:bg-white/20': variant === 'secondary',
            'border border-white/20 text-white hover:bg-white/10': variant === 'outline',
            'text-white hover:bg-white/10': variant === 'ghost',
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-6 text-sm': size === 'md',
            'h-12 px-8 text-base': size === 'lg'
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
