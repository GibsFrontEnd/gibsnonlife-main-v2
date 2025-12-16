//@ts-nocheck
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EditRenewalModel from './EditRenewalModel';
import { 
  Search, 
  X, 
  Filter, 
  Calendar,
  DollarSign,
  User,
  Phone,
  Mail,
  FileText,
  Tag,
  ChevronLeft,
  ChevronRight,
 
  BarChart3,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { Renewal, RenewalFilterParams } from "../../types/renewal";
import {
  fetchRenewals,
  filterRenewals,
  setFilters,
} from "../../features/reducers/renewalReducers/renewalSlice";
import { AppDispatch, RootState } from "../../features/store";

// ============================================
// UTILITY FUNCTIONS
// ============================================
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'Completed': 'bg-green-100 text-green-700 border-green-200',
    'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Expired': 'bg-red-100 text-red-700 border-red-200',
    'Renewed': 'bg-blue-100 text-blue-700 border-blue-200',
    'Cancelled': 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// ============================================
// SEARCH BAR COMPONENT
// ============================================
const SearchBar: React.FC<{
  onSearch: (query: string) => void;
  onFilterToggle: () => void;
  activeFilters: number;
  loading: boolean;
}> = ({ onSearch, onFilterToggle, activeFilters, loading }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSearch} className="mb-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by policy number or insured name..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Search
        </button>
        <button
          type="button"
          onClick={onFilterToggle}
          className="relative px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter className="h-4 w-4" />
          {activeFilters > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>
    </form>
  );
};

// ============================================
// ADVANCED FILTERS COMPONENT
// ============================================
const AdvancedFilters: React.FC<{
  filters: RenewalFilterParams;
  onApply: (filters: RenewalFilterParams) => void;
  onClose: () => void;
  loading: boolean;
}> = ({ filters: initialFilters, onApply, onClose, loading }) => {
  const [localFilters, setLocalFilters] = useState<RenewalFilterParams>(initialFilters);

  const updateFilter = (key: keyof RenewalFilterParams, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleApply = () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(localFilters).filter(([_, v]) => v)
    ) as RenewalFilterParams;
    onApply(cleanFilters);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({});
    onApply({});
    onClose();
  };

  return (
    <div className="mb-4 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
          <input
            type="text"
            value={localFilters.policyNo || ''}
            onChange={(e) => updateFilter('policyNo', e.target.value)}
            placeholder="Enter policy number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Insured Name</label>
          <input
            type="text"
            value={localFilters.insuredName || ''}
            onChange={(e) => updateFilter('insuredName', e.target.value)}
            placeholder="Enter insured name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subrisk</label>
          <input
            type="text"
            value={localFilters.subriskName || ''}
            onChange={(e) => updateFilter('subriskName', e.target.value)}
            placeholder="Enter subrisk name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={localFilters.tag || ''}
            onChange={(e) => updateFilter('tag', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Expired">Expired</option>
            <option value="Renewed">Renewed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
          <select
            value={localFilters.channels || ''}
            onChange={(e) => updateFilter('channels', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="Direct">Direct</option>
            <option value="Agent">Agent</option>
            <option value="Broker">Broker</option>
            <option value="Online">Online</option>
            <option value="Corporate">Corporate</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (From)</label>
          <input
            type="date"
            value={localFilters.startDate || ''}
            onChange={(e) => updateFilter('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (To)</label>
          <input
            type="date"
            value={localFilters.expiryDate || ''}
            onChange={(e) => updateFilter('expiryDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Party Name</label>
          <input
            type="text"
            value={localFilters.partyName || ''}
            onChange={(e) => updateFilter('partyName', e.target.value)}
            placeholder="Enter party name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marketing Staff</label>
          <input
            type="text"
            value={localFilters.mktStaff || ''}
            onChange={(e) => updateFilter('mktStaff', e.target.value)}
            placeholder="Enter staff name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <p className="font-medium">Search Tips:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Use Policy Number for exact matches</li>
            <li>Use Insured Name for partial name searches</li>
            <li>Dates filter records from the selected date onwards</li>
          </ul>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-700">Active filters:</span>
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {Object.keys(localFilters).filter(k => localFilters[k as keyof RenewalFilterParams]).length}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={handleClear}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={handleApply}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
        >
          {loading ? 'Applying...' : 'Apply Filters'}
        </button>
      </div>
    </div>
  );
};

// ============================================
// RENEWAL TABLE COMPONENT
// ============================================
const RenewalTable: React.FC<{
  renewals: Renewal[];
  loading: boolean;
  onRowClick: (renewal: Renewal) => void;
}> = ({ renewals, loading, onRowClick }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!renewals?.length) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No renewals found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy No</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Insured</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premium</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {renewals.map((renewal) => (
            <tr
              key={renewal.renewalID}
              className="hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onRowClick(renewal)}
            >
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-gray-900">{renewal.policyNo}</div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-gray-900">{renewal.insuredName}</div>
                <div className="text-xs text-gray-500">{renewal.email}</div>
              </td>
              <td className="px-4 py-3">
                <div className="text-xs text-gray-600">
                  <div>Start: {formatDate(renewal.startDate)}</div>
                  <div>Expiry: {formatDate(renewal.expiryDate)}</div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(renewal.grossPremium)}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(renewal.tag)}`}>
                  {renewal.tag || 'N/A'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================
// PAGINATION COMPONENT
// ============================================
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, total, pageSize, onPageChange }) => {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white">
      <div className="text-sm text-gray-700">
        Showing <span className="font-medium">{start}</span> to <span className="font-medium">{end}</span> of{' '}
        <span className="font-medium">{total}</span> results
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// ============================================
// RENEWAL DETAILS MODAL (UPDATED)
// ============================================
const RenewalDetailsModel: React.FC<{
  renewal: Renewal;
  onClose: () => void;
  onRenewalUpdated: () => void; // Add this prop to trigger refresh
}> = ({ renewal, onClose, onRenewalUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);

  // Handle successful save and trigger refresh
  const handleSaveSuccess = () => {
    setIsEditing(false);
    onRenewalUpdated(); // Trigger refresh in parent component
  };

  if (isEditing) {
    return (
      <EditRenewalModel
        renewal={renewal}
        onClose={() => setIsEditing(false)}
        onSaveSuccess={handleSaveSuccess} // Pass the success handler
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Renewal Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{renewal.insuredName}</h3>
                <p className="text-sm text-gray-600 mt-1">{renewal.policyNo}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(renewal.tag)}`}>
                {renewal.tag || 'N/A'}
              </span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-sm">Contact Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{renewal.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{renewal.mobilePhone}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-sm">Policy Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subrisk:</span>
                  <span className="font-medium">{renewal.subriskName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Channel:</span>
                  <span className="font-medium">{renewal.channels}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">Important Dates</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Start Date</p>
                <p className="font-medium">{formatDate(renewal.startDate)}</p>
              </div>
              <div>
                <p className="text-gray-600">Expiry Date</p>
                <p className="font-medium">{formatDate(renewal.expiryDate)}</p>
              </div>
              <div>
                <p className="text-gray-600">Renewal Date</p>
                <p className="font-medium">{formatDate(renewal.renewalDate)}</p>
              </div>
              <div>
                <p className="text-gray-600">Process Date</p>
                <p className="font-medium">{formatDate(renewal.procDate)}</p>
              </div>
            </div>
          </div>

          {/* Financial */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">Financial Information</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Sum Insured</p>
                <p className="font-bold text-lg">{formatCurrency(renewal.sumInsured)}</p>
              </div>
              <div>
                <p className="text-gray-600">Gross Premium</p>
                <p className="font-bold text-lg">{formatCurrency(renewal.grossPremium)}</p>
              </div>
              <div>
                <p className="text-gray-600">Adjusted Rate</p>
                <p className="font-bold text-lg">{renewal.adjustedRate}%</p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {(renewal.partyName || renewal.mKtStaff) && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-sm">Additional Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {renewal.partyName && (
                  <div>
                    <p className="text-gray-600">Party Name</p>
                    <p className="font-medium">{renewal.partyName}</p>
                  </div>
                )}
                {renewal.mKtStaff && (
                  <div>
                    <p className="text-gray-600">Marketing Staff</p>
                    <p className="font-medium">{renewal.mKtStaff}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Remarks */}
          {renewal.remarks && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-sm">Remarks</h4>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700">{renewal.remarks}</p>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 space-y-2">
          <button
            onClick={() => setIsEditing(true)}
            className="w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Edit Renewal
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// STATS CARDS COMPONENT (UPDATED)
// ============================================
const StatsCards: React.FC<{
  total: number;
  filtered: number;
  activeFilters: number;
  lastUpdated?: string;
}> = ({ total, filtered, activeFilters, lastUpdated }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4 transition-all duration-300 hover:transform hover:-translate-y-0.5 hover:shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Renewals</p>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 transition-all duration-300 hover:transform hover:-translate-y-0.5 hover:shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Showing</p>
            <p className="text-2xl font-bold text-gray-900">{filtered}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 transition-all duration-300 hover:transform hover:-translate-y-0.5 hover:shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Active Filters</p>
            <p className="text-2xl font-bold text-gray-900">{activeFilters}</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <Filter className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 transition-all duration-300 hover:transform hover:-translate-y-0.5 hover:shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Last Updated</p>
            <p className="text-lg font-medium text-gray-900">
              {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Just now'}
            </p>
          </div>
          <div className="p-3 bg-amber-100 rounded-lg">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN RENEWAL COMPONENT (UPDATED)
// ============================================
const RenewalComponent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const renewalState = useSelector((state: RootState) => state.renewal);
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRenewal, setSelectedRenewal] = useState<Renewal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const renewals = renewalState.data || [];
  const loading = renewalState.loading;
  const error = renewalState.error;
  const filters = renewalState.filters || {};
  
  const pagination = {
    page: renewalState.pagination?.currentPage || 1,
    pageSize: renewalState.pagination?.pageSize || 10,
    total: renewalState.pagination?.totalCount || 0,
    totalPages: renewalState.pagination?.totalPages || 1,
  };

  // Initial fetch
  useEffect(() => {
    dispatch(fetchRenewals({ page: 1, pageSize: 10 }));
    setLastUpdated(new Date().toISOString());
  }, [dispatch]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('🔄 Auto-refreshing renewals...');
      dispatch(fetchRenewals({ 
        ...filters, 
        page: pagination.page, 
        pageSize: pagination.pageSize 
      }));
      setLastUpdated(new Date().toISOString());
    }, 30000); // Refresh every 30 seconds (30000 milliseconds)

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [dispatch, filters, pagination.page, pagination.pageSize]);

// In your RenewalComponent.tsx
// Handle search
// Handle search - improved version that can search both
const handleSearch = useCallback((query: string) => {
  setSearchQuery(query);
  
  if (!query.trim()) {
    // If empty search, fetch all with pagination
    dispatch(fetchRenewals({ page: 1, pageSize: 10 }));
    return;
  }
  
  // Start with empty search params
  let searchParams: RenewalFilterParams = {};
  
  // Try to detect if it's a policy number
  const isLikelyPolicyNumber = 
    query.includes('/') || // Contains slashes
    /^[A-Z]{2,3}\/\w+\/\w+/.test(query) || // Pattern like XXX/XXX/XXX
    /^[A-Z]{2,}\d+$/.test(query) || // Pattern like ABC123
    query.match(/^[A-Z]+\/[A-Z]+\/[A-Z]+\/\d+$/); // Full pattern
  
  if (isLikelyPolicyNumber) {
    // Search by policy number first
    searchParams.policyNo = query;
    console.log('🔍 Searching by Policy Number:', query);
  } else {
    // Search by insured name
    searchParams.insuredName = query;
    console.log('🔍 Searching by Insured Name:', query);
  }
  
  console.log('🔍 Executing search with:', searchParams);
  
  dispatch(setFilters(searchParams));
  dispatch(filterRenewals(searchParams));
  
  setLastUpdated(new Date().toISOString());
}, [dispatch]);

// Handle filter apply
const handleFilterApply = useCallback((newFilters: RenewalFilterParams) => {
  dispatch(setFilters(newFilters));
  
  // Remove page/pageSize for filter endpoint
  const filterParams = { ...newFilters }; // Different variable name
  delete filterParams.page;
  delete filterParams.pageSize;
  
  dispatch(filterRenewals(filterParams));
  setLastUpdated(new Date().toISOString());
}, [dispatch, pagination.pageSize]);

  // // Handle filter apply
  // const handleFilterApply = useCallback((newFilters: RenewalFilterParams) => {
  //   dispatch(setFilters(newFilters));
  //   dispatch(filterRenewals({ ...newFilters, page: 1, pageSize: pagination.pageSize }));
  //   setLastUpdated(new Date().toISOString());
  // }, [dispatch, pagination.pageSize]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    dispatch(fetchRenewals({ ...filters, page, pageSize: pagination.pageSize }));
    setLastUpdated(new Date().toISOString());
  }, [dispatch, filters, pagination.pageSize]);

  // Handle row click
  const handleRowClick = useCallback((renewal: Renewal) => {
    setSelectedRenewal(renewal);
  }, []);

  // Handle refresh after edit
  const handleRenewalUpdated = useCallback(() => {
    // Refresh data from server
    dispatch(fetchRenewals({ 
      ...filters, 
      page: pagination.page, 
      pageSize: pagination.pageSize 
    }));
    
    // Update last updated timestamp
    setLastUpdated(new Date().toISOString());
    
    // Close the modal
    setSelectedRenewal(null);
    
    // Optional: Show success message
    console.log('✅ Renewal updated, refreshing data...');
  }, [dispatch, filters, pagination.page, pagination.pageSize]);

  // Manual refresh function
  const handleManualRefresh = useCallback(() => {
    dispatch(fetchRenewals({ 
      ...filters, 
      page: pagination.page, 
      pageSize: pagination.pageSize 
    }));
    setLastUpdated(new Date().toISOString());
  }, [dispatch, filters, pagination.page, pagination.pageSize]);

  // Active filters count
// In your RenewalComponent.tsx, update the activeFilterCount calculation:
const activeFilterCount = useMemo(() => {
  const filterKeys = Object.keys(filters).filter(k => filters[k as keyof RenewalFilterParams]);
  // Add search query to active filters if it exists
  if (searchQuery.trim()) {
    return filterKeys.length + 1;
  }
  return filterKeys.length;
}, [filters, searchQuery]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Renewal Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage and track policy renewals</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleManualRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
           
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <X className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Stats */}
        <StatsCards
          total={pagination.total}
          filtered={renewals.length}
          activeFilters={activeFilterCount}
          lastUpdated={lastUpdated}
        />

        {/* Search Bar */}
        <SearchBar
          onSearch={handleSearch}
          onFilterToggle={() => setShowFilters(!showFilters)}
          activeFilters={activeFilterCount}
          loading={loading}
        />

        {/* Advanced Filters */}
        {showFilters && (
          <AdvancedFilters
            filters={filters}
            onApply={handleFilterApply}
            onClose={() => setShowFilters(false)}
            loading={loading}
          />
        )}

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <RenewalTable
            renewals={renewals}
            loading={loading}
            onRowClick={handleRowClick}
          />
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            pageSize={pagination.pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Details Modal */}
      {selectedRenewal && (
        <RenewalDetailsModel
          renewal={selectedRenewal}
          onClose={() => setSelectedRenewal(null)}
          onRenewalUpdated={handleRenewalUpdated} // Pass refresh function
        />
      )}
    </div>
  );
};

export default RenewalComponent;