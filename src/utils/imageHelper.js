export const getProxiedImage = (url) => {
  if (!url) return '';
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
};
