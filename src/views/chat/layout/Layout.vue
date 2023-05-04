<script setup lang='ts'>
import { computed } from 'vue'
import { NLayout, NLayoutContent } from 'naive-ui'
import { useRouter } from 'vue-router'
import Sider from './sider/index.vue'
import UserLogin from './UserLogin.vue'
// import Permission from './Permission.vue'
import { useBasicLayout } from '@/hooks/useBasicLayout'
// import { useAppStore, useAuthStore, useChatStore, useUserStore } from '@/store'
import { useAppStore, useChatStore, useUserStore } from '@/store'

const router = useRouter()
const appStore = useAppStore()
const chatStore = useChatStore()
// const authStore = useAuthStore()
const userStore = useUserStore()

router.replace({ name: 'Chat', params: { uuid: chatStore.active } })

const { isMobile } = useBasicLayout()

const collapsed = computed(() => appStore.siderCollapsed)

// const needPermission1 = computed(() => !!authStore.session?.auth && !authStore.token)
// const needPermission = computed(() => (!!authStore.session?.auth && !authStore.token) || (userStore.userInfo.is_login == false && userStore.userInfo?.available_num < 0))
const needLogin = computed(() => (userStore.userInfo.is_login == false && !userStore.userInfo.id))

const getMobileClass = computed(() => {
  if (isMobile.value)
    return ['rounded-none', 'shadow-none']
  return ['border', 'rounded-md', 'shadow-md', 'dark:border-neutral-800']
})

const getContainerClass = computed(() => {
  return [
    'h-full',
    { 'pl-[260px]': !isMobile.value && !collapsed.value },
  ]
})
</script>

<template>
  <div class="h-full dark:bg-[#24272e] transition-all" :class="[isMobile ? 'p-0' : 'p-4']">
    <div class="h-full overflow-hidden" :class="getMobileClass">
      <NLayout class="z-40 transition" :class="getContainerClass" has-sider>
        <Sider />
        <NLayoutContent class="h-full">
          <RouterView v-slot="{ Component, route }">
            <component :is="Component" :key="route.fullPath" />
          </RouterView>
        </NLayoutContent>
      </NLayout>
    </div>
    <!-- <Permission :visible="needPermission" /> -->
    <UserLogin :visible="needLogin" />
  </div>
</template>
