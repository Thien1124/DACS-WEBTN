import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as chapterService from '../services/chapterService';

export const fetchChapters = createAsyncThunk(
  'chapters/fetchChapters',
  async (params, { rejectWithValue }) => {
    try {
      const response = await chapterService.getChapters(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchChaptersBySubject = createAsyncThunk(
  'chapters/fetchChaptersBySubject',
  async (subjectId, { rejectWithValue }) => {
    try {
      const response = await chapterService.getChaptersBySubject(subjectId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createChapter = createAsyncThunk(
  'chapters/createChapter',
  async (chapterData, { rejectWithValue }) => {
    try {
      const response = await chapterService.createChapter(chapterData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateChapter = createAsyncThunk(
  'chapters/updateChapter',
  async ({ id, chapterData }, { rejectWithValue }) => {
    try {
      const response = await chapterService.updateChapter(id, chapterData);
      return response;
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
  bySubject: {},
  currentChapter: null,
  loading: false,
  error: null
};

const chapterSlice = createSlice({
  name: 'chapters',
  initialState,
  reducers: {
    clearChapterError: (state) => {
      state.error = null;
    },
    clearCurrentChapter: (state) => {
      state.currentChapter = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch chapters
      .addCase(fetchChapters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChapters.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.list = action.payload;
        } else if (action.payload && Array.isArray(action.payload.data)) {
          state.list = action.payload.data;
        } else if (action.payload && Array.isArray(action.payload.items)) {
          state.list = action.payload.items;
        }
      })
      .addCase(fetchChapters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch chapters by subject
      .addCase(fetchChaptersBySubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChaptersBySubject.fulfilled, (state, action) => {
        state.loading = false;
        const subjectId = action.meta.arg;
        let chaptersData = [];
        
        if (Array.isArray(action.payload)) {
          chaptersData = action.payload;
        } else if (action.payload && Array.isArray(action.payload.data)) {
          chaptersData = action.payload.data;
        } else if (action.payload && Array.isArray(action.payload.items)) {
          chaptersData = action.payload.items;
        }
        
        state.bySubject[subjectId] = chaptersData;
      })
      .addCase(fetchChaptersBySubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create chapter
      .addCase(createChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChapter.fulfilled, (state, action) => {
        state.loading = false;
        const newChapter = action.payload;
        state.list.push(newChapter);
        
        // Update the bySubject list if it exists
        if (newChapter.subjectId && state.bySubject[newChapter.subjectId]) {
          state.bySubject[newChapter.subjectId].push(newChapter);
        }
      })
      .addCase(createChapter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update chapter
      .addCase(updateChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChapter.fulfilled, (state, action) => {
        state.loading = false;
        const updatedChapter = action.payload;
        
        // Update in main list
        const index = state.list.findIndex(chapter => chapter.id === updatedChapter.id);
        if (index !== -1) {
          state.list[index] = updatedChapter;
        }
        
        // Update in bySubject list
        if (updatedChapter.subjectId && state.bySubject[updatedChapter.subjectId]) {
          const subjectIndex = state.bySubject[updatedChapter.subjectId]
            .findIndex(chapter => chapter.id === updatedChapter.id);
            
          if (subjectIndex !== -1) {
            state.bySubject[updatedChapter.subjectId][subjectIndex] = updatedChapter;
          }
        }
      })
      .addCase(updateChapter.rejected, (state, action) => {
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
        const chapterId = action.payload;
        
        // Remove from main list
        state.list = state.list.filter(chapter => chapter.id !== chapterId);
        
        // Remove from bySubject lists
        Object.keys(state.bySubject).forEach(subjectId => {
          state.bySubject[subjectId] = state.bySubject[subjectId]
            .filter(chapter => chapter.id !== chapterId);
        });
      })
      .addCase(removeChapter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearChapterError, clearCurrentChapter } = chapterSlice.actions;
export default chapterSlice.reducer;