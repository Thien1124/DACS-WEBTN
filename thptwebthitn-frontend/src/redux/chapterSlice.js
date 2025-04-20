import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as chapterService from '../services/chapterService';

export const fetchChapters = createAsyncThunk(
  'chapters/fetchChapters',
  async (params, { rejectWithValue }) => {
    try {
      return await chapterService.getChapters(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getChapter = createAsyncThunk(
  'chapters/getChapter',
  async (id, { rejectWithValue }) => {
    try {
      return await chapterService.getChapterById(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addChapter = createAsyncThunk(
  'chapters/addChapter',
  async (chapterData, { rejectWithValue }) => {
    try {
      return await chapterService.createChapter(chapterData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const editChapter = createAsyncThunk(
  'chapters/editChapter',
  async ({ id, chapterData }, { rejectWithValue }) => {
    try {
      return await chapterService.updateChapter(id, chapterData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeChapter = createAsyncThunk(
  'chapters/removeChapter',
  async (id, { rejectWithValue }) => {
    try {
      await chapterService.deleteChapter(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  list: [],
  currentChapter: null,
  loading: false,
  error: null,
  totalItems: 0,
  totalPages: 0,
};

const chapterSlice = createSlice({
  name: 'chapters',
  initialState,
  reducers: {
    clearChapterError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all chapters
      .addCase(fetchChapters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChapters.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.items || action.payload;
        state.totalItems = action.payload.totalItems || action.payload.length;
        state.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchChapters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get single chapter
      .addCase(getChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChapter.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChapter = action.payload;
      })
      .addCase(getChapter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add chapter
      .addCase(addChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addChapter.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(addChapter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Edit chapter
      .addCase(editChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editChapter.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(chapter => chapter.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(editChapter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Remove chapter
      .addCase(removeChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeChapter.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(chapter => chapter.id !== action.payload);
      })
      .addCase(removeChapter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearChapterError } = chapterSlice.actions;
export default chapterSlice.reducer;