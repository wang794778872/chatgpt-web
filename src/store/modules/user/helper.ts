import { ss } from '@/utils/storage'
// import { useAuthStore } from '@/store'
import { fetchUserInit } from '@/api'
// import { defaultUserRedis } from 'service/src/utils/user_redis'
const LOCAL_NAME = 'userStorage'

export interface UserInfo {
  avatar: string
  name: string
  description: string
  id: string
  available_num: number
}

export interface UserState {
  userInfo: UserInfo
}

export function defaultSetting(): UserState {
  console.log("defaultSetting")
//   const user_id: string = defaultUserRedis()
//   const authStore = useAuthStore()
//   authStore.setToken(user_id)
  const user_id = "aaa"
  console.log(fetchUserInit())
  console.log("defaultSetting user_id", user_id)
  return {
    userInfo: {
      avatar: 'https://raw.githubusercontent.com/Chanzhaoyu/chatgpt-web/main/src/assets/avatar.jpg',
      name: 'benhu',
      description: 'Star on <a href="https://github.com/wang794778872/chatgpt-bot" class="text-blue-500" target="_blank" >Github</a>',
      id: user_id,
      available_num: 3, // 新用户默认50条
    },
  }
}

export function getLocalState(): UserState {
  const localSetting: UserState | undefined = ss.get(LOCAL_NAME)
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalState(setting: UserState): void {
//   console.log(setting)
  ss.set(LOCAL_NAME, setting)
}
