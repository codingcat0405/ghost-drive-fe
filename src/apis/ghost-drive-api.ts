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
    updateAesKeyEncrypted: (aesKeyEncrypted: string): Promise<{
      id: number;
      username: string;
      role: string;
      bucketName: string;
      aesKeyEncrypted: string;
      avatar: string;
    }> => {
      return axiosClient.post("/users/update-aes-key-encrypted", { aesKeyEncrypted });
    },
    getUserInfo: (): Promise<User> => {
      return axiosClient.get("/users/me");
    }
  },
  file: {
    getUploadUrl: (objectKey: string): Promise<{ uploadUrl: string }> => {
      return axiosClient.post(`/files/upload-url`, { objectKey });
    },
    getDownloadUrl: (objectKey: string): Promise<{ downloadUrl: string }> => {
      return axiosClient.post(`/files/download-url`, { objectKey });
    },
    getUploadMultipartUrl: (objectKey: string, totalChunks: number): Promise<{
      uploadId: string;
      fileId: string;
      objectName: string;
      partUrls: Array<{ partNumber: number; url: string }>;
    }> => {
      return axiosClient.post(`/files/upload-multipart-url`, { objectKey, totalChunks });
    },
    completeUploadMultipart: (objectName: string, uploadId: string, parts: Array<{ PartNumber: number; ETag: string }>): Promise<void> => {
      return axiosClient.post(`/files/complete-multipart-upload`, { objectKey: objectName, uploadId, parts });
    },
  }
};

export default ghostDriveApi;