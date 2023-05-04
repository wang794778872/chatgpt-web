<script lang="ts" setup>
import { ref } from 'vue'
// import { ref, computed } from 'vue'
import { NButton, NInput, useMessage } from 'naive-ui'
import { useUserStore } from '@/store'
import { fetchCodeActive } from '@/api'

interface SessionResponse {
    status: string
    message: string
    data: string
}

const message = useMessage()
const codeValue = ref('')


async function afterhandleActive(data: any) {
    if (data && data.status && data.status == 'success'){
        message.success("激活成功")
    }
    else{
        message.error("激活失败")
    }
}

async function handleActive() {
    const userStore = useUserStore()
    if (!userStore.userInfo.member_id) {
        message.error("激活失败，用户未登陆")
    }
    console.log("handleMemberInfo", userStore.userInfo.member_id)
    try {
        const { data } = await fetchCodeActive<SessionResponse>(userStore.userInfo.member_id, codeValue.value.trim())
        console.log("handleMemberInfo", data)
        return afterhandleActive(data)
    }
    catch (error: any) {
        console.log(error)
        return afterhandleActive(error)
    }
}

</script>

<template>
    <div class="p-4 space-y-5 min-h-[200px]">
    <div class="space-y-6">
        <div class="flex items-center space-x-4">
            <span class="flex-shrink-0 w-[100px]">激活码</span>
            <div class="flex-1">
            <NInput v-model:value="codeValue" type="text" />
            </div>
            <NButton size="tiny" text type="primary" @click="handleActive">
                激活
            </NButton>
        </div>
    </div>
    </div>
</template>
