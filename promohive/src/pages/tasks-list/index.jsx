import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Gamepad2 } from 'lucide-react';
import { taskService } from '../../services/taskService';
import { adgemService } from '../../services/adgemService';
import { useAuthContext } from '../../contexts/AuthContext';
import TaskCard from './components/TaskCard';

import TaskStats from './components/TaskStats';
import QuickActions from './components/QuickActions';

const TasksList = () => {
  const { user } = useAuthContext();
  const [tasks, setTasks] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [adgemOffers, setAdgemOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [userProfile, setUserProfile] = useState(null);

  // Add this block - Load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.id) {
        try {
          // Assuming taskService has a method to get user profile
          const { profile } = await taskService?.getUserProfile?.(user?.id);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
    };
    loadUserProfile();
  }, [user?.id]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    if (!user?.id) {
      console.error('User not authenticated');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const filters = {
        category: selectedCategory !== 'all' ? selectedCategory : undefined
      };

      // Load regular tasks with user-specific AdGem rewards
      const { tasks: allTasks, error: tasksError } = await taskService?.getTasksForUser(user?.id, filters);
      if (tasksError) throw tasksError;

      // Load user submissions
      const { submissions, error: submissionsError } = await taskService?.getUserSubmissions(user?.id);
      if (submissionsError) throw submissionsError;

      // Load AdGem offers if category is 'adgem' or 'all'
      if (selectedCategory === 'all' || selectedCategory === 'adgem') {
        const { offers, error: offersError } = await adgemService?.getAdgemOffers(user?.id);
        if (offersError) console.error('AdGem offers error:', offersError);
        else setAdgemOffers(offers || []);
      }

      setTasks(allTasks || []);
      setUserSubmissions(submissions || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = task?.title?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         task?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || task?.category === selectedCategory;

    return matchesSearch && matchesCategory;
  })?.sort((a, b) => {
    switch (sortBy) {
      case 'reward_high':
        return (b?.reward_amount || 0) - (a?.reward_amount || 0);
      case 'reward_low':
        return (a?.reward_amount || 0) - (b?.reward_amount || 0);
      case 'oldest':
        return new Date(a?.created_at) - new Date(b?.created_at);
      case 'newest':
      default:
        return new Date(b?.created_at) - new Date(a?.created_at);
    }
  });

  // Combine AdGem offers with filtered tasks
  const combinedTasks = selectedCategory === 'adgem' 
    ? adgemOffers?.map(offer => ({
        id: offer?.id,
        title: offer?.title,
        description: offer?.description,
        category: 'adgem',
        reward_amount: offer?.display_reward,
        external_url: offer?.external_url,
        requirements: offer?.requirements,
        created_at: offer?.created_at,
        total_slots: 1,
        completed_slots: 0,
        level_percentage: offer?.user_level >= 5 ? 85 : [10, 25, 40, 55, 70]?.[offer?.user_level] || 10,
        user_level: offer?.user_level,
        isAdgemOffer: true
      }))
    : [...filteredTasks, ...(selectedCategory === 'all' ? adgemOffers?.map(offer => ({
        id: offer?.id,
        title: offer?.title,
        description: offer?.description,
        category: 'adgem',
        reward_amount: offer?.display_reward,
        external_url: offer?.external_url,
        requirements: offer?.requirements,
        created_at: offer?.created_at,
        total_slots: 1,
        completed_slots: 0,
        level_percentage: offer?.user_level >= 5 ? 85 : [10, 25, 40, 55, 70]?.[offer?.user_level] || 10,
        user_level: offer?.user_level,
        isAdgemOffer: true
      })) : [])];

  // Add this block - Calculate stats for TaskStats component
  const taskStats = {
    total: combinedTasks?.length || 0,
    completed: userSubmissions?.filter(sub => sub?.status === 'approved')?.length || 0,
    pending: userSubmissions?.filter(sub => sub?.status === 'pending')?.length || 0,
    totalEarnings: userSubmissions?.filter(sub => sub?.status === 'approved')?.reduce((sum, sub) => sum + (sub?.reward_amount || 0), 0) || 0
  };

  const handleStartTask = (task) => {
    if (task?.isAdgemOffer) {
      // For AdGem offers, open external URL directly
      window.open(task?.external_url, '_blank');
    } else {
      // For regular tasks, use existing flow
      console.log('Starting task:', task);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">📋</div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Available Tasks</h1>
                <p className="text-sm text-gray-500">
                  Complete tasks to earn rewards • Level {userProfile?.level || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* AdGem Indicator */}
              <div className="hidden sm:flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded-lg">
                <Gamepad2 className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  AdGem {userProfile?.level >= 5 ? 85 : [10, 25, 40, 55, 70]?.[userProfile?.level] || 10}%
                </span>
              </div>

              <button
                onClick={loadTasks}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <TaskStats tasks={combinedTasks} userSubmissions={userSubmissions} stats={taskStats} />

        {/* Quick Actions */}
        <QuickActions onRefresh={loadTasks} refreshing={loading} />

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category and Sort Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e?.target?.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="survey">Survey</option>
                <option value="social_media">Social Media</option>
                <option value="app_download">App Download</option>
                <option value="review">Review</option>
                <option value="referral">Referral</option>
                <option value="video_watch">Video Watch</option>
                <option value="adgem">🎮 AdGem Offers</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e?.target?.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="reward_high">Highest Reward</option>
                <option value="reward_low">Lowest Reward</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {combinedTasks?.length > 0 ? (
              combinedTasks?.map(task => {
                const submission = userSubmissions?.find(sub => sub?.task_id === task?.id);
                return (
                  <TaskCard
                    key={task?.id}
                    task={task}
                    userSubmission={submission}
                    userLevel={userProfile?.level || 0}
                    onStart={handleStartTask}
                    onViewProof={() => console.log('View proof for:', task)}
                  />
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-500">
                  {searchTerm || selectedCategory !== 'all' ? 'Try adjusting your search or filters' : 'New tasks will appear here when available'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksList;