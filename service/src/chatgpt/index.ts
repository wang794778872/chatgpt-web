import * as dotenv from 'dotenv'
import 'isomorphic-fetch'
import type { ChatGPTAPIOptions, ChatMessage, SendMessageOptions } from 'chatgpt'
import { ChatGPTAPI, ChatGPTUnofficialProxyAPI } from 'chatgpt'
import { SocksProxyAgent } from 'socks-proxy-agent'
import httpsProxyAgent from 'https-proxy-agent'
import fetch from 'node-fetch'
import { sendResponse } from '../utils'
import { isNotEmptyString } from '../utils/is'
import type { ApiModel, ChatContext, ChatGPTUnofficialProxyAPIOptions, ModelConfig } from '../types'
import type { BalanceResponse, RequestOptions } from './types'
import { get_openai_apikey } from 'src/database/apikey_db'

const { HttpsProxyAgent } = httpsProxyAgent

dotenv.config()

const ErrorCodeMessage: Record<string, string> = {
//   401: '[OpenAI] 提供错误的API密钥 | Incorrect API key provided',
  401: '[OpenAI] 开了个小差，请重试',
  403: '[OpenAI] 服务器拒绝访问，请稍后再试 | Server refused to access, please try again later',
  502: '[OpenAI] 错误的网关 |  Bad Gateway',
  503: '[OpenAI] 服务器繁忙，请稍后再试 | Server is busy, please try again later',
  504: '[OpenAI] 网关超时 | Gateway Time-out',
  500: '[OpenAI] 服务器繁忙，请稍后再试 | Internal Server Error',
}

const timeoutMs: number = !isNaN(+process.env.TIMEOUT_MS) ? +process.env.TIMEOUT_MS : 30 * 1000
const disableDebug: boolean = process.env.OPENAI_API_DISABLE_DEBUG === 'true'

let apiModel: ApiModel

if (!isNotEmptyString(process.env.OPENAI_API_KEY) && !isNotEmptyString(process.env.OPENAI_ACCESS_TOKEN))
  throw new Error('Missing OPENAI_API_KEY or OPENAI_ACCESS_TOKEN environment variable')

let api: ChatGPTAPI | ChatGPTUnofficialProxyAPI
let api35: ChatGPTAPI | ChatGPTUnofficialProxyAPI

async function initGPTAPI() {
    if (isNotEmptyString(process.env.OPENAI_API_KEY)) {
        const OPENAI_API_BASE_URL = process.env.OPENAI_API_BASE_URL
        const OPENAI_API_MODEL = process.env.OPENAI_API_MODEL
        const model = isNotEmptyString(OPENAI_API_MODEL) ? OPENAI_API_MODEL : 'gpt-3.5-turbo'
    
        const options: ChatGPTAPIOptions = {
        apiKey: process.env.OPENAI_API_KEY,
        completionParams: { model },
        debug: !disableDebug,
        }
    
        // increase max token limit if use gpt-4
        if (model.toLowerCase().includes('gpt-4')) {
        // if use 32k model
        if (model.toLowerCase().includes('32k')) {
            options.maxModelTokens = 32768
            options.maxResponseTokens = 8192
        }
        else {
            options.maxModelTokens = 8192
            options.maxResponseTokens = 2048
        }
        }
        else{       //默认tokens限制
            options.maxModelTokens = 4096
            options.maxResponseTokens = 2048
        }
    
        if (isNotEmptyString(OPENAI_API_BASE_URL))
        options.apiBaseUrl = `${OPENAI_API_BASE_URL}/v1`
    
        setupProxy(options)
    
        api = new ChatGPTAPI({ ...options })
        apiModel = 'ChatGPTAPI'
    }
}

async function initGPTToken() {
    const OPENAI_API_MODEL = process.env.OPENAI_API_MODEL
    const options: ChatGPTUnofficialProxyAPIOptions = {
    accessToken: process.env.OPENAI_ACCESS_TOKEN,
    debug: !disableDebug,
    }

    if (isNotEmptyString(OPENAI_API_MODEL))
    options.model = OPENAI_API_MODEL

    options.apiReverseProxyUrl = isNotEmptyString(process.env.API_REVERSE_PROXY)
    ? process.env.API_REVERSE_PROXY
    : 'https://bypass.churchless.tech/api/conversation'

    setupProxy(options)
    api = new ChatGPTUnofficialProxyAPI({ ...options })
    apiModel = 'ChatGPTUnofficialProxyAPI'
}

async function initGPTAPIEx(apikey: string, model:string) {
    if (isNotEmptyString(apikey)) {
        const OPENAI_API_BASE_URL = process.env.OPENAI_API_BASE_URL
        const options: ChatGPTAPIOptions = {
        apiKey: apikey,
        completionParams: { model },
        debug: !disableDebug,
        }
    
        // increase max token limit if use gpt-4
        if (model.toLowerCase().includes('gpt-4')) {
        // if use 32k model
        if (model.toLowerCase().includes('32k')) {
            options.maxModelTokens = 32768
            options.maxResponseTokens = 8192
        }
        else {
            options.maxModelTokens = 8192
            options.maxResponseTokens = 2048
        }
        }
        else{       //默认tokens限制
            options.maxModelTokens = 4096
            options.maxResponseTokens = 2048
        }
    
        if (isNotEmptyString(OPENAI_API_BASE_URL))
        options.apiBaseUrl = `${OPENAI_API_BASE_URL}/v1`
    
        setupProxy(options)
    
        const apiEx = new ChatGPTAPI({ ...options })
        apiModel = 'ChatGPTAPI'
        return apiEx
    }
}


(async () => {
  // More Info: https://github.com/transitive-bullshit/chatgpt-api

    if (isNotEmptyString(process.env.OPENAI_API_KEY)) {
        await initGPTAPI()
    }
    else {
        await initGPTToken()
    }
    api35 = await initGPTAPIEx(process.env.OPENAI_API_KEY, 'gpt-3.5-turbo')
})()

async function chatReplyProcess(options: RequestOptions) {
  const { message, lastContext, process, systemMessage } = options
  try {
    const get_apikey = await get_openai_apikey(false)
    if (get_apikey && get_apikey != api.apiKey) {
        api.apiKey=get_apikey
    }
    let options: SendMessageOptions = { timeoutMs }
    if (apiModel === 'ChatGPTAPI') {
      if (isNotEmptyString(systemMessage))
        options.systemMessage = systemMessage
    }

    if (lastContext != null) {
      if (apiModel === 'ChatGPTAPI')

        options.parentMessageId = lastContext.parentMessageId
      else
        options = { ...lastContext }
    }

    global.console.log("api.apiKey", api.apiKey)
    const response = await api.sendMessage(message, {
      ...options,
      onProgress: (partialResponse) => {
        process?.(partialResponse)
      },
    })

    return sendResponse({ type: 'Success', data: response })
  }
  catch (error: any) {
    const code = error.statusCode
    if ('401' == code){
        console.log("apiKey error", api.apiKey)
        const change_apikey= await get_openai_apikey(true)
        api.apiKey=change_apikey
    }
    if (Reflect.has(ErrorCodeMessage, code))
      return sendResponse({ type: 'Fail', message: ErrorCodeMessage[code] })
    return sendResponse({ type: 'Fail', message: error.message ?? 'Please check the back-end console' })
  }
}

async function chatReplyProcessEx(model: string, options: RequestOptions) {
    global.console.log("chatReplyProcessEx", model)
    if (!model){
        model='gpt-3.5-turbo'
    }
    const { message, lastContext, process, systemMessage } = options
    try {
        const get_apikey = await get_openai_apikey(false)
        if (model != 'gpt-3.5-turbo')
            return sendResponse({ type: 'Fail', message: "mode not support" })
        const apiEx= api35
        if (!apiEx)
            return sendResponse({ type: 'Fail', message: "api error" })
        apiEx.apiKey=get_apikey
        let options: SendMessageOptions = { timeoutMs }
        if (apiModel === 'ChatGPTAPI') {
        if (isNotEmptyString(systemMessage))
            options.systemMessage = systemMessage
        }

        if (lastContext != null) {
        if (apiModel === 'ChatGPTAPI')

            options.parentMessageId = lastContext.parentMessageId
        else
            options = { ...lastContext }
        }

        const response = await apiEx.sendMessage(message, {
        ...options,
        onProgress: (partialResponse) => {
            process?.(partialResponse)
        },
        })

        return sendResponse({ type: 'Success', data: response })
    }
    catch (error: any) {
        const code = error.statusCode
        if ('401' == code){
            const change_apikey= await get_openai_apikey(true)
            apiEx.apiKey=change_apikey
        }
        if (Reflect.has(ErrorCodeMessage, code))
        return sendResponse({ type: 'Fail', message: ErrorCodeMessage[code] })
        return sendResponse({ type: 'Fail', message: error.message ?? 'Please check the back-end console' })
    }
}


async function fetchBalance() {
  // 计算起始日期和结束日期

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY
  const OPENAI_API_BASE_URL = process.env.OPENAI_API_BASE_URL

  if (!isNotEmptyString(OPENAI_API_KEY))
    return Promise.resolve('-')

  const API_BASE_URL = isNotEmptyString(OPENAI_API_BASE_URL)
    ? OPENAI_API_BASE_URL
    : 'https://api.openai.com'

  const [startDate, endDate] = formatDate()

  // 每月使用量
  const urlUsage = `${API_BASE_URL}/v1/dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`

  const headers = {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  }

  try {
    // 获取已使用量
    const useResponse = await fetch(urlUsage, { headers })
    const usageData = await useResponse.json() as BalanceResponse
    const usage = Math.round(usageData.total_usage) / 100
    return Promise.resolve(usage ? `$${usage}` : '-')
  }
  catch {
    return Promise.resolve('-')
  }
}

function formatDate(): string[] {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const lastDay = new Date(year, month, 0)
  const formattedFirstDay = `${year}-${month.toString().padStart(2, '0')}-01`
  const formattedLastDay = `${year}-${month.toString().padStart(2, '0')}-${lastDay.getDate().toString().padStart(2, '0')}`
  return [formattedFirstDay, formattedLastDay]
}

async function chatConfig() {
  const balance = await fetchBalance()
  const reverseProxy = process.env.API_REVERSE_PROXY ?? '-'
  const httpsProxy = (process.env.HTTPS_PROXY || process.env.ALL_PROXY) ?? '-'
  const socksProxy = (process.env.SOCKS_PROXY_HOST && process.env.SOCKS_PROXY_PORT)
    ? (`${process.env.SOCKS_PROXY_HOST}:${process.env.SOCKS_PROXY_PORT}`)
    : '-'
  return sendResponse<ModelConfig>({
    type: 'Success',
    data: { apiModel, reverseProxy, timeoutMs, socksProxy, httpsProxy, balance },
  })
}

function setupProxy(options: ChatGPTAPIOptions | ChatGPTUnofficialProxyAPIOptions) {
  if (isNotEmptyString(process.env.SOCKS_PROXY_HOST) && isNotEmptyString(process.env.SOCKS_PROXY_PORT)) {
    const agent = new SocksProxyAgent({
      hostname: process.env.SOCKS_PROXY_HOST,
      port: process.env.SOCKS_PROXY_PORT,
      userId: isNotEmptyString(process.env.SOCKS_PROXY_USERNAME) ? process.env.SOCKS_PROXY_USERNAME : undefined,
      password: isNotEmptyString(process.env.SOCKS_PROXY_PASSWORD) ? process.env.SOCKS_PROXY_PASSWORD : undefined,
    })
    options.fetch = (url, options) => {
      return fetch(url, { agent, ...options })
    }
  }
  else {
    if (isNotEmptyString(process.env.HTTPS_PROXY) || isNotEmptyString(process.env.ALL_PROXY)) {
      const httpsProxy = process.env.HTTPS_PROXY || process.env.ALL_PROXY
      if (httpsProxy) {
        const agent = new HttpsProxyAgent(httpsProxy)
        options.fetch = (url, options) => {
          return fetch(url, { agent, ...options })
        }
      }
    }
  }
}

function currentModel(): ApiModel {
  return apiModel
}

export type { ChatContext, ChatMessage }

export { chatReplyProcess, chatConfig, currentModel, chatReplyProcessEx }
