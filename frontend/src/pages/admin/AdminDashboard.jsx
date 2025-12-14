import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getDashboardStats, 
  getSalesChart, 
  getTopProducts, 
  getRecentTransactions 
} from '../../services/adminService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    totalUsers: 0,
    totalProducts: 0,
    todayRevenue: 0,
    todayTransactions: 0
  });

  const [salesChart, setSalesChart] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchSalesChart();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, topProductsData, recentTransData] = await Promise.all([
        getDashboardStats(),
        getTopProducts(),
        getRecentTransactions(5)
      ]);

      setStats(statsData);
      setTopProducts(topProductsData);
      setRecentTransactions(recentTransData);
      await fetchSalesChart();
      setError('');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesChart = async () => {
    try {
      const data = await getSalesChart(dateRange);
      setSalesChart(data);
    } catch (error) {
      console.error('Error fetching sales chart:', error);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Date', 'User', 'Product', 'Amount'],
      ...recentTransactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.user,
        t.product,
        t.amount
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const maxRevenue = Math.max(...salesChart.map(s => parseFloat(s.revenue) || 0), 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error}</div>
          <button 
            onClick={fetchDashboardData}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Overview of your telco business</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrintReport}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-emerald-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                +{stats.todayRevenue > 0 ? ((stats.todayRevenue / stats.totalRevenue) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              Rp {stats.totalRevenue.toLocaleString('id-ID')}
            </p>
            <p className="text-sm text-gray-500">
              Today: Rp {stats.todayRevenue.toLocaleString('id-ID')}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Transactions</h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stats.totalTransactions}</p>
            <p className="text-sm text-gray-500">Today: {stats.todayTransactions}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stats.totalUsers}</p>
            <p className="text-sm text-gray-500">Registered users</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                Available
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Products</h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stats.totalProducts}</p>
            <p className="text-sm text-gray-500">In catalog</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Sales Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Sales Overview</h2>
              <div className="flex gap-2">
                {['week', 'month', 'year'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setDateRange(period)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      dateRange === period
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {salesChart.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.month}</span>
                    <span className="text-sm font-bold text-purple-600">
                      Rp {parseFloat(item.revenue).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(parseFloat(item.revenue) / maxRevenue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}

              {salesChart.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No sales data available
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Products</h2>
            <div className="space-y-4">
              {topProducts.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' :
                      'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600 text-sm">
                      Rp {parseFloat(product.revenue || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}

              {topProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No product data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
            <Link
              to="/admin/transactions"
              className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-sm text-gray-600">#{transaction.id}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{transaction.user}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{transaction.product}</td>
                    <td className="py-3 px-4 text-sm font-bold text-emerald-600">
                      Rp {parseFloat(transaction.amount).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {recentTransactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No transactions yet
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <Link
            to="/admin/users"
            className="bg-white border-2 border-purple-200 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg transition group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-600">View & edit users</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/products"
            className="bg-white border-2 border-orange-200 rounded-xl p-6 hover:border-orange-400 hover:shadow-lg transition group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-lg group-hover:bg-orange-200 transition">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Manage Products</p>
                <p className="text-sm text-gray-600">View & edit products</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/transactions"
            className="bg-white border-2 border-blue-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">All Transactions</p>
                <p className="text-sm text-gray-600">View all transactions</p>
              </div>
            </div>
          </Link>

          <button
            onClick={handleExportCSV}
            className="bg-white border-2 border-emerald-200 rounded-xl p-6 hover:border-emerald-400 hover:shadow-lg transition group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-lg group-hover:bg-emerald-200 transition">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Export Report</p>
                <p className="text-sm text-gray-600">Download CSV</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;