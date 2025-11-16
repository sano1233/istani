import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, type, ...props }, ref) => {
    return (
      <label className="flex flex-col w-full">
        {label && (
          <span className="pb-2 text-base font-medium text-white">{label}</span>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'w-full h-12 p-3 text-base font-normal leading-normal text-white placeholder-white/40 bg-white/5 rounded-lg border border-white/10 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-colors',
            className
          )}
          {...props}
        />
      </label>
    )
  }
)

Input.displayName = 'Input'

export { Input }
