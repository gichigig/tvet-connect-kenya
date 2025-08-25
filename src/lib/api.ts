/**
 * API utility functions for tvet-connect-kenya app
 * Ensures proper app identification and grade access restrictions
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const API_KEY = import.meta.env.VITE_API_KEY;

/**
 * Get default headers for API requests including app identification
 */
const getDefaultHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY || '',
    'X-App-Name': 'tvet-connect-kenya', // This identifies the app for backend restrictions
    'User-Agent': 'tvet-connect-kenya-app/1.0',
  };
};

/**
 * Enhanced fetch function with app identification
 */
export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = getDefaultHeaders();
  const mergedHeaders = {
    ...defaultHeaders,
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers: mergedHeaders,
  });
};

/**
 * API helper functions
 */
export const api = {
  get: (endpoint: string, options?: RequestInit) => 
    apiFetch(endpoint, { method: 'GET', ...options }),
    
  post: (endpoint: string, data?: any, options?: RequestInit) => 
    apiFetch(endpoint, { 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined,
      ...options 
    }),
    
  put: (endpoint: string, data?: any, options?: RequestInit) => 
    apiFetch(endpoint, { 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined,
      ...options 
    }),
    
  delete: (endpoint: string, options?: RequestInit) => 
    apiFetch(endpoint, { method: 'DELETE', ...options }),
};

/**
 * Grade-related API functions (these will be blocked by backend)
 * These functions will return appropriate error messages
 */
export const gradesApi = {
  getStudentGrades: async (studentId: string) => {
    throw new Error('Grades are not accessible through tvet-connect-kenya app. Please use grade-vault-tvet app.');
  },
  
  getUnitGrades: async (unitId: string) => {
    throw new Error('Grades are not accessible through tvet-connect-kenya app. Please use grade-vault-tvet app.');
  },
  
  getTranscript: async (studentId: string) => {
    throw new Error('Grades are not accessible through tvet-connect-kenya app. Please use grade-vault-tvet app.');
  }
};

export { API_BASE_URL, API_KEY };
