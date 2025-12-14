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
      setSuccess('Transaction successful! Redirecting to products...');
      setTimeout(() => {
        navigate('/products');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction failed');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-purewhite flex items-center justify-center">
        <div className="text-xl text-darkgrey">Loading product...</div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-purewhite flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-purewhite flex items-center justify-center">
        <div className="text-xl text-darkgrey">Product not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purewhite py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <button
          onClick={() => navigate('/products')}
          className="mb-6 text-emerald hover:text-emerald-600 font-semibold flex items-center gap-2 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Products
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-jet text-white p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald opacity-10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
                <span className="bg-emerald/20 backdrop-blur-sm border border-emerald/30 text-emerald-100 px-4 py-2 rounded-lg text-sm font-semibold">
                  {product.category}
                </span>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-emerald">
                  Rp {product.price.toLocaleString('id-ID')}
                </p>
                <p className="text-sm text-gray-400 mt-2 flex items-center justify-end gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Valid for {product.validity_days} days
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-xl font-bold text-jet mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Description
            </h2>
            <p className="text-darkgrey leading-relaxed mb-8 pl-7">
              {product.description}
            </p>

            <div className="bg-silver rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-jet mb-4">Package Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald/10 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-darkgrey">Category</p>
                    <p className="font-semibold text-jet">{product.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-emerald/10 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-darkgrey">Price</p>
                    <p className="font-semibold text-jet">Rp {product.price.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>
            </div>

            {success && (
              <div className="bg-emerald/10 border border-emerald text-emerald px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {success}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="w-full bg-emerald text-white py-4 rounded-lg font-semibold text-lg hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {purchasing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Purchase Now
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
