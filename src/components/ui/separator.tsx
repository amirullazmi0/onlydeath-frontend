'use client';

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const separatorVariants = cva('shrink-0', {
    variants: {
        variant: {
            default: 'bg-border',
            primary: 'bg-primary',
            warning: 'bg-warning',
            info: 'bg-info/100',
            danger: 'bg-destructive/100',
            success: 'bg-success/100',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});

const Separator = React.forwardRef<
    React.ComponentRef<typeof SeparatorPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> &
        VariantProps<typeof separatorVariants>
>(({ className, orientation = 'horizontal', decorative = true, variant, ...props }, ref) => (
    <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
            separatorVariants({ variant }),
            orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
            className,
        )}
        {...props}
    />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator, separatorVariants };
