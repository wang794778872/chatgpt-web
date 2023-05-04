import { createDB, getDB, resetDB } from './myCouchdb'

const apikeydb = createDB('service-env')
// global.console.log("apikeydb", apikeydb)
let USE_OPENAI_API_KEY: string = null
//secret
async function get_openai_apikey(change: boolean): string {
    global.console.log("get_openai_apikey")
    if (!USE_OPENAI_API_KEY) {
        const result = await getDB(apikeydb, 'OPENAI_APIKEY_POOL')
        global.console.log(result)
        if (result){
            global.console.log("openai_env_init success use:", result.use)
            USE_OPENAI_API_KEY=result.use
            return result.use
        } 
        else{
            global.console.log("openai_env_init failed")
        }
    }
    else if (change) {
        const result = await getDB(apikeydb, 'OPENAI_APIKEY_POOL')
        global.console.log(result)
        if (result) {
            // global.console.log("openai_env_init success result", result)
            if (result.new.length > 0) {
                result.fail.push(USE_OPENAI_API_KEY)
                USE_OPENAI_API_KEY=result.new.shift()
                result.use=USE_OPENAI_API_KEY
                await resetDB(apikeydb, result)
                global.console.log("openai_env_init success new", USE_OPENAI_API_KEY)
                return USE_OPENAI_API_KEY
            }
        } 
        else{
            global.console.log("openai_env_init failed")
        }
    }
    else {
        // global.console.log("openai_env_init first", USE_OPENAI_API_KEY)
        return USE_OPENAI_API_KEY
    }
    return USE_OPENAI_API_KEY
}

export { get_openai_apikey }