import client from './client';

export const getNetworks = () => client.get('/services/networks/');
export const getDataPlans = (network) => client.get('/services/data-plans/', { params: network ? { network } : {} });
export const getCablePlans = () => client.get('/services/cable-plans/');
export const getElectricityBillers = () => client.get('/services/electricity/');
