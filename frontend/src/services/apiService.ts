import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - redirect to login
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private getAccessToken(): string | null {
    // For demo/PoC - use simple auth from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      // Return mock token (in production, get real token from backend)
      // Use proper UTF-8 encoding for btoa to handle special characters like ü in "Müller"
      const utf8Bytes = new TextEncoder().encode(user);
      const base64 = btoa(String.fromCharCode(...utf8Bytes));
      return 'demo-token-' + base64;
    }
    return null;
  }

  // Generic methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.api.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.post<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.patch<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.api.delete<T>(url);
    return response.data;
  }

  // File upload
  async uploadFiles(url: string, formData: FormData): Promise<any> {
    const response = await this.api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export default new ApiService();
