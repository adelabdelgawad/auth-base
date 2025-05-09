// lib/axiosInstance.ts
import axios from 'axios';

/**
 * Creates an Axios instance configured with a base URL.
 *
 * @returns {axios.AxiosInstance} Configured Axios instance.
 */
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensure cookies are sent with requests
});

export default axiosInstance;