import axios from "axios";
import moment from "moment";

const API_BASE_URL = "http://192.168.100.21:8080/api";

export const getMachineByCode = async (code: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/machines/${code}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const msg = error.response?.data || "Machine not found.";
      throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
    throw new Error("Network or unknown error.");
  }
};

export const getTransactionsByDateRange = async (from: Date, to: Date) => {
  try {
    const fromDate = moment(from).format("YYYY-MM-DD");
    const toDate = moment(to).format("YYYY-MM-DD");
    const response = await axios.get(
      `${API_BASE_URL}/transactions?from=${fromDate}&to=${toDate}`
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch transactions.");
  }
};