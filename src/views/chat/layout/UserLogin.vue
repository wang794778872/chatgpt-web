<script setup lang='ts'>
import { ref } from 'vue'
import { NModal, useMessage } from 'naive-ui'
import { fetchUserRegisterWithCode,fetchUserLogin } from '@/api'
import { useUserStore } from '@/store'
import registerDesc from './PersonalCenter/registerDesc.vue'
import registerTxT from './PersonalCenter/registerTxT.vue'

const userStore = useUserStore()
// import { NButton, NInput, NModal, useMessage } from 'naive-ui'
const ms = useMessage()
interface Props {
    visible: boolean
}

defineProps<Props>()

interface SessionResponse {
    status: string
    message: string
    data: string
}

const isLogin = ref(true)
const isTxTChecked = ref(false)
const txtshow = ref(false)

const register_name = ref('')
const register_passwd1 = ref('')
const register_passwd2 = ref('')
const register_code = ref('')
// const register_tip = ref('')

const login_name = ref('')
const login_passwd = ref('')
// const login_tip = ref('')

const codeshow = ref(false)

function afterHandleRegister(name: string, data: any) {
    try {
        if (data.status == "success"){
            ms.success('注册成功')

            userStore.setLoginState(true, register_name.value.trim())
            window.location.reload()
        }
        else {
            ms.error(data.message)
        }
    }
    catch (error: any) {
        ms.error("注册失败")
    }
}

async function handleRegister() {
    // console.log(register_name.value.trim())
    // console.log(register_passwd1.value.trim())
    // console.log(register_passwd2.value.trim())
    // console.log(register_code.value.trim())
    if (!register_name.value.trim() || !register_passwd1.value.trim() || !register_passwd2.value.trim() || !register_code.value.trim()) {
        ms.error("填写不正确")
    }
    else if (register_passwd1.value.trim() != register_passwd2.value.trim())
        ms.error("两次输入的密码不一致")
    else if (!isTxTChecked.value){
        ms.error("请先阅读并勾选《软件免责说明》")
    }
    else {
        try {
            const { data } = await fetchUserRegisterWithCode<SessionResponse>(register_name.value.trim(), register_passwd1.value.trim(), register_code.value.trim())
            // console.log("fetchUserRegisterWithCode", data.message,  data)
            afterHandleRegister(register_name.value.trim(), data)
        }
        catch (error: any) {
            afterHandleRegister(register_name.value.trim(), error)
        }
    }
}

function afterHandleLogin(name:string, data: any) {
    try {
        if (data.status && data.message)
        {
            if (data.status == "success"){
                ms.success("登陆成功")
                userStore.setLoginState(true, name)
                window.location.reload()
            }
            else {
                ms.error(data.message)
            }
        }
        else
            ms.error(data.message)
    }
    catch (error: any) {
        ms.error("登陆失败")
    }
}

async function handleLogin() {
    // console.log(login_name.value.trim())
    // console.log(login_passwd.value.trim())
    if (!login_name.value.trim() || !login_passwd.value.trim()) {
        ms.error("用户名 or 密码不正确")
    }
    else if (!isTxTChecked.value){
        ms.error("请先阅读并勾选《软件免责说明》")
    }
    else {
        try {
            const { data } = await fetchUserLogin<SessionResponse>(login_name.value.trim(), login_passwd.value.trim())
            // console.log(data)
            // console.log(data.message)
            afterHandleLogin(login_name.value.trim(), data)
        }
        catch (error: any) {
            afterHandleLogin(login_name.value.trim(), error)
        }
    }

    // console.log("登陆")
}

async function handleVisitor() {
    if (!isTxTChecked.value){
        ms.error('请先阅读并勾选《软件免责说明》')
    }
    else
    {
        window.location.reload()
    }
}

</script>

<template>
    <NModal :show="visible"  style=" width: 400px; height: 400px;  position: relative;min-width: 400px;min-height: 400px;padding: 25px;">
        <div class="main-box">
        <div :class="['container', 'container-register', { 'is-txl': isLogin }]">
            <form>
            <h2 class="title">创建新用户</h2>
            <!-- <span class="text">{{ $t(register_tip) }}</span> -->
            <input class="form__input" type="text" placeholder="用户名" v-model="register_name"/>
            <input class="form__input" type="password" placeholder="密码" v-model="register_passwd1"/>
            <input class="form__input" type="password" placeholder="再次输入密码" v-model="register_passwd2"/>
            <input class="form__input" type="password" placeholder="激活码（必填）" v-model="register_code"/>
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <input type="checkbox" v-model="isTxTChecked">
                </div>
                <div class="flex space-x-4">
                    <button style="color: blue; font-weight: bold;" @click="txtshow = true">
                    点击阅读《软件免责声明》
                    </button>
                </div>
            </div>
            <div class="flex items-center justify-between">
                <div class="flex space-x-4">
                    <button style="color: blue; font-weight: bold;" @click="codeshow = true">
                    获取激活码
                    </button>
                </div>
            </div>
            <div class="primary-btn" @click="handleRegister">注册并登陆</div>
            <!-- <div class="primary-btn" @click="handleVisitor">跳过登陆,直接试用</div> -->
            </form>
        </div>
        <div :class="['container', 'container-login', { 'is-txl is-z200': isLogin }]">
            <form>
            <h2 class="title">用户登陆</h2>
            <!-- <span class="text">{{ $t(login_tip) }}</span> -->
            <input class="form__input" type="text" placeholder="用户名"  v-model="login_name"/>
            <input class="form__input" type="password" placeholder="密码"  v-model="login_passwd"/>
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <input type="checkbox" v-model="isTxTChecked">
                </div>
                <div class="flex space-x-4">
                    <button style="color: blue; font-weight: bold;" @click="txtshow = true">
                    点击阅读《软件免责声明》
                    </button>
                </div>
            </div>
            <div class="primary-btn" @click="handleLogin">登录</div>

            </form>
        </div>
        <div :class="['switch', { login: isLogin }]">
            <div class="switch__circle"></div>
            <div class="switch__circle switch__circle_top"></div>
            <div class="switch__container">
            <!-- <h2>{{ isLogin ? '注册!' : '登陆!' }}</h2> -->
            <!-- <p>
                {{
                isLogin
                    ? '输入您的账户信息，并与我们一起开始旅程'
                    : '请登录您的账户，开始旅程'
                }}
            </p> -->
            <div class="primary-btn" @click="isLogin = !isLogin">
                {{ isLogin ? '没有账号,立即注册' : '已有账号,\n立即登录' }}
            </div>
            <div class="primary-btn" @click="handleVisitor">
                跳过登陆,直接试用
            </div>
            </div>
        </div>
        </div>
    </NModal>
<template>
    <registerDesc v-model:visible="codeshow" />
    <registerTxT v-model:visible="txtshow" />
</template>

</template>

<style lang="scss" scoped>
.main-box {
  position: relative;
  width: 400px;
  min-width: 400px;
  min-height: 400px;
  height: 400px;
  padding: 25px;
  background-color: #ecf0f3;
  box-shadow: 10px 10px 10px #d1d9e6, -10px -10px 10px #f9f9f9;
  border-radius: 12px;
  overflow: hidden;
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    width: 400px;
    height: 100%;
    padding: 25px;
    background-color: #ecf0f3;
    transition: all 1.25s;
    form {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      width: 100%;
      height: 100%;
      color: #a0a5a8;
      .title {
        font-size: 34px;
        font-weight: 700;
        line-height: 3;
        color: #181818;
      }
      .text {
        margin-top: 30px;
        margin-bottom: 12px;
      }
      .form__input {
        width: 200px;
        height: 40px;
        margin: 4px 0;
        padding-left: 25px;
        font-size: 13px;
        letter-spacing: 0.15px;
        border: none;
        outline: none;
        // font-family: 'Montserrat', sans-serif;
        background-color: #ecf0f3;
        transition: 0.25s ease;
        border-radius: 8px;
        box-shadow: inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #f9f9f9;
        // &::placeholder {
        //   color: #a0a5a8;
        // }
      }
    }
  }
  .container-register {
    z-index: 100;
    left: calc(100% - 330px);
  }
  .container-login {
    left: calc(100% - 350px);
    margin-left: -80px;
    z-index: 0;
  }
  .is-txl {
    left: 0;
    transition: 1.25s;
    transform-origin: right;
  }
  .is-z200 {
    z-index: 200;
    transition: 1.25s;
  }
  .switch {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 150px;
    padding: 50px;
    z-index: 200;
    transition: 1.25s;
    background-color: #ecf0f3;
    overflow: hidden;
    box-shadow: 4px 4px 10px #d1d9e6, -4px -4px 10px #f9f9f9;
    color: #a0a5a8;
    .switch__circle {
      position: absolute;
      width: 400px;
      height: 200px;
      border-radius: 50%;
      background-color: #ecf0f3;
      box-shadow: inset 8px 8px 12px #d1d9e6, inset -8px -8px 12px #f9f9f9;
      bottom: -60%;
      left: -60%;
      transition: 1.25s;
    }
    .switch__circle_top {
      top: -30%;
      left: 60%;
      width: 200px;
      height: 300px;
    }
    .switch__container {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      position: absolute;
      width: 150px;
      padding: 50px 55px;
      transition: 1.25s;
      h2 {
        font-size: 34px;
        font-weight: 700;
        line-height: 3;
        color: #181818;
      }
      p {
        font-size: 14px;
        letter-spacing: 0.25px;
        text-align: center;
        line-height: 1.6;
      }
    }
  }
  .login {
    left: calc(100% - 150px);
    .switch__circle {
      left: 0;
    }
  }
  .primary-btn {
    width: 150px;
    height: 40px;
    border-radius: 25px;
    margin-top: 40px;
    text-align: center;
    line-height: 40px;
    font-size: 14px;
    letter-spacing: 2px;
    background-color: #4b70e2;
    color: #f9f9f9;
    cursor: pointer;
    box-shadow: 8px 8px 16px #d1d9e6, -8px -8px 16px #f9f9f9;
    &:hover {
      box-shadow: 4px 4px 6px 0 rgb(255 255 255 / 50%),
        -4px -4px 6px 0 rgb(116 125 136 / 50%),
        inset -4px -4px 6px 0 rgb(255 255 255 / 20%),
        inset 4px 4px 6px 0 rgb(0 0 0 / 40%);
    }
  }
}
</style>
