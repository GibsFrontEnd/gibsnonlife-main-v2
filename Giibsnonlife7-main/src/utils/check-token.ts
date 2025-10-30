import { jwtDecode } from "jwt-decode";
import { setTokenExpired } from "../features/reducers/authReducers/authSlice";
import { store } from "../features/store";
import { decryptData } from "./encrypt-utils";

export const checkToken = () => {
  const encryptedToken = localStorage.getItem("token");
  if (!encryptedToken) {
    store.dispatch(setTokenExpired(true));
    return;
  }

  try {
    const token = decryptData(encryptedToken)
    const decodedToken = jwtDecode(token);
    const expirationTime = decodedToken.exp ? decodedToken.exp * 1000 : 0;

    store.dispatch(setTokenExpired(Date.now() > expirationTime));
  } catch (error) {
    console.error(error);
    store.dispatch(setTokenExpired(true));
  }
};
