<script setup lang='ts'>
import type { CSSProperties } from 'vue'
import { computed, ref, watch } from 'vue'
import { NButton, NLayoutSider } from 'naive-ui'
// import { NButton, NLayoutSider, NDialog, NSelect } from 'naive-ui'
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

// async function handleAdd() {
//     const result = await Swal.fire({
//         title: '请选择',
//         html: `
//             <div>
//             模型：
//             <select id="selectBox1" class="swal2-input">
//                 <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
//                 <option value="gpt-4-turbo">gpt-4-turbo</option>
//             </select>
//             </div>
//         `,
//         // html: `
//         //     <div>
//         //     模型：
//         //     <select id="selectBox1" class="swal2-input">
//         //         <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
//         //         <option value="gpt-4-turbo">gpt-4-turbo</option>
//         //     </select>
//         //     </div>
//         //     <div>
//         //     角色：
//         //     <select id="selectBox2" class="swal2-input">
//         //         <option value="online">online</option>
//         //         <option value="debug">test</option>
//         //     </select>
//         //     </div>
//         // `,
//         showCancelButton: true,
//         confirmButtonText: '确认',
//         cancelButtonText: '取消',
//         position: 'top',
//         toast: true,
//         preConfirm: () => {
//             return [
//                         document.getElementById('selectBox1').value,
//                         "default"
//                         // document.getElementById('selectBox2').value
//                     ];
//         }
//     })
//     if (result && result.isConfirmed == true) {
//         console.log(`您选择模型： ${result.value[0]}`)
//         // console.log(`您选择角色： ${result.value[1]}`)
//         chatStore.addHistory({ title: 'New Chat', uuid: Date.now(), isEdit: false, model: result.value[0] })    //'gpt-3.5-turbo'
//         if (isMobile.value)
//             appStore.setSiderCollapsed(true)
//     }
//     else{
//         console.log('取消创建聊天')
//     }
// }


async function handleAdd() {
    chatStore.addHistory({ title: 'New Chat', uuid: Date.now(), isEdit: false, model: 'gpt-3.5-turbo' })    //'gpt-3.5-turbo'
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

