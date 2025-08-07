import React, { useState } from 'react';
import { type Post, type Comment, apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageCircle, MoreVertical, Trash2, Edit, Send } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onUpdate?: (updatedPost: Post) => void;
  onDelete?: (postId: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isAuthor = user?.id === post.author.id;
  const isLiked = post.isLiked || false;

  const handleLike = async () => {
    try {
      if (isLiked) {
        await apiClient.unlikePost(post.id);
      } else {
        await apiClient.likePost(post.id);
      }
      const updatedPost = { 
        ...post, 
        isLiked: !isLiked,
        likesCount: isLiked ? post.likesCount - 1 : post.likesCount + 1
      };
      onUpdate?.(updatedPost);
    } catch (error) {
      console.error('Failed to like/unlike post:', error);
    }
  };

  const loadComments = async () => {
    try {
      const postComments = await apiClient.getPostComments(post.id);
      setComments(postComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleShowComments = () => {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsCommenting(true);
    try {
      const comment = await apiClient.addComment(post.id, newComment);
      setComments([...comments, comment]);
      setNewComment('');
      const updatedPost = { ...post, commentsCount: post.commentsCount + 1 };
      onUpdate?.(updatedPost);
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await apiClient.deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      const updatedPost = { ...post, commentsCount: post.commentsCount - 1 };
      onUpdate?.(updatedPost);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim()) return;

    setIsUpdating(true);
    try {
      const updatedPost = await apiClient.updatePost(post.id, editContent);
      onUpdate?.(updatedPost);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update post:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await apiClient.deletePost(post.id);
        onDelete?.(post.id);
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
    }
  };

  return (
    <article className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-soft border border-gray-100/80 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 hover:shadow-medium hover:border-gray-200/80 transition-all duration-300 ease-soft group">
      {/* Post Header */}
      <header className="flex items-start justify-between mb-4 sm:mb-6">
        <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-10 sm:w-12 lg:w-14 h-10 sm:h-12 lg:h-14 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-sm sm:text-base lg:text-lg font-bold text-white shadow-colored ring-2 sm:ring-4 ring-primary-100/50 group-hover:ring-primary-200/70 transition-all duration-300">
              {post.author.firstName?.[0] || post.author.username[0]}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 sm:w-4 lg:w-5 h-3 sm:h-4 lg:h-5 bg-green-400 border border-white sm:border-2 rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
              <h3 className="text-sm sm:text-base lg:text-subtitle font-semibold text-gray-900 truncate">
                {post.author.firstName && post.author.lastName 
                  ? `${post.author.firstName} ${post.author.lastName}` 
                  : post.author.username}
              </h3>
              <span className="text-xs lg:text-micro text-primary-600 bg-primary-50 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                Pro
              </span>
            </div>
            <p className="text-xs sm:text-sm lg:text-caption text-gray-600 font-medium truncate">@{post.author.username}</p>
            <time className="text-xs lg:text-micro text-gray-500 font-normal" dateTime={post.createdAt}>
              {new Date(post.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </time>
          </div>
        </div>
        
        {isAuthor && (
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl hover:bg-gray-100/80 transition-all duration-200 opacity-60 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 sm:w-5 h-4 sm:h-5 text-gray-500" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-44 sm:w-52 bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-strong z-10 border border-gray-100/80 overflow-hidden">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 sm:space-x-3 w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 hover:bg-primary-50/80 transition-all duration-200"
                >
                  <Edit className="w-3 sm:w-4 h-3 sm:h-4 text-primary-600" />
                  <span>Edit Post</span>
                </button>
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={() => {
                    handleDeletePost();
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 sm:space-x-3 w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50/80 transition-all duration-200"
                >
                  <Trash2 className="w-3 sm:w-4 h-3 sm:h-4" />
                  <span>Delete Post</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Post Content */}
      {isEditing ? (
        <form onSubmit={handleUpdatePost} className="mb-4 sm:mb-6">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-400 bg-gray-50/50 text-sm sm:text-base lg:text-body-lg resize-none transition-all duration-200"
            rows={3}
            required
            placeholder="Share your thoughts..."
          />
          <div className="flex justify-end space-x-2 sm:space-x-3 mt-3 sm:mt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium border-2 border-gray-300 rounded-xl sm:rounded-2xl hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl sm:rounded-2xl hover:shadow-colored-lg hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all duration-200"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-4 sm:mb-6">
          <p className="text-sm sm:text-base lg:text-body-lg leading-relaxed text-gray-800 whitespace-pre-wrap font-normal">{post.content}</p>
          {post.imageUrl && (
            <div className="mt-3 sm:mt-4 lg:mt-6 rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-soft">
              <img 
                src={post.imageUrl} 
                alt="Post image" 
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500 ease-out"
              />
            </div>
          )}
        </div>
      )}

      {/* Post Actions */}
      <footer className="flex items-center justify-between pt-3 sm:pt-4 lg:pt-6 border-t border-gray-100/60">
        <div className="flex items-center space-x-0.5 sm:space-x-1">
          <button
            onClick={handleLike}
            className={`group flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 rounded-lg sm:rounded-xl lg:rounded-2xl transition-all duration-300 ${
              isLiked 
                ? 'text-red-600 bg-red-50/80 hover:bg-red-100/80' 
                : 'text-gray-600 hover:text-red-600 hover:bg-red-50/50'
            }`}
          >
            <Heart className={`w-4 sm:w-5 h-4 sm:h-5 transition-all duration-300 ${
              isLiked ? 'fill-current scale-110' : 'group-hover:scale-110'
            }`} />
            <span className="font-semibold text-xs sm:text-sm">{post.likesCount}</span>
          </button>
          
          <button
            onClick={handleShowComments}
            className="group flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 rounded-lg sm:rounded-xl lg:rounded-2xl text-gray-600 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-300"
          >
            <MessageCircle className="w-4 sm:w-5 h-4 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-semibold text-xs sm:text-sm">{post.commentsCount}</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2 text-xs lg:text-micro text-gray-500">
          <span className="hidden sm:inline">{post.likesCount + post.commentsCount} interactions</span>
          <span className="sm:hidden">{post.likesCount + post.commentsCount}</span>
        </div>
      </footer>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 sm:mt-4 lg:mt-6 pt-3 sm:pt-4 lg:pt-6 border-t border-gray-100/60 animate-fade-in">
          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="flex space-x-2 sm:space-x-3 lg:space-x-4 mb-4 sm:mb-6">
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-accent-400 to-primary-500 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-soft flex-shrink-0">
              {user?.firstName?.[0] || user?.username[0]}
            </div>
            <div className="flex-1 flex space-x-2 sm:space-x-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-50/50 border-2 border-gray-200/60 rounded-lg sm:rounded-xl lg:rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-400 text-sm sm:text-base lg:text-subtitle placeholder-gray-500 transition-all duration-200"
              />
              <button
                type="submit"
                disabled={isCommenting || !newComment.trim()}
                className="px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg sm:rounded-xl lg:rounded-2xl hover:shadow-colored hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all duration-200 group flex-shrink-0"
              >
                <Send className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 && !isCommenting && (
              <div className="text-center py-6">
                <p className="text-caption text-gray-500 font-medium">No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-4 p-4 bg-gray-50/30 rounded-2xl border border-gray-100/50 hover:bg-primary-50/20 hover:border-primary-200/40 transition-all duration-300 group">
                <div className="w-9 h-9 bg-gradient-to-br from-secondary-400 to-accent-500 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-soft">
                  {comment.author.firstName?.[0] || comment.author.username[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <p className="text-subtitle font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                        {comment.author.firstName && comment.author.lastName 
                          ? `${comment.author.firstName} ${comment.author.lastName}` 
                          : comment.author.username}
                      </p>
                      <span className="text-micro text-gray-500 font-medium">@{comment.author.username}</span>
                    </div>
                    <time className="text-micro text-gray-400 font-normal">
                      {new Date(comment.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </time>
                  </div>
                  <p className="text-caption text-gray-800 leading-relaxed font-normal mb-3">{comment.content}</p>
                  <div className="flex items-center space-x-4">
                    <button className="text-micro text-gray-500 hover:text-primary-600 font-medium transition-colors duration-200">
                      Reply
                    </button>
                    {user?.id === comment.author.id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-micro text-red-500 hover:text-red-700 font-medium transition-colors duration-200"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCard;
