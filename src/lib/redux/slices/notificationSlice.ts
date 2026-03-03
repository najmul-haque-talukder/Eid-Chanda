import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NotificationState {
    unreadCount: number;
    recentNotifications: any[];
}

const initialState: NotificationState = {
    unreadCount: 0,
    recentNotifications: [],
};

const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        setUnreadCount: (state, action: PayloadAction<number>) => {
            state.unreadCount = action.payload;
        },
        incrementUnreadCount: (state) => {
            state.unreadCount += 1;
        },
        setRecentNotifications: (state, action: PayloadAction<any[]>) => {
            state.recentNotifications = action.payload;
        },
        markAsRead: (state, action: PayloadAction<string>) => {
            const notification = state.recentNotifications.find(n => n.id === action.payload);
            if (notification && !notification.is_read) {
                notification.is_read = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markAllAsRead: (state) => {
            state.recentNotifications.forEach(n => n.is_read = true);
            state.unreadCount = 0;
        },
        deleteNotification: (state, action: PayloadAction<string>) => {
            const notification = state.recentNotifications.find(n => n.id === action.payload);
            if (notification && !notification.is_read) {
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
            state.recentNotifications = state.recentNotifications.filter(n => n.id !== action.payload);
        },
    },
});

export const {
    setUnreadCount,
    incrementUnreadCount,
    setRecentNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = notificationSlice.actions;
export default notificationSlice.reducer;
