import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

export interface User {
  id: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  author: User;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: User;
  postId: number;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface UserStats {
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

class ApiClient {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:3000',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async register(userData: {
    email: string;
    password: string;
    username: string;
    firstName?: string;
    lastName?: string;
  }): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/auth/profile');
    return response.data;
  }

  // Users endpoints
  async getUsers(): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.api.get('/users');
    return response.data;
  }

  async getUserById(id: number): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async updateProfile(id: number, userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.put(`/users/${id}/profile`, userData);
    return response.data;
  }

  async changePassword(id: number, oldPassword: string, newPassword: string): Promise<void> {
    await this.api.patch(`/users/${id}/password`, { oldPassword, newPassword });
  }

  async deactivateAccount(id: number): Promise<void> {
    await this.api.delete(`/users/${id}/account`);
  }

  async followUser(id: number): Promise<void> {
    await this.api.post(`/users/${id}/follow`);
  }

  async unfollowUser(id: number): Promise<void> {
    await this.api.delete(`/users/${id}/follow`);
  }

  async getUserFollowers(id: number): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.api.get(`/users/${id}/followers`);
    return response.data;
  }

  async getUserFollowing(id: number): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.api.get(`/users/${id}/following`);
    return response.data;
  }

  async getUserStats(id: number): Promise<UserStats> {
    const response: AxiosResponse<UserStats> = await this.api.get(`/users/${id}/stats`);
    return response.data;
  }

  async isFollowing(followerId: number, followingId: number): Promise<{ isFollowing: boolean }> {
    const response: AxiosResponse<{ isFollowing: boolean }> = await this.api.get(
      `/users/${followerId}/is-following/${followingId}`
    );
    return response.data;
  }

  // Posts endpoints
  async createPost(content: string, imageUrl?: string): Promise<Post> {
    const response: AxiosResponse<Post> = await this.api.post('/posts', {
      content,
      imageUrl,
    });
    return response.data;
  }

  async getAllPosts(userId?: number): Promise<Post[]> {
    const params = userId ? { userId } : {};
    const response: AxiosResponse<Post[]> = await this.api.get('/posts', { params });
    return response.data;
  }

  async getFeed(): Promise<Post[]> {
    const response: AxiosResponse<Post[]> = await this.api.get('/posts/feed');
    return response.data;
  }

  async getPostById(id: number): Promise<Post> {
    const response: AxiosResponse<Post> = await this.api.get(`/posts/${id}`);
    return response.data;
  }

  async updatePost(id: number, content: string, imageUrl?: string): Promise<Post> {
    const response: AxiosResponse<Post> = await this.api.put(`/posts/${id}`, {
      content,
      imageUrl,
    });
    return response.data;
  }

  async deletePost(id: number): Promise<void> {
    await this.api.delete(`/posts/${id}`);
  }

  async likePost(id: number): Promise<void> {
    await this.api.post(`/posts/${id}/like`);
  }

  async unlikePost(id: number): Promise<void> {
    await this.api.delete(`/posts/${id}/like`);
  }

  async addComment(postId: number, content: string): Promise<Comment> {
    const response: AxiosResponse<Comment> = await this.api.post(`/posts/${postId}/comments`, {
      content,
    });
    return response.data;
  }

  async getPostComments(postId: number): Promise<Comment[]> {
    const response: AxiosResponse<Comment[]> = await this.api.get(`/posts/${postId}/comments`);
    return response.data;
  }

  async deleteComment(commentId: number): Promise<void> {
    await this.api.delete(`/posts/comments/${commentId}`);
  }

  // Health endpoint
  async healthCheck(): Promise<{ status: string }> {
    const response: AxiosResponse<{ status: string }> = await this.api.get('/health');
    return response.data;
  }

  // Development helper - check if backend is running
  async checkBackendStatus(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.warn('Backend not responding:', error);
      return false;
    }
  }
}

export const apiClient = new ApiClient();
