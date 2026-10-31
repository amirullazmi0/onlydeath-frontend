'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    onCheckedChange?: (checked: boolean) => void;
    icon?: React.ReactNode;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, onCheckedChange, checked, icon, ...props }, ref) => {
        return (
            <div
                className={cn(
                    'relative flex items-center justify-center h-5 w-5 rounded border border-emerald-500 transition-all cursor-pointer',
                    !icon &&
                        (checked
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'bg-white border-gray-300 hover:border-emerald-400'),
                    className,
                )}
            >
                <input
                    type="checkbox"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    ref={ref}
                    checked={checked}
                    onChange={(e) => onCheckedChange?.(e.target.checked)}
                    {...props}
                />
                {icon || (checked && <Check className="h-3.5 w-3.5 text-white stroke-3" />)}
            </div>
        );
    },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
