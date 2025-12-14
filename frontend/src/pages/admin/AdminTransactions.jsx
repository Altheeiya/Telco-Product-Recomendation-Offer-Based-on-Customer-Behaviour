import { useState, useEffect } from 'react';
import { getAllTransactionsAdmin } from '../../services/adminService';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    userId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      const data = await getAllTransactionsAdmin(params);
      setTransactions(data.transactions || []);
      setPagination(prev => ({
        ...prev,
        ...data.pagination
      }));
      setError('');
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleApplyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchTransactions();
  };

  const handleClearFilters = () => {
    setFilters({
      userId: '',
      startDate: '',
      endDate: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    setTimeout(() => fetchTransactions(), 0);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Transaction Management</h1>
          <p className="text-gray-600">View and manage all transactions</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
              <input
                type="text"
                name="userId"
                value={filters.userId}
                onChange={handleFilterChange}
                placeholder="Enter user ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleApplyFilters}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                Apply
              </button>
              <button
                onClick={handleClearFilters}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Product</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Category</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-4 px-6 text-sm text-gray-600">#{transaction.id}</td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transaction.user}</p>
                        <p className="text-xs text-gray-500">{transaction.user_email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">{transaction.product}</td>
                    <td className="py-4 px-6">
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">
                        {transaction.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-emerald-600">
                      Rp {parseFloat(transaction.amount).toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {transactions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No transactions found
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;