import api from './axios';

export const financeApi = {
  getLedger: () =>
    api.get('/finance/ledger'),

  getLedgerByType: (type) =>
    api.get(`/finance/ledger/${type}`),

  getSummary: () =>
    api.get('/finance/summary'),

  // budgets
  getBudgets: () =>
    api.get('/finance/budgets'),

  getBudgetsByModule: (module) =>
    api.get(`/finance/budgets/module/${module}`),

  getBudgetStatus: (module) =>
    api.get(`/finance/budgets/status/${module}`),

  createBudget: (data) =>
    api.post('/finance/budgets', data),

  // projections
  calculateProjection: (basisMonths = 3) =>
    api.post(`/finance/projections/calculate?basisMonths=${basisMonths}`),

  getProjections: () =>
    api.get('/finance/projections'),

  updateActual: (id, amount) =>
    api.patch(`/finance/projections/${id}/actual?amount=${amount}`),
};