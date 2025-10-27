import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Calendar, Award } from 'lucide-react';
import { Card, LoadingSpinner, Select } from '../components/ui';
import analyticsService from '../services/analyticsService';
import { CHART_COLORS } from '../utils/constants';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6'); // months
  const [overview, setOverview] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const [overviewRes, monthlyRes, categoryRes, trendRes] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getMonthlyProgress(parseInt(timeRange)),
        analyticsService.getCategoryBreakdown(),
        analyticsService.getProgressTrend(parseInt(timeRange)),
      ]);
      
      setOverview(overviewRes.data.data);
      setMonthlyData(monthlyRes.data.data.monthlyProgress || []);
      setCategoryData(categoryRes.data.data.categories || []);
      setTrendData(trendRes.data.data.trend || []);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Goals',
      value: overview?.totalGoals || 0,
      icon: Target,
      color: 'from-primary-500 to-primary-600',
    },
    {
      title: 'Completion Rate',
      value: `${overview?.completionRate || 0}%`,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Current Streak',
      value: `${overview?.currentStreak || 0} days`,
      icon: Award,
      color: 'from-orange-500 to-red-600',
    },
    {
      title: 'Avg Progress',
      value: `${overview?.averageProgress || 0}%`,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-gray-400">Track your progress and insights</p>
        </div>
        
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          options={[
            { value: '3', label: 'Last 3 months' },
            { value: '6', label: 'Last 6 months' },
            { value: '12', label: 'Last 12 months' },
          ]}
          className="w-full sm:w-48"
        />
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card variant="glass">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="glass">
            <h2 className="text-xl font-bold text-white mb-6">Monthly Progress</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    background: '#1F2937',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Bar dataKey="completed" fill={CHART_COLORS.primary} name="Completed" />
                <Bar dataKey="inProgress" fill={CHART_COLORS.secondary} name="In Progress" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="glass">
            <h2 className="text-xl font-bold text-white mb-6">Goals by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS.categories[index % CHART_COLORS.categories.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1F2937',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Progress Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card variant="glass">
            <h2 className="text-xl font-bold text-white mb-6">Progress Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    background: '#1F2937',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="averageProgress" 
                  stroke={CHART_COLORS.primary} 
                  strokeWidth={3}
                  name="Average Progress"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
