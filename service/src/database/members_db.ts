import { createDB, resetDB, setDB, getDB } from './myCouchdb'

const membersDb = createDB('members')

async function insertMemberDB(user_info: any) {
    resetDB(membersDb, user_info)
}

async function setMemberDB(user_id: string, info: any) {
    setDB(membersDb, user_id, info)
}

async function getMemberDB(user_id: string): any {
    return getDB(membersDb, user_id)
}


async function after_user_chat(results: any) {
    if (results){     //非会员访问
        await insertMemberDB(results)
    }
}

async function before_user_chat(username: string) {
    if (!username){     //非会员访问
        return { status: true, message: "非会员访问" , data:undefined}
    }
    const results = await getMemberDB(username)
    if (!results){      //会员无效
        return { status: false, message: "会员无效" , data:undefined}
    }
    if (results.stop_time == 9999)  //永久会员
        return { status: true, message: "永久会员" , data:undefined}
    else if (results.stop_time > new Date().getTime()){
        return { status: true, message: "会员未过期" , data:undefined}
    }
    else if (results.avail_num > 0){
        results.avail_num--
        return { status: true, message: "会员额度够用" , data:results}
    }
    else{
        return { status: false, message: "【警告】sorry，您的会员已过期或者额度已用完，请使用新的激活码重新激活，谢谢！" , data:undefined}
    }
}

async function user_register_name_verify(username: string) {
    const results = await getMemberDB(username)
    global.console.log("user_register_verify", results)
    if (results){
        return { status: false, message: "用户已存在" }
    }
    else {
        return { status: true, message: "用户名可用" }
    }
}

async function user_register_new_with_code(username: string, passwd: string, code_info: any) {
    const new_member={
        _id: username,
        password: passwd,
        create_time: (new Date().getTime()),
        active_time: (new Date().getTime()),
        stop_time: 0,
        avail_num: 0
    }
    if (code_info.type == 0) {  //时长卡
        new_member.stop_time=new_member.active_time+code_info.duration*24*60*60*1000     //毫秒级
    }
    else if(code_info.type == 1) {   //额度卡
        new_member.avail_num=code_info.avail_num
    }
    else if (code_info.type == 2) { //永久卡，9999表示永久
        new_member.stop_time=9999
    }
    else {
        return { status: false, message: "激活码错误" }
    }

    await insertMemberDB(new_member)

    return { status: true, message: "注册成功" }
}

async function user_code_active(username: string, code_info: any) {
    const results = await getMemberDB(username)
    global.console.log("user_login results", results)
    if (!results){
        return { status: false, message: "用户名 or 密码错误" , data: null}
    }
    if (code_info.type == 2) { //永久卡，9999表示永久
        results.stop_time=9999
    }
    else if (code_info.type == 0) {  //时长卡
        const now: number = new Date().getTime()
        if (results.stop_time < now) {   //已过期
            results.stop_time=results.active_time+code_info.duration*24*60*60*1000
        }
        else{
            results.active_time=now
            results.stop_time+=code_info.duration*24*60*60*1000
        }
    }
    else if(code_info.type == 1) {   //额度卡
        results.avail_num=code_info.avail_num
    }
    else {
        return { status: false, message: "激活码错误", data: null }
    }

    await insertMemberDB(results)

    return { status: true, message: "激活成功", data: null }
}


async function user_login(username: string, password: string) {
    const results = await getMemberDB(username)
    global.console.log("user_login results", results)
    if (password && results && results.password && results.password == password){
        return { status: true, message: "登陆成功" }
    }
    else {
        return { status: false, message: "用户名 or 密码错误" }
    }
}

async function get_member_info(username: string) {
    const results = await getMemberDB(username)
    global.console.log("user_login results", results)
    if (results){
        return { status: true, message: "获取会员信息成功", data: results}
    }
    else {
        return { status: false, message: "获取会员信息失败", data: results }
    }
}

export { setMemberDB, getMemberDB, user_register_name_verify, user_register_new_with_code, user_login, get_member_info, before_user_chat, after_user_chat, user_code_active }