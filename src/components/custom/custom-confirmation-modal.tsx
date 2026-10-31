'use client';
import React from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface CustomConfirmationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isLoading: boolean;
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    loadingText?: string;
    variant?: 'primary' | 'danger' | 'warning' | 'default';
}

export default function CustomConfirmationModal({
    open,
    onOpenChange,
    onConfirm,
    isLoading,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    loadingText = 'Processing...',
    variant = 'primary',
}: Readonly<CustomConfirmationModalProps>) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-end gap-2">
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isLoading}>
                            {cancelText}
                        </Button>
                    </DialogClose>
                    <Button variant={variant} onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                {loadingText}
                                <Spinner />
                            </div>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
