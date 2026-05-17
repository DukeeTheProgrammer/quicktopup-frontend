import client from './client';

export const getNetworks = () => client.get('/services/networks/');
export const getDataPlans = (network) => client.get('/services/data-plans/', { params: network ? { network } : {} });
export const getCablePlans = (provider) => client.get('/services/cable-plans/', { params: provider ? { provider: provider.toLowerCase() } : {} });
export const getElectricityBillers = () => client.get('/services/electricity/');
