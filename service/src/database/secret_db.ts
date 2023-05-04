import { createDB, resetDB, setDB, getDB } from './myCouchdb'

const secretDb = createDB('secret')

//secret
async function verifySecretDB(secret_key: string) {
    const result = await getDB(secretDb, secret_key)
    global.console.log(JSON.stringify(result))
    if (result)
    {
        if (result.avail_count <= 0) {   //密钥次数已使用完
            global.console.log("密钥次数已使用完", secret_key)
            return -1
        }
        else {
            global.console.log("密钥次数", secret_key)
            result.avail_count--
            // Object.assign(result, { avail_count: avail_count })
            resetDB(secretDb, result)
            return result.avail_num
        }
    } 
    else{
        global.console.log("密钥无效", secret_key)
        return -1
    }
}

export { verifySecretDB }