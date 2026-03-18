import {createAsyncThunk} from '@reduxjs/toolkit';
import {postsService} from '../../services/posts.service';
import {setPostsLoading, setPostsError, setPosts} from '../slices/posts.slice';

export const fetchAllPosts = createAsyncThunk(
  'posts/fetchAll',
  async (page: number = 1, {dispatch, rejectWithValue}) => {
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
      scheduledAt?: string;
    },
    {dispatch, rejectWithValue},
  ) => {
    try {
      const response = await postsService.create({
        mediaUrls: data.mediaUrls || [],
        caption: data.caption || '',
        platforms: data.platforms as ('facebook' | 'instagram')[],
        scheduledAt: data.scheduledAt,
      });
      // the new post will be added to the top via unshift in the slice if we return it here,
      // or we can just fetch all posts again
      dispatch(fetchAllPosts(1));
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create post';
      return rejectWithValue(message);
    }
  },
);
