import * as yup from 'yup';

const isID = (country: string) => country === 'ID';

export type Destination = 'ID' | 'INTL';

const required = (message: string) => yup.string().trim().required(message);

/** Address levels follow kratify: province, city, district, sub-district (kelurahan) for every country. */
export const checkoutSchema = yup.object().shape({
    destination: yup
        .string()
        .oneOf(['ID', 'INTL'] as const)
        .required('Choose where to ship first'),
    customer_name: required('Full name is required').min(2, 'Name is too short'),
    customer_email: required('Email is required').email('Invalid email'),
    customer_phone: required('Phone number is required').when('country_code', {
        is: isID,
        then: (s) =>
            s.test(
                'id-mobile',
                'Enter an Indonesian mobile number, e.g. 0812 3456 7890',
                (v) => /^(\+62|62|0)8\d{7,12}$/.test((v ?? '').replace(/[\s()-]/g, '')),
            ),
        otherwise: (s) =>
            s.matches(/^\+[0-9 ()-]{7,20}$/, 'Include the country code, e.g. +1 555 123 4567'),
    }),
    country_code: yup
        .string()
        .required('Country is required')
        .length(2)
        .when('destination', {
            is: 'INTL',
            then: (s) => s.notOneOf(['ID'], 'Choose Indonesia as the destination instead'),
        }),
    state: required('Province / state is required'),
    city: required('City is required'),
    district: required('District is required'),
    sub_district: required('Sub-district is required'),
    postal_code: required('Postal code is required').when('country_code', {
        is: isID,
        then: (s) => s.matches(/^\d{5}$/, 'Indonesian postal codes have 5 digits'),
        otherwise: (s) => s.matches(/^[A-Za-z0-9 -]{3,10}$/, 'Invalid postal code'),
    }),
    address: required('Street address is required')
        .min(10, 'Please enter your full street address')
        .matches(/\p{L}/u, 'Street address must contain a street name'),
    note: yup.string().optional().max(500),
    courier_key: yup.string().required('Choose a shipping option'),
});

export type CheckoutFormData = yup.InferType<typeof checkoutSchema>;

/** Rates are identified by "courier_code|service_code" in the form. */
export const courierKey = (r: { courier_code: string; courier_service_code: string }) =>
    `${r.courier_code}|${r.courier_service_code}`;
