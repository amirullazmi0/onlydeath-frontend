import { MutationDataService } from '../../type';

export type UploadsMutationKeys = 'upload-image' | 'upload-document';

export const uploadsMutations: MutationDataService<UploadsMutationKeys> = {
    'upload-image': {
        url: '/uploads',
        method: 'POST',
    },
    'upload-document': {
        url: '/uploads/document',
        method: 'POST',
    },
};
