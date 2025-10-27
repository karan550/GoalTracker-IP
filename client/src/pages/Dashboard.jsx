import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  Plus,
  ArrowRight,
  Flame
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, Button, LoadingSpinner } from '../components/ui';
import { GoalCard, GoalForm } from '../components/goals';
import analyticsService from '../services/analyticsService';
import goalService from '../services/goalService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentGoals, setRecentGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [analyticsRes, goalsRes] = await Promise.all([
        analyticsService.getOverview(),
        goalService.getGoals({ limit: 6, sortBy: 'updatedAt', sortOrder: 'desc' }),
      ]);
      
      setStats(analyticsRes.data.data);
      setRecentGoals(goalsRes.data.data.goals);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async (formData) => {
    try {
      await goalService.createGoal(formData);
      fetchDashboardData();
    } catch (error) {
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Goals',
      value: stats?.totalGoals || 0,
      icon: Target,
      color: 'from-primary-500 to-primary-600',
      change: '+12%',
    },
    {
      title: 'In Progress',
      value: stats?.inProgressGoals || 0,
      icon: Clock,
      color: 'from-blue-500 to-blue-600',
      change: '+8%',
    },
    {
      title: 'Completed',
      value: stats?.completedGoals || 0,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      change: '+23%',
    },
    {
      title: 'Current Streak',
      value: `${stats?.currentStreak || 0} days`,
      icon: Flame,
      color: 'from-orange-500 to-red-600',
      change: 'Keep going!',
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
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-400">
            Here's your goal tracking progress overview
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          icon={Plus}
          onClick={() => setShowGoalForm(true)}
        >
          New Goal
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card variant="glass" className="overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">{stat.change}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Recent Goals</h2>
          <Button
            variant="ghost"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate('/goals')}
          >
            View All
          </Button>
        </div>

        {recentGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentGoals.map((goal, index) => (
              <GoalCard 
                key={goal._id} 
                goal={goal} 
                index={index}
                onUpdate={fetchDashboardData}
              />
            ))}
          </div>
        ) : (
          <Card variant="glass" className="text-center py-12">
            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No goals yet</h3>
            <p className="text-gray-400 mb-6">
              Start tracking your goals to see them here
            </p>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setShowGoalForm(true)}
            >
              Create Your First Goal
            </Button>
          </Card>
        )}
      </motion.div>

      {/* Goal Form Modal */}
      <GoalForm
        isOpen={showGoalForm}
        onClose={() => setShowGoalForm(false)}
        onSubmit={handleCreateGoal}
      />
    </div>
  );
};

export default Dashboard;
