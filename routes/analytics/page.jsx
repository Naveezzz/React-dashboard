// /src/routes/analytics/page.jsx
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ComposedChart } from 'recharts';
import { TrendingUp, Users, DollarSign, Eye, BarChart3, Activity, Calendar, ArrowUpRight, ArrowDownRight, Package, CreditCard, ShoppingBag, Target } from 'lucide-react';

const AnalyticsPage = () => {
  const [activeTimeRange, setActiveTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Enhanced data based on your existing structure
  const analyticsData = [
    { month: 'Jan', revenue: 12400, users: 2400, orders: 856, conversion: 3.2 },
    { month: 'Feb', revenue: 13200, users: 2210, orders: 924, conversion: 3.8 },
    { month: 'Mar', revenue: 14800, users: 2290, orders: 1205, conversion: 4.1 },
    { month: 'Apr', revenue: 16200, users: 2000, orders: 1089, conversion: 4.5 },
    { month: 'May', revenue: 18500, users: 2181, orders: 1456, conversion: 4.2 },
    { month: 'Jun', revenue: 20100, users: 2500, orders: 1623, conversion: 4.8 }
  ];

  const trafficSources = [
    { name: 'Organic Search', value: 45, color: '#3b82f6', visitors: 12500 },
    { name: 'Direct', value: 30, color: '#8b5cf6', visitors: 8300 },
    { name: 'Social Media', value: 15, color: '#06b6d4', visitors: 4200 },
    { name: 'Referral', value: 10, color: '#f59e0b', visitors: 2800 }
  ];

  const deviceData = [
    { device: 'Desktop', sessions: 15420, bounce: 32.5 },
    { device: 'Mobile', sessions: 18650, bounce: 45.2 },
    { device: 'Tablet', sessions: 6840, bounce: 38.7 }
  ];

  const topPages = [
    { page: '/products', views: 8540, time: '3:42', bounce: 28.5 },
    { page: '/dashboard', views: 6230, time: '4:15', bounce: 22.1 },
    { page: '/analytics', views: 4820, time: '5:32', bounce: 31.8 },
    { page: '/customers', views: 3940, time: '2:58', bounce: 35.2 },
    { page: '/settings', views: 2150, time: '1:45', bounce: 42.6 }
  ];

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Revenue',
      value: '$94,300',
      change: 12.5,
      icon: DollarSign,
      color: 'bg-blue-500',
      period: 'vs last month'
    },
    {
      title: 'Active Users',
      value: '13,845',
      change: 8.2,
      icon: Users,
      color: 'bg-purple-500',
      period: 'vs last month'
    },
    {
      title: 'Page Views',
      value: '284.5K',
      change: -2.1,
      icon: Eye,
      color: 'bg-cyan-500',
      period: 'vs last month'
    },
    {
      title: 'Conversion Rate',
      value: '4.2%',
      change: 15.3,
      icon: Target,
      color: 'bg-emerald-500',
      period: 'vs last month'
    }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="font-medium text-slate-900 dark:text-slate-50 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {entry.name}: <span className="font-medium text-slate-900 dark:text-slate-50">
                  {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                </span>
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const StatCard = ({ title, value, change, icon: Icon, color, period }) => (
    <div className="card">
      <div className="card-header">
        <div className={`w-fit rounded-lg ${color}/20 p-2 ${color.replace('bg-', 'text-')} transition-colors dark:${color}/20 dark:${color.replace('bg-', 'text-')}`}>
          <Icon size={26} />
        </div>
        <p className="card-title">{title}</p>
      </div>
      <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
        <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">{value}</p>
        <div className="flex items-center justify-between">
          <span className={`flex w-fit items-center gap-x-2 rounded-full border px-2 py-1 font-medium text-sm ${
            change >= 0 
              ? 'border-emerald-500 text-emerald-600 dark:border-emerald-600 dark:text-emerald-500' 
              : 'border-red-500 text-red-600 dark:border-red-600 dark:text-red-500'
          }`}>
            {change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{period}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="title">Analytics</h1>
        <div className="flex items-center gap-2">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setActiveTimeRange(range)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeTimeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        {/* Revenue Trend Chart */}
        <div className="card col-span-1 lg:col-span-4">
          <div className="card-header">
            <div className="flex items-center justify-between w-full">
              <p className="card-title">Revenue Analytics</p>
              <div className="flex gap-2">
                {['revenue', 'users', 'orders'].map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                      selectedMetric === metric
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                    }`}
                  >
                    {metric}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="card-body p-0">
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={analyticsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="conversion"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="card col-span-1 lg:col-span-3">
          <div className="card-header">
            <p className="card-title">Traffic Sources</p>
          </div>
          <div className="card-body">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={trafficSources}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {trafficSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {trafficSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: source.color }}
                      />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-50">{source.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{source.visitors.toLocaleString()} visitors</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-50">{source.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Device Analytics & Top Pages */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Device Analytics */}
        <div className="card">
          <div className="card-header">
            <p className="card-title">Device Analytics</p>
          </div>
          <div className="card-body p-0">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={deviceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis 
                  dataKey="device" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="sessions" 
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  name="Sessions"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Pages */}
        <div className="card">
          <div className="card-header">
            <p className="card-title">Top Pages</p>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-slate-900 dark:text-slate-50">{page.page}</p>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-50">{page.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <span>Avg. time: {page.time}</span>
                      <span>Bounce: {page.bounce}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="card">
        <div className="card-header">
          <p className="card-title">Performance Metrics</p>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
              <Package className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">98.7%</h3>
              <p className="text-slate-600 dark:text-slate-400">Uptime</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl">
              <Activity className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">1.2s</h3>
              <p className="text-slate-600 dark:text-slate-400">Avg. Load Time</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
              <TrendingUp className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">+24%</h3>
              <p className="text-slate-600 dark:text-slate-400">Growth Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;