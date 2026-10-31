import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer active:scale-98 ease-in-out duration-200",
    {
        variants: {
            variant: {
                default: 'bg-transparent text-primary',
                destructive:
                    'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
                outline:
                    'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
                secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
                link: 'text-primary underline-offset-4 hover:underline',
                primary: 'bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg',
                warning: 'bg-warning hover:bg-warning/90 text-white rounded-lg',
                info: 'bg-info hover:bg-info text-white rounded-lg',
                danger: 'bg-destructive hover:bg-destructive text-white rounded-lg',
                success: 'bg-success hover:bg-success text-white rounded-lg',
                outlinePrimary:
                    'border-primary hover:bg-primary text-primary hover:text-primary-foreground rounded-lg',
                outlineWarning:
                    'border-warning hover:bg-warning/90 text-warning hover:text-primary-foreground rounded-lg',
                outlineInfo:
                    'border-info hover:bg-info text-info hover:text-primary-foreground rounded-lg',
                outlineDanger:
                    'border-destructive hover:bg-destructive text-destructive hover:text-primary-foreground rounded-lg',
                outlineSuccess:
                    'border-success hover:bg-success text-success hover:text-primary-foreground rounded-lg',
            },
            size: {
                default: 'h-9 px-4 py-2 has-[>svg]:px-3',
                sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
                lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
                icon: 'size-9',
                'icon-sm': 'size-8',
                'icon-lg': 'size-10',
            },
            width: {
                full: 'w-full',
                fit: 'w-fit',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
            width: 'fit',
        },
    },
);

function Button({
    className,
    variant,
    size,
    width,
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size, width, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };
