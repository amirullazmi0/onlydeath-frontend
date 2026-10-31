'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { LabelInput, PasswordInput } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/react-query/useAuth';
import AuthShell from '../components/auth-shell';

const schema = yup.object().shape({
    password: yup.string().required('Password is required').min(8, 'At least 8 characters'),
    confirm: yup
        .string()
        .required('Please confirm your password')
        .oneOf([yup.ref('password')], 'Passwords do not match'),
});

export default function AuthResetPasswordView() {
    const token = useSearchParams().get('token') ?? '';
    const { resetPassword, resetPasswordState } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema), defaultValues: { password: '', confirm: '' } });

    if (!token) {
        return (
            <AuthShell title="Reset Password">
                <p className="text-sm">This reset link is invalid.</p>
                <Link href="/auth/forgot-password" className="mt-4 inline-block text-xs underline">
                    Request a new link
                </Link>
            </AuthShell>
        );
    }

    return (
        <AuthShell title="Reset Password" subtitle="Choose a new password for your admin account.">
            <form
                onSubmit={handleSubmit((d) => resetPassword({ token, password: d.password }))}
                className="space-y-4"
            >
                <div className="space-y-1.5">
                    <LabelInput required>New Password</LabelInput>
                    <PasswordInput {...register('password')} className="rounded-none" />
                    {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>
                <div className="space-y-1.5">
                    <LabelInput required>Confirm Password</LabelInput>
                    <PasswordInput {...register('confirm')} className="rounded-none" />
                    {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message}</p>}
                </div>
                <Button
                    type="submit"
                    variant="primary"
                    width="full"
                    disabled={resetPasswordState.isLoading}
                    className="h-11 rounded-none text-xs font-bold tracking-widest uppercase"
                >
                    {resetPasswordState.isLoading ? <Spinner /> : 'Reset Password'}
                </Button>
            </form>
        </AuthShell>
    );
}
