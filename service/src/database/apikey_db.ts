import { createDB, getDB, resetDB, setDB } from './myCouchdb'

const apikeydb = createDB('service-env')
// global.console.log("apikeydb", apikeydb)
let USE_OPENAI_API_KEY: string = null
let USE_OPENAI_API_4_KEY: string = null

//secret
async function get_openai_apikey4(change: boolean): string {
	global.console.log("get_openai_apikey4")
	let db_key = "OPENAI_APIKEY_4_POOL"
	if (!USE_OPENAI_API_4_KEY) {
		const result = await getDB(apikeydb, db_key)
		global.console.log(result)
		if (result) {
			global.console.log("openai_env_init success use:", result.use)
			USE_OPENAI_API_4_KEY = result.use
			return result.use
		}
		else {
			global.console.log("openai_env_init failed")
		}
	}
	else if (change) {
		const result = await getDB(apikeydb, db_key)
		global.console.log(result)
		if (result) {
			// global.console.log("openai_env_init success result", result)
			if (result.new.length > 0) {
				result.fail.push(USE_OPENAI_API_4_KEY)
				USE_OPENAI_API_4_KEY = result.new.shift()
				result.use = USE_OPENAI_API_4_KEY
				await resetDB(apikeydb, result)
				global.console.log("openai_env_init4 success new", USE_OPENAI_API_4_KEY)
				return USE_OPENAI_API_4_KEY
			}
		}
		else {
			global.console.log("openai_env_init failed")
		}
	}
	else {
		// global.console.log("openai_env_init first", USE_OPENAI_API_4_KEY)
		return USE_OPENAI_API_4_KEY
	}
	return USE_OPENAI_API_4_KEY
}

async function get_openai_apikey(change: boolean, model: string): string {
	global.console.log("get_openai_apikey")
	let db_key = "OPENAI_APIKEY_POOL"
	if (model == 'gpt-4') {
		return await get_openai_apikey4(change)
	}
	if (!USE_OPENAI_API_KEY) {
		const result = await getDB(apikeydb, db_key)
		global.console.log(result)
		if (result) {
			global.console.log("openai_env_init success use:", result.use)
			USE_OPENAI_API_KEY = result.use
			return result.use
		}
		else {
			global.console.log("openai_env_init failed")
		}
	}
	else if (change) {
		const result = await getDB(apikeydb, db_key)
		global.console.log(result)
		if (result) {
			// global.console.log("openai_env_init success result", result)
			if (result.new.length > 0) {
				result.fail.push(USE_OPENAI_API_KEY)
				USE_OPENAI_API_KEY = result.new.shift()
				result.use = USE_OPENAI_API_KEY
				await resetDB(apikeydb, result)
				global.console.log("openai_env_init success new", USE_OPENAI_API_KEY)
				return USE_OPENAI_API_KEY
			}
		}
		else {
			global.console.log("openai_env_init failed")
		}
	}
	else {
		// global.console.log("openai_env_init first", USE_OPENAI_API_KEY)
		return USE_OPENAI_API_KEY
	}
	return USE_OPENAI_API_KEY
}

async function get_service_env(name: string) {
	const result = await getDB(apikeydb, name)
	global.console.log(result)
	if (result) {
		return { status: true, message: "获取成功", data: result }
	}
	return { status: false, message: "获取失败", data: null }
}

async function verify_new_ip(ip: string) {
	const result = await getDB(apikeydb, 'SHARED_IP')
	global.console.log("verify_new_ip", result)
	if (result) {
		if (result.ip_list.includes(ip))
			return { status: false, message: "ip已使用过", data: result }
		else {
			result.ip_list.push(ip)
			setDB(apikeydb, 'SHARED_IP', result)
			return { status: true, message: "IP可用", data: result }
		}
	}
	return { status: false, message: "失败", data: null }
}


export { get_openai_apikey, get_service_env, verify_new_ip }
