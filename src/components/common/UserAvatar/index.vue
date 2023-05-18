<script setup lang='ts'>
import { ref, computed } from 'vue'
import { NAvatar } from 'naive-ui'
import { useUserStore } from '@/store'
import defaultAvatar from '@/assets/avatar.jpg'
import { isString } from '@/utils/is'
// import Swal  from 'sweetalert2'
// import { copyText } from '@/utils/format'
import PersonalCenter from '@/views/chat/layout/PersonalCenter/index.vue'

const showPerson = ref(false)
const userStore = useUserStore()

// const message = useMessage()

const userInfo = computed(() => userStore.userInfo)
// function copyLink() {
//     const url =window.location.href
//     const index = url.indexOf('#');
//     const domain = url.substring(0, index); 
//     const link = `${domain}#/share/${userStore.userInfo.id}` // 指定要复制的链接
//     if (navigator.clipboard?.writeText)
//         navigator.clipboard.writeText(link)
//     else
//         copyText({ text: link, origin: true })
//     message.info('已复制专属链接，快去分享给朋友一起体验吧！')
//     // Swal.fire({
//     //     title: '',
//     //     text: '已复制专属链接，快去分享给朋友一起体验吧！',
//     //     timer: 3000, // 设置自动关闭时间为3秒
//     //     // icon: 'success',
//     //     showCancelButton: false,
//     //     confirmButtonText: 'OK',
//     //     allowOutsideClick: true,
//     //     allowEscapeKey: true,
//     //     allowEnterKey: true,
//     //     toast: true,
//     //     position: 'top',
//     //     customClass: {
//     //         container: 'my-swal-container-class',
//     //         popup: 'my-swal-popup-class'
//     //     }
//     // })
// }

</script>
<style>
.my-swal-container-class {
  z-index: 1002;
}

.my-swal-popup-class {
  z-index: 1003;
}
</style>

<template>
    <div class="flex items-center overflow-hidden">
    <div class="w-10 h-10 overflow-hidden rounded-full shrink-0">
        <template v-if="isString(userInfo.avatar) && userInfo.avatar.length > 0">
            <NAvatar
            size="large"
            round
            :src="userInfo.avatar"
            :fallback-src="defaultAvatar"
            @click="showPerson = true"
        />
        </template>
        <template v-else>
            <NAvatar size="large" round :src="defaultAvatar" />
        </template>
    </div>

    <div style="display: flex; flex-wrap: wrap;">
        <div v-if="userInfo.is_login == true" style="flex-basis: 100%; display: flex; margin-top: 5px;">
            <span style="flex-basis: 0; flex-grow: 1; min-width: 0;"> Hi， {{ userInfo.member_id }}</span>
        </div>
        <div v-if="userInfo.is_login == false" style="flex-basis: 100%; display: flex; margin-top: 5px;">
            <span style="flex-basis: 0; flex-grow: 1; min-width: 0;">  剩余对话次数： {{ userInfo.available_num }}</span>
        </div>
        <!-- <div style="flex-basis: 100%; display: flex; margin-top: 5px;">
            <span style="flex-basis: 0; flex-grow: 1; min-width: 0;font-size: 8px;color: blue;">{{ $t('store.gpthometip') }}</span>
        </div> -->
        <div v-if="userInfo.is_login == false" style="flex-basis: 100%; display: flex; margin-top: 5px;color: rgb(59, 183, 80);">
            如果您有更多使用的需要，请加微信：<br>AI-publishing
        </div>
    </div>
    </div>
    <PersonalCenter v-model:visible="showPerson" />
</template>
