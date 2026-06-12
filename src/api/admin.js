import client from './client';

export const getAdminDashboard = () => client.get('/admin/dashboard/');
