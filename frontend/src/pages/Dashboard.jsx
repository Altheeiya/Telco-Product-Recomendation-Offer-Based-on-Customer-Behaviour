import { useState, useEffect } from 'react';
import { getUser } from '../utils/auth';
import { getMyRecommendations, generateRecommendation } from '../services/mlService';

const Dashboard = () => {
  const user = getUser();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  // Form data untuk behavior
  const [behaviorData, setBehaviorData] = useState({
    plan_type: 'Postpaid',
    device_brand: 'Samsung',
    avg_data_usage_gb: 5,
    pct_video_usage: 0.4,
    avg_call_duration: 15,
    sms_freq: 10,
    monthly_spend: 100000,
    topup_freq: 2,
    travel_score: 0.3,
    complaint_count: 0
  });

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching recommendations from API...');
      
      const response = await getMyRecommendations();
      console.log('📊 API Response:', response);
      
      if (response.status === 'success' && Array.isArray(response.data)) {
        console.log('✅ Got', response.data.length, 'recommendations');
        setRecommendations(response.data);
      } else {
        console.log('⚠️ No recommendations data');
        setRecommendations([]);
      }
    } catch (err) {
      console.error('❌ Fetch recommendations error:', err);
      setError(err.response?.data?.message || 'Failed to load recommendations');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRecommendation = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setError('');
    setSuccess('');

    try {
      console.log('🤖 Generating recommendation with data:', behaviorData);
      const response = await generateRecommendation(behaviorData);
      console.log('✅ Generate response:', response);
      
      if (response.status === 'success') {
        setSuccess('✨ Recommendations generated successfully! Refreshing...');
        setShowForm(false);
        
        // Wait 2 seconds then refresh
        setTimeout(async () => {
          await fetchRecommendations();
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      console.error('❌ Generate error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to generate recommendations';
      const errorHint = err.response?.data?.hint || '';
      setError(`${errorMsg}${errorHint ? ` (${errorHint})` : ''}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setBehaviorData({
      ...behaviorData,
      [name]: type === 'number' ? parseFloat(value) : value
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading recommendations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-50 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Welcome, {user?.username}! 👋
              </h1>
              <p className="text-gray-600">
                {recommendations.length > 0 
                  ? `You have ${recommendations.length} personalized recommendations`
                  : 'No recommendations yet. Generate your first recommendation!'}
              </p>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setError('');
                setSuccess('');
              }}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition whitespace-nowrap"
            >
              {showForm ? '❌ Cancel' : '🤖 Generate Recommendations'}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
            <svg className="w-6 h-6 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        {/* Form untuk Generate Recommendation */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              📝 Tell us about your usage behavior
            </h2>
            <p className="text-gray-600 mb-6">
              Fill in your mobile usage details to get personalized recommendations
            </p>
            
            <form onSubmit={handleGenerateRecommendation} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Type
                </label>
                <select
                  name="plan_type"
                  value={behaviorData.plan_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                >
                  <option value="Postpaid">Postpaid</option>
                  <option value="Prepaid">Prepaid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device Brand
                </label>
                <select
                  name="device_brand"
                  value={behaviorData.device_brand}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                >
                  <option value="Samsung">Samsung</option>
                  <option value="Xiaomi">Xiaomi</option>
                  <option value="Oppo">Oppo</option>
                  <option value="Vivo">Vivo</option>
                  <option value="Realme">Realme</option>
                  <option value="Huawei">Huawei</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Data Usage (GB/month)
                </label>
                <input
                  type="number"
                  name="avg_data_usage_gb"
                  value={behaviorData.avg_data_usage_gb}
                  onChange={handleInputChange}
                  required
                  step="0.1"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Usage Percentage (0.0 - 1.0)
                </label>
                <input
                  type="number"
                  name="pct_video_usage"
                  value={behaviorData.pct_video_usage}
                  onChange={handleInputChange}
                  required
                  step="0.1"
                  min="0"
                  max="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">0.0 = no video, 1.0 = all video</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Call Duration (minutes/day)
                </label>
                <input
                  type="number"
                  name="avg_call_duration"
                  value={behaviorData.avg_call_duration}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMS Frequency (per day)
                </label>
                <input
                  type="number"
                  name="sms_freq"
                  value={behaviorData.sms_freq}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Spend (Rp)
                </label>
                <input
                  type="number"
                  name="monthly_spend"
                  value={behaviorData.monthly_spend}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="1000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Top-up Frequency (per month)
                </label>
                <input
                  type="number"
                  name="topup_freq"
                  value={behaviorData.topup_freq}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Travel Score (0.0 - 1.0)
                </label>
                <input
                  type="number"
                  name="travel_score"
                  value={behaviorData.travel_score}
                  onChange={handleInputChange}
                  required
                  step="0.1"
                  min="0"
                  max="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">0.0 = never travel, 1.0 = always travel</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complaint Count (per month)
                </label>
                <input
                  type="number"
                  name="complaint_count"
                  value={behaviorData.complaint_count}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={generating}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {generating ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating Recommendations...
                    </>
                  ) : (
                    <>✨ Generate Recommendations</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Display Recommendations */}
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">
                        {rec.product?.name || 'Product'}
                      </h3>
                      <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                        {rec.product?.category || 'Unknown'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                        Match: {(rec.score * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">
                    {rec.product?.description || 'No description'}
                  </p>

                  <div className="bg-red-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      💡 Why this offer?
                    </p>
                    <p className="text-sm text-gray-600">
                      {rec.reason || 'Based on your usage pattern'}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-3xl font-bold text-red-600">
                        Rp {rec.product?.price?.toLocaleString('id-ID') || '0'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Valid for {rec.product?.validity_days || 0} days
                      </p>
                    </div>
                    <button 
                      onClick={() => window.location.href = `/products/${rec.product?.id}`}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white rounded-xl shadow-md p-12">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-xl text-gray-800 font-semibold mb-2">No recommendations yet</p>
            <p className="text-gray-500 mb-6">
              Click the "Generate Recommendations" button above to get personalized product suggestions based on your usage!
            </p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition inline-block"
              >
                Get Started
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;