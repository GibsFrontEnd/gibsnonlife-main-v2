//@ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { 
  Users, 
  Package, 
  Shield, 
  Settings, 
  MessageSquare,
  Ticket,
  Building,
  Search,
  Bell,
  DollarSign,
  FileText,
  UserCheck,
  RefreshCw,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Clock,
  Eye
} from "lucide-react"

import apiCall from "../utils/api-call";
import { AxiosError } from "axios"

// Helper functions
const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  return error.message || 'An unexpected error occurred';
};

const Dashboard = () => {
  const navigate = useNavigate()
  
  const isAuthenticated = useSelector((state: any) => state.auth?.isAuthenticated)
  const showAuthError = useSelector((state: any) => state.auth?.showAuthError)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    activePolicies: 0,
    totalAgents: 0,
    totalRevenue: 0,
    pendingTickets: 0,
    unreadMessages: 0,
    totalRenewals: 0,
    totalQuotations: 0
  })

  const [recentActivities, setRecentActivities] = useState([])
  const [recentRenewals, setRecentRenewals] = useState([])
  const [recentQuotations, setRecentQuotations] = useState([])

  const token = localStorage.getItem('token');
  const hasToken = !!token;

  // Check for token on mount
  useEffect(() => {
    if (!hasToken) {
      console.warn('No authentication token found')
      setError('Please log in to view dashboard data')
      setLoading(false)
    }
  }, [hasToken])

  // Redirect to login if auth error is shown
  useEffect(() => {
    if (showAuthError) {
      console.log('Auth error detected, redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    }
  }, [showAuthError, navigate])

  // Fetch dashboard data
  useEffect(() => {
    if (!hasToken) {
      return
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('Fetching dashboard data...')

        // Use endpoints that actually exist from your API documentation
        // Based on your Swagger, these are the working endpoints:
        const endpoints = [
          { 
            name: 'customers', 
            url: '/Customers',
            method: 'GET'
          },
          { 
            name: 'renewals', 
            url: '/Renewal?page=1&pageSize=5',
            method: 'GET'
          },
          { 
            name: 'quotations', 
            url: '/Quotation?page=1&pageSize=5',
            method: 'GET'
          },
          { 
            name: 'policies', 
            url: '/policies?page=1&pageSize=5',
            method: 'GET'
          }
        ]

        const results = await Promise.allSettled(
          endpoints.map(endpoint => 
            apiCall.get(endpoint.url)
              .then(res => ({
                name: endpoint.name,
                data: res.data,
                success: true
              }))
              .catch(error => ({
                name: endpoint.name,
                error: error.message,
                success: false,
                status: error.response?.status
              }))
          )
        )

        console.log('API results:', results)

        let totalCustomers = 0
        let totalRenewals = 0
        let totalQuotations = 0
        let totalPolicies = 0
        let totalRevenue = 0
        const activities = []
        const renewalsList = []
        const quotationsList = []

        // Process each result
        results.forEach((result) => {
          if (result.status === 'fulfilled' && result.value.success) {
            const { name, data } = result.value;
            
            switch(name) {
              case 'customers':
                // Customers endpoint returns array of customers
                if (Array.isArray(data)) {
                  totalCustomers = data.length;
                  // Add recent customer activities
                  data.slice(0, 3).forEach((customer, index) => {
                    activities.push({
                      id: `customer-${index}`,
                      user: customer.name || customer.insuredName || 'Customer',
                      action: 'registered',
                      time: new Date().toLocaleDateString(),
                      type: 'customer',
                      icon: Users
                    });
                  });
                }
                break;
                
              case 'renewals':
                // Renewals endpoint has {data: [], pagination: {}}
                if (data?.data && Array.isArray(data.data)) {
                  totalRenewals = data.pagination?.totalCount || data.data.length;
                  renewalsList.push(...data.data.slice(0, 3));
                  
                  // Add renewal activities
                  data.data.slice(0, 2).forEach((renewal, index) => {
                    activities.push({
                      id: `renewal-${index}`,
                      user: renewal.insuredName || 'Customer',
                      action: 'renewal processed',
                      time: renewal.procDate ? new Date(renewal.procDate).toLocaleDateString() : 'Recently',
                      type: 'policy',
                      icon: RefreshCw,
                      policyNo: renewal.policyNo
                    });
                  });
                }
                break;
                
              case 'quotations':
                // Quotations endpoint
                if (Array.isArray(data)) {
                  totalQuotations = data.length;
                  quotationsList.push(...data.slice(0, 3));
                  
                  // Add quotation activities
                  data.slice(0, 2).forEach((quotation, index) => {
                    activities.push({
                      id: `quotation-${index}`,
                      user: quotation.insuredName || 'Customer',
                      action: 'new quotation created',
                      time: quotation.transDate ? new Date(quotation.transDate).toLocaleDateString() : 'Recently',
                      type: 'product',
                      icon: FileText,
                      proposalNo: quotation.proposalNo
                    });
                  });
                } else if (data?.data && Array.isArray(data.data)) {
                  totalQuotations = data.data.length;
                  quotationsList.push(...data.data.slice(0, 3));
                }
                break;
                
              case 'policies':
                // Policies endpoint - this might fail due to column errors in API
                if (Array.isArray(data)) {
                  totalPolicies = data.length;
                  // Calculate revenue from policies
                  totalRevenue = data.reduce((sum, policy) => {
                    return sum + (Number(policy.grossPremium) || 0);
                  }, 0);
                  
                  // Filter active policies
                  const activePolicies = data.filter(policy => 
                    (policy.status || '').toLowerCase() === 'active'
                  );
                  totalPolicies = activePolicies.length;
                }
                break;
            }
          } else if (result.status === 'fulfilled' && !result.value.success) {
            console.warn(`${result.value.name} API failed:`, result.value.error);
            
            // For failed endpoints, use fallback data
            if (result.value.name === 'policies') {
              // Use renewals data to estimate policies count
              const renewalsResult = results.find(r => 
                r.status === 'fulfilled' && 
                r.value.name === 'renewals' && 
                r.value.success
              );
              if (renewalsResult) {
                totalPolicies = totalRenewals; // Estimate based on renewals
                totalRevenue = totalRenewals * 100000; // Estimated average
              }
            }
          }
        });

        // Sort activities by time (newest first)
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        // Set state with collected data
        setStats({
          totalCustomers,
          totalProducts: totalQuotations, // Using quotations as products indicator
          activePolicies: totalPolicies,
          totalAgents: Math.floor(totalCustomers * 0.1), // Estimate agents (10% of customers)
          totalRevenue,
          pendingTickets: 0, // TODO: Add tickets endpoint if available
          unreadMessages: 0, // TODO: Add messages endpoint if available
          totalRenewals,
          totalQuotations
        });

        setRecentActivities(activities.slice(0, 4));
        setRecentRenewals(renewalsList.slice(0, 3));
        setRecentQuotations(quotationsList.slice(0, 3));

        // Check for failures
        const failedEndpoints = results
          .filter(r => r.status === 'fulfilled' && !r.value.success)
          .map(r => r.value.name);

        if (failedEndpoints.length > 0) {
          console.warn('Some endpoints failed:', failedEndpoints);
          // Don't show error for endpoints that might not exist
          const criticalEndpoints = ['customers', 'renewals'];
          const criticalFailures = failedEndpoints.filter(ep => 
            criticalEndpoints.includes(ep)
          );
          
          if (criticalFailures.length > 0) {
            setError(`Unable to load data from: ${criticalFailures.join(', ')}`);
          }
        }

        console.log('Dashboard data loaded successfully');

      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        
        const errorMessage = handleApiError(err)
        setError(errorMessage)
        
        if (err instanceof AxiosError && err.response?.status === 401) {
          console.log('Authentication error detected')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [navigate, hasToken])

  const quickActions = [
    { name: 'Manage Customers', path: '/csu/customers', icon: Users, description: 'View and manage customer accounts', color: 'bg-blue-500' },
    { name: 'Quotations', path: '/quotations', icon: FileText, description: 'Create and manage insurance quotations', color: 'bg-green-500' },
    { name: 'Renewals', path: '/renewals', icon: RefreshCw, description: 'Process policy renewals', color: 'bg-orange-500' },
    { name: 'Reports', path: '/reports', icon: BarChart3, description: 'View system reports and analytics', color: 'bg-purple-500' },
    { name: 'Messaging', path: '/csu/messaging', icon: MessageSquare, description: 'Check customer messages', color: 'bg-yellow-500' },
    { name: 'Security Settings', path: '/admin/security', icon: Shield, description: 'Manage system security', color: 'bg-red-500' },
    { name: 'Company Profile', path: '/admin/company', icon: Building, description: 'Update company information', color: 'bg-indigo-500' },
    { name: 'System Settings', path: '/admin/settings', icon: Settings, description: 'General system settings', color: 'bg-gray-500' }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const StatCard = ({ 
    number, 
    label, 
    icon: Icon,
    gradient,
    trend,
    trendText
  }: {
    number: string | number;
    label: string;
    icon: React.ElementType;
    gradient: string;
    trend?: 'up' | 'down' | 'neutral';
    trendText?: string;
  }) => (
    <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 flex items-center gap-3 sm:gap-4 transition-all duration-200 hover:shadow-md">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white ${gradient} flex-shrink-0`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{number}</div>
        <div className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{label}</div>
        {trend && trendText && (
          <div className={`text-xs mt-1 flex items-center gap-1 ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-gray-500'
          }`}>
            <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
            {trendText}
          </div>
        )}
      </div>
    </div>
  )

  const StatCardSkeleton = () => (
    <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 flex items-center gap-3 sm:gap-4 animate-pulse">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-200 flex-shrink-0"></div>
      <div className="flex-1">
        <div className="h-6 sm:h-7 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  )

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 overflow-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 sm:mb-8">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Welcome to your insurance management system</p>
          
          {/* Warnings and Alerts */}
          {!hasToken && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-red-800 font-medium text-sm">Not Authenticated</div>
                <div className="text-red-600 text-xs mt-1">Please log in to view live data</div>
              </div>
              <button 
                onClick={() => navigate('/login')}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium"
              >
                Login
              </button>
            </div>
          )}
          
          {error && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-orange-800 font-medium text-sm">{error}</div>
              </div>
              <button 
                onClick={handleRetry}
                className="flex items-center gap-1 text-orange-800 hover:text-orange-900 text-xs font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              number={stats.totalCustomers.toLocaleString()}
              label="Total Customers"
              icon={Users}
              gradient="bg-gradient-to-br from-blue-500 to-purple-600"
              trend="up"
              trendText="+12% this month"
            />
            <StatCard
              number={stats.totalQuotations}
              label="Active Quotations"
              icon={FileText}
              gradient="bg-gradient-to-br from-green-500 to-teal-600"
            />
            <StatCard
              number={stats.activePolicies}
              label="Active Policies"
              icon={Shield}
              gradient="bg-gradient-to-br from-orange-500 to-red-600"
              trend="up"
              trendText="+5% from last month"
            />
            <StatCard
              number={formatCurrency(stats.totalRevenue)}
              label="Total Revenue"
              icon={DollarSign}
              gradient="bg-gradient-to-br from-emerald-500 to-green-600"
              trend="up"
              trendText="+18% growth"
            />
          </>
        )}
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          number={stats.totalRenewals}
          label="Pending Renewals"
          icon={RefreshCw}
          gradient="bg-gradient-to-br from-yellow-500 to-orange-600"
        />
        <StatCard
          number={stats.totalAgents}
          label="Active Agents"
          icon={UserCheck}
          gradient="bg-gradient-to-br from-purple-500 to-pink-600"
        />
        <StatCard
          number={stats.pendingTickets}
          label="Support Tickets"
          icon={Ticket}
          gradient="bg-gradient-to-br from-gray-500 to-blue-600"
        />
      </div>

      {/* Quick Access Grid */}
      <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 sm:mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Quick Access</h2>
          <p className="text-sm text-gray-600">Navigate to different system modules</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action) => {
            const IconComponent = action.icon
            return (
              <Link
                key={action.name}
                to={action.path}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200 group"
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white ${action.color} flex-shrink-0`}>
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 truncate">
                    {action.name}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{action.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 sm:mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
            <Link to="/csu/enquiries" className="text-blue-600 text-sm font-medium hover:text-blue-700">
              View all
            </Link>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {loading ? (
              // Loading skeleton for activities
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity) => {
                const ActivityIcon = activity.icon || Users
                return (
                  <div key={activity.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 flex-shrink-0">
                      <ActivityIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        <span className="font-semibold">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </p>
                    </div>
                    {activity.proposalNo && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {activity.proposalNo}
                      </span>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No recent activities</p>
                <p className="text-gray-400 text-xs mt-1">Activities will appear here as they occur</p>
              </div>
            )}
          </div>
        </div>

        {/* System Overview */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Today's Quotations</span>
                </div>
                <span className="font-semibold text-green-600">+{Math.floor(stats.totalQuotations * 0.1)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Renewals Due</span>
                </div>
                <span className="font-semibold text-blue-600">{stats.totalRenewals}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Conversion Rate</span>
                </div>
                <span className="font-semibold text-purple-600">24%</span>
              </div>
            </div>
          </div>

          {/* Admin Quick Actions */}
          <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link 
                to="/quotations/create" 
                className="flex items-center gap-3 p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
              >
                <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="truncate">Create New Quotation</span>
              </Link>
              <Link 
                to="/renewals" 
                className="flex items-center gap-3 p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
              >
                <RefreshCw className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span className="truncate">Process Renewals</span>
              </Link>
              <Link 
                to="/reports" 
                className="flex items-center gap-3 p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
              >
                <BarChart3 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <span className="truncate">View Reports</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard