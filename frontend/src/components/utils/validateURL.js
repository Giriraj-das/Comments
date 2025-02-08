const urlRegex = /^(https?|ftps?|ftp):\/\/([A-Z0-9][A-Z0-9-]{0,61}[A-Z0-9]\.)+[A-Z]{2,63}(:\d{1,5})?(\/[^\s]*)?$/i;

export const validateURL = (url) => {
  if (!url) return true;
  return urlRegex.test(url);
};