import loki from 'lokijs'
import fs from 'fs'
// import LokiMemoryAdapter from 'lokijs/src/loki-memory-adapter'


// 创建新的内存适配器
// const adapter = new LokiMemoryAdapter()
const MY_COLLENTION = 'users'

interface sUserInfo {
  id: string
  name: string
  invite_num: number
}

// 创建数据库实例
let db: any
let users: any

function loadUserDB(): any {
    if (fs.existsSync('./users.db')) {
        global.console.log("existsSync")
        global.console.log(fs.accessSync('./users.db', fs.constants.R_OK))
      } else {
        global.console.log("existsSync failed")
      }
  db = new loki ('./users.db')
//   db = new loki ('./users.db', { adapter, autoload: true, autosave: true })
  users = db.addCollection(MY_COLLENTION)
//   db.loadDatabase({ autoload: true, autosave: true, recursiveWait: true })
//   users = db.getCollection(MY_COLLENTION)
//   global.console.log("getCollection", users)
//   if (!users) {
//     global.console.log('Collection does not exist!')
//     users = db.addCollection('users')
//   } else {
//     global.console.log('Collection loaded successfully!')
//   }
  return users
}

users = loadUserDB()
global.console.log(users)

// 监听数据库修改
users.on('update', (doc:any) => {
    global.console.log(`文档 ${doc.$loki} 被修改了`)
})
global.console.log("users.on")


export function insertUserRedis(user_info: sUserInfo) {
  users.insert(user_info)
  global.console.log('设置成功', user_info)
  db.saveDatabase()
}

export function setUserRedis(user_id: string, info: any) {
  const user = users.findOne({ id: user_id })
  const results = users.update({...user, ...info})
  global.console.log('修改成功', results)
  db.saveDatabase()
}

export function getUserRedis(user_id: string): sUserInfo {
  const results = users.findOne({ id: user_id })
  global.console.log("查询成功", results)
  return results
}

export function delUserRedis(user_id: string) {
  const user = users.findOne({ id: user_id })
  const results = users.remove(user)
  global.console.log('删除成功：', results)
  db.saveDatabase()
}

export function defaultUserRedis( id: string ) {
  global.console.log('defaultUserRedis', id)
  const default_user: sUserInfo = {
    id: id,
    name: 'default',
    invite_num: 0,
  }
  insertUserRedis(default_user)
}
