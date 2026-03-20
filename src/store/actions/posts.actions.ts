import { createAsyncThunk } from '@reduxjs/toolkit';
import { postsService } from '../../services/posts.service';
import { setPostsLoading, setPostsError, setPosts, addPost } from '../slices/posts.slice';

export const fetchAllPosts = createAsyncThunk(
  'posts/fetchAll',
  async (page: number = 1, { dispatch, rejectWithValue }) => {
    dispatch(setPostsLoading(true));
    try {
      const response = await postsService.getAll(page);
      const formattedPosts = response.posts.map((p: any) => ({
        ...p,
        mediaUrl: p.mediaUrl || null,
        scheduledTime: p.scheduledTime || p.scheduledAt || null,
      }));
      dispatch(setPosts(formattedPosts));
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch posts';
      dispatch(setPostsError(message));
      return rejectWithValue(message);
    }
  },
);

export const createNewPost = createAsyncThunk(
  'posts/create',
  async (
    data: {
      mediaUrls?: string[];
      caption?: string;
      platforms: string[];
      scheduledTime?: string;
      location?: { name: string; lat: number; lng: number; };
      thumbnailUrl?: string;
    },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await postsService.create({
        mediaUrls: data.mediaUrls || [],
        caption: data.caption || '',
        platforms: data.platforms as ('facebook' | 'instagram')[],
        scheduledTime: data.scheduledTime,
        location: data.location,
        thumbnailUrl: data.thumbnailUrl,
      });
      // #32: Insert new post directly into Redux store instead of re-fetching the entire list
      dispatch(addPost(response));
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create post';
      return rejectWithValue(message);
    }
  },
);

