const prefixFileUrlWithBackendUrl = (fileURL?: string): string | undefined => {
  return !!fileURL && fileURL.startsWith('/') ? `${window.metrix.backendURL}${fileURL}` : fileURL;
};

export { prefixFileUrlWithBackendUrl };
