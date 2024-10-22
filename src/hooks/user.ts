import { User } from '@/types/User'
import { create } from 'zustand'

type Store = {
  user: User | null
  setUser: (user : User | null) => void
}

const useUser = create<Store>()((set) => ({
  user: null,
  setUser: (user : User | null) => set((state) => ({ user })),
}))



export default useUser