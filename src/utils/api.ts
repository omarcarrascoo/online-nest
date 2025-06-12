import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://localhost:1311';

// Create an axios instance for common config (baseURL, timeouts, interceptors, etc.)
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000, // 10 seconds
});

interface FetchParams {
  [key: string]: string | number;
}

async function fetchReports(endpoint: string, params: FetchParams = {}) {
  try {
    // axios automatically serializes `params` into the query string
    const response = await apiClient.get(`/reports/${endpoint}`, { params });
    return response.data;
  } catch (error: any) {
    // Log the full error to the console for diagnostics
    console.error(`[fetchReports] Error fetching "${endpoint}"`, error);
    // Optionally, wrap or re-throw a cleaner Error
    throw new Error(
      `Error fetching "${endpoint}": ${error.response?.status} ${error.message}`
    );
  }
}

// Exported helpers remain the same shape
export const getMonthlyBalance = (month: number, year: number) =>
  fetchReports('monthly-balance', { month, year });

export const getIncomeExpense = (start: string, end: string) =>
  fetchReports('income-expense', { start, end });

export const getDelinquency = () => fetchReports('delinquency');

export const getCollection = (start: string, end: string) =>
  fetchReports('collection', { start, end });

export const getBudgetVsActual = (year: number) =>
  fetchReports('budget-vs-actual', { year });

export const getAnnualSummary = (year: number) =>
  fetchReports('annual-summary', { year });

export const getBankReconciliation = () =>
  fetchReports('bank-reconciliation');

export const getReserveFund = () =>
  fetchReports('reserve-fund');

export const getProviderExpenses = (start: string, end: string) =>
  fetchReports('provider-expenses', { start, end });

export const getExtraExpenses = (start: string, end: string) =>
  fetchReports('extra-expenses', { start, end });
