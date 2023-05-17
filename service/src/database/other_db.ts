import { createDB, getDB, updateDB, deleteDB } from './myCouchdb'

const other_db={
    appSetting: createDB('app-setting'),
    chatStorage: createDB('chat-storage'),
    promptStore: createDB('prompt-store'),
    settingsStorage: createDB('settings-storage'),
    // SECRET_TOKEN: createDB('SECRET_TOKEN')
    // userStorage: createDB('user-storage')
}

async function get_web_db(db_name:string, id: string) {
    const db_cli=other_db[db_name]
    const result = await getDB(db_cli, id)
    global.console.log(db_name, result)
    if (result){
        return { status: true, message: "获取成功", db_name, data: result }
    } 
    return { status: false, message: "获取失败", data: null }
}

async function set_web_db(db_name:string, id: string, data:any) {
    global.console.log(db_name, id)
    const db_cli=other_db[db_name]
    // global.console.log(db_cli)
    await updateDB(db_cli, id, data)
    global.console.log("set_web_db  成功")
    return { status: true, message: "设置成功", data: null } 
}


async function del_web_db(db_name:string, id: string,) {
    const db_cli=other_db[db_name]
    await deleteDB(db_cli, id)

    return { status: true, message: "删除成功", data: null } 
}

export { get_web_db, set_web_db, del_web_db }