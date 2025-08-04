import axios from "axios";
import { fromResponse } from "./errors";

const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

async function convertErrorToInstance(error: any) {
  if (!error && error.response) return error;
  return fromResponse(error.response.data);
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const instance = convertErrorToInstance(error);
    return instance;
  }
);

export default axiosInstance;