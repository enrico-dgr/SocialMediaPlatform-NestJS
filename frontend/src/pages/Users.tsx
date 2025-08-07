import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient, type User } from '../services/api';
import { UserPlus, UserMinus, MessageCircle } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import {
  extractErrorMessage,
  createHttpError,
  type ApiRequestError,
} from '../types/common';

const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { createDirectConversation, setActiveConversation } = useChat();
  const [users, setUsers] = useState<User[]>([]);
  const [followingStatus, setFollowingStatus] = useState<
    Record<number, boolean>
  >({});
  const [loadingUsers, setLoadingUsers] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      const allUsers = await apiClient.getUsers();
      const filteredUsers = allUsers.filter((u) => u.id !== currentUser?.id);
      setUsers(filteredUsers);

      // Check following status for each user
      if (currentUser) {
        const statusPromises = filteredUsers.map(async (user) => {
          try {
            const result = await apiClient.isFollowing(currentUser.id, user.id);
            return { userId: user.id, isFollowing: result.isFollowing };
          } catch {
            return { userId: user.id, isFollowing: false };
          }
        });

        const statuses = await Promise.all(statusPromises);
        const statusMap = statuses.reduce(
          (acc, { userId, isFollowing }) => {
            acc[userId] = isFollowing;
            return acc;
          },
          {} as Record<number, boolean>,
        );

        setFollowingStatus(statusMap);
      }
    } catch (error: unknown) {
      const typedError =
        typeof error === 'object' &&
        error !== null &&
        ('response' in error || 'code' in error)
          ? createHttpError(error as ApiRequestError)
          : error;
      setError(extractErrorMessage(typedError));
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleFollowToggle = useCallback(
    async (userId: number) => {
      if (!currentUser) return;

      setLoadingUsers((prev) => ({ ...prev, [userId]: true }));

      try {
        const isCurrentlyFollowing = followingStatus[userId];

        if (isCurrentlyFollowing) {
          await apiClient.unfollowUser(userId);
        } else {
          await apiClient.followUser(userId);
        }

        setFollowingStatus((prev) => ({
          ...prev,
          [userId]: !isCurrentlyFollowing,
        }));
      } catch (error: unknown) {
        const typedError =
          typeof error === 'object' &&
          error !== null &&
          ('response' in error || 'code' in error)
            ? createHttpError(error as ApiRequestError)
            : error;
        setError(extractErrorMessage(typedError));
      } finally {
        setLoadingUsers((prev) => ({ ...prev, [userId]: false }));
      }
    },
    [currentUser, followingStatus],
  );

  const handleStartChat = useCallback(
    async (userId: string) => {
      try {
        const conversation = await createDirectConversation(userId);
        if (conversation) {
          setActiveConversation(conversation);
        }
      } catch (error: unknown) {
        const typedError =
          typeof error === 'object' &&
          error !== null &&
          ('response' in error || 'code' in error)
            ? createHttpError(error as ApiRequestError)
            : error;
        setError(`Failed to start chat: ${extractErrorMessage(typedError)}`);
      }
    },
    [createDirectConversation, setActiveConversation],
  );

  if (isLoading) {
    return (
      <div className="px-4 sm:px-0">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Discover Users
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Find and follow other users in the community
          </p>
        </div>

        {error && (
          <div className="px-6 py-4 bg-red-50 border-l-4 border-red-400">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="divide-y divide-gray-200">
          {users.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No users found.
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      {user.firstName?.[0] || user.username[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.username}
                      </h3>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                      {user.bio && (
                        <p className="text-sm text-gray-500 mt-1 max-w-md truncate">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStartChat(user.id.toString())}
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      title="Send message"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Message</span>
                    </button>
                    
                    <button
                      onClick={() => handleFollowToggle(user.id)}
                      disabled={loadingUsers[user.id]}
                      className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
                        followingStatus[user.id]
                          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {loadingUsers[user.id] ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : followingStatus[user.id] ? (
                        <>
                          <UserMinus className="w-4 h-4" />
                          <span>Unfollow</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
