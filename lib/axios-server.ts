import axios from "axios";
import { cookies, headers } from "next/headers";

export async function axiosServer() {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const host = headerStore.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return axios.create({
    baseURL: `${protocol}://${host}${process.env.NEXT_PUBLIC_API_URL}`,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
  });
}
