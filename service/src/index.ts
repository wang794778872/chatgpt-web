import express from 'express'
import type { RequestProps } from './types'
import type { ChatMessage } from './chatgpt'
import { chatConfig, chatReplyProcess, currentModel } from './chatgpt'
import { auth } from './middleware/auth'
import { limiter } from './middleware/limiter'
import { isNotEmptyString } from './utils/is'
import { defaultUserRedis } from './utils/user_redis'


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

  try {
    const { prompt, options = {}, systemMessage } = req.body as RequestProps
    let firstChunk = true
    await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
        firstChunk = false
      },
      systemMessage,
    })
  }
  catch (error) {
    res.write(JSON.stringify(error))
  }
  finally {
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
    // global.console.log("session")
    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
    const hasAuth = isNotEmptyString(AUTH_SECRET_KEY)
    res.send({ status: 'Success', message: '', data: { auth: hasAuth, model: currentModel() } })
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
    const MY_AUTH_SECRET_KEY_LIST: string[] = ['ironman', 'thor', 'hulk', 'captainamerica', 'ai1838']
    global.console.log(MY_AUTH_SECRET_KEY_LIST.includes(token))
    // if (process.env.AUTH_SECRET_KEY !== token) {
    if (MY_AUTH_SECRET_KEY_LIST.includes(token))
        res.send({ status: 'Success', message: 'Verify successfully', data: null })
    else
        throw new Error('密钥无效 | Secret key is invalid')
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/user_init', auth, async (req, res) => {
    const { id } = req.body as { id: string }
//   global.console.log("user_init")
  try {
    defaultUserRedis(id)
    res.send({ status: 'Success', message: 'user_init successfully', data: null})
  }
  catch (error) {
    res.send(error)
  }
})

app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)

app.listen(3002, () => globalThis.console.log('Server is running on port 3002'))
