import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useAuth();

  const handleAddToCart = async () => {
    if (!user) {
      setError("Por favor inicia sesion para agregar productos al carrito");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3000/api/cart",
        {
          productId: product.id,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setError("");
      setSuccess("Producto agregado correctamente!");
      setTimeout(() => setSuccess(""), 3000); // Se elimina mensaje depsues de 3 segundos
    } catch (error) {
      setError(
        error.response?.data?.error || "Error al agregar el producto al carrito"
      );
      console.error("Error al agregar al carrito:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 mb-4">{product.description}</p>
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-bold text-gray-900">
            ${product.price}
          </span>
          <span
            className={`text-sm font-medium ${
              product.stock > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {product.stock > 0 ? `Stock: ${product.stock}` : "Sin stock"}
          </span>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            {success}
          </div>
        )}
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="text-gray-500 hover:text-gray-700"
              disabled={quantity <= 1}
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.min(
                    product.stock,
                    Math.max(1, parseInt(e.target.value) || 1)
                  )
                )
              }
              className="w-16 text-center border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="text-gray-500 hover:text-gray-700"
              disabled={quantity >= product.stock}
            >
              +
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
              product.stock === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
