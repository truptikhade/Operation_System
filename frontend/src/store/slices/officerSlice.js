import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchOfficers = createAsyncThunk('officers/fetchAll', async (params = {}) => {
  const { data } = await api.get('/officers', { params });
  return data.data;
});

export const fetchOfficerStats = createAsyncThunk('officers/stats', async () => {
  const { data } = await api.get('/officers/stats/summary');
  return data.data;
});

export const createOfficer = createAsyncThunk('officers/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/officers', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const officerSlice = createSlice({
  name: 'officers',
  initialState: { list: [], stats: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOfficers.pending, (state) => { state.loading = true; })
      .addCase(fetchOfficers.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchOfficerStats.fulfilled, (state, action) => { state.stats = action.payload; })
      .addCase(createOfficer.fulfilled, (state, action) => { state.list.push(action.payload); });
  },
});

export default officerSlice.reducer;
