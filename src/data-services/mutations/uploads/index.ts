import { MutationDataService } from '../../type';

export type UploadsMutationKeys = 'upload-image';

export const uploadsMutations: MutationDataService<UploadsMutationKeys> = {
    'upload-image': {
        url: '/uploads',
        method: 'POST',
    },
};
