import loki from 'lokijs'
// import { deCrypto, enCrypto } from '@/utils/crypto'

const MY_COLLENTION = 'users'
const id_prefix = 'BENHU_'

interface sUserInfo {
  id: string
  name: string
  invite_num: number
}

// 创建数据库实例
const db = new loki ('./users.db')
let users: any

function loadUserDB(): any {
  db.loadDatabase()
  users = db.getCollection(MY_COLLENTION)
  global.console.log("getCollection", users)
  if (!users) {
    global.console.log('Collection does not exist!')
    users = db.addCollection('users')
  } else {
    global.console.log('Collection loaded successfully!')
  }
  return users
}

users = loadUserDB()
global.console.log(users)

// 监听数据库修改
users.on('update', (doc:any) => {
    global.console.log(`文档 ${doc.$loki} 被修改了`)
})
global.console.log("users.on")
export function structure_user_id() {
  const now: number = new Date().getTime()
  const new_id = `${id_prefix}${now}`
  return new_id
//   return enCrypto(new_id)
}

export function verify_user_id(id: any) {
//   const dec_id: string = deCrypto(id)
  const dec_id: string = id
  if (dec_id === null || dec_id === undefined)
    return false
  return dec_id.startsWith(id_prefix)
}

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

export function defaultUserRedis() {
  global.console.log('defaultUserRedis')
  const now: number = new Date().getTime()
  global.console.log(`BENHU_${now}`)
  const new_id: string = `BENHU_${now}`
  const default_user: sUserInfo = {
    id: new_id,
    name: 'default',
    invite_num: 0,
  }
  insertUserRedis(default_user)

  return new_id
//   return 'custom_794778872'
}
