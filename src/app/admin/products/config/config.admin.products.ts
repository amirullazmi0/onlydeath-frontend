import * as yup from 'yup';

export const productSchema = yup.object().shape({
    name: yup.string().required('Name is required').min(2),
    description: yup.string().optional(),
    category_id: yup.string().optional(),
    price: yup.number().typeError('IDR price is required').required().integer().min(0),
    // Entered in US dollars; sent to the API as cents
    price_usd: yup.number().typeError('USD price is required').required().min(0.01, 'USD price is required'),
    weight_gram: yup.number().typeError('Weight is required').required().integer().min(1, 'Min 1 gram'),
    availability: yup.mixed<'READY' | 'PRE_ORDER'>().oneOf(['READY', 'PRE_ORDER']).required(),
    stock: yup.number().typeError('Stock is required').required().integer().min(0),
    po_estimate_days: yup
        .number()
        .transform((v) => (Number.isNaN(v) ? undefined : v))
        .when('availability', {
            is: 'PRE_ORDER',
            then: (s) => s.required('Estimated days is required').integer().min(1),
            otherwise: (s) => s.optional(),
        }),
    po_mode: yup.mixed<'ANYTIME' | 'PERIOD'>().oneOf(['ANYTIME', 'PERIOD']).required(),
    // datetime-local values (local time); converted to ISO on submit
    po_start_at: yup.string().when(['availability', 'po_mode'], {
        is: (a: string, m: string) => a === 'PRE_ORDER' && m === 'PERIOD',
        then: (s) => s.required('Start date is required'),
        otherwise: (s) => s.optional(),
    }),
    po_end_at: yup.string().when(['availability', 'po_mode'], {
        is: (a: string, m: string) => a === 'PRE_ORDER' && m === 'PERIOD',
        then: (s) =>
            s
                .required('End date is required')
                .test('after-start', 'End must be after start', function (end) {
                    const start = this.parent.po_start_at as string | undefined;
                    return !start || !end || new Date(end) > new Date(start);
                }),
        otherwise: (s) => s.optional(),
    }),
    is_active: yup.boolean().required(),
});

export type ProductFormData = yup.InferType<typeof productSchema>;
