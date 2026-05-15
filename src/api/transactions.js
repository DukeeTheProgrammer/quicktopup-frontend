import client from './client';

export const purchaseAirtime = (data) => client.post('/transactions/airtime/', data);
export const purchaseData = (data) => client.post('/transactions/data/', data);
export const initiatePayment = (data) => client.post('/transactions/initiate-payment/', data);
export const getTransactions = (params) => client.get('/transactions/', { params });
