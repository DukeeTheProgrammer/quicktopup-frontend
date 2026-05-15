import client from './client';

export const getWallet = () => client.get('/wallet/');
export const fundWallet = (data) => client.post('/wallet/fund/', data);
export const getWalletLedger = (params) => client.get('/wallet/ledger/', { params });
