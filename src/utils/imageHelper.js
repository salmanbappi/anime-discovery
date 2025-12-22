export const getProxiedImage = (url) => {
  if (!url) return '';
  // Use Statically as an image proxy
  // Format: https://cdn.statically.io/img/:domain/:path
  const cleanUrl = url.replace(/^https?:\/\//, '');
  return `https://cdn.statically.io/img/${cleanUrl}`;
};
