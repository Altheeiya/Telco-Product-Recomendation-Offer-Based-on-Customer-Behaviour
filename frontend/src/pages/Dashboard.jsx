import { useState } from 'react';
import { getUser } from '../utils/auth';
import dummyRecommendations from '../utils/dummyData';

const Dashboard = () => {
  const user = getUser();
  const [filter, setFilter] = useState('all');

  const filteredProducts = filter === 'recommended' 
    ? dummyRecommendations.filter(p => p.recommended)
    : dummyRecommendations;

  return (
    <div className="min-h-screen bg-red-50 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome, {user?.username}!
          </h1>
          <p className="text-gray-600">
            Discover personalized offers based on your preferences
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Offers
          </button>
          <button
            onClick={() => setFilter('recommended')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              filter === 'recommended'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Recommended for You
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">
                      {product.name}
                    </h3>
                    <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  {product.recommended && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                      Recommended
                    </span>
                  )}
                </div>

                <p className="text-gray-600 mb-4">
                  {product.description}
                </p>

                <div className="bg-red-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Why this offer?
                  </p>
                  <p className="text-sm text-gray-600">
                    {product.reason}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-3xl font-bold text-red-600">
                      Rp {product.price.toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-gray-500">
                      Valid for {product.validity_days} days
                    </p>
                  </div>
                  <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center text-gray-600 mt-12 bg-white rounded-xl shadow-md p-12">
            <p className="text-xl">No offers available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
