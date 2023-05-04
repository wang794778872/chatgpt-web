import type { AxiosProgressEvent, GenericAbortSignal } from 'axios'
import { post } from '@/utils/request'
import { useSettingStore, useUserStore } from '@/store'

// export function fetchChatAPI<T = any>(
//   prompt: string,
//   options?: { conversationId?: string; parentMessageId?: string },
//   signal?: GenericAbortSignal,
// ) {
//   return post<T>({
//     url: '/chat',
//     data: { prompt, options },
//     signal,
//   })
// }

export function fetchChatConfig<T = any>() {
  return post<T>({
    url: '/config',
  })
}

//chatgpt消息发送协议
export function fetchChatAPIProcess<T = any>(
  params: {
    model:string
    prompt: string
    options?: { conversationId?: string; parentMessageId?: string }
    signal?: GenericAbortSignal
    onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void }
) {
  const settingStore = useSettingStore()
  const userStore = useUserStore()
  console.log(params.model)
  const member_id=userStore.userInfo.is_login?userStore.userInfo.member_id:null
  return post<T>({
    url: '/chat-process',
    data: { prompt: params.prompt, options: params.options, systemMessage: settingStore.systemMessage, username: member_id, model: params.model},
    signal: params.signal,
    onDownloadProgress: params.onDownloadProgress,
  })
}


export function fetchSession<T>(id: string) {
    // console.log("fetchSession")
    return post<T>({
    url: '/session',
    data: { id },
  })
}

export function fetchVerify<T>(token: string) {
  return post<T>({
    url: '/verify',
    data: { token },
  })
}

export function fetchUserInit<T>(id: string) {
    return post<T>({
      url: '/user_init',
      data: { id },
    })
}

export function fetchUserInitShared<T>(id: string, shared_id: string) {
    return post<T>({
      url: '/user_init_shared',
      data: { id,  shared_id},
    })
}

export function fetchUserRegisterWithCode<T>(username: string, password: string, code: string) {
    return post<T>({
      url: '/user_register_code',
      data: { username,  password, code },
    })
}


export function fetchUserLogin<T>(username: string, password: string) {
    return post<T>({
      url: '/user_login',
      data: { username,  password },
    })
}

export function fetchMemberInfo<T>(username: string) {
    return post<T>({
      url: '/member_info',
      data: { username },
    })
}


export function fetchCodeActive<T>(username: string, code: string) {
    return post<T>({
      url: '/code_active',
      data: { username, code },
    })
}