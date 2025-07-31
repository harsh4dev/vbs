import { toast } from 'react-toastify';

const shownToasts = new Set();

export const showToast = (message, options = {}) => {
  const toastKey = `${message}-${options.toastId || ''}`;
  if (shownToasts.has(toastKey)) {
    console.log(`Skipping duplicate toast: ${toastKey}`);
    return;
  }
  shownToasts.add(toastKey);
  toast(message, {
    ...options,
    onClose: () => shownToasts.delete(toastKey),
    type: options.type || 'info',
  });
};