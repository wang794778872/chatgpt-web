import loki from 'lokijs'

const MY_COLLENTION = 'users'

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
