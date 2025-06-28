// Utilidades para manejar rutas de imágenes
export const getImagePath = (imageName) => {
  // Si la imagen ya tiene una ruta completa, la devolvemos tal como está
  if (imageName && imageName.startsWith('http')) {
    return imageName;
  }
  
  // Si la imagen ya tiene una ruta relativa que comienza con /, la devolvemos
  if (imageName && imageName.startsWith('/')) {
    return imageName;
  }
  
  // Si no hay imagen o es undefined, usar bariloche como fallback
  if (!imageName) {
    return '/images/bariloche.jpg';
  }
  
  // Si la imagen no tiene ruta, asumimos que está en /images/
  return `/images/${imageName}`;
};

export const getDestinationImage = (destination) => {
  const images = {
    // Destinos argentinos
    'Bariloche': '/images/bariloche.jpg',
    'Iguazú': '/images/iguazujpg.jpg',
    'Mendoza': '/images/mendoza.jpeg',
    'Salta': '/images/salta.jpg',
    'Ushuaia': '/images/ushuaiajpg.jpg',
    'Córdoba': '/images/cordoba.jpg',
    
    // Destinos internacionales
    'Río de Janeiro': '/images/rio-janeiro.jpg',
    'Santiago de Chile': '/images/santiago-chile.jpg',
    'Lima': '/images/lima.jpeg',
    'Bogotá': '/images/bogota.jpeg',
    'Ciudad de México': '/images/mexico.jpg',
    'Nueva York': '/images/new-york.jpg',
    'París': '/images/paris.jpg',
    'Tokio': '/images/tokio.jpg'
  };
 
  return images[destination] || '/images/bariloche.jpg';
};

export const handleImageError = (e) => {
  e.target.src = '/images/bariloche.jpg';
}; 