import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient, type User, type Post } from '../services/api';
import PostCard from '../components/PostCard';
import {
  Search as SearchIcon,
  User as UserIcon,
  MessageSquare,
  Users,
} from 'lucide-react';

const Search: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (query.trim()) {
      performSearch();
    } else {
      setUsers(allUsers);
      setPosts(allPosts);
      setHasSearched(false);
    }
  }, [query, allUsers, allPosts]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, postsData] = await Promise.all([
        apiClient.getUsers(),
        apiClient.getAllPosts(),
      ]);

      setAllUsers(usersData.filter((u) => u.id !== currentUser?.id));
      setAllPosts(postsData);
      setUsers(usersData.filter((u) => u.id !== currentUser?.id));
      setPosts(postsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = () => {
    setHasSearched(true);
    const searchTerm = query.toLowerCase().trim();

    // Search users
    const filteredUsers = allUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        (user.firstName && user.firstName.toLowerCase().includes(searchTerm)) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchTerm)) ||
        (user.bio && user.bio.toLowerCase().includes(searchTerm)),
    );

    // Search posts
    const filteredPosts = allPosts.filter(
      (post) =>
        post.content.toLowerCase().includes(searchTerm) ||
        post.author.username.toLowerCase().includes(searchTerm) ||
        (post.author.firstName &&
          post.author.firstName.toLowerCase().includes(searchTerm)) ||
        (post.author.lastName &&
          post.author.lastName.toLowerCase().includes(searchTerm)),
    );

    setUsers(filteredUsers);
    setPosts(filteredPosts);
  };

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
    setAllPosts(
      allPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
    );
  };

  const handlePostDelete = (postId: number) => {
    setPosts(posts.filter((p) => p.id !== postId));
    setAllPosts(allPosts.filter((p) => p.id !== postId));
  };

  return (
    <div className="px-4 sm:px-0">
      <div className="bg-white shadow rounded-lg">
        {/* Search Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search</h2>

          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search for users, posts, or content..."
            />
          </div>

          {/* Tabs */}
          <div className="mt-4 flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users ({users.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Posts ({posts.length})</span>
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Users Tab */}
              {activeTab === 'users' && (
                <div>
                  {users.length === 0 ? (
                    <div className="text-center py-12">
                      <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {hasSearched ? 'No users found' : 'All Users'}
                      </h3>
                      <p className="text-gray-600">
                        {hasSearched
                          ? 'Try searching with different keywords'
                          : 'Search for users by name, username, or bio'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-lg font-semibold">
                            {user.firstName?.[0] || user.username[0]}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.username}
                            </h3>
                            <p className="text-sm text-gray-600">
                              @{user.username}
                            </p>
                            {user.bio && (
                              <p className="text-sm text-gray-500 mt-1">
                                {user.bio}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Joined{' '}
                              {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-sm text-gray-500">
                            <p>{user.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Posts Tab */}
              {activeTab === 'posts' && (
                <div>
                  {posts.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {hasSearched ? 'No posts found' : 'All Posts'}
                      </h3>
                      <p className="text-gray-600">
                        {hasSearched
                          ? 'Try searching with different keywords'
                          : 'Search for posts by content or author'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {posts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onUpdate={handlePostUpdate}
                          onDelete={handlePostDelete}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
