import * as yup from 'yup';

const isID = (country: string) => country === 'ID';

/** Address levels follow kratify: province, city, district, sub-district (kelurahan) for every country. */
export const checkoutSchema = yup.object().shape({
    customer_name: yup.string().required('Full name is required').min(2, 'Name is too short'),
    customer_email: yup.string().required('Email is required').email('Invalid email'),
    customer_phone: yup
        .string()
        .required('Phone number is required')
        .matches(/^\+?[0-9 ()-]{7,20}$/, 'Invalid phone number (include country code, e.g. +1 555 123 4567)'),
    country_code: yup.string().required('Country is required').length(2),
    state: yup.string().required('Province / state is required'),
    city: yup.string().required('City is required'),
    district: yup.string().required('District is required'),
    sub_district: yup.string().required('Sub-district is required'),
    postal_code: yup
        .string()
        .required('Postal code is required')
        .when('country_code', {
            is: isID,
            then: (s) => s.matches(/^\d{5}$/, 'Indonesian postal codes have 5 digits'),
            otherwise: (s) => s.matches(/^[A-Za-z0-9 -]{3,10}$/, 'Invalid postal code'),
        }),
    address: yup.string().required('Street address is required').min(5, 'Address is too short'),
    note: yup.string().optional().max(500),
    courier_key: yup.string().required('Choose a shipping option'),
});

export type CheckoutFormData = yup.InferType<typeof checkoutSchema>;

/** Rates are identified by "courier_code|service_code" in the form. */
export const courierKey = (r: { courier_code: string; courier_service_code: string }) =>
    `${r.courier_code}|${r.courier_service_code}`;
