// Utility for handling public product routes
export const generatePublicProductUrl = (productName: string): string => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://iestore.netlify.app' 
    : 'http://localhost:8081';
  
  return `${baseUrl}/?product=${encodeURIComponent(productName)}`;
};

export const parsePublicProductUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const productIndex = pathParts.indexOf('public-product');
    
    if (productIndex !== -1 && pathParts[productIndex + 1]) {
      return decodeURIComponent(pathParts[productIndex + 1]);
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing public product URL:', error);
    return null;
  }
};

// For development, we'll use a simple hash-based routing
export const handlePublicProductRoute = (): string | null => {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash;
    const match = hash.match(/#\/public-product\/(.+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }
  return null;
};


