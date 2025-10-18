import { http } from '../api/http';

export const getActs = async (counterpartyId: string) => {
  // Backend: GET /api/invoices/v1/ с query параметрами для пагинации
  const { data } = await http.get(`/api/invoices/v1?counterpartyId=${counterpartyId}`);
  return data;
};

export const createAct = async (actData: any) => {
  // Backend: PUT /api/invoices/v1/{externalId} для создания/обновления
  const { data } = await http.put(`/api/invoices/v1/${actData.externalId}`, actData);
  return data;
};

export const getCounterparties = async () => {
  const { data } = await http.get('/api/counterparties/v1');
  return data;
};

export const getContracts = async (counterpartyId: string) => {
  const { data } = await http.get(`/api/contracts/v1?counterpartyId=${counterpartyId}`);
  return data;
};
