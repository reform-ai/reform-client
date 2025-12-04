/**
 * Token API endpoints
 */

import { API_URL } from './base';

export const tokenEndpoints = {
  TOKEN_BALANCE: `${API_URL}/api/tokens/balance`,
  TOKEN_TRANSACTIONS: `${API_URL}/api/tokens/transactions`,
  TOKEN_ACTIVATE: `${API_URL}/api/tokens/activate`,
};

