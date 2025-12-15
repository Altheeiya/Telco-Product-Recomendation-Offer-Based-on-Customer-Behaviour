import { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { getTransactionHistory } from '../services/transactionService';

const Profile = () => {
  // State untuk data data
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalSpent: 0,
    loyaltyPoints: 0
  });
  
  // State untuk form
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '', // Catatan: Backend saat ini belum menyimpan no hp, jadi ini masih client-side
    image: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch data saat komponen dimuat
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Ambil Data Profil (Username, Email, Badge, dll)
      const userResponse = await getUserProfile();
      // Sesuaikan struktur response backend: { status: 'success', data: { ... } }
      const userData = userResponse.data || userResponse; 

      // 2. Ambil Data Transaksi untuk hitung statistik
      const transResponse = await getTransactionHistory();
      const transactions = Array.isArray(transResponse) 
        ? transResponse 
        : (transResponse.data || []);

      // 3. Hitung Statistik
      const totalPurchases = transactions.length;
      const totalSpent = transactions.reduce((acc, curr) => acc + curr.amount, 0);
      // Contoh logika poin: 1 poin tiap kelipatan 10.000
      const loyaltyPoints = Math.floor(totalSpent / 1000); 

      // 4. Set State
      setProfileData(userData);
      setStats({ totalPurchases, totalSpent, loyaltyPoints, transactions }); // Simpan transactions untuk logika badge
      
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        phone: '+62 812 3456 7890', // Default placeholder
        image: ''
      });

    } catch (error) {
      console.error("Error fetching profile:", error);
      // Fallback data agar tidak blank putih jika error
      setProfileData({ username: 'User', email: 'user@example.com' }); 
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Panggil API Update Profile
      await updateUserProfile({
        username: formData.username,
        email: formData.email
      });
      
      setIsEditing(false);
      alert('Profile berhasil diperbarui!');
      fetchData(); // Refresh data agar sinkron
    } catch (error) {
      console.error("Update failed:", error);
      alert('Gagal memperbarui profil: ' + (error.response?.data?.message || 'Terjadi kesalahan'));
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper untuk cek status badge
  const isBadgeUnlocked = (type) => {
    if (!stats.transactions) return false;
    
    switch (type) {
      case 'early_bird': 
        return stats.totalPurchases > 0;
      case 'data_lover':
        // Asumsi sederhana: jika beli > 5 item dianggap data lover
        return stats.totalPurchases >= 5;
      case 'big_spender':
        return stats.totalSpent >= 1000000;
      // Badge dari backend (Gold/Silver)
      case 'gold_member':
        return profileData?.badge_level === 'Gold';
      case 'silver_member':
        return profileData?.badge_level === 'Silver' || profileData?.badge_level === 'Gold';
      default:
        return false;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Profile...</div>;
  }

  return (
    <div className="min-h-screen bg-purewhite py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-jet px-8 py-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald opacity-10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
              <p className="text-gray-400">Manage your personal information</p>
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-8 py-8">
            {/* Avatar Section */}
            <div className="flex justify-center -mt-20 mb-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-emerald flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-xl">
                  {formData.image ? (
                    <img src={formData.image} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getInitials(profileData?.username)
                  )}
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-jet">Personal Information</h2>
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-emerald hover:text-emerald-600 font-semibold flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="text-darkgrey hover:text-jet font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-emerald text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition font-semibold"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-darkgrey mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isEditing 
                        ? 'border-gray-300 bg-white focus:ring-2 focus:ring-emerald focus:border-emerald' 
                        : 'border-gray-200 bg-silver cursor-not-allowed'
                    } transition text-jet`}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-darkgrey mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isEditing 
                        ? 'border-gray-300 bg-white focus:ring-2 focus:ring-emerald focus:border-emerald' 
                        : 'border-gray-200 bg-silver cursor-not-allowed'
                    } transition text-jet`}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-darkgrey mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={true} // Selalu disabled karena belum ada di backend
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-silver cursor-not-allowed text-jet"
                  />
                  {isEditing && <p className="text-xs text-orange-500 mt-1">Phone number cannot be changed currently.</p>}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Account Stats (DYNAMIC) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-emerald/10 p-3 rounded-lg">
                <svg className="w-6 h-6 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-jet">{stats.totalPurchases}</p>
                <p className="text-sm text-darkgrey">Total Purchases</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-emerald/10 p-3 rounded-lg">
                <svg className="w-6 h-6 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-jet">Rp {stats.totalSpent.toLocaleString('id-ID')}</p>
                <p className="text-sm text-darkgrey">Total Spent</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-emerald/10 p-3 rounded-lg">
                <svg className="w-6 h-6 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-jet">{stats.loyaltyPoints}</p>
                <p className="text-sm text-darkgrey">Telco Points</p>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section (SEMI-DYNAMIC) */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mt-8">
          <div className="bg-silver px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-jet flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Achievement Badges
            </h2>
            <p className="text-sm text-darkgrey mt-1">
              Current Level: <span className="font-bold text-emerald">{profileData?.badge_level || 'Bronze'}</span>
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Badge 1 - Early Bird */}
              <div className={`rounded-xl p-4 text-center border-2 transition transform ${
                isBadgeUnlocked('early_bird') 
                ? 'bg-emerald-50 border-emerald-200 hover:scale-105 opacity-100' 
                : 'bg-gray-50 border-gray-200 opacity-50 grayscale'
              }`}>
                <div className="w-16 h-16 bg-emerald rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                   <span className="text-2xl">🌅</span>
                </div>
                <h3 className="font-bold text-jet text-sm mb-1">Early Bird</h3>
                <p className="text-xs text-darkgrey">First purchase</p>
              </div>

              {/* Badge 2 - Data Lover */}
              <div className={`rounded-xl p-4 text-center border-2 transition transform ${
                isBadgeUnlocked('data_lover')
                ? 'bg-blue-50 border-blue-200 hover:scale-105 opacity-100'
                : 'bg-gray-50 border-gray-200 opacity-50 grayscale'
              }`}>
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                   <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-bold text-jet text-sm mb-1">Data Lover</h3>
                <p className="text-xs text-darkgrey">Buy 5 items</p>
              </div>

              {/* Badge 3 - Big Spender */}
              <div className={`rounded-xl p-4 text-center border-2 transition transform ${
                isBadgeUnlocked('big_spender')
                ? 'bg-purple-50 border-purple-200 hover:scale-105 opacity-100'
                : 'bg-gray-50 border-gray-200 opacity-50 grayscale'
              }`}>
                 <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                   <span className="text-2xl">💎</span>
                </div>
                <h3 className="font-bold text-jet text-sm mb-1">Big Spender</h3>
                <p className="text-xs text-darkgrey">Spend Rp 1M</p>
              </div>

              {/* Badge 4 - Gold Member (Dari Backend) */}
              <div className={`rounded-xl p-4 text-center border-2 transition transform ${
                isBadgeUnlocked('gold_member')
                ? 'bg-yellow-50 border-yellow-200 hover:scale-105 opacity-100'
                : 'bg-gray-50 border-gray-200 opacity-50 grayscale'
              }`}>
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                   <span className="text-2xl">🏆</span>
                </div>
                <h3 className="font-bold text-jet text-sm mb-1">Gold Member</h3>
                <p className="text-xs text-darkgrey">Spend {'>'} 150rb/mo</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;