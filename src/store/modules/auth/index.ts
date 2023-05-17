import { defineStore } from 'pinia'
import { getToken, removeToken, setToken } from './helper'
import { store } from '@/store'
import { getIPAddress, fetchSession } from '@/api'

interface SessionResponse {
  auth: boolean
  model: 'ChatGPTAPI' | 'ChatGPTUnofficialProxyAPI'
  ext_available_num: number
}

export interface AuthState {
  token: string | undefined
  session: SessionResponse | null
  address: string| null
}

export const useAuthStore = defineStore('auth-store', {
  state: (): AuthState => ({
    token: getToken(),
    session: null,
    address: "0.0.0.0",
  }),

  getters: {
    isChatGPTAPI(state): boolean {
      return state.session?.model === 'ChatGPTAPI'
    },
  },

  actions: {
    async getSession(id: string) {
        for (let i = 0; i < 10; i++) {
            try {
                this.address = await getIPAddress()
                console.log( this.address)
                break
            }
            catch (error) {
                console.log(error)
            }
        }
      try {
        const { data } = await fetchSession<SessionResponse>(id, this.address)
        this.session = { ...data }
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
    },

    setToken(token: string) {
      this.token = token
      setToken(token)
    },

    removeToken() {
      this.token = undefined
      removeToken()
    },
  },
})

export function useAuthStoreWithout() {
  return useAuthStore(store)
}
