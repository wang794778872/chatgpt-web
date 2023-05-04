import { ss } from '@/utils/storage'
// import { deCrypto, enCrypto } from '@/utils/crypto'
// import { useAuthStore } from '@/store'
import { fetchUserInit, fetchUserInitShared } from '@/api'
const LOCAL_NAME = 'userStorage'

export interface UserInfo {
  avatar: string        //头像
  name: string          //名称
  description: string   //描述
  id: string            //游客id
  available_num: number //游客可对话次数
  shared_id: string     //被分享id
  is_new: boolean       //是否是新账号
  is_login: boolean     //是否登陆会员
  login_time: Number    //会员登陆时间，用于长时间不登陆时，重新登陆
  member_id : string    //会员id
}

export interface UserState {
  userInfo: UserInfo
}

export function defaultSetting(): UserState {
  return {
    userInfo: {
      avatar: 'https://raw.githubusercontent.com/Chanzhaoyu/chatgpt-web/main/src/assets/avatar.jpg',
      name: '游客',
      description: '',
      id: undefined,
      shared_id: undefined,
      available_num: 10, // 新用户默认10条
      is_new: true,
      is_login: false,
      login_time: 0,
      member_id : ''
    },
  }
}

export function getNewUserId(): string {
    const now: number = new Date().getTime()
    const rand_num=Math.floor(Math.random() * 100)
    // const user_id: string = enCrypto(`ZL-${now}`)
    const user_id: string = `ZL-${now}${rand_num}`
    fetchUserInit(user_id)
    console.log("getNewUserId user_id", `ZL-${now}`, user_id, rand_num)
    return user_id
}

export function verify_user_id(id: any) {
    if (id === null || id === undefined)
        return false
    return id.startsWith('ZL-')
}

export function setShare(Setting: UserState): UserState {
    // console.log("setShare", Setting.userInfo.id, Setting.userInfo.is_new)
    if (Setting.userInfo.is_new && Setting.userInfo.shared_id)    //新用户
    {
        // 新用户如果有分享码，支持分享逻辑
        // console.log("shared_id", Setting.userInfo.shared_id)
        fetchUserInitShared(Setting.userInfo.id, Setting.userInfo.shared_id)
        Setting.userInfo.is_new=false
    }
    // console.log("setShare222", Setting.userInfo.id, Setting.userInfo.is_new)
    return Setting
}

export function getLocalState(): UserState {
    const localSetting: UserState | undefined = ss.get(LOCAL_NAME)
    console.log("defaultSetting", defaultSetting())
    console.log("localSetting", localSetting)
    let SetUserInfo=defaultSetting().userInfo
    if (localSetting)
        SetUserInfo= { ...defaultSetting().userInfo, ...localSetting.userInfo }

    console.log("getLocalState", SetUserInfo)
    if (!SetUserInfo.id || !verify_user_id(SetUserInfo.id))
        SetUserInfo.id=getNewUserId()
    console.log("getLocalState", SetUserInfo)
    const Setting2=setShare({userInfo: SetUserInfo})
    console.log("getLocalState", Setting2)
    setLocalState(Setting2)
    console.log("getLocalState", Setting2)
    return Setting2
}

export function setLocalState(setting: UserState): void {
    // console.log('setLocalState', setting)
    const Setting2=setShare(setting)
    ss.set(LOCAL_NAME, Setting2)
}
