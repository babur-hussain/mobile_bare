import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface Post {
  _id: string;
  caption: string;
  mediaUrl: string | null;
  platforms: string[];
  status: 'pending' | 'processing' | 'published' | 'failed';
  scheduledTime: string | null;
  createdAt: string;
}

interface PostsState {
  items: Post[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
}

const initialState: PostsState = {
  items: [],
  isLoading: false,
  isCreating: false,
  error: null,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPostsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
      state.error = null;
    },
    setPostsCreating(state, action: PayloadAction<boolean>) {
      state.isCreating = action.payload;
      state.error = null;
    },
    setPostsError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.isCreating = false;
      state.error = action.payload;
    },
    clearPostsError(state) {
      state.error = null;
    },
    setPosts(state, action: PayloadAction<Post[]>) {
      state.items = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addPost(state, action: PayloadAction<Post>) {
      state.items.unshift(action.payload);
      state.isCreating = false;
      state.error = null;
    },
    updatePost(state, action: PayloadAction<Post>) {
      const index = state.items.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removePost(state, action: PayloadAction<string>) {
      state.items = state.items.filter(p => p._id !== action.payload);
    },
  },
});

export const {
  setPostsLoading,
  setPostsCreating,
  setPostsError,
  clearPostsError,
  setPosts,
  addPost,
  updatePost,
  removePost,
} = postsSlice.actions;

export default postsSlice.reducer;
