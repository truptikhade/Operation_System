import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchOperations = createAsyncThunk('operations/fetchAll', async (params = {}) => {
  const { data } = await api.get('/operations', { params });
  return data;
});

export const fetchOperation = createAsyncThunk('operations/fetchOne', async (id) => {
  const { data } = await api.get(`/operations/${id}`);
  return data.data;
});

export const createOperation = createAsyncThunk('operations/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/operations', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateOperationStatus = createAsyncThunk('operations/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/operations/${id}/status`, { status });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const assignOfficers = createAsyncThunk('operations/assign',
  async ({ id, officer_ids, shift }) => {
    const { data } = await api.post(`/operations/${id}/assign`, { officer_ids, shift });
    return data;
  }
);

const operationSlice = createSlice({
  name: 'operations',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
    pagination: {},
  },
  reducers: {
    clearCurrent(state) { state.current = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOperations.pending, (state) => { state.loading = true; })
      .addCase(fetchOperations.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOperations.rejected, (state, action) => {
        state.loading = false; state.error = action.error.message;
      })
      .addCase(fetchOperation.fulfilled, (state, action) => { state.current = action.payload; })
      .addCase(createOperation.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateOperationStatus.fulfilled, (state, action) => {
        const idx = state.list.findIndex(op => op.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
        if (state.current?.id === action.payload.id) state.current = action.payload;
      });
  },
});

export const { clearCurrent } = operationSlice.actions;
export default operationSlice.reducer;
