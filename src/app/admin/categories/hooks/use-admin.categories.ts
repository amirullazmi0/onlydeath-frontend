import { useState } from 'react';
import useQueryApiRequest from '@/hooks/react-query/useQueryApiRequest';
import useMutationApiRequest from '@/hooks/react-query/useMutationApiRequest';
import type { GlobalApiResponse } from '@/types/api/responses';
import type { Category } from '@/types/product';

export default function useAdminCategories() {
    // null = closed, {} = create, Category = edit
    const [editing, setEditing] = useState<Partial<Category> | null>(null);
    const [deleting, setDeleting] = useState<Category | null>(null);
    const [name, setName] = useState('');

    const { data, isLoading } = useQueryApiRequest<GlobalApiResponse<Category[]>>({ key: 'categories' });

    const saveMutation = useMutationApiRequest<GlobalApiResponse<Category>, { name: string }>({
        key: editing?.id ? 'update-category' : 'create-category',
        params: () => ({ id: editing?.id ?? '' }),
        options: { onSuccess: () => setEditing(null) },
    });
    const deleteMutation = useMutationApiRequest<GlobalApiResponse<null>, void>({
        key: 'delete-category',
        params: () => ({ id: deleting?.id ?? '' }),
        options: { onSuccess: () => setDeleting(null) },
    });

    return {
        categories: data?.data ?? [],
        isLoading,
        editing,
        openForm: (c: Partial<Category>) => {
            setEditing(c);
            setName(c.name ?? '');
        },
        closeForm: () => setEditing(null),
        name,
        setName,
        save: () => name.trim().length >= 2 && saveMutation.mutate({ name: name.trim() }),
        saving: saveMutation.isPending,
        deleting,
        setDeleting,
        confirmDelete: () => deleteMutation.mutate(),
        isDeleting: deleteMutation.isPending,
    };
}
