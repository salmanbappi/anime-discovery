export const getProxiedImage = (url) => {
  if (!url) return '';
  // Proxy disabled due to loading issues
  return url; 
  // return `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=webp`;
};
