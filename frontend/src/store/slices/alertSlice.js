// alertSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchAlerts = createAsyncThunk('alerts/fetchAll', async (params = {}) => {
  const { data } = await api.get('/alerts', { params });
  return data.data;
});

export const raiseAlert = createAsyncThunk('alerts/raise', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/alerts', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const resolveAlert = createAsyncThunk('alerts/resolve', async (id) => {
  const { data } = await api.patch(`/alerts/${id}/resolve`);
  return data.data;
});

const alertSlice = createSlice({
  name: 'alerts',
  initialState: { list: [], loading: false, error: null },
  reducers: {
    addRealtimeAlert(state, action) { state.list.unshift(action.payload); },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => { state.loading = true; })
      .addCase(fetchAlerts.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(raiseAlert.fulfilled, (state, action) => { state.list.unshift(action.payload); })
      .addCase(resolveAlert.fulfilled, (state, action) => {
        const idx = state.list.findIndex(a => a.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      });
  },
});

export const { addRealtimeAlert } = alertSlice.actions;
export default alertSlice.reducer;
