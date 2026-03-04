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

export async function getUserSession() {
  try {
    const api = await axiosServer();
    const res = await api.get("/auth/session");
    console.log("session", res.data);
    return res.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}
