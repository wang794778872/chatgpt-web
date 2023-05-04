<script setup lang='ts'>
import type { CSSProperties } from 'vue'
import { computed, ref, watch } from 'vue'
import { NButton, NLayoutSider } from 'naive-ui'
import List from './List.vue'
import Footer from './Footer.vue'
import { useAppStore, useChatStore } from '@/store'
// import { useAppStore, useChatStore, useUserStore } from '@/store'
import { useUserStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { PromptStore } from '@/components/common'
import PersonalCenter from '../PersonalCenter/index.vue'
// import Swal  from 'sweetalert2'
// import { copyText } from '@/utils/format'

const appStore = useAppStore()
const chatStore = useChatStore()

const { isMobile } = useBasicLayout()
const show = ref(false)
const showPerson = ref(false)

const userStore = useUserStore()
const isLogin = computed(() => Boolean(userStore.userInfo.is_login))
const collapsed = computed(() => appStore.siderCollapsed)

function handleAdd() {
  chatStore.addHistory({ title: 'New Chat', uuid: Date.now(), isEdit: false })
  if (isMobile.value)
    appStore.setSiderCollapsed(true)
}

function handleUpdateCollapsed() {
  appStore.setSiderCollapsed(!collapsed.value)
}

const getMobileClass = computed<CSSProperties>(() => {
  if (isMobile.value) {
    return {
      position: 'fixed',
      zIndex: 50,
    }
  }
  return {}
})

const mobileSafeArea = computed(() => {
  if (isMobile.value) {
    return {
      paddingBottom: 'env(safe-area-inset-bottom)',
    }
  }
  return {}
})

watch(
  isMobile,
  (val) => {
    appStore.setSiderCollapsed(val)
  },
  {
    immediate: true,
    flush: 'post',
  },
)

// const userStore = useUserStore()




</script>
<template>
  <NLayoutSider
    :collapsed="collapsed"
    :collapsed-width="0"
    :width="260"
    :show-trigger="isMobile ? false : 'arrow-circle'"
    collapse-mode="transform"
    position="absolute"
    bordered
    :style="getMobileClass"
    @update-collapsed="handleUpdateCollapsed"
  >
    <div class="flex flex-col h-full" :style="mobileSafeArea">
      <main class="flex flex-col flex-1 min-h-0">
        <div class="p-4">
          <NButton dashed block @click="handleAdd">
            {{ $t('chat.newChatButton') }}
          </NButton>
        </div>
        <div class="flex-1 min-h-0 pb-4 overflow-hidden">
          <List />
        </div>
        <div class="p-4">
            <NButton block @click="show = true">
                {{ $t('store.siderButton') }}
            </NButton>
            <NButton block>
                <a href="https://www.aifuturecome.com/" target="_blank">{{ $t('store.gpthome') }}</a>
            </NButton>
            <NButton v-if='isLogin'  block @click="showPerson = true">
                {{ $t('store.personalCenter') }}
            </NButton>
            <NButton v-else  block @click="showPerson = true">
                {{ $t('store.personalLogin') }}
            </NButton>
        <!-- </div>
        <div class="p-4"> -->
            <!-- <NButton block @click="copyLink">
                {{ $t('store.copyShareLink') }}
            </NButton> -->
        </div>
      </main>
      <Footer />
    </div>
  </NLayoutSider>
  <template v-if="isMobile">
    <div v-show="!collapsed" class="fixed inset-0 z-40 bg-black/40" @click="handleUpdateCollapsed" />
  </template>
  <PromptStore v-model:visible="show" />
  <PersonalCenter v-model:visible="showPerson" />
</template>

