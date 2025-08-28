import axiosClient from "./axios-client";

const ghostDriveApi = {
  user: {
    login: (data: { username: string; password: string }) => {
      return axiosClient.post("/user/login", data);
    },
    register: (data: { username: string; password: string }) => {
      return axiosClient.post("/user/register", data);
    },
    getUserInfo: () => {
      return axiosClient.get("/user/me");
    },
  }
};

export default ghostDriveApi;