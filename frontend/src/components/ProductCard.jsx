import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import { useNavigate } from 'react-router-dom';
import { getDestinationImage, handleImageError } from '../utils/imageUtils';

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart, getProductMessage, clearProductMessage } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { convertPrice, formatPrice } = useCurrency();
  const navigate = useNavigate();

  const { success, error } = getProductMessage(product.id);

  // Convertir precio a la moneda seleccionada
  const convertedPrice = convertPrice(product.price, 'USD');
  const formattedPrice = formatPrice(convertedPrice);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsAdding(true);
    try {
      await addToCart(product.id, quantity);
    } finally {
      setIsAdding(false);
    }
  };

  const handleCardClick = (e) => {
    // Evitar que el click en el botón "Agregar al carrito" dispare la navegación
    if (e.target.closest('button')) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role === 'ADMIN') {
      // Si es admin, no hace nada
      return;
    }
    navigate(`/schedule-trip/${product.id}`, { state: { product } });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1" onClick={handleCardClick}>
      <img
        src={getDestinationImage(product.destination)}
        alt={product.destination}
        className="w-full h-40 object-cover"
        onError={handleImageError}
      />
      <div className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mb-1">Origen: {product.origin || 'Buenos Aires'} | Destino: {product.destination}</p>
        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{product.description}</p>
      </div>
    </div>
  );
};

export default ProductCard;
