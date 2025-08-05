import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient, type Post, type User, type UserStats } from '../services/api';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { RefreshCw, Sparkles } from 'lucide-react';
import { PostSkeleton } from '../components/ui/Skeleton';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await Promise.all([
        loadFeed(),
        loadUserStats(),
        loadSuggestedUsers()
      ]);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFeed = async () => {
    try {
      // Try to load personalized feed first, fall back to all posts
      let feedPosts: Post[] = [];
      try {
        feedPosts = await apiClient.getFeed();
      } catch {
        // If feed fails (maybe user follows nobody), get all posts
        feedPosts = await apiClient.getAllPosts();
      }
      setPosts(feedPosts);
    } catch (error) {
      console.error('Failed to load feed:', error);
    }
  };

  const loadUserStats = async () => {
    if (!user) return;
    try {
      const userStats = await apiClient.getUserStats(user.id);
      setStats(userStats);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const loadSuggestedUsers = async () => {
    try {
      const allUsers = await apiClient.getUsers();
      // Simple suggestion: users not followed by current user (excluding self)
      const suggestions = allUsers
        .filter(u => u.id !== user?.id)
        .slice(0, 3); // Show only first 3 as suggestions
      setSuggestedUsers(suggestions);
    } catch (error) {
      console.error('Failed to load suggested users:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadFeed();
    setIsRefreshing(false);
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts]);
    if (stats) {
      setStats({ ...stats, postsCount: stats.postsCount + 1 });
    }
  };

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handlePostDelete = (postId: number) => {
    setPosts(posts.filter(p => p.id !== postId));
    if (stats) {
      setStats({ ...stats, postsCount: stats.postsCount - 1 });
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 sm:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="mb-8 animate-fade-in">
              <h2 className="text-headline font-bold bg-gradient-to-r from-gray-900 via-primary-800 to-secondary-800 bg-clip-text text-transparent mb-3">
                Loading your feed...
              </h2>
              <p className="text-body-lg text-gray-600 font-medium">
                We're gathering the latest posts for you.
              </p>
            </div>
            <div className="space-y-6">
              {Array.from({ length: 3 }, (_, index) => (
                <PostSkeleton key={index} />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 animate-fade-in">
              <h3 className="font-semibold text-gray-900 mb-4">Loading stats...</h3>
              <div className="space-y-3">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="flex justify-between">
                    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-3 space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-display font-bold bg-gradient-to-r from-gray-900 via-primary-800 to-secondary-800 bg-clip-text text-transparent mb-4">
              Welcome back, {user?.firstName || user?.username}!
            </h1>
            <p className="text-body-lg text-gray-600 font-medium max-w-2xl">
              Here's what's happening in your network. Stay connected with friends and discover new content.
            </p>
          </div>

          {/* Create Post */}
          <CreatePost onPostCreated={handlePostCreated} />

          {/* Feed Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Feed</h3>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Posts */}
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="bg-gradient-to-br from-white via-primary-50/30 to-secondary-50/30 rounded-3xl shadow-medium border border-white/50 p-12 text-center backdrop-blur-sm">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-float">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to your feed!</h3>
                <p className="text-gray-600 mb-6 text-lg">
                  Start following people or create your first post to see content here.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl font-semibold shadow-colored hover:scale-105 transition-all duration-200">
                    Create Your First Post
                  </button>
                  <button className="px-6 py-3 border-2 border-primary-300 text-primary-600 rounded-2xl font-semibold hover:bg-primary-50 transition-all duration-200">
                    Discover Users
                  </button>
                </div>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onUpdate={handlePostUpdate}
                  onDelete={handlePostDelete}
                />
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* User Stats */}
          {stats && (
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-soft border border-gray-100/80 p-8 hover:shadow-medium transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-title font-bold text-gray-900">Your Activity</h3>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse-soft"></div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50/50 to-secondary-50/30 rounded-2xl border border-primary-100/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-bold text-sm">📝</span>
                    </div>
                    <span className="text-subtitle font-semibold text-gray-700">Posts</span>
                  </div>
                  <span className="text-title font-bold text-primary-600">{stats.postsCount}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-secondary-50/50 to-primary-50/30 rounded-2xl border border-secondary-100/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-bold text-sm">👥</span>
                    </div>
                    <span className="text-subtitle font-semibold text-gray-700">Followers</span>
                  </div>
                  <span className="text-title font-bold text-secondary-600">{stats.followersCount}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-accent-50/50 to-primary-50/30 rounded-2xl border border-accent-100/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-bold text-sm">➕</span>
                    </div>
                    <span className="text-subtitle font-semibold text-gray-700">Following</span>
                  </div>
                  <span className="text-title font-bold text-accent-600">{stats.followingCount}</span>
                </div>
              </div>
              <button className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl font-bold hover:shadow-colored-lg hover:scale-105 transition-all duration-300">
                View Full Profile
              </button>
            </div>
          )}

          {/* Suggested Users */}
          {suggestedUsers.length > 0 && (
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-soft border border-gray-100/80 p-8 hover:shadow-medium transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-title font-bold text-gray-900">Discover People</h3>
                <span className="text-micro text-primary-600 bg-primary-50 px-2 py-1 rounded-full font-bold">NEW</span>
              </div>
              <div className="space-y-4">
                {suggestedUsers.map((suggestedUser) => (
                  <div key={suggestedUser.id} className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/60 hover:bg-primary-50/30 hover:border-primary-200/60 transition-all duration-300 group">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-secondary-400 to-accent-500 rounded-2xl flex items-center justify-center text-sm font-bold text-white shadow-soft">
                        {suggestedUser.firstName?.[0] || suggestedUser.username[0]}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-subtitle font-semibold text-gray-900 truncate group-hover:text-primary-700 transition-colors">
                        {suggestedUser.firstName && suggestedUser.lastName 
                          ? `${suggestedUser.firstName} ${suggestedUser.lastName}` 
                          : suggestedUser.username}
                      </p>
                      <p className="text-caption text-gray-600 font-medium">@{suggestedUser.username}</p>
                    </div>
                    <button className="px-3 py-1.5 bg-primary-500 text-white rounded-xl text-micro font-bold hover:bg-primary-600 hover:scale-105 transition-all duration-200">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100/60">
                <a
                  href="/users"
                  className="flex items-center justify-center space-x-2 w-full py-3 text-subtitle font-bold text-primary-600 hover:text-primary-700 hover:bg-primary-50/50 rounded-2xl transition-all duration-200"
                >
                  <span>Discover More People</span>
                  <span className="text-lg">→</span>
                </a>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-gradient-to-br from-yellow-50/80 via-orange-50/60 to-primary-50/40 rounded-3xl border border-yellow-200/60 p-8 shadow-soft hover:shadow-medium transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-colored">
                <span className="text-xl">💡</span>
              </div>
              <div className="flex-1">
                <h3 className="text-subtitle font-bold text-orange-900 mb-3">Pro Tip</h3>
                <p className="text-caption text-orange-800 font-medium leading-relaxed">
                  Follow more users to see diverse content in your personalized feed! Your network grows with every connection.
                </p>
                <button className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-xl text-micro font-bold hover:bg-orange-600 hover:scale-105 transition-all duration-200">
                  Explore Users
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
