import { MutationDataService } from '../type';
import { AuthKeys, authMutations } from './auth';
import { UsersMutationKeys, usersMutations } from './users';
import { CategoriesMutationKeys, categoriesMutations } from './categories';
import { ProductsMutationKeys, productsMutations } from './products';
import { UploadsMutationKeys, uploadsMutations } from './uploads';
import { ShippingMutationKeys, shippingMutations } from './shipping';
import { OrdersMutationKeys, ordersMutations } from './orders';

export type AllMutationKeys =
    | AuthKeys
    | UsersMutationKeys
    | CategoriesMutationKeys
    | ProductsMutationKeys
    | UploadsMutationKeys
    | ShippingMutationKeys
    | OrdersMutationKeys;

export const allMutations: MutationDataService<AllMutationKeys> = {
    ...authMutations,
    ...usersMutations,
    ...categoriesMutations,
    ...productsMutations,
    ...uploadsMutations,
    ...shippingMutations,
    ...ordersMutations,
};
