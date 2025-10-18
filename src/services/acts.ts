import { http } from '../api/http';

export const getActs = async (counterpartyId: string) => {
  const { data } = await http.get(`/api/acts?counterpartyId=${counterpartyId}`);
  return data;
};

export const createAct = async (actData: any) => {
  const { data } = await http.post('/api/acts', actData);
  return data;
};

export const getCounterparties = async () => {
  const { data } = await http.get('/api/counterparties');
  return data;
};

export const getContracts = async (counterpartyId: string) => {
  const { data } = await http.get(`/api/contracts?counterpartyId=${counterpartyId}`);
  return data;
};
