'use client';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { LabelInput, PasswordInput } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import AdminPageHeader from '@/components/admin/admin.page-header';
import useMutationApiRequest from '@/hooks/react-query/useMutationApiRequest';
import { useAuthStore } from '@/stores/auth.store';
import type { GlobalApiResponse } from '@/types/api/responses';
import type { ChangePasswordRequest } from '@/types/auth';

const schema = yup.object().shape({
    current_password: yup.string().required('Current password is required'),
    new_password: yup.string().required('New password is required').min(8, 'At least 8 characters'),
    confirm: yup
        .string()
        .required('Please confirm the new password')
        .oneOf([yup.ref('new_password')], 'Passwords do not match'),
});

export default function AdminSettingsView() {
    const user = useAuthStore((s) => s.user);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { current_password: '', new_password: '', confirm: '' },
    });

    const mutation = useMutationApiRequest<GlobalApiResponse<null>, ChangePasswordRequest>({
        key: 'changePassword',
        options: { onSuccess: () => reset() },
    });

    return (
        <div className="max-w-xl space-y-6">
            <AdminPageHeader title="Settings" />

            <section className="bg-white border border-black/10 p-5">
                <p className="text-xs font-bold uppercase tracking-widest">Profile</p>
                <p className="mt-3 text-sm font-semibold">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
            </section>

            <section className="bg-white border border-black/10 p-5">
                <p className="text-xs font-bold uppercase tracking-widest">Change password</p>
                <form
                    onSubmit={handleSubmit(({ current_password, new_password }) =>
                        mutation.mutate({ current_password, new_password }),
                    )}
                    className="mt-4 space-y-4"
                >
                    <div className="space-y-1.5">
                        <LabelInput required>Current password</LabelInput>
                        <PasswordInput {...register('current_password')} className="rounded-none" />
                        {errors.current_password && <p className="text-xs text-destructive">{errors.current_password.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <LabelInput required>New password</LabelInput>
                        <PasswordInput {...register('new_password')} className="rounded-none" />
                        {errors.new_password && <p className="text-xs text-destructive">{errors.new_password.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <LabelInput required>Confirm new password</LabelInput>
                        <PasswordInput {...register('confirm')} className="rounded-none" />
                        {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message}</p>}
                    </div>
                    <Button type="submit" variant="primary" disabled={mutation.isPending} className="rounded-none text-xs font-bold uppercase">
                        {mutation.isPending ? <Spinner /> : 'Update Password'}
                    </Button>
                </form>
            </section>
        </div>
    );
}
