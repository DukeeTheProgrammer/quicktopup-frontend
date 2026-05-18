import client from './client';

export const getWallet = () => client.get('/wallet/');
export const fundWallet = (data) => client.post('/wallet/fund/', data);
export const fundWalletCallback = (params) => client.get('/wallet/fund/callback/', { params });
export const getWalletLedger = (params) => client.get('/wallet/ledger/', { params });
// NEW: poll funding status by reference (3.a in API docs)
export const getFundingStatus = (reference) => client.get(`/wallet/funding/${reference}/`);
