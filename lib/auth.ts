import { axiosServer } from "./axios-server";

export async function getCurrentUser() {
  try {
    const api = await axiosServer();
    const res = await api.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}
