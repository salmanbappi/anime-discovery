export const getProxiedImage = (url) => {
  if (!url) return '';
  // Using imageproxy.org as a reliable alternative
  return `https://imageproxy.org/600x,q80,fit/${url}`;
};
