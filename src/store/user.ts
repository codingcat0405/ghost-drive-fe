import { create } from 'zustand'

export type UserStore = {
  user: User,
  setUser: (user: User) => void,
  clearUser: () => void,
}

export type User = {
  id: number,
  username: string,
  avatar?: string,
  role: string,
  bucketName:string,
  aesKeyEncrypted: string,
}

const defaultUser: User = {
  id: 0,
  username: '',
  avatar: '',
  role: 'user',
  bucketName: '',
  aesKeyEncrypted: ''
}
const useUserStore = create<UserStore>((set) => ({
  user: defaultUser,
  setUser: (user: User) => set({ user }),
  clearUser: () => set({ user: defaultUser }),
}))

export default useUserStore;