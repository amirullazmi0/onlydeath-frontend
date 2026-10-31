'use client';
import dayjs from 'dayjs';
import { KeyRound, Plus, Power, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, LabelInput } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminPageHeader from '@/components/admin/admin.page-header';
import CustomPagination from '@/components/custom/custom-pagination';
import CustomConfirmationModal from '@/components/custom/custom-confirmation-modal';
import useAdminUsers from './hooks/use-admin.users';

const CONFIRM_COPY = {
    toggle: (active: boolean) => ({
        title: active ? 'Deactivate admin?' : 'Activate admin?',
        description: active ? 'They will be signed out and unable to log in.' : 'They will be able to log in again.',
        confirm: active ? 'Deactivate' : 'Activate',
    }),
    reset: () => ({
        title: 'Reset password?',
        description: 'A new random password will be emailed to this admin.',
        confirm: 'Reset',
    }),
    delete: () => ({
        title: 'Delete admin?',
        description: 'This admin account will be removed permanently.',
        confirm: 'Delete',
    }),
};

export default function AdminUsersView() {
    const {
        me,
        users,
        meta,
        isLoading,
        setPage,
        creating,
        setCreating,
        form,
        onCreate,
        createLoading,
        action,
        setAction,
        confirmAction,
        actionLoading,
    } = useAdminUsers();
    const {
        register,
        formState: { errors },
    } = form;

    const copy = action ? CONFIRM_COPY[action.type](action.user.is_active) : null;

    return (
        <div>
            <AdminPageHeader
                title="Admin Users"
                description="People who can sign in to this panel. Buyers don't need accounts."
                action={
                    <Button variant="primary" onClick={() => setCreating(true)} className="rounded-none text-xs font-bold uppercase tracking-wider">
                        <Plus /> Add Admin
                    </Button>
                }
            />

            <div className="bg-white border border-black/10">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <Skeleton className="h-10 rounded-none" />
                                </TableCell>
                            </TableRow>
                        )}
                        {users.map((u) => {
                            const isMe = u.id === me?.id;
                            return (
                                <TableRow key={u.id}>
                                    <TableCell className="font-medium">
                                        {u.name} {isMe && <span className="text-xs text-muted-foreground">(you)</span>}
                                    </TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell>
                                        <span className={u.is_active ? 'text-xs font-semibold' : 'text-xs text-muted-foreground'}>
                                            {u.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{dayjs(u.created_at).format('DD MMM YYYY')}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon-sm" aria-label="Reset password" onClick={() => setAction({ type: 'reset', user: u })}>
                                                <KeyRound />
                                            </Button>
                                            {!isMe && (
                                                <>
                                                    <Button variant="ghost" size="icon-sm" aria-label="Toggle active" onClick={() => setAction({ type: 'toggle', user: u })}>
                                                        <Power />
                                                    </Button>
                                                    <Button variant="ghost" size="icon-sm" aria-label="Delete" onClick={() => setAction({ type: 'delete', user: u })}>
                                                        <Trash2 />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                {meta && (
                    <CustomPagination
                        page={meta.current_page}
                        totalPage={meta.total_page}
                        totalData={meta.total_data}
                        setPage={setPage}
                    />
                )}
            </div>

            <Dialog open={creating} onOpenChange={setCreating}>
                <DialogContent className="sm:max-w-md rounded-none">
                    <DialogHeader>
                        <DialogTitle>New Admin</DialogTitle>
                        <DialogDescription>A temporary password will be emailed to them.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={onCreate} className="space-y-4">
                        <div className="space-y-1.5">
                            <LabelInput required>Name</LabelInput>
                            <Input {...register('name')} className="rounded-none" />
                            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <LabelInput required>Email</LabelInput>
                            <Input type="email" {...register('email')} className="rounded-none" />
                            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCreating(false)} className="rounded-none">
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" disabled={createLoading} className="rounded-none">
                                {createLoading ? <Spinner /> : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <CustomConfirmationModal
                open={!!action}
                onOpenChange={(open) => !open && setAction(null)}
                onConfirm={confirmAction}
                isLoading={actionLoading}
                variant={action?.type === 'delete' ? 'danger' : 'primary'}
                title={copy?.title ?? ''}
                description={copy ? `${action?.user.name}: ${copy.description}` : ''}
                confirmText={copy?.confirm}
            />
        </div>
    );
}
