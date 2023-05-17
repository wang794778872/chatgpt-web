import { createDB, resetDB, setDB, getDB } from './myCouchdb'

const memberSecretDb = createDB('members-secret')

async function user_register_code_verify(code: string) {
    global.console.log("user_register_code_verify", code)
    const results = await getDB(memberSecretDb, code)
    global.console.log("user_register_verify", results)
    if (results && results.avail_count > 0){
        if  (results.type == 0 && results.duration > 0) {   //时长卡
            return { status: true, message: "激活码可用", results:results }
        }
        else if (results.type == 1 && results.avail_num > 0) {  //额度卡
            return { status: true, message: "激活码可用", results:results }
        }
        else if (results.type == 2) {
            return { status: true, message: "激活码可用", results:results }
        }
    }
    else {
        global.console.log("激活码无效")
        return { status: false, message: "激活码无效", results:results }
    }
}

async function user_code_reduce(username: string, results: any) {
    global.console.log("user_code_reduce")
    results.avail_count--
    const addres={ user: username }
    // Object.assign(result, { avail_count: avail_count })
    resetDB(memberSecretDb, { ...results, ...addres })
}

export { user_register_code_verify, user_code_reduce }