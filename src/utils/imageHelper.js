export const getProxiedImage = (url) => {
  if (!url) return '';
  // Convert to https if it's http
  const secureUrl = url.replace(/^http:\/\//i, 'https://');
  // Use wsrv.nl as it's one of the most reliable and fastest image proxies available
  return `https://wsrv.nl/?url=${encodeURIComponent(secureUrl)}`;
};
