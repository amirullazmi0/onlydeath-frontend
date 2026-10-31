'use client';
import Link from 'next/link';
import { Input, LabelInput, PasswordInput } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthShell from '../components/auth-shell';
import useAuthSignIn from './auth.sign-in.hook';

export default function AuthSignInView() {
    const { register, handleSubmit, onSubmit, errors, isSubmitting } = useAuthSignIn();

    return (
        <AuthShell title="Sign In" subtitle="Sign in to manage the store.">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                    <LabelInput required>Email</LabelInput>
                    <Input type="email" {...register('email')} className="rounded-none" />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-1.5">
                    <div className="flex justify-between">
                        <LabelInput required>Password</LabelInput>
                        <Link href="/auth/forgot-password" className="text-xs underline">
                            Forgot password?
                        </Link>
                    </div>
                    <PasswordInput {...register('password')} className="rounded-none" />
                    {errors.password && (
                        <p className="text-xs text-destructive">{errors.password.message}</p>
                    )}
                </div>
                <Button
                    type="submit"
                    variant="primary"
                    width="full"
                    disabled={isSubmitting}
                    className="h-11 rounded-none text-xs font-bold tracking-widest uppercase"
                >
                    {isSubmitting ? <Spinner /> : 'Sign In'}
                </Button>
            </form>
        </AuthShell>
    );
}
