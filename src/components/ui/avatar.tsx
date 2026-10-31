'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const avatarVariants = cva(
    'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full transition-all',
    {
        variants: {
            size: {
                default: 'h-10 w-10',
                sm: 'h-8 w-8',
                lg: 'h-14 w-14',
            },
        },
        defaultVariants: {
            size: 'default',
        },
    },
);

const Avatar = React.forwardRef<
    React.ComponentRef<typeof AvatarPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> &
        VariantProps<typeof avatarVariants>
>(({ className, size, ...props }, ref) => (
    <AvatarPrimitive.Root
        ref={ref}
        className={cn(avatarVariants({ size, className }))}
        {...props}
    />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
    React.ComponentRef<typeof AvatarPrimitive.Image>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Image
        ref={ref}
        className={cn('aspect-square h-full w-full', className)}
        {...props}
    />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const avatarFallbackVariants = cva(
    'flex h-full w-full items-center justify-center rounded-full bg-muted',
    {
        variants: {
            variant: {
                default: 'bg-muted text-muted-foreground',
                primary: 'bg-primary text-primary-foreground',
                warning: 'bg-yellow-100 text-warning dark:bg-yellow-900 dark:text-yellow-100',
                info: 'bg-blue-100 text-info dark:bg-blue-900 dark:text-blue-100',
                danger: 'bg-red-100 text-destructive dark:bg-red-900 dark:text-red-100',
                success: 'bg-green-100 text-success dark:bg-green-900 dark:text-green-100',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

const AvatarFallback = React.forwardRef<
    React.ComponentRef<typeof AvatarPrimitive.Fallback>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> &
        VariantProps<typeof avatarFallbackVariants>
>(({ className, variant, ...props }, ref) => (
    <AvatarPrimitive.Fallback
        ref={ref}
        className={cn(avatarFallbackVariants({ variant, className }))}
        {...props}
    />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
