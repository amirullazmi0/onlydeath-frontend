'use client';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input, LabelInput } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/react-query/useAuth';
import AuthShell from '../components/auth-shell';

const schema = yup.object().shape({
    email: yup.string().required('Email is required').email('Invalid email'),
});

export default function AuthForgotPasswordView() {
    const { forgetPassword, forgetPasswordState } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema), defaultValues: { email: '' } });

    return (
        <AuthShell
            title="Forgot Password"
            subtitle="Enter your admin email and we will send you a reset link."
        >
            {forgetPasswordState.isSuccess ? (
                <p className="border border-black p-4 text-sm">
                    If the email is registered, a reset link is on its way. Check your inbox.
                </p>
            ) : (
                <form onSubmit={handleSubmit((d) => forgetPassword(d))} className="space-y-4">
                    <div className="space-y-1.5">
                        <LabelInput required>Email</LabelInput>
                        <Input type="email" {...register('email')} className="rounded-none" />
                        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>
                    <Button
                        type="submit"
                        variant="primary"
                        width="full"
                        disabled={forgetPasswordState.isLoading}
                        className="h-11 rounded-none text-xs font-bold tracking-widest uppercase"
                    >
                        {forgetPasswordState.isLoading ? <Spinner /> : 'Send Reset Link'}
                    </Button>
                </form>
            )}
            <Link href="/auth/sign-in" className="mt-6 inline-block text-xs underline">
                Back to sign in
            </Link>
        </AuthShell>
    );
}
