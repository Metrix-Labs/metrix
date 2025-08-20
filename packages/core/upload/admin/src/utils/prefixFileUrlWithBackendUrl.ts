export const prefixFileUrlWithBackendUrl = (fileURL?: string) => {
  return !!fileURL && fileURL.startsWith('/') ? `${window.metrix.backendURL}${fileURL}` : fileURL;
};
