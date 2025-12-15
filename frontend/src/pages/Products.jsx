import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts } from '../services/productService';
import { checkAndGenerateRecommendations } from '../services/recommendationService';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState('offer');
  const [loading, setLoading] = useState(true);
  const [mlGenerating, setMlGenerating] = useState(false);
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
      setMlGenerating(true);
      const response = await checkAndGenerateRecommendations();
      
      if (response.justGenerated) {
        console.log('✅ ML recommendations just generated');
      }
      
      setRecommendations(response?.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setRecommendations([]);
    } finally {
      setMlGenerating(false);
    }
  };

  const handleRefreshRecommendations = async () => {
    setMlGenerating(true);
    setError('');
    
    try {
      // Force re-generate dengan memanggil endpoint generate
      await generateRecommendation();
      
      // Tunggu 2 detik untuk ML processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Fetch ulang recommendations
      await fetchRecommendations();
    } catch (err) {
      setError('Failed to refresh recommendations');
    } finally {
      setMlGenerating(false);
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-jet">Products</h1>
            <p className="text-darkgrey mt-2">
              Browse products and personalized offers
            </p>
          </div>
          
          {/* ⭐ BUTTON REFRESH REKOMENDASI */}
          {activeTab === 'recommendation' && (
            <button
              onClick={handleRefreshRecommendations}
              disabled={mlGenerating}
              className="bg-emerald text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition disabled:opacity-50 flex items-center gap-2"
            >
              <svg className={`w-5 h-5 ${mlGenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {mlGenerating ? 'Refreshing...' : 'Refresh AI Recommendations'}
            </button>
          )}
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
              {tab === 'recommendation' && (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  For You
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ⭐ ML GENERATING INDICATOR */}
        {mlGenerating && activeTab === 'recommendation' && (
          <div className="bg-emerald/10 border border-emerald rounded-xl p-6 mb-8 flex items-center gap-4">
            <svg className="animate-spin h-8 w-8 text-emerald" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div>
              <p className="font-semibold text-jet">🤖 AI is analyzing your usage pattern...</p>
              <p className="text-sm text-darkgrey">This will take a few seconds</p>
            </div>
          </div>
        )}

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
                <div className="border-t px-6 py-3 text-xs text-emerald flex items-center gap-2 bg-emerald/5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI-Powered Recommendation
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* EMPTY STATE */}
        {displayProducts.length === 0 && !mlGenerating && (
          <div className="text-center text-darkgrey mt-12 bg-white rounded-xl p-12 border">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl font-semibold mb-2">No products available</p>
            <p className="text-sm">
              {activeTab === 'offer' && 'No special offers right now'}
              {activeTab === 'recommendation' && 'Click refresh to generate AI recommendations'}
              {activeTab === 'available' && 'Check back later'}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Products;