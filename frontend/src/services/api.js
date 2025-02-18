import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

export async function simulateState(state) {
  const response = await axios.post(`${API_URL}/simulate`, state);
  return response.data;
}
