import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const cardVariants = cva('flex flex-col gap-6 rounded-xl transition-all', {
    variants: {
        variant: {
            default: 'bg-card text-card-foreground',
            primary:
                'bg-primary/10 border-primary/20 text-primary dark:bg-primary/20 dark:border-primary/80 dark:text-primary-foreground',
            warning:
                'bg-warning/10 border-warning/20 text-warning dark:bg-yellow-950/20 dark:border-yellow-800 dark:text-yellow-50',
            info: 'bg-info/10 border-info/20 text-info dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-50',
            danger: 'bg-destructive/10 border-destructive/20 text-destructive dark:bg-red-950/20 dark:border-red-800 dark:text-red-50',
            success:
                'bg-success/10 border-success/20 text-success dark:bg-green-950/20 dark:border-green-800 dark:text-green-50',
            outline: 'border bg-transparent text-card-foreground',
            outlinePrimary: 'border-primary text-card-foreground',
            outlineWarning: 'border-warning/90 text-card-foreground',
            outlineInfo: 'border-info text-card-foreground',
            outlineDanger: 'border-destructive text-card-foreground',
            outlineSuccess: 'border-success text-card-foreground',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});

function Card({
    className,
    variant,
    ...props
}: React.ComponentProps<'div'> & VariantProps<typeof cardVariants>) {
    return <div data-slot="card" className={cn(cardVariants({ variant, className }))} {...props} />;
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-header"
            className={cn(
                '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 py-8 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
                className,
            )}
            {...props}
        />
    );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-title"
            className={cn('leading-none font-semibold', className)}
            {...props}
        />
    );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-description"
            className={cn('text-muted-foreground text-sm', className)}
            {...props}
        />
    );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-action"
            className={cn(
                'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
                className,
            )}
            {...props}
        />
    );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
    return <div data-slot="card-content" className={cn('px-6 py-6', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-footer"
            className={cn('flex items-center px-6 py-8 [.border-t]:pt-6', className)}
            {...props}
        />
    );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
