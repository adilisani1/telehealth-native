import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import patientApi from '../../services/patientApi';
import doctorApi from '../../services/doctorApi';

// Async thunk to fetch notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (userType, { rejectWithValue }) => {
    try {
      let res;
      if (userType === 'doctor') {
        res = await doctorApi.getDoctorNotifications();
      } else {
        res = await patientApi.getNotifications();
      }
      return res.data.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

// Async thunk to mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async ({ notificationId, userType }, { rejectWithValue }) => {
    try {
      if (userType === 'doctor') {
        await doctorApi.markNotificationAsRead(notificationId);
      } else {
        await patientApi.markNotificationAsRead(notificationId);
      }
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

// Async thunk to mark all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (userType, { getState, rejectWithValue }) => {
    try {
      const { notifications } = getState().notifications;
      const unreadNotifications = notifications.filter(n => !n.read);
      
      // Mark all unread notifications as read
      const promises = unreadNotifications.map(notification => {
        if (userType === 'doctor') {
          return doctorApi.markNotificationAsRead(notification._id);
        } else {
          return patientApi.markNotificationAsRead(notification._id);
        }
      });
      
      await Promise.all(promises);
      return unreadNotifications.map(n => n._id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark single notification as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n._id === notificationId);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark all notifications as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state, action) => {
        const readNotificationIds = action.payload;
        state.notifications.forEach(notification => {
          if (readNotificationIds.includes(notification._id)) {
            notification.read = true;
          }
        });
        state.unreadCount = 0;
      });
  },
});

export const { clearNotifications, clearError } = notificationsSlice.actions;
export default notificationsSlice.reducer;
