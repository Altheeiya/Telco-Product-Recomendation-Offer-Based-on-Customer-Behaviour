import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts } from '../services/productService';
<<<<<<< Updated upstream
=======
import { getUserRecommendations, generateRecommendation } from '../services/recommendationService';
>>>>>>> Stashed changes

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
<<<<<<< Updated upstream
=======
  const [activeTab, setActiveTab] = useState('offer');
  const [isGeneratingML, setIsGeneratingML] = useState(false);
>>>>>>> Stashed changes

  useEffect(() => {
    fetchProducts();
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

<<<<<<< Updated upstream
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading products...</div>
=======
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

  const autoGenerateRecommendations = async () => {
    setIsGeneratingML(true);
    try {
      // Call ML API to generate recommendations
      await generateRecommendation();
      
      // Wait a bit for ML processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Fetch updated recommendations
      await fetchRecommendations();
      
      // Show success message
      setError('');
    } catch (err) {
      console.error('Failed to generate recommendations:', err);
      setError('Failed to generate recommendations. Please try again.');
    } finally {
      setIsGeneratingML(false);
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
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-emerald mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl text-darkgrey">Loading products...</p>
        </div>
>>>>>>> Stashed changes
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
<<<<<<< Updated upstream
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Available Products
          </h1>
          <Link
            to="/products/create"
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Product
          </Link>
        </div>

=======
        {/* Header - TOMBOL CREATE PRODUCT DIHAPUS */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-jet">Products</h1>
          <p className="text-darkgrey mt-2">Browse our available products and special offers</p>
        </div>

        {/* Tab Buttons */}
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
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeTab === 'recommendation'
                ? 'bg-emerald text-white shadow-md'
                : 'text-darkgrey hover:text-jet'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            For You
          </button>
        </div>

        {/* Loading UI for ML Generation */}
        {isGeneratingML && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 animate-pulse">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-emerald" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div>
                <p className="text-emerald-700 font-semibold">
                  🤖 AI sedang menganalisis perilaku Anda...
                </p>
                <p className="text-emerald-600 text-sm">
                  Tunggu beberapa detik, rekomendasi akan muncul
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button for Recommendation Tab */}
        {activeTab === 'recommendation' && (
          <div className="mb-6 flex justify-between items-center bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-darkgrey">
                Rekomendasi personal berdasarkan analisis ML
              </p>
            </div>
            <button
              onClick={autoGenerateRecommendations}
              disabled={isGeneratingML}
              className={`px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                isGeneratingML 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald text-white hover:bg-emerald-600 shadow-md hover:shadow-lg transform hover:scale-105'
              }`}
            >
              <svg className={`w-4 h-4 ${isGeneratingML ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isGeneratingML ? 'Generating...' : 'Refresh Rekomendasi'}
            </button>
          </div>
        )}

        {/* Success Message */}
        {error && !isGeneratingML && error.includes('success') && (
          <div className="bg-emerald-50 border border-emerald-400 text-emerald-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Products Grid */}
>>>>>>> Stashed changes
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
<<<<<<< Updated upstream
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-800">
=======
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 border border-gray-100 group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-jet group-hover:text-emerald transition">
>>>>>>> Stashed changes
                    {product.name}
                  </h3>
                  <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      Rp {product.price.toLocaleString('id-ID')}
                    </p>
<<<<<<< Updated upstream
                    <p className="text-sm text-gray-500">
                      Valid for {product.validity_days} days
                    </p>
                  </div>
                  <div className="text-red-600 font-medium">
                    View Details →
=======
                    <p className="text-sm text-darkgrey flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Valid for {product.validity_days} days
                    </p>
                  </div>
                  <div className="text-emerald font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
>>>>>>> Stashed changes
                  </div>
                </div>
              </div>
              
              {/* Recommendation Badge */}
              {activeTab === 'recommendation' && (
                <div className="bg-emerald/5 border-t border-emerald/20 px-6 py-3">
                  <div className="flex items-center gap-2 text-xs text-emerald">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="font-semibold">Recommended for you</span>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>

<<<<<<< Updated upstream
        {products.length === 0 && (
          <div className="text-center text-gray-600 mt-12">
            <p className="text-xl">No products available</p>
=======
        {/* Empty State */}
        {displayProducts.length === 0 && !isGeneratingML && (
          <div className="text-center text-darkgrey mt-12 bg-white rounded-xl p-12 border border-gray-100">
            <div className="bg-silver w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-darkgrey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-xl mb-2 font-semibold">No products available</p>
            <p className="text-sm text-darkgrey/70 mb-4">
              {activeTab === 'offer' && 'No special offers at the moment'}
              {activeTab === 'recommendation' && !isGeneratingML && (
                <>
                  No recommendations yet. Click "Refresh Rekomendasi" to generate personalized recommendations!
                </>
              )}
              {activeTab === 'available' && 'Check back later for new products'}
            </p>
            {activeTab === 'recommendation' && !isGeneratingML && (
              <button
                onClick={autoGenerateRecommendations}
                className="bg-emerald text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Recommendations
              </button>
            )}
>>>>>>> Stashed changes
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;