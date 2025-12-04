import { Link } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const Home = () => {
  return (
    <div className="min-h-screen bg-red-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Find Your Perfect
            <span className="text-red-600"> Data Plan</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover personalized internet packages tailored to your needs. 
            Get the best offers and recommendations just for you.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {isAuthenticated() ? (
              <>
                <Link
                  to="/products"
                  className="bg-red-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition transform hover:scale-105"
                >
                  Browse Products
                </Link>
                <Link
                  to="/dashboard"
                  className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-red-600 hover:bg-red-50 transition transform hover:scale-105"
                >
                  View Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-red-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition transform hover:scale-105"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-red-600 hover:bg-red-50 transition transform hover:scale-105"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center transform hover:scale-105 transition">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Fast & Reliable
            </h3>
            <p className="text-gray-600">
              High-speed internet packages for all your needs
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center transform hover:scale-105 transition">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Best Prices
            </h3>
            <p className="text-gray-600">
              Affordable packages with great value for money
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center transform hover:scale-105 transition">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Personalized
            </h3>
            <p className="text-gray-600">
              Get recommendations based on your usage
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of satisfied customers enjoying our services
          </p>
          {!isAuthenticated() && (
            <Link
              to="/register"
              className="inline-block bg-red-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition transform hover:scale-105"
            >
              Create Free Account
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
