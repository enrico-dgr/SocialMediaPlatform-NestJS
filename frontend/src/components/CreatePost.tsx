import React, { useState, useCallback } from 'react';
import { apiClient, type Post } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Image, Send } from 'lucide-react';
import { extractErrorMessage, createHttpError, type FormSubmitHandler, type ApiRequestError } from '../types/common';

interface CreatePostProps {
  onPostCreated: (post: Post) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit: FormSubmitHandler = useCallback(async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const newPost = await apiClient.createPost(content, imageUrl || undefined);
      onPostCreated(newPost);
      setContent('');
      setImageUrl('');
    } catch (error: unknown) {
      const typedError = (typeof error === 'object' && error !== null && ('response' in error || 'code' in error)) 
        ? createHttpError(error as ApiRequestError) 
        : error;
      setError(extractErrorMessage(typedError));
    } finally {
      setIsLoading(false);
    }
  }, [content, imageUrl, onPostCreated]);

  if (!user) return null;

  return (
    <div className={`bg-white/95 backdrop-blur-sm rounded-3xl shadow-soft border p-8 mb-8 transition-all duration-300 group ${
      isFocused ? 'border-primary-300/80 shadow-medium ring-4 ring-primary-100/50' : 'border-gray-100/80 hover:shadow-medium'
    }`}>
      <div className="flex space-x-5">
        <div className="relative flex-shrink-0">
          <div className={`w-14 h-14 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-colored transition-transform duration-300 ${
            isFocused ? 'scale-110' : 'group-hover:scale-105'
          }`}>
            {user.firstName?.[0] || user.username[0]}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full transition-all duration-300 ${
            isFocused ? 'animate-pulse-soft scale-110' : ''
          }`}></div>
        </div>
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={`What's on your mind, ${user.firstName || user.username}?`}
                className={`w-full px-6 py-4 border-2 rounded-2xl bg-gray-50/30 text-body-lg resize-none transition-all duration-300 placeholder:text-gray-500 placeholder:font-normal min-h-[120px] ${
                  isFocused 
                    ? 'border-primary-400 ring-4 ring-primary-100/50 bg-white/80' 
                    : 'border-gray-200/60 hover:border-gray-300/80'
                }`}
                rows={4}
                required
                maxLength={280}
              />
              <div className={`absolute bottom-4 right-4 text-micro font-medium transition-colors duration-200 ${
                content.length > 240 ? 'text-orange-500' : content.length > 200 ? 'text-yellow-600' : 'text-gray-400'
              }`}>
                {content.length}/280
              </div>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50/80 border border-red-200/60 rounded-2xl">
                <p className="text-caption text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 px-4 py-2.5 bg-gray-50/50 rounded-2xl border border-gray-200/60 hover:bg-gray-100/50 transition-all duration-200">
                  <Image className="w-5 h-5 text-primary-600" />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Add image URL..."
                    className="bg-transparent text-sm font-medium placeholder:text-gray-500 focus:outline-none min-w-[200px]"
                  />
                </div>
                
                <div className="flex items-center space-x-2 text-caption text-gray-500">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span className="font-medium">Public</span>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !content.trim()}
                className="group flex items-center space-x-3 px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl font-bold hover:shadow-colored-lg hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed transition-all duration-300"
              >
                <Send className={`w-5 h-5 transition-transform duration-200 ${
                  isLoading ? 'animate-pulse' : 'group-hover:rotate-12'
                }`} />
                <span>{isLoading ? 'Posting...' : 'Share Post'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
