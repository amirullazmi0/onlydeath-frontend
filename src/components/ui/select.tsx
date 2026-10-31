'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const selectTriggerVariants = cva(
    'flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 ',
    {
        variants: {
            variant: {
                default: 'border-input focus:ring-ring',
                primary: 'border-primary focus:ring-primary',
                warning: 'border-warning focus:ring-warning',
                info: 'border-info focus:ring-info',
                danger: 'border-destructive focus:ring-destructive',
                success: 'border-success focus:ring-success',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

const SelectTrigger = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> &
        VariantProps<typeof selectTriggerVariants>
>(({ className, children, variant, ...props }, ref) => (
    <SelectPrimitive.Trigger
        ref={ref}
        className={cn(selectTriggerVariants({ variant, className }))}
        {...props}
    >
        {children}
        <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.ScrollUpButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollUpButton
        ref={ref}
        className={cn('flex cursor-default items-center justify-center py-1', className)}
        {...props}
    >
        <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.ScrollDownButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollDownButton
        ref={ref}
        className={cn('flex cursor-default items-center justify-center py-1', className)}
        {...props}
    >
        <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
    <SelectPrimitive.Portal>
        <SelectPrimitive.Content
            ref={ref}
            className={cn(
                'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
                position === 'popper' &&
                    'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
                className,
            )}
            position={position}
            {...props}
        >
            <SelectScrollUpButton />
            <SelectPrimitive.Viewport
                className={cn(
                    'p-1',
                    position === 'popper' &&
                        'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
                )}
            >
                {children}
            </SelectPrimitive.Viewport>
            <SelectScrollDownButton />
        </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Label
        ref={ref}
        className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)}
        {...props}
    />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        className={cn(
            'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
            className,
        )}
        {...props}
    >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <SelectPrimitive.ItemIndicator>
                <Check className="h-4 w-4" />
            </SelectPrimitive.ItemIndicator>
        </span>

        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Separator
        ref={ref}
        className={cn('-mx-1 my-1 h-px bg-muted', className)}
        {...props}
    />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

interface SearchableSelectContentProps extends React.ComponentPropsWithoutRef<
    typeof SelectPrimitive.Content
> {
    searchPlaceholder?: string;
    onSearchChange?: (search: string) => void;
}

const SearchableSelectContent = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Content>,
    SearchableSelectContentProps
>(
    (
        {
            className,
            children,
            position = 'popper',
            searchPlaceholder = 'Search...',
            onSearchChange,
            ...props
        },
        ref,
    ) => {
        const [search, setSearch] = React.useState('');
        const inputRef = React.useRef<HTMLInputElement>(null);

        // Refocus input after each search change
        React.useEffect(() => {
            const frame = requestAnimationFrame(() => {
                inputRef.current?.focus();
            });
            return () => cancelAnimationFrame(frame);
        }, [search]);

        const filteredChildren = React.useMemo(() => {
            if (!search.trim()) return children;

            const query = search.toLowerCase();

            const filterItems = (nodes: React.ReactNode): React.ReactNode => {
                return React.Children.map(nodes, (child) => {
                    if (!React.isValidElement(child)) return child;

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const childProps = child.props as any;

                    // If it's a SelectItem, filter by text content
                    if (child.type === SelectItem) {
                        const text = String(childProps.children ?? '').toLowerCase();
                        if (text.includes(query)) return child;
                        return null;
                    }

                    // If it's a SelectGroup, filter its children
                    if (child.type === SelectGroup || child.type === SelectPrimitive.Group) {
                        const filtered = filterItems(childProps.children);
                        const hasItems = React.Children.toArray(filtered).some(
                            (c) => React.isValidElement(c) && c.type === SelectItem,
                        );
                        if (!hasItems) return null;
                        return React.cloneElement(
                            child as React.ReactElement<{ children?: React.ReactNode }>,
                            {},
                            filtered,
                        );
                    }

                    return child;
                });
            };

            return filterItems(children);
        }, [children, search]);

        return (
            <SelectPrimitive.Portal>
                <SelectPrimitive.Content
                    ref={ref}
                    className={cn(
                        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
                        position === 'popper' &&
                            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
                        className,
                    )}
                    position={position}
                    {...props}
                >
                    <div className="flex items-center gap-2 border-b px-3 py-2">
                        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                        <input
                            ref={inputRef}
                            autoFocus
                            className="flex h-7 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                onSearchChange?.(e.target.value);
                            }}
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    </div>
                    <SelectScrollUpButton />
                    <SelectPrimitive.Viewport
                        className={cn(
                            'p-1',
                            position === 'popper' &&
                                'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
                        )}
                    >
                        {filteredChildren}
                    </SelectPrimitive.Viewport>
                    <SelectScrollDownButton />
                </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
        );
    },
);
SearchableSelectContent.displayName = 'SearchableSelectContent';

export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SearchableSelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
    SelectScrollUpButton,
    SelectScrollDownButton,
    selectTriggerVariants,
};
