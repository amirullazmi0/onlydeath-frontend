'use client';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, LabelInput } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminPageHeader from '@/components/admin/admin.page-header';
import CustomConfirmationModal from '@/components/custom/custom-confirmation-modal';
import useAdminCategories from './hooks/use-admin.categories';

export default function AdminCategoriesView() {
    const {
        categories,
        isLoading,
        editing,
        openForm,
        closeForm,
        name,
        setName,
        save,
        saving,
        deleting,
        setDeleting,
        confirmDelete,
        isDeleting,
    } = useAdminCategories();

    return (
        <div>
            <AdminPageHeader
                title="Categories"
                description="Group products in the shop."
                action={
                    <Button variant="primary" onClick={() => openForm({})} className="rounded-none text-xs font-bold uppercase tracking-wider">
                        <Plus /> Add Category
                    </Button>
                }
            />

            <div className="bg-white border border-black/10">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={4}>
                                    <Skeleton className="h-10 rounded-none" />
                                </TableCell>
                            </TableRow>
                        )}
                        {categories.map((c) => (
                            <TableRow key={c.id}>
                                <TableCell className="font-medium">{c.name}</TableCell>
                                <TableCell className="text-muted-foreground font-mono text-xs">{c.slug}</TableCell>
                                <TableCell className="tabular-nums">{c._count?.products ?? 0}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => openForm(c)}>
                                            <Pencil />
                                        </Button>
                                        <Button variant="ghost" size="icon-sm" aria-label="Delete" onClick={() => setDeleting(c)}>
                                            <Trash2 />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {!isLoading && categories.length === 0 && (
                    <p className="p-10 text-center text-sm text-muted-foreground">No categories yet.</p>
                )}
            </div>

            <Dialog open={!!editing} onOpenChange={(open) => !open && closeForm()}>
                <DialogContent className="sm:max-w-md rounded-none">
                    <DialogHeader>
                        <DialogTitle>{editing?.id ? 'Edit Category' : 'New Category'}</DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            save();
                        }}
                        className="space-y-4"
                    >
                        <div className="space-y-1.5">
                            <LabelInput required>Name</LabelInput>
                            <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-none" autoFocus />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeForm} className="rounded-none">
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" disabled={saving || name.trim().length < 2} className="rounded-none">
                                {saving ? <Spinner /> : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <CustomConfirmationModal
                open={!!deleting}
                onOpenChange={(open) => !open && setDeleting(null)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                variant="danger"
                title="Delete category?"
                description={`Products in "${deleting?.name}" will become uncategorized.`}
                confirmText="Delete"
            />
        </div>
    );
}
