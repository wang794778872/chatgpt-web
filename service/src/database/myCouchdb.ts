import * as dotenv from 'dotenv'
import nano from 'nano'
dotenv.config()
const db_prefix=process.env.DB_PREFIX 
// 连接到 CouchDB 服务器
const db_nano = nano(process.env.DB_URL)

global.console.log(db_prefix)
function createDB(db_name: string, monitor?: boolean) {
    let newDb: any
    if (db_prefix != undefined && db_prefix){
        newDb = db_nano.use(`${db_prefix}-${db_name}`)
        global.console.log('--------------------------------', `${db_prefix}-${db_name}`)
    }
    else{
        newDb = db_nano.use(db_name)
        global.console.log('--------------------------------', db_name)
    }
        
    if (monitor)
    {
        newDb.changes({since: 'now', include_docs: true}, (err: Error, body: any) => {
            if (err) {
                console.log('Error:', err);
            } else {
                console.log('Changes:', body.results);
            }
        });
    }

    return newDb
}

async function resetDB(db: any, data: any) {
    await db.insert(data, function(err:Error, result: any) {
        if (err) {
            global.console.log('插入文档失败：', err)
        } else {
            global.console.log('插入文档成功：', result)
        }
    })
}

async function setDB(db: any, id: string, data: any) {
    try {
        const doc: any = await db.get(id)
        Object.assign(doc, data)
        db.insert(doc)
        global.console.log("设置成功")
    } catch (error) {
        global.console.log("设置失败",id)
    }
}

async function getDB(db: any, id: string): any {
    try{
        global.console.log("getDB",id)
        const body = await db.get(id)
        global.console.log(body)
        // global.console.log("getDB", JSON.stringify(body))
        // global.console.log(JSON.stringify({value: body}))
        return JSON.parse(JSON.stringify(body))
    }
    catch (error) {
        global.console.log("getUserDB  ERROR")
        // global.console.log("getUserDB  ERROR", error)
    }
}

async function deleteDB(db: any, id: string) {
    try {
        const doc = await db.get(id)
        const response = await db.destroy(id, doc._rev)
        global.console.log("删除成功", response)
    } catch (error) {
        global.console.log("删除失败",id)
    }
}

export { createDB, resetDB, setDB, getDB, deleteDB }