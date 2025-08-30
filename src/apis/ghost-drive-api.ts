import type { User } from "../store/user";
import axiosClient from "./axios-client";

const ghostDriveApi = {
  user: {
    login: (data: { username: string; password: string }): Promise<{ user: User, jwt: string }> => {
      return axiosClient.post("/users/login", data);
    },
    register: (data: { username: string; password: string }) => {
      return axiosClient.post("/users/register", data);
    },
    getUserInfo: (): Promise<User> => {
      return axiosClient.get("/users/me");
    },
  }
};

export default ghostDriveApi;