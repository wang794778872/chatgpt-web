import { createDB, resetDB, setDB, getDB } from './myCouchdb'

const userDb = createDB('users')

interface sUserInfo {
    _id: string
    name: string
    ext_available_num: number
}

async function insertUserDB(user_info: sUserInfo) {
    resetDB(userDb, user_info)
}

async function setUserDB(user_id: string, info: any) {
    setDB(userDb, user_id, info)
}

async function getUserDB(user_id: string): any {
    return getDB(userDb, user_id)
}

function defaultUserDB(user_id: string) {
    global.console.log('defaultUserDB')
    const default_user = {
        _id: user_id,
        name: 'default',
        ext_available_num: 0,
    }
    insertUserDB(default_user)
}

export { setUserDB, getUserDB, defaultUserDB }