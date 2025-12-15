import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUser } from '../utils/auth';
import { getUserRecommendations } from '../services/recommendationService';
import { getUserProfile, topUpBalance } from '../services/userService';

const Dashboard = () => {
  const user = getUser();
  const [recommendations, setRecommendations] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // State untuk Modal Top Up
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const profileResponse = await getUserProfile();
      setUserProfile(profileResponse.data);

      const recResponse = await getUserRecommendations();
      const recData = recResponse.data || [];
      setRecommendations(recData.slice(0, 2));
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Buka Modal
  const handleTopUpClick = () => {
    setTopUpAmount(''); // Reset input
    setShowTopUpModal(true);
  };

  // 2. Submit Top Up via Modal
  const submitTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setTopUpLoading(true);
    try {
      await topUpBalance(amount);
      alert("Top Up Successful!");
      setShowTopUpModal(false); // Tutup modal
      fetchData(); // Refresh data saldo
    } catch (err) {
      console.error(err);
      alert("Top Up Failed: " + (err.response?.data?.message || err.message));
    } finally {
      setTopUpLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount || 0);
  };

  const getDataPercentage = () => {
    if (!userProfile) return 0;
    const total = 50; 
    const remaining = userProfile.data_remaining_gb || 0;
    return Math.min(100, (remaining / total) * 100);
  };

  const getExpiryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const getLoyaltyPoints = () => {
    if (!userProfile) return 0;
    return Math.floor((userProfile.monthly_spend || 0) / 1000);
  };

  const getBadgeLevel = () => {
    if (!userProfile) return 'Bronze';
    const spend = userProfile.monthly_spend || 0;
    if (spend > 150000) return 'Gold';
    if (spend > 50000) return 'Silver';
    return 'Bronze';
  };

  const getBadgeColor = () => {
    const badge = getBadgeLevel();
    if (badge === 'Gold') return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-100';
    if (badge === 'Silver') return 'bg-gray-400/20 border-gray-400/30 text-gray-100';
    return 'bg-orange-500/20 border-orange-500/30 text-orange-100';
  };

  return (
    <div className="bg-purewhite min-h-screen flex flex-col relative">
      
      {/* --- MODAL TOP UP --- */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-fadeIn">
            <div className="bg-emerald p-4 text-center">
              <h3 className="text-xl font-bold text-white">Top Up Balance</h3>
            </div>
            
            <div className="p-6">
              <p className="text-darkgrey mb-4 text-center text-sm">
                Enter the amount to add to your balance.
              </p>
              
              <div className="relative mb-6">
                <span className="absolute left-4 top-3 text-gray-400 font-bold">Rp</span>
                <input 
                  type="number" 
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald focus:border-transparent font-bold text-jet text-lg text-right"
                  placeholder="50000"
                  autoFocus
                />
              </div>

              {/* Pilihan Cepat (Optional) */}
              <div className="flex justify-between gap-2 mb-6">
                {[50000, 100000, 200000].map(val => (
                  <button 
                    key={val}
                    onClick={() => setTopUpAmount(val)}
                    className="text-xs bg-gray-100 hover:bg-emerald/10 hover:text-emerald text-gray-600 py-2 px-2 rounded-lg transition border border-transparent hover:border-emerald/30 flex-1"
                  >
                    {val / 1000}k
                  </button>
                ))}
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowTopUpModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-darkgrey font-semibold rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitTopUp}
                  disabled={topUpLoading}
                  className="flex-1 py-3 px-4 bg-emerald text-white font-bold rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald/20 transition disabled:opacity-70 flex justify-center items-center"
                >
                  {topUpLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* --- END MODAL --- */}

      <header className="bg-jet pb-32 pt-10 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald opacity-10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Hi, {user?.username}! 👋</h1>
              <p className="text-gray-400">{user?.email}</p>
            </div>
            <span className={`backdrop-blur-sm border px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${getBadgeColor()}`}>
              {getBadgeLevel()} Member
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 -mt-24 flex-grow mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* 1. BALANCE (Pulsa) */}
          <div className="bg-silver p-6 rounded-2xl shadow-lg border border-white hover:shadow-xl transition transform hover:-translate-y-1 relative group">
            <div className="flex justify-between items-center mb-4">
              <span className="text-darkgrey text-sm font-semibold">Balance</span>
              {/* Tombol Top Up membuka Modal */}
              <button 
                onClick={handleTopUpClick}
                className="bg-emerald hover:bg-emerald-600 text-white p-2 rounded-full shadow-md transition transform hover:scale-110 flex items-center justify-center w-8 h-8"
                title="Top Up Balance"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-jet mb-2">
                  Rp {formatCurrency(userProfile?.balance || 0)}
                </h2>
                <div className="flex justify-between items-end">
                    <p className="text-xs text-emerald font-medium">Active until {getExpiryDate()}</p>
                    <span 
                      className="text-[10px] text-gray-500 cursor-pointer hover:text-emerald" 
                      onClick={handleTopUpClick}
                    >
                        Click + to Top Up
                    </span>
                </div>
              </>
            )}
          </div>

          {/* 2. INTERNET QUOTA */}
          <div className="bg-silver p-6 rounded-2xl shadow-lg border border-white hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="flex justify-between items-center mb-4">
              <span className="text-darkgrey text-sm font-semibold">Internet Quota</span>
              <div className="bg-white p-2 rounded-full shadow-sm">
                <svg className="w-5 h-5 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-20 mb-3"></div>
                <div className="h-2 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-32"></div>
              </div>
            ) : (
              <>
                <div className="flex items-end space-x-2 mb-3">
                  <h2 className="text-3xl font-bold text-jet">
                    {userProfile?.data_remaining_gb?.toFixed(1) || '0'}
                  </h2>
                  <span className="text-lg font-medium text-darkgrey mb-1">GB</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2.5 mb-2">
                  <div 
                    className="bg-emerald h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${getDataPercentage()}%` }}
                  ></div>
                </div>
                <p className="text-xs text-darkgrey text-right">
                  Total Active: {userProfile?.data_remaining_gb?.toFixed(1) || 0} GB
                </p>
              </>
            )}
          </div>

          {/* 3. TELCO POINTS */}
          <div className="bg-silver p-6 rounded-2xl shadow-lg border border-white hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="flex justify-between items-center mb-4">
              <span className="text-darkgrey text-sm font-semibold">Telco Points</span>
              <div className="bg-white p-2 rounded-full shadow-sm">
                <svg className="w-5 h-5 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </div>
            ) : (
              <>
                <div className="flex items-end space-x-2 mb-2">
                  <h2 className="text-3xl font-bold text-jet">
                    {getLoyaltyPoints()}
                  </h2>
                  <span className="text-lg font-medium text-darkgrey mb-1">pts</span>
                </div>
                <p className="text-xs text-gray-600">1 point = Rp 1.000 spent</p>
              </>
            )}
          </div>
        </div>

        {/* 4. SPECIAL FOR YOU BANNER */}
        <div className="bg-white rounded-2xl shadow-lg p-1 mb-8 border border-gray-100">
          <div className="bg-silver rounded-xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-emerald opacity-5 rounded-full"></div>

            <div className="relative z-10 mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-jet mb-2 flex items-center">
                Special For You
                <span className="text-2xl ml-2">🎁</span>
              </h3>
              <p className="text-darkgrey opacity-80 max-w-md">
                {(userProfile?.monthly_spend || 0) > 0 ? (
                  <>
                    AI customized recommendations based on your spending of{' '}
                    <span className="font-bold text-emerald">Rp {formatCurrency(userProfile.monthly_spend)}</span>. 
                    Save up to 50% today!
                  </>
                ) : (
                  'Hello New Member! Start your first transaction to activate your Personal AI Assistant.'
                )}
              </p>
            </div>
            <Link
              to="/products"
              className="bg-emerald hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition transform hover:scale-105 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {userProfile?.monthly_spend > 0 ? 'Check AI Offers' : 'Start Shopping'}
            </Link>
          </div>
        </div>

        {/* Recommended Products */}
        <div>
          <h3 className="text-xl font-bold text-jet mb-6 border-l-4 border-emerald pl-3">
            Recommended for You
          </h3>

          {loading ? (
            <div className="text-center py-8 text-darkgrey">
              <svg className="animate-spin h-8 w-8 text-emerald mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading AI recommendations...
            </div>
          ) : recommendations.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
              <p className="text-darkgrey mb-4">
                {userProfile?.monthly_spend > 0 
                  ? `AI is analyzing your spending patterns (Rp ${formatCurrency(userProfile.monthly_spend)})...`
                  : 'Make your first purchase to get personalized AI recommendations!'
                }
              </p>
              <Link
                to="/products"
                className="inline-block bg-emerald text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition"
              >
                View All Products
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

export default Dashboard;