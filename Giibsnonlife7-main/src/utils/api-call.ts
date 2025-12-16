import axios from "axios";
import { SERVER_URL } from "./constants";
import { setShowAuthError } from "../features/reducers/authReducers/authSlice";
import { store }  from "../features/store";
import { decryptData } from "./encrypt-utils";

const apiCall = axios.create({
  baseURL: SERVER_URL,
  timeout: 60000,
  withCredentials: true,
});

apiCall.interceptors.request.use(
  (config) => {
    console.log('🔍 [API Interceptor Debug] Starting request...');
    console.log('Request URL:', config.url);
    const encryptedToken = localStorage.getItem("token");
    console.log('Encrypted token from localStorage:', encryptedToken ? 'EXISTS' : 'MISSING');


    const token = encryptedToken ? decryptData(encryptedToken) : null;
    console.log('Decrypted token result:', token ? 'SUCCESS' : 'FAILED/EMPTY');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
            console.log('✅ Authorization header SET for:', config.url);
    } else {
       console.log('❌ NO Authorization header set. Token missing or decryption failed.');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiCall.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      store.dispatch(setShowAuthError(true));
    }
    return Promise.reject(error);
  }
);

export default apiCall;
