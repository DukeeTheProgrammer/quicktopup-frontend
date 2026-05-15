import client from './client';

export const getNotifications = (params) => client.get('/notifications/', { params });
export const markNotificationRead = (id) => client.patch(`/notifications/${id}/`, { status: 'read' });
