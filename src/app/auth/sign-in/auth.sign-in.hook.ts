import { useAuth } from '@/hooks/react-query/useAuth';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { SignInFormData, signInSchema } from './auth.sign-in.config';

const useAuthSignIn = () => {
    const { login, loginState } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignInFormData>({
        resolver: yupResolver(signInSchema),
        mode: 'onChange',
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = (data: SignInFormData) => login(data);

    return {
        register,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting: loginState.isLoading,
    };
};

export default useAuthSignIn;
