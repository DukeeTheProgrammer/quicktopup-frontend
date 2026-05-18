import client from './client';

export const getNotifications = (params) => client.get('/notifications/', { params });
// API uses POST (not PATCH) to mark a notification as read
export const markNotificationRead = (id) => client.post(`/notifications/${id}/`);
export const getNotification = (id) => client.get(`/notifications/${id}/`);
