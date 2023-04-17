import { ss } from '@/utils/storage'
import { deCrypto, enCrypto } from '@/utils/crypto'
// import { useAuthStore } from '@/store'
import { fetchUserInit } from '@/api'
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
  return {
    userInfo: {
      avatar: 'https://raw.githubusercontent.com/Chanzhaoyu/chatgpt-web/main/src/assets/avatar.jpg',
      name: 'benhu',
      description: 'Star on <a href="https://github.com/wang794778872/chatgpt-bot" class="text-blue-500" target="_blank" >Github</a>',
      id: undefined,
      available_num: 50, // 新用户默认50条
    },
  }
}

export function getNewUserId(): string {
    const now: number = new Date().getTime()
    const user_id: string = enCrypto(`BH_${now}`)
    fetchUserInit(user_id)
    // console.log("getNewUserId user_id", `BH_${now}`, user_id)
    return user_id
}

export function verify_user_id(id: any) {
    const dec_id: string = deCrypto(id)
    if (dec_id === null || dec_id === undefined)
        return false
    return dec_id.startsWith('BH_')
}

export function getLocalState(): UserState {
    const localSetting: UserState | undefined = ss.get(LOCAL_NAME)
    // console.log("localSetting", localSetting)
    const Setting= { ...defaultSetting(), ...localSetting }
    if (!Setting.userInfo.id)
    {
        Setting.userInfo.id=getNewUserId()
    }
    setLocalState(Setting)
    // console.log("getLocalState", Setting)
    return Setting
}

export function setLocalState(setting: UserState): void {
//   console.log(setting)
    ss.set(LOCAL_NAME, setting)
}
