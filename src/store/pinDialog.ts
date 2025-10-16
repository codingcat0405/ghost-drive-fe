import { create } from 'zustand'

export type PinDialogStore = {
  open: boolean,
  setOpen: (open: boolean) => void,
}

const usePinDialogStore = create<PinDialogStore>((set) => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
}))

export default usePinDialogStore;
