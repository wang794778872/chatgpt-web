import express from 'express'
import type { RequestProps, RequestPropsEx } from './types'
import type { ChatMessage } from './chatgpt'
import { chatConfig, chatReplyProcess, currentModel, chatReplyProcessEx } from './chatgpt'
import { auth } from './middleware/auth'
import { limiter } from './middleware/limiter'
// import { isNotEmptyString } from './utils/is'
import { getUserDB, setUserDB, defaultUserDB } from './database/users_db'
import { verifySecretDB } from './database/secret_db'
import { user_register_code_verify, user_code_reduce } from './database/member_secret_db'
import { user_register_name_verify, user_register_new_with_code, user_login, get_member_info, before_user_chat, after_user_chat, user_code_active } from './database/members_db'
import e from 'express'


const app = express()
const router = express.Router()


app.use(express.static('public'))
app.use(express.json())

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

router.post('/chat-process', [auth, limiter], async (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')
    let results:any
  try {
    const { prompt, options = {}, systemMessage, username, model } = req.body as RequestPropsEx
    results= await before_user_chat(username)
    if (!results.status){
        global.console.log("/chat-process  error ")
        res.write(JSON.stringify({ message: results.message, data: null, status: 'Fail' }))
    }
    else {
        let firstChunk = true
        global.console.log("/chat-process  start ", model)
        await chatReplyProcessEx(model, {
          message: prompt,
          lastContext: options,
          process: (chat: ChatMessage) => {
            res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
            firstChunk = false
          },
          systemMessage,
        })
    }

  }
  catch (error) {
    global.console.log("/chat-process  error ", error)
    res.write(JSON.stringify(error))
  }
  finally {
    global.console.log("/chat-process  end ", results)
    if (results && results.status == true && results.data)
        after_user_chat(results.data)
    res.end()
  }
})

router.post('/config', auth, async (req, res) => {
  try {
    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/session', async (req, res) => {
  try {
    const { id } = req.body as { id: string }
    // global.console.log("session", id)
    // const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
    // const hasAuth = isNotEmptyString(AUTH_SECRET_KEY)
    const results = await getUserDB(id)
    if (results) {
        // global.console.log("获取成功", results)
        let ext_avail_num: number
        ext_avail_num=0
        if (results){
            ext_avail_num=results.ext_available_num
        }
        res.send({ status: 'Success', message: '', data: { auth: false, model: currentModel() , ext_available_num: ext_avail_num } })
        // res.send({ status: 'Success', message: '', data: { auth: hasAuth, model: currentModel() , ext_available_num: ext_avail_num } })
        if (ext_avail_num != 0)
            setUserDB(id, { ext_available_num: 0 })
    }
    else {
        // global.console.log('-9001')
        defaultUserDB(id)
        res.send({ status: 'Success', message: '', data: { auth: false, model: currentModel() , ext_available_num: -9001 } })
    }
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/verify', async (req, res) => {
    try {
        // global.console.log("verify")
        const { token } = req.body as { token: string }
        if (!token)
            throw new Error('Secret key is empty')
        // const MY_AUTH_SECRET_KEY_LIST: string[] = ['ironman', 'thor', 'hulk', 'captainamerica', 'ai1838']
        // global.console.log(MY_AUTH_SECRET_KEY_LIST.includes(token))
        // // if (process.env.AUTH_SECRET_KEY !== token) {
        // if (MY_AUTH_SECRET_KEY_LIST.includes(token))
        //     res.send({ status: 'Success', message: 'Verify successfully', data: null })
        const secret_num=await verifySecretDB(token)
        // global.console.log("secret_num", secret_num)
        if (secret_num > 0)
            res.send({ status: 'Success', message: 'Verify successfully', data: { secret_num } })
        else
            throw new Error('密钥无效 | Secret key is invalid')
    }
    catch (error) {
        res.send({ status: 'Fail', message: error.message, data: null })
    }
})

router.post('/user_init', auth, async (req, res) => {
    const { id } = req.body as { id: string }
    // global.console.log("user_init")
    try {
        defaultUserDB(id)
        res.send({ status: 'Success', message: 'user_init successfully', data: null})
    }
    catch (error) {
        res.send(error)
    }
})

async function user_shared_handle(shared_id: string) {
    const results = await getUserDB(shared_id)
    // global.console.log("查询", results)
    if (results){
        // results.ext_available_num=results.ext_available_num+20  // 分享链接+20
        // global.console.log("user_shared_handle 查询成功", results)
        // global.console.log("user_shared_handle 查询成功dddd", results.ext_available_num)
        setUserDB(shared_id, { ext_available_num: (Number(results.ext_available_num)+20) })
    }
}


router.post('/user_init_shared', auth, async (req, res) => {
    const { id, shared_id } = req.body as { id: string, shared_id: string }
    // global.console.log("user_init_shared", id, shared_id)
    try {
        await user_shared_handle(shared_id)
        res.send({ status: 'Success', message: 'user_init_shared successfully', data: null})
    }
    catch (error) {
        res.send(error)
    }
})

router.post('/user_register_code', auth, async (req, res) => {
    const { username,  password, code } = req.body as { username: string, password: string, code: string }
    global.console.log("user_register_code", username,  password, code)
    try {
        //验证用户名是否可用
        const result=await user_register_name_verify(username)
        global.console.log("user_register_name_verify", result)
        if (!result.status)
            res.send({ status: 'failed', message: result.message, data: null})
        else {
            //验证激活码是否可用
            const code_result= await user_register_code_verify(code)
            if (!code_result.status){
                console.log("user_register_code_verify", code_result)
                res.send({ status: 'failed', message: code_result.message, data: null})
            }
            else{
                //设置用户名
                const reg_result = await user_register_new_with_code(username, password, code_result.results)
                if (!code_result.status)
                    res.send({ status: 'failed', message: reg_result.message, data: null})
                else{
                    //设置密钥使用消耗
                    await user_code_reduce(code_result.results)
                    res.send({ status: 'success', message: "注册成功", data: null})
                }
            }
        }
    }
    catch (error) {
        res.send({ status: 'failed', message: "注册失败", data: null})
    }
})

router.post('/user_login', auth, async (req, res) => {
    const { username,  password } = req.body as { username: string, password: string }
    global.console.log("user_login post", username,  password)
    try {
        //验证用户名是否可用
        const result=await user_login(username, password)
        global.console.log("user_login", result)
        if (!result) {
            res.send({ status: 'failed', message: "用户名 or 密码不正确", data: null})
        }
        else if (!result.status) {
            res.send({ status: 'failed', message: result.message, data: null})
        }
        else {
            res.send({ status: 'success', message: "登陆成功", data: null})
        }
    }
    catch (error) {
        res.send({ status: 'failed', message: "登陆失败", data: null})
    }
})

router.post('/member_info', auth, async (req, res) => {
    const { username } = req.body as { username: string }
    global.console.log("member_info post", username)
    try {
        //验证用户名是否可用
        const result=await get_member_info(username)
        global.console.log("user_login", result)
        if (!result) {
            res.send({ status: 'failed', message: "获取会员信息失败", data: undefined})
        }
        else if (!result.status) {
            res.send({ status: 'failed', message: result.message, data: result.data})
        }
        else {
            res.send({ status: 'success', message: "获取会员信息成功", data: result.data})
        }
    }
    catch (error) {
        res.send({ status: 'failed', message: "获取会员信息失败", data: undefined})
    }
})


router.post('/code_active', auth, async (req, res) => {
    const { username, code } = req.body as { username: string, code: string }
    global.console.log("member_info post", username)
    try {
        //验证激活码是否可用
        const code_result= await user_register_code_verify(code)
        if (!code_result.status){
            console.log("user_register_code_verify", code_result)
            res.send({ status: 'failed', message: code_result.message, data: null})
        }
        else{
            const use_result= await user_code_active(username, code_result.results)
            if (!use_result.status)
                res.send({ status: 'failed', message: use_result.message, data: null})
            else{
                //设置密钥使用消耗
                await user_code_reduce(code_result.results)
                res.send({ status: 'success', message: "激活成功", data: null})
            }
        }
    }
    catch (error) {
        res.send({ status: 'failed', message: "激活失败", data: null})
    }
})


app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)

app.listen(3002, () => globalThis.console.log('Server is running on port 3002'))
