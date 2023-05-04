<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NButton, NInput, NModal, useMessage } from 'naive-ui'
import { fetchVerify } from '@/api'
import { useAuthStore, useUserStore } from '@/store'
import Icon403 from '@/icons/403.vue'

interface SessionResponse {
  secret_num: number
}

interface Props {
  visible: boolean
}

defineProps<Props>()

const userStore = useUserStore()
const authStore = useAuthStore()

const ms = useMessage()

const loading = ref(false)
const token = ref('')

const disabled = computed(() => !token.value.trim() || loading.value)

async function handleVerify() {
  const secretKey = token.value.trim()

  if (!secretKey)
    return

  try {
    loading.value = true
    const { data } = await fetchVerify<SessionResponse>(secretKey)
    // authStore.setToken(secretKey)
    // console.log(data)
    if (data.secret_num > 0)
    {
        authStore.setToken(userStore.userInfo.id)
        if (userStore.userInfo.available_num < 0)
            userStore.userInfo.available_num = data.secret_num
        else
            userStore.userInfo.available_num += data.secret_num // 密钥验证通过给20条
        userStore.updateUserInfo({ available_num: userStore.userInfo.available_num })
        ms.success('success')
        window.location.reload()
    }
    else
        throw new Error('密钥无效 | Secret key is invalid')
  }
  catch (error: any) {
    ms.error(error.message ?? 'error')
    authStore.removeToken()
    token.value = ''
  }
  finally {
    loading.value = false
  }
}

function handlePress(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleVerify()
  }
}
</script>

<template>
  <NModal :show="visible" style="width: 90%; max-width: 640px">
    <div class="p-10 bg-white rounded dark:bg-slate-800">
      <div class="space-y-4">
        <header class="space-y-2">
          <h2 class="text-2xl font-bold text-center text-slate-800 dark:text-neutral-200">
            403
          </h2>
          <p class="text-base text-center text-slate-500 dark:text-slate-500">
            {{ $t('common.unauthorizedTips') }}
          </p>
          <Icon403 class="w-[200px] m-auto" />
        </header>
        <NInput v-model:value="token" type="password" placeholder="" @keypress="handlePress" />
        <NButton
          block
          type="primary"
          :disabled="disabled"
          :loading="loading"
          @click="handleVerify"
        >
          {{ $t('common.verify') }}
        </NButton>
      </div>
    </div>
  </NModal>
</template>
