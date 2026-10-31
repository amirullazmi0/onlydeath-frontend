import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useQueryApiRequest from '@/hooks/react-query/useQueryApiRequest';
import useMutationApiRequest from '@/hooks/react-query/useMutationApiRequest';
import { useAuthStore } from '@/stores/auth.store';
import type { GlobalApiResponse } from '@/types/api/responses';
import type { User } from '@/types/auth';

const createSchema = yup.object().shape({
    name: yup.string().required('Name is required').min(2),
    email: yup.string().required('Email is required').email('Invalid email'),
});

export default function useAdminUsers() {
    const me = useAuthStore((s) => s.user);
    const [page, setPage] = useState(1);
    const [creating, setCreating] = useState(false);
    // Target user of a pending confirmation
    const [action, setAction] = useState<{ type: 'delete' | 'reset' | 'toggle'; user: User } | null>(null);

    const form = useForm({ resolver: yupResolver(createSchema), defaultValues: { name: '', email: '' } });

    const { data, isLoading } = useQueryApiRequest<GlobalApiResponse<User[]>>({
        key: 'users',
        queries: { page, limit: 10 },
    });

    const params = () => ({ id: action?.user.id ?? '' });
    const done = { onSuccess: () => setAction(null) };

    const createMutation = useMutationApiRequest<GlobalApiResponse<User>, { name: string; email: string }>({
        key: 'create-user',
        options: {
            onSuccess: () => {
                setCreating(false);
                form.reset();
            },
        },
    });
    const updateMutation = useMutationApiRequest<GlobalApiResponse<User>, { is_active: boolean }>({
        key: 'update-user',
        params,
        options: done,
    });
    const resetMutation = useMutationApiRequest<GlobalApiResponse<null>, void>({
        key: 'reset-password-user',
        params,
        options: done,
    });
    const deleteMutation = useMutationApiRequest<GlobalApiResponse<null>, void>({
        key: 'delete-user',
        params,
        options: done,
    });

    const confirmAction = () => {
        if (!action) return;
        if (action.type === 'toggle') updateMutation.mutate({ is_active: !action.user.is_active });
        if (action.type === 'reset') resetMutation.mutate();
        if (action.type === 'delete') deleteMutation.mutate();
    };

    return {
        me,
        users: data?.data ?? [],
        meta: data?.meta,
        isLoading,
        setPage,
        creating,
        setCreating,
        form,
        onCreate: form.handleSubmit((d) => createMutation.mutate(d)),
        createLoading: createMutation.isPending,
        action,
        setAction,
        confirmAction,
        actionLoading: updateMutation.isPending || resetMutation.isPending || deleteMutation.isPending,
    };
}
