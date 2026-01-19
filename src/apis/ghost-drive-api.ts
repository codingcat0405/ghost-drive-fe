import type { User } from "../store/user";
import axiosClient from "./axios-client";
export interface FolderContentItem {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  objectKey?: string;
  folderId?: number;
  size: number;
  mimeType?: string;
  userId: number;
  parentId?: number;

}

const ghostDriveApi = {
  user: {
    login: (data: { username: string; password: string }): Promise<{ user?: User, jwt?: string, requiresTwoFactor?: boolean }> => {
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
    },
    updateUserInfo: async (data: {
      avatar?: string;
      fullName?: string;
      email?: string;
    }): Promise<User> => {
      return await axiosClient.put("/users", data);
    },
    updatePassword: async (data: {
      oldPassword: string;
      newPassword: string;
    }): Promise<User> => {
      return await axiosClient.put("/users/update-password", data);
    },
    getQuotaReport: async (): Promise<{
      totalStorage: number;
      storageQuota: number;
      totalStorageImage: number;
      totalStorageVideo: number;
      totalStorageAudio: number;
      otherStorage: number;
    }> => {
      return await axiosClient.get("/users/report");
    }
  },
  file: {
    createFileEntry: async (data: {
      name: string,
      objectKey: string,
      folderId?: number,
      size: number,
      mimeType: string
    }) => {
      return await axiosClient.post("/files", data);
    },
    getFiles: async (params: {
      folderId?: number;
      page?: number;
      limit?: number;
    }): Promise<{
      contents: {
        id: number;
        createdAt: string;
        updatedAt: string;
        name: string;
        objectKey: string;
        folderId: number;
        size: number;
        mimeType: string;
        userId: number;
      }[],
      currentPage: number;
      perPage: number;
      totalPage: number;
      totalElements: number;
    }> => {
      return await axiosClient.get("/files", { params });
    },
    updateFileEntry: async (id: number, data: {
      name?: string;
      folderId?: number;
    }): Promise<void> => {
      return await axiosClient.put(`/files/${id}`, data);
    },
    deleteFileEntry: async (id: number) => {
      return await axiosClient.delete(`/files/${id}`)
    },
    searchFiles: async (params: {
      q: string;
      page?: number;
      limit?: number;
    }): Promise<{
      contents: FolderContentItem[];
      currentPage: number;
      perPage: number;
      totalPage: number;
      totalElements: number;
    }> => {
      return await axiosClient.get("/files/search", { params });
    }
  },
  upload: {
    getUploadUrl: (objectKey: string): Promise<{ uploadUrl: string }> => {
      return axiosClient.post(`/upload/upload-url`, { objectKey });
    },
    getDownloadUrl: (objectKey: string): Promise<{ downloadUrl: string }> => {
      return axiosClient.post(`/upload/download-url`, { objectKey });
    },
    getUploadMultipartUrl: (objectKey: string, totalChunks: number): Promise<{
      uploadId: string;
      fileId: string;
      objectName: string;
      partUrls: Array<{ partNumber: number; url: string }>;
    }> => {
      return axiosClient.post(`/upload/upload-multipart-url`, { objectKey, totalChunks });
    },
    completeUploadMultipart: (objectName: string, uploadId: string, parts: Array<{ PartNumber: number; ETag: string }>): Promise<void> => {
      return axiosClient.post(`/upload/complete-multipart-upload`, { objectKey: objectName, uploadId, parts });
    },
    commonUploadPresignedUrl: (objectKey: string): Promise<{
      presignedUrl: string;
      downloadUrl: string;
    }> => {
      return axiosClient.post(`/upload/common/upload-url`, { objectKey });
    },
  },
  folder: {
    getFolders: async (params: {
      parentId?: number;
      page?: number;
      limit?: number;
    }): Promise<{
      contents: {
        id: number;
        name: string;
        parentId: number;
        createdAt: string;
        updatedAt: string;
        userId: number;
        path: string;
      }[],
      currentPage: number;
      perPage: number;
      totalPage: number;
      totalElements: number;
    }> => {
      return await axiosClient.get("/folders", { params });
    },
    createFolder: async (data: {
      name: string;
      parentId?: number;
    }): Promise<void> => {
      return await axiosClient.post("/folders", data);
    },
    deleteFolder: async (id: number): Promise<void> => {
      return await axiosClient.delete(`/folders/${id}`);
    },
    updateFolder: async (id: number, data: {
      name?: string;
      parentId?: number;
    }): Promise<void> => {
      return await axiosClient.put(`/folders/${id}`, data);
    },
    contents: async (params: {
      folderId?: number;
      page?: number;
      limit?: number;
    }): Promise<{
      contents: FolderContentItem[];
      currentPage: number;
      perPage: number;
      totalPage: number;
      totalElements: number;
    }> => {
      return await axiosClient.get("/folders/contents", { params });
    },
    getParentTree: async (params: {
      folderId?: number;
    }): Promise<
      {
        id: number;
        name: string;
        parentId: number;
        userId: number;
        createdAt: string;
        updatedAt: string;
      }[]
    > => {
      return await axiosClient.get(`/folders/parent-tree`, { params });
    },
    getChildren: async (params: {
      folderId?: number;
    }): Promise<
      {
        id: number;
        name: string;
        parentId: number;
        userId: number;
        createdAt: string;
        updatedAt: string;
      }[]
    > => {
      return await axiosClient.get(`/folders/children`, { params });
    },
    getMoveDestinations: async (params: {
      sourceFolderId?: number;
      type: 'file' | 'folder';
    }): Promise<{
      name: string;
      id: number;
      path: string;
      parentId: number;
      createdAt: string;
      updatedAt: string;
      userId: number;
    }[]> => {
      return await axiosClient.get(`/folders/move-destinations`, { params });
    },
  },
  twoFactor: {
    setup: (): Promise<{
      secret: string;
      qrcode: string;
    }> => {
      return axiosClient.post("users/2fa/setup");
    },
    enable: (token: string): Promise<boolean> => {
      return axiosClient.post("/users/2fa/enable", { token });
    },
    disable: (): Promise<boolean> => {
      return axiosClient.post("/users/2fa/disable");
    },
    verify: (data: { token: string; username: string }): Promise<{
      jwt: string;
      user: User;
      requiresTwoFactor: boolean;
    }> => {
      return axiosClient.post("/users/2fa/verify", data);
    },
    status: (): Promise<{
      enabled: boolean;
      hasSecret: boolean;
    }> => {
      return axiosClient.get("/users/2fa/status");
    },
  },
  vault: {
    create: async (data: {
      title: string;
      username?: string;
      password: string;
      category: number;
    }) => {
      return await axiosClient.post("/vaults", data);
    },
    list: async (params: {
      q?: string;
      category?: number;
      page?: number;
      limit?: number;
    }): Promise<{
      contents: {
        id: number;
        title: string;
        userId: number;
        username?: string;
        category: number;
        password: string;
        createdAt: string;
        updatedAt: string;
      }[]
      currentPage: number;
      perPage: number;
      totalPage: number;
      totalElements: number;
    }> => {
      return await axiosClient.get("/vaults", { params });
    },
    update: async (id: number, data: {
      title?: string;
      username?: string;
      category?: number;
      password?: string;
    }) => {
      return await axiosClient.put(`/vaults/${id}`, data);
    },
    delete: async (id: number) => {
      return await axiosClient.delete(`/vaults/${id}`);
    },
    detail: async (id: number): Promise<{
      id: number;
      title: string;
      userId: number;
      username?: string;
      category: number;
      password: string;
      createdAt: string;
      updatedAt: string;
    }> => {
      return await axiosClient.get(`/vaults/${id}`);
    },
  }
};

export default ghostDriveApi;