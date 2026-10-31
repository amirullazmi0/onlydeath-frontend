import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow,transform] overflow-hidden',
    {
        variants: {
            variant: {
                default:
                    'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
                secondary:
                    'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/80',
                destructive:
                    'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
                outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
                primary: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
                warning: 'border-transparent bg-warning text-white [a&]:hover:bg-warning/90',
                info: 'border-transparent bg-info text-white [a&]:hover:bg-info/90',
                danger: 'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90',
                success: 'border-transparent bg-success text-white [a&]:hover:bg-success/90',
                outlinePrimary:
                    'border-primary text-primary [a&]:hover:bg-primary/90 [a&]:hover:text-primary-foreground',
                outlineWarning:
                    'border-warning text-warning [a&]:hover:bg-warning/90 [a&]:hover:text-primary-foreground',
                outlineInfo:
                    'border-info text-info [a&]:hover:bg-info/90 [a&]:hover:text-primary-foreground',
                outlineDanger:
                    'border-destructive text-destructive [a&]:hover:bg-destructive/90 [a&]:hover:text-primary-foreground',
                outlineSuccess:
                    'border-success text-success [a&]:hover:bg-success/90 [a&]:hover:text-primary-foreground',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

function Badge({
    className,
    variant,
    asChild = false,
    ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : 'span';

    return (
        <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
