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
  AlertCircle
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

const extractTotalCount = (response: any): number => {
  // Handle different API response structures
  const data = response.data || response;
  
  // Check for pagination total
  if (data.pagination?.total !== undefined) {
    return data.pagination.total;
  }
  
  // Check for totalCount
  if (data.totalCount !== undefined) {
    return data.totalCount;
  }
  
  // Check for total
  if (data.total !== undefined) {
    return data.total;
  }
  
  // If it's an array, return length
  if (Array.isArray(data)) {
    return data.length;
  }
  
  // If it's an object with items array
  if (data.items && Array.isArray(data.items)) {
    return data.items.length;
  }
  
  // If it's an object with data array
  if (data.data && Array.isArray(data.data)) {
    return data.data.length;
  }
  
  return 0;
};

const extractItems = (response: any): any[] => {
  const data = response.data || response;
  
  if (Array.isArray(data)) {
    return data;
  }
  
  if (data.items && Array.isArray(data.items)) {
    return data.items;
  }
  
  if (data.data && Array.isArray(data.data)) {
    return data.data;
  }
  
  return [];
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
    unreadMessages: 0
  })

  const [recentActivities, setRecentActivities] = useState([])

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

        // Try dedicated dashboard endpoint first
        try {
          const dashboardData = await apiCall.get('/dashboard')
          console.log('Dashboard stats response:', dashboardData)
          
          const statsData = dashboardData.data || dashboardData
          
          setStats({
            totalCustomers: statsData.totalCustomers || 0,
            totalProducts: statsData.totalProducts || 0,
            activePolicies: statsData.activePolicies || 0,
            totalAgents: statsData.totalAgents || 0,
            totalRevenue: statsData.totalRevenue || 0,
            pendingTickets: statsData.pendingTickets || 0,
            unreadMessages: statsData.unreadMessages || 0,
          })

          // Set recent activities from API if available
          if (statsData.recentActivities) {
            setRecentActivities(statsData.recentActivities)
          }
          
          console.log('Dashboard data loaded successfully')
          return
        } catch (dashboardError) {
          console.log('Dashboard endpoint not available, fetching individual endpoints...')
        }

        // Fetch all endpoints in parallel with proper error handling
        const endpoints = [
          { name: 'customers', url: '/customers' },
          { name: 'products', url: '/products' },
          { name: 'policies', url: '/policies' },
          { name: 'agents', url: '/agents' }
        ]

        const results = await Promise.allSettled(
          endpoints.map(endpoint => 
            apiCall.get(endpoint.url)
          )
        )

        console.log('API results:', results)

        // Process customers - get total count
        let totalCustomers = 0
        let recentCustomers = []
        if (results[0].status === 'fulfilled') {
          const response = results[0].value;
          totalCustomers = extractTotalCount(response);
          recentCustomers = extractItems(response).slice(0, 5); // Get recent 5 customers
          console.log('Customers API response:', response.data);
          console.log('Total customers calculated:', totalCustomers);
        } else {
          console.error('Customers fetch failed:', results[0].reason);
        }

        // Process products - get total count
        let totalProducts = 0
        if (results[1].status === 'fulfilled') {
          const response = results[1].value;
          totalProducts = extractTotalCount(response);
          console.log('Products API response:', response.data);
          console.log('Total products calculated:', totalProducts);
        } else {
          console.error('Products fetch failed:', results[1].reason);
        }

        // Process policies - calculate active policies and total revenue
        let activePolicies = 0
        let totalRevenue = 0
        let recentPolicies = []
        if (results[2].status === 'fulfilled') {
          const response = results[2].value;
          const policiesList = extractItems(response);
          console.log('Policies API response:', response.data);
          console.log('Policies list extracted:', policiesList);
          
          // Count active policies
          activePolicies = policiesList.filter((policy: any) => {
            const status = policy.status?.toLowerCase() || 
                          policy.policyStatus?.toLowerCase() || 
                          '';
            return status === 'active' || status === 'activepolicy';
          }).length;
          
          // Calculate total revenue from all policies
          totalRevenue = policiesList.reduce((sum: number, policy: any) => {
            const premium = Number(policy.premium) || 
                           Number(policy.amount) || 
                           Number(policy.price) || 
                           Number(policy.totalPremium) || 
                           0;
            return sum + premium;
          }, 0);

          // Get recent policies for activities
          recentPolicies = policiesList.slice(0, 4).map((policy: any) => ({
            id: policy.id,
            user: policy.customerName || 'Customer',
            action: 'purchased new policy',
            time: policy.createdAt ? new Date(policy.createdAt).toLocaleDateString() : 'Recently',
            type: 'policy'
          }));
          
          console.log('Active policies:', activePolicies);
          console.log('Total revenue calculated:', totalRevenue);
        } else {
          console.error('Policies fetch failed:', results[2].reason);
        }

        // Process agents - get total count
        let totalAgents = 0
        if (results[3].status === 'fulfilled') {
          const response = results[3].value;
          totalAgents = extractTotalCount(response);
          console.log('Agents API response:', response.data);
          console.log('Total agents calculated:', totalAgents);
        } else {
          console.error('Agents fetch failed:', results[3].reason);
        }

        // Generate recent activities from actual data
        const activities = [
          ...recentPolicies,
          ...recentCustomers.slice(0, 2).map((customer: any) => ({
            id: customer.id,
            user: `${customer.firstName} ${customer.lastName}` || customer.name || 'Customer',
            action: 'registered new account',
            time: customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'Recently',
            type: 'customer'
          }))
        ].slice(0, 4); // Limit to 4 activities

        setRecentActivities(activities)

        // Update stats with actual API data
        setStats({
          totalCustomers,
          totalProducts,
          activePolicies,
          totalAgents,
          totalRevenue,
          pendingTickets: 0, // TODO: Implement tickets API when available
          unreadMessages: 0, // TODO: Implement messages API when available
        })

        // Check for failures and set appropriate error message
        const failedEndpoints = endpoints
          .filter((endpoint, i) => results[i].status === 'rejected')
          .map(endpoint => endpoint.name)

        if (failedEndpoints.length > 0) {
          setError(`Unable to load data from: ${failedEndpoints.join(', ')}`);
          console.warn('Failed endpoints:', failedEndpoints);
        } else {
          console.log('All dashboard data loaded successfully');
        }

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
    { name: 'Product Management', path: '/admin/products', icon: Package, description: 'Configure insurance products', color: 'bg-green-500' },
    { name: 'Security Settings', path: '/admin/security', icon: Shield, description: 'Manage system security', color: 'bg-red-500' },
    { name: 'Company Profile', path: '/admin/company', icon: Building, description: 'Update company information', color: 'bg-purple-500' },
    { name: 'Messaging', path: '/csu/messaging', icon: MessageSquare, description: 'Check customer messages', color: 'bg-yellow-500' },
    { name: 'Support Tickets', path: '/csu/tickets', icon: Ticket, description: 'Handle support requests', color: 'bg-indigo-500' },
    { name: 'System Features', path: '/admin/features', icon: Settings, description: 'Configure system features', color: 'bg-gray-500' },
    { name: 'System Settings', path: '/admin/settings', icon: Settings, description: 'General system settings', color: 'bg-pink-500' }
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
    gradient
  }: {
    number: string | number;
    label: string;
    icon: React.ElementType;
    gradient: string;
  }) => (
    <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 flex items-center gap-3 sm:gap-4 transition-all duration-200 hover:shadow-md">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white ${gradient}`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{number}</div>
        <div className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{label}</div>
      </div>
    </div>
  )

  const StatCardSkeleton = () => (
    <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 flex items-center gap-3 sm:gap-4 animate-pulse">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-200"></div>
      <div className="flex-1">
        <div className="h-6 sm:h-7 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  )

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'policy': return FileText
      case 'ticket': return Ticket
      case 'product': return Package
      case 'admin': return Settings
      case 'customer': return Users
      default: return Users
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'policy': return 'text-blue-600 bg-blue-50'
      case 'ticket': return 'text-orange-600 bg-orange-50'
      case 'product': return 'text-green-600 bg-green-50'
      case 'admin': return 'text-purple-600 bg-purple-50'
      case 'customer': return 'text-cyan-600 bg-cyan-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

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
            />
            <StatCard
              number={stats.totalProducts}
              label="Insurance Products"
              icon={Package}
              gradient="bg-gradient-to-br from-green-500 to-teal-600"
            />
            <StatCard
              number={stats.activePolicies}
              label="Active Policies"
              icon={FileText}
              gradient="bg-gradient-to-br from-orange-500 to-red-600"
            />
            <StatCard
              number={stats.totalAgents.toLocaleString()}
              label="Total Agents"
              icon={UserCheck}
              gradient="bg-gradient-to-br from-emerald-500 to-green-600"
            />
          </>
        )}
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
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity) => {
                const ActivityIcon = getActivityIcon(activity.type)
                return (
                  <div key={activity.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)} flex-shrink-0`}>
                      <ActivityIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        <span className="font-semibold">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
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
          {/* Support Metrics */}
          <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Support Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Pending Tickets</span>
                </div>
                <span className="font-semibold text-orange-600">{stats.pendingTickets}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Unread Messages</span>
                </div>
                <span className="font-semibold text-blue-600">{stats.unreadMessages}</span>
              </div>
            </div>
            <Link 
              to="/csu/tickets" 
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg text-sm font-medium transition-colors block"
            >
              Manage Support
            </Link>
          </div>

          {/* Admin Quick Actions */}
          <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>
            <div className="space-y-2">
              <Link 
                to="/admin/security" 
                className="flex items-center gap-3 p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Shield className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="truncate">Security Settings</span>
              </Link>
              <Link 
                to="/admin/company" 
                className="flex items-center gap-3 p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Building className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <span className="truncate">Company Profile</span>
              </Link>
              <Link 
                to="/admin/features" 
                className="flex items-center gap-3 p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="truncate">System Features</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard