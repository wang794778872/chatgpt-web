import { enCrypto } from '../crypto'
// import { deCrypto, enCrypto } from '../crypto'
// import { useUserStore } from '@/store'
import { ss_local } from './local'
import { fetchGetDB, fetchSetDB, fetchDelDB } from '@/api'


interface StorageData<T = any> {
    data: T
    expire: number | null
}

interface SessionResponse {
    status: string
    message: string
    data: string
}

// const userStore = useUserStore()
var is_remote_flag=false
var CUR_MEMBER_ID=''
var chatStoreTmp: any = 0

const remote_db_name=['appSetting', 'chatStorage', 'promptStore', 'settingsStorage']
// const local_db_name=['SECRET_TOKEN', 'userStorage']

function is_remote(key: string) {
    // console.log()
    if (remote_db_name.includes(key) && is_remote_flag)
    {
        return true
    }
    else
        return false
}

function update_remote_handle(key:string, result: any) {
    if (result && result.status == "success" && result.data)
    {
        // console.log("update_remote_handle", key, result)
        if (result.status == "success"){
            const json = JSON.stringify(result.data);
            window.localStorage.setItem(key, json)
        }
        else {
            console.error(key, result.message)
        }
    }
}


function update_remote() {
    // console.log("update_remote")
    remote_db_name.forEach(function(key){
        // console.log("update_remote", key)
        fetchGetDB<SessionResponse>(key, CUR_MEMBER_ID).then(result=>{
            update_remote_handle(key, result)
        })
        .catch (error => {
            update_remote_handle(key, error)
        })
    })
} 


function reflash_remote_flag(key: string, data: any) {
    if (key == 'userStorage' && data && data.userInfo)
    {
        if (data.userInfo.is_login && data.userInfo.member_id)
        {
            if (is_remote_flag == false){
                update_remote()
            }
            CUR_MEMBER_ID=data.userInfo.member_id
            is_remote_flag=true
            
        }
        else
        {
            CUR_MEMBER_ID=''
            is_remote_flag=false
        }
    }
}

function timeouthandle() {
    if (chatStoreTmp && is_remote('chatStorage')){
        fetchSetDB<SessionResponse>('chatStorage', CUR_MEMBER_ID, chatStoreTmp).catch(error => {
            console.log("fetchSetDB", error.message)
        })
        chatStoreTmp=null
    }
}

setInterval(timeouthandle, 5000);    //每5s执行一次发送

export function createRemoteStorage() {
    const expire = 60 * 60 * 24 * 7
    const crypto = false

    const user_info=ss_local.get('userStorage')
    if (user_info && user_info.userInfo && user_info.userInfo.is_login && user_info.userInfo.member_id)
    {
        CUR_MEMBER_ID=user_info.userInfo.member_id
        update_remote()
        // console.log("init", is_remote_flag)
        is_remote_flag=true
    }

  function set<T = any>(key: string, data: T) {
    // console.log(key, data)
    reflash_remote_flag(key, data)
    if (is_remote(key)){
        const storageData: StorageData<T> = {
            data,
            expire: expire !== null ? new Date().getTime() + expire * 1000 : null,
        }

        const json = crypto ? enCrypto(storageData) : JSON.stringify(storageData)
        if (key != 'chatStorage')    //对话记录5s上传一次，防止上传过于频繁影响性能
            {
            //set
            fetchSetDB<SessionResponse>(key, CUR_MEMBER_ID, json).catch(error => {
                console.log("fetchSetDB", error.message)
            })
        }
        else{
            chatStoreTmp=json
        }
    } 

    return ss_local.set(key, data)
}

  function get(key: string) {
    const data = ss_local.get(key)
    reflash_remote_flag(key, data)
    return data
  }

  function remove(key: string) {
    if (is_remote(key)){
        //remote
        fetchDelDB<SessionResponse>(key, CUR_MEMBER_ID).catch(error => {
            console.log("fetchDelDB", error.message)
        })
    } 

    return ss_local.remove(key)
  }

  function clear() {
    console.log("clear")
    return ss_local.clear()
  }

  return {
    set,
    get,
    remove,
    clear,
  }
}

export const ss = createRemoteStorage()
