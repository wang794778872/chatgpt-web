// import Redis from 'ioredis'
import { deCrypto, enCrypto } from '../crypto'

// const client = Redis.createClient()

interface userRedis {
  name: string
  invite_num: number
}

// const systemRedisId = '__SYSTEM_WSJ__'
const id_prefix = 'BENHU_'

// interface systemRedis {
//   user_num: number
// }

export function structure_user_id(num: number) {
  const new_id = `${id_prefix}${num}`
  return enCrypto(new_id)
}

export function verify_user_id(id: any) {
  const dec_id: string = deCrypto(id)
  if (dec_id === null || dec_id === undefined)
    return false
  return dec_id.startsWith(id_prefix)
}

export function setUserRedis(redis_id: string, redis_info: userRedis) {
//   console.log('setUserRedis', redis_id, redis_info)
//   client.set(redis_id, JSON.stringify(redis_info))
//     .then(() => console.log('New user saved to database!'))
//     .catch((error: Error) => console.error('Error saving user:', error))
}

export function getUserRedis(redis_id: string) {
//   console.log('getUserRedis', redis_id)
//   client.get(redis_id).then((result: any) => {
//     if (result) {
//       const user = JSON.parse(result)
//       console.log('User:', user)
//     }
//     else {
//       console.log('Record not found')
//     }
//   }).catch((error: Error) => console.error('Error querying user:', error))
}

export function delUserRedis(redis_id: string) {
//   console.log('delUserRedis', redis_id)
//   client.del(redis_id).then((result: any) => {
//     if (result === 1)
//       console.log('Record deleted')
//     else
//       console.log('Record not found')
//   }).catch((error: Error) => console.error('Error deleting record:', error))
}

export function defaultUserRedis() {
//   console.log('defaultUserRedis')
  //   const default_user: userRedis = {
  //     name: 'default',
  //     invite_num: 0,
  //   }
  //   const mysystem: systemRedis = getUserRedis(systemRedisId)
  //   mysystem.user_num++
  const redis_id = 'custom_user_794778872'
  //   const redis_id: string = structure_user_id(mysystem.user_num)
  //   setUserRedis(redis_id, mysystem)
  //   setUserRedis(systemRedisId, default_user)
  //   console.log(redis_id)
  return redis_id
}

// getUserRedis('gpt-web')

// setUserRedis('gpt-web', user)
// getUserRedis('gpt-web')
// user.invite_num = 10
// setUserRedis('gpt-web', user)
// getUserRedis('gpt-web')
// delUserRedis('gpt-web')
// getUserRedis('gpt-web')
