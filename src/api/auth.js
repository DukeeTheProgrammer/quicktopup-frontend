import client from './client';

export const register = (data) => client.post('/auth/register/', data);
export const login = (data) => client.post('/auth/login/', data);
export const googleAuth = (data) => client.post('/auth/google/', data);
export const logout = () => client.post('/auth/logout/');
export const getProfile = () => client.get('/auth/profile/');
export const updateProfile = (data) => client.patch('/auth/profile/', data);
export const passwordReset = (data) => client.post('/auth/password-reset/', data);
export const passwordResetConfirm = (data) => client.post('/auth/password-reset-confirm/', data);
export const setPin = (data) => client.post('/auth/set-pin/', data);
export const pinResetRequest = () => client.post('/auth/pin-reset-request/');
export const pinResetConfirm = (data) => client.post('/auth/pin-reset-confirm/', data);
export const phoneChangeRequest = (data) => client.post('/auth/phone-change-request/', data);
export const phoneChangeConfirm = (data) => client.post('/auth/phone-change-confirm/', data);
export const uploadAvatar = (data) => client.put('/auth/profile/', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
