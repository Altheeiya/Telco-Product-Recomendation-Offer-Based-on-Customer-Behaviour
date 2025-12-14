import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts } from '../services/productService';
import { getUserRecommendations } from '../services/recommendationService';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('offer');
  useEffect(() => {
    fetchProducts();
    fetchRecommendations();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getAllProducts();
      console.log('Products response:', response);
      if (Array.isArray(response)) {
        setProducts(response);
      } else if (response && Array.isArray(response.data)) {
        setProducts(response.data);
      } else if (response && Array.isArray(response.products)) {
        setProducts(response.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await getUserRecommendations();
      const recData = response.data || [];
      setRecommendations(recData);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setRecommendations([]);
    }
  };

  const getOfferProducts = () => {
    // Filter products dengan harga < 50000 sebagai offer
    return products.filter(p => p.price < 50000);
  };

  const getDisplayProducts = () => {
    if (activeTab === 'offer') {
      return getOfferProducts();
    } else if (activeTab === 'recommendation') {
      return recommendations.map(rec => rec.product).filter(Boolean);
    }
    return products;
  };

  const displayProducts = getDisplayProducts();

  if (loading) {
    return (
      <div className="min-h-screen bg-purewhite flex items-center justify-center">
        <div className="text-xl text-darkgrey">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-purewhite flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purewhite py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-jet">
            Products
          </h1>
          <Link
            to="/products/create"
            className="bg-emerald text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Product
          </Link>
        </div>

        <div className="flex gap-2 mb-8 bg-silver p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('offer')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'offer'
                ? 'bg-emerald text-white shadow-md'
                : 'text-darkgrey hover:text-jet'
            }`}
          >
            Special Offers
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'available'
                ? 'bg-emerald text-white shadow-md'
                : 'text-darkgrey hover:text-jet'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setActiveTab('recommendation')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'recommendation'
                ? 'bg-emerald text-white shadow-md'
                : 'text-darkgrey hover:text-jet'
            }`}
          >
            For You
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProducts.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-jet">
                    {product.name}
                  </h3>
                  <span className="bg-emerald/10 text-emerald text-xs font-semibold px-3 py-1 rounded-full">
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
                      Valid for {product.validity_days} days
                    </p>
                  </div>
                  <div className="text-emerald font-medium">
                    View Details →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {displayProducts.length === 0 && (
          <div className="text-center text-darkgrey mt-12 bg-white rounded-xl p-12 border border-gray-100">
            <p className="text-xl mb-2">No products available</p>
            <p className="text-sm text-darkgrey/70">
              {activeTab === 'offer' && 'No special offers at the moment'}
              {activeTab === 'recommendation' && 'No recommendations yet. Browse more products!'}
              {activeTab === 'available' && 'Check back later for new products'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
