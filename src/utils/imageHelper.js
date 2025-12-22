export const getProxiedImage = (url) => {
  if (!url) return '';
  // Use wsrv.nl as an image proxy
  // output=webp for better compression
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=webp`;
};
