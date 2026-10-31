import * as yup from 'yup';

export const signInSchema = yup.object().shape({
    email: yup.string().required('Email is required').email('Invalid email'),
    password: yup.string().required('Password is required'),
});

export type SignInFormData = yup.InferType<typeof signInSchema>;
