import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient, type UserStats } from '../services/api';
import { Edit, Mail, Calendar, Users, Save, X, Sparkles } from 'lucide-react';
import { Button, Input, Card, Avatar, Badge } from '../components/ui';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    if (!user) return;
    try {
      const userStats = await apiClient.getUserStats(user.id);
      setStats(userStats);
    } catch (err) {
      console.error('Failed to load user stats:', err);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      const updatedUser = await apiClient.updateProfile(user.id, editForm);
      updateUser(updatedUser);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  if (!user) return null;

  return (
    <div className="px-4 sm:px-0 animate-fade-in-up">
      <Card className="overflow-hidden bg-white/95 backdrop-blur-sm border-gray-100/80 shadow-medium hover:shadow-strong transition-all duration-300">
        {/* Profile Header */}
        <div className="relative bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-600 h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
          <div className="absolute top-4 right-4">
            <Sparkles className="w-6 h-6 text-white/80 animate-float" />
          </div>
          <div className="absolute bottom-4 left-6 text-white">
            <p className="text-micro font-bold uppercase tracking-wider opacity-80">Member since</p>
            <p className="text-caption font-semibold">{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        
        <div className="px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
              <div className="relative self-center md:self-start">
                <Avatar
                  initials={user.firstName?.[0] || user.username[0] || 'U'}
                  size="xl"
                  className="w-24 h-24 -mt-12 ring-4 ring-white shadow-colored text-2xl font-bold"
                  status="online"
                />
                <Badge dot variant="success" className="absolute -bottom-2 -right-2">
                  <div className="w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
                </Badge>
              </div>
              <div className="text-center md:text-left mt-4 md:mt-0">
                <h1 className="text-display font-bold bg-gradient-to-r from-gray-900 via-primary-800 to-secondary-800 bg-clip-text text-transparent mb-2">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.username}
                </h1>
                <p className="text-subtitle text-gray-600 font-medium mb-3">@{user.username}</p>
                {user.bio && (
                  <p className="text-body text-gray-700 leading-relaxed max-w-md">{user.bio}</p>
                )}
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "primary"}
              size="md"
              className="self-center md:self-start"
            >
              {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          {/* User Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-primary-50/50 to-secondary-50/30 rounded-2xl border border-primary-100/50">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-micro text-gray-600 font-medium uppercase tracking-wide">Email</p>
                <p className="text-caption text-gray-900 font-semibold">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-secondary-50/50 to-accent-50/30 rounded-2xl border border-secondary-100/50">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-micro text-gray-600 font-medium uppercase tracking-wide">Joined</p>
                <p className="text-caption text-gray-900 font-semibold">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-accent-50/50 to-primary-50/30 rounded-2xl border border-accent-100/50">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-micro text-gray-600 font-medium uppercase tracking-wide">Network</p>
                <p className="text-caption text-gray-900 font-semibold">{stats?.followersCount || 0} followers</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="mt-8 border-t border-gray-100/60 pt-8">
              <h3 className="text-title font-bold text-gray-900 mb-6 text-center">Activity Overview</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-primary-50/50 to-primary-100/30 rounded-3xl border border-primary-200/50 hover:shadow-soft transition-all duration-300">
                  <div className="text-display font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">{stats.postsCount}</div>
                  <div className="text-subtitle text-gray-700 font-semibold">Posts</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-secondary-50/50 to-secondary-100/30 rounded-3xl border border-secondary-200/50 hover:shadow-soft transition-all duration-300">
                  <div className="text-display font-bold bg-gradient-to-r from-secondary-600 to-secondary-700 bg-clip-text text-transparent">{stats.followersCount}</div>
                  <div className="text-subtitle text-gray-700 font-semibold">Followers</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-accent-50/50 to-accent-100/30 rounded-3xl border border-accent-200/50 hover:shadow-soft transition-all duration-300">
                  <div className="text-display font-bold bg-gradient-to-r from-accent-600 to-accent-700 bg-clip-text text-transparent">{stats.followingCount}</div>
                  <div className="text-subtitle text-gray-700 font-semibold">Following</div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Form */}
          {isEditing && (
            <div className="mt-8 border-t border-gray-100/60 pt-8 animate-fade-in">
              <div className="bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/30 rounded-3xl border border-primary-200/50 p-8">
                <h3 className="text-title font-bold text-gray-900 mb-6 flex items-center">
                  <Edit className="w-5 h-5 mr-2 text-primary-600" />
                  Edit Profile
                </h3>
                <form onSubmit={handleEditSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50/80 border border-red-200/60 text-red-700 px-4 py-3 rounded-2xl">
                      <p className="text-caption font-medium">{error}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-subtitle font-semibold text-gray-700 mb-2">
                        First Name
                      </label>
                      <Input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={editForm.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-subtitle font-semibold text-gray-700 mb-2">
                        Last Name
                      </label>
                      <Input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={editForm.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block text-subtitle font-semibold text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={editForm.bio}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200/60 rounded-2xl focus:ring-4 focus:ring-primary-100/50 focus:border-primary-400 bg-gray-50/30 text-body resize-none transition-all duration-200 placeholder:text-gray-500"
                      placeholder="Tell us about yourself..."
                      maxLength={160}
                    />
                    <p className="text-micro text-gray-500 mt-2">{editForm.bio.length}/160 characters</p>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <Button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      size="md"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      variant="primary"
                      size="md"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Profile;
