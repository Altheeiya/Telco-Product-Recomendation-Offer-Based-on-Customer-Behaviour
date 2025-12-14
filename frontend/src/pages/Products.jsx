import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts } from '../services/productService';
import { getUserRecommendations } from '../services/recommendationService';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState('offer');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchRecommendations();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getAllProducts();
      if (Array.isArray(response)) {
        setProducts(response);
      } else if (response?.data) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await getUserRecommendations();
      setRecommendations(response?.data || []);
    } catch (err) {
      setRecommendations([]);
    }
  };

  const getOfferProducts = () =>
    products.filter(p => p.price < 50000);

  const getDisplayProducts = () => {
    if (activeTab === 'offer') return getOfferProducts();
    if (activeTab === 'recommendation')
      return recommendations.map(r => r.product).filter(Boolean);
    return products;
  };

  const displayProducts = getDisplayProducts();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-darkgrey">
        Loading products...
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purewhite py-12 px-4">
      <div className="container mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-jet">Products</h1>
          <p className="text-darkgrey mt-2">
            Browse products and personalized offers
          </p>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-8 bg-silver p-1 rounded-xl w-fit">
          {['offer', 'available', 'recommendation'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === tab
                  ? 'bg-emerald text-white shadow'
                  : 'text-darkgrey hover:text-jet'
              }`}
            >
              {tab === 'offer' && 'Special Offers'}
              {tab === 'available' && 'All Products'}
              {tab === 'recommendation' && 'For You'}
            </button>
          ))}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProducts.map(product => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex justify-between mb-3">
                  <h3 className="text-xl font-bold text-jet">
                    {product.name}
                  </h3>
                  <span className="text-xs bg-emerald/10 text-emerald px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>

                <p className="text-darkgrey mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-emerald">
                      Rp {product.price?.toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-darkgrey">
                      Valid {product.validity_days} days
                    </p>
                  </div>
                  <span className="text-emerald font-medium">
                    View →
                  </span>
                </div>
              </div>

              {activeTab === 'recommendation' && (
                <div className="border-t px-6 py-3 text-xs text-emerald flex items-center gap-2">
                  🤖 Recommended for you
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* EMPTY STATE */}
        {displayProducts.length === 0 && (
          <div className="text-center text-darkgrey mt-12 bg-white rounded-xl p-12 border">
            <p className="text-xl font-semibold">No products available</p>
            <p className="text-sm mt-2">
              {activeTab === 'offer' && 'No special offers right now'}
              {activeTab === 'recommendation' && 'No recommendations yet'}
              {activeTab === 'available' && 'Check back later'}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Products;
