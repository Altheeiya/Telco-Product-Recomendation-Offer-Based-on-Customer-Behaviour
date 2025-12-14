import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated, getUser } from '../utils/auth';
import { getUserRecommendations } from '../services/recommendationService';

const Home = () => {
  const user = getUser();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchRecommendations();
    }
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await getUserRecommendations();
      const recData = response.data || [];
      setRecommendations(recData.slice(0, 2));
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-purewhite flex items-center justify-center px-6">
        <div className="text-center max-w-2xl">
          <div className="w-20 h-20 bg-emerald rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-jet mb-4">Welcome to Telco</h1>
          <p className="text-xl text-darkgrey mb-8">
            One stop digital solution for your telco needs. Get personalized product recommendations.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="bg-emerald text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-600 transition transform hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-white text-emerald px-8 py-4 rounded-lg font-semibold text-lg border-2 border-emerald hover:bg-emerald-50 transition transform hover:scale-105"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purewhite min-h-screen flex flex-col">
      <header className="bg-jet pb-32 pt-10 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald opacity-10 rounded-full blur-3xl -mr-16 -mt-16"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Hi, {user?.username}! 👋</h1>
              <p className="text-gray-400">{user?.email}</p>
            </div>
            <span className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-lg uppercase tracking-wider">
              Postpaid
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 -mt-24 flex-grow mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-silver p-6 rounded-2xl shadow-lg border border-white hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="flex justify-between items-center mb-4">
              <span className="text-darkgrey text-sm font-semibold">Main Balance</span>
              <div className="bg-white p-2 rounded-full shadow-sm">
                <svg className="w-5 h-5 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-jet mb-2">Rp 41.733</h2>
            <p className="text-xs text-emerald font-medium">Active until 30 Dec</p>
          </div>

          <div className="bg-silver p-6 rounded-2xl shadow-lg border border-white hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="flex justify-between items-center mb-4">
              <span className="text-darkgrey text-sm font-semibold">Internet Data</span>
              <div className="bg-white p-2 rounded-full shadow-sm">
                <svg className="w-5 h-5 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-end space-x-2 mb-3">
              <h2 className="text-3xl font-bold text-jet">1</h2>
              <span className="text-lg font-medium text-darkgrey mb-1">GB</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2.5 mb-2">
              <div className="bg-emerald h-2.5 rounded-full" style={{ width: '20%' }}></div>
            </div>
            <p className="text-xs text-darkgrey text-right">Remaining 1 GB of 5 GB</p>
          </div>

          <div className="bg-silver p-6 rounded-2xl shadow-lg border border-white hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="flex justify-between items-center mb-4">
              <span className="text-darkgrey text-sm font-semibold">Telco Points</span>
              <div className="bg-white p-2 rounded-full shadow-sm">
                <svg className="w-5 h-5 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
            <div className="flex items-end space-x-2 mb-2">
              <h2 className="text-3xl font-bold text-jet">1,250</h2>
              <span className="text-lg font-medium text-darkgrey mb-1">pts</span>
            </div>
            <a href="#" className="text-emerald text-sm font-bold hover:underline flex items-center">
              Redeem Now
              <svg className="w-3 h-3 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-1 mb-8 border border-gray-100">
          <div className="bg-silver rounded-xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-emerald opacity-5 rounded-full"></div>

            <div className="relative z-10 mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-jet mb-2 flex items-center">
                Special For You
                <span className="text-2xl ml-2">🎁</span>
              </h3>
              <p className="text-darkgrey opacity-80 max-w-md">
                Get personalized offers based on your usage history. Save up to 50% today.
              </p>
            </div>
            <Link
              to="/products"
              className="bg-emerald hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition transform hover:scale-105 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Check Special Offers
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-jet mb-6 border-l-4 border-emerald pl-3">Recommended Products</h3>

          {loading ? (
            <div className="text-center py-8 text-darkgrey">Loading recommendations...</div>
          ) : recommendations.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
              <p className="text-darkgrey mb-4">No recommendations available yet.</p>
              <Link
                to="/products"
                className="inline-block bg-emerald text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between items-center group"
                >
                  <div className="flex items-start space-x-4 w-full md:w-auto mb-4 md:mb-0">
                    <div className="bg-emerald/10 text-emerald w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="bg-emerald/10 text-emerald text-[10px] font-bold px-2 py-0.5 rounded">
                          {rec.product?.category}
                        </span>
                        <h4 className="text-lg font-bold text-jet group-hover:text-emerald transition">
                          {rec.product?.name}
                        </h4>
                      </div>
                      <p className="text-sm text-darkgrey opacity-70 mb-2">{rec.product?.description}</p>
                      {rec.reason && (
                        <div className="flex items-center text-xs text-emerald bg-emerald/10 px-2 py-1 rounded w-fit">
                          <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          {rec.reason}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end min-w-[120px]">
                    <span className="text-lg font-bold text-emerald mb-2">
                      Rp {rec.product?.price?.toLocaleString('id-ID')}
                    </span>
                    <Link
                      to={`/products/${rec.product?.id}`}
                      className="bg-emerald text-white text-sm font-semibold py-2 px-6 rounded-lg hover:bg-emerald-600 transition w-full md:w-auto text-center"
                    >
                      Buy Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
