import axios from "axios";
import { SERVER_URL } from "./constants";
import { setShowAuthError } from "../features/reducers/authReducers/authSlice";
import { store }  from "../features/store";
import { decryptData } from "./encrypt-utils";

const apiCall = axios.create({
  baseURL: SERVER_URL,
  timeout: 60000,
});

apiCall.interceptors.request.use(
  (config) => {
    // const token = decryptData(localStorage.getItem("token"));
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    const encryptedToken = localStorage.getItem("token");
    const token = encryptedToken ? decryptData(encryptedToken) : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
