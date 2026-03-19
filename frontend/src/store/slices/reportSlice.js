import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchReports = createAsyncThunk('reports/fetchAll', async () => {
  const { data } = await api.get('/reports');
  return data.data;
});

export const submitReport = createAsyncThunk('reports/submit', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/reports', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const reportSlice = createSlice({
  name: 'reports',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => { state.loading = true; })
      .addCase(fetchReports.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(submitReport.fulfilled, (state, action) => { state.list.unshift(action.payload); });
  },
});

export default reportSlice.reducer;
