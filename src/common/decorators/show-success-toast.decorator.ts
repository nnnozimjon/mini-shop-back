import { SetMetadata } from '@nestjs/common';

export const SHOW_SUCCESS_TOAST_KEY = 'showSuccessToastMessage';

export const ShowSuccessToast = (message?: string) => {
  return SetMetadata(SHOW_SUCCESS_TOAST_KEY, message);
};
