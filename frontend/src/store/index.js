import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import operationReducer from './slices/operationSlice';
import officerReducer from './slices/officerSlice';
import alertReducer from './slices/alertSlice';
import reportReducer from './slices/reportSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    operations: operationReducer,
    officers: officerReducer,
    alerts: alertReducer,
    reports: reportReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
