import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/productService';
import { createTransaction } from '../services/transactionService';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await getProductById(id);
      console.log('Product detail response:', response);
      if (response && response.data) {
        setProduct(response.data);
      } else if (response && response.id) {
        setProduct(response);
      } else {
        setProduct(null);
      }
    } catch (err) {
      console.error('Fetch product error:', err);
      setError(err.response?.data?.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    setPurchasing(true);
    setError('');
    setSuccess('');

    try {
      await createTransaction(product.id);
      setSuccess('Transaction successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction failed');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading product...</div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Product not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <button
          onClick={() => navigate('/products')}
          className="mb-6 text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
        >
          ← Back to Products
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-red-600 text-white p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <span className="bg-white bg-opacity-20 px-4 py-1 rounded-full text-sm">
                  {product.category}
                </span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">
                  Rp {product.price.toLocaleString('id-ID')}
                </p>
                <p className="text-sm opacity-90 mt-1">
                  Valid for {product.validity_days} days
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Description
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              {product.description}
            </p>

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
                {success}
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {purchasing ? 'Processing...' : 'Purchase Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
