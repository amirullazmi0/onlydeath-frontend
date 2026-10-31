import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Button } from './button';
import { Eye, EyeOff } from 'lucide-react';
import { Label } from './label';

const inputVariants = cva(
    'flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm selection:bg-primary selection:text-primary-foreground',
    {
        variants: {
            variant: {
                default:
                    'border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                primary:
                    'border-primary focus-visible:border-primary focus-visible:ring-primary/50',
                warning:
                    'border-warning focus-visible:border-warning focus-visible:ring-warning/50',
                info: 'border-info focus-visible:border-info focus-visible:ring-info/50',
                danger: 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/50',
                success:
                    'border-success focus-visible:border-success focus-visible:ring-success/50',
            },
            size: {
                default: 'h-9',
                sm: 'h-8 text-xs',
                lg: 'h-10 text-base',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

export interface InputProps
    extends Omit<React.ComponentProps<'input'>, 'size'>, VariantProps<typeof inputVariants> {
    startIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

function Input({
    className,
    type,
    variant,
    size,
    startIcon,
    rightIcon,
    ...props
}: Readonly<InputProps>) {
    if (startIcon || rightIcon) {
        return (
            <div className="relative w-full">
                {startIcon && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">
                        {startIcon}
                    </div>
                )}
                <input
                    type={type}
                    data-slot="input"
                    className={cn(
                        inputVariants({ variant, size, className }),
                        startIcon && 'pl-8',
                        rightIcon && 'pr-10',
                    )}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                        {rightIcon}
                    </div>
                )}
            </div>
        );
    }
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(inputVariants({ variant, size, className }))}
            {...props}
        />
    );
}

function LabelInput({
    className,
    required,
    children,
    ...props
}: React.ComponentProps<typeof Label> & { required?: boolean }) {
    return (
        <Label className={className} {...props}>
            <div className="flex items-center gap-1">
                {children}
                {required && <span className="text-destructive">*</span>}
            </div>
        </Label>
    );
}
function PasswordInput({
    className,
    variant,
    size,
    ...props
}: Readonly<Omit<InputProps, 'rightIcon'>>) {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
        <Input
            type={showPassword ? 'text' : 'password'}
            data-slot="input"
            className={cn(inputVariants({ variant, size, className }))}
            {...props}
            rightIcon={
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">
                        {showPassword ? 'Hide password' : 'Show password'}
                    </span>
                </Button>
            }
        />
    );
}

function InputNumber({
    className,
    variant,
    size,
    startIcon,
    min,
    max,
    ...props
}: Readonly<Omit<InputProps, 'rightIcon'>>) {
    return (
        <Input
            type="number"
            data-slot="input"
            className={cn(inputVariants({ variant, size, className }))}
            startIcon={startIcon}
            min={min}
            max={max}
            {...props}
        />
    );
}

export { Input, inputVariants, PasswordInput, LabelInput, InputNumber };
