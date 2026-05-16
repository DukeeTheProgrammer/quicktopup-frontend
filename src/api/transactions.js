import client from './client';

export const purchaseAirtime = (data) => client.post('/transactions/airtime/', data);
export const purchaseData = (data) => client.post('/transactions/data/', data);
export const purchaseCable = (data) => client.post('/transactions/cable/', data);
export const purchaseElectricity = (data) => client.post('/transactions/electricity/', data);
export const initiatePayment = (data) => client.post('/transactions/initiate-payment/', data);
export const getTransactions = (params) => client.get('/transactions/', { params });
