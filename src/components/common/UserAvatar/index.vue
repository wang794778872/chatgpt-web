<script setup lang='ts'>
import { computed } from 'vue'
import { NAvatar } from 'naive-ui'
import { useUserStore } from '@/store'
import defaultAvatar from '@/assets/avatar.jpg'
import { isString } from '@/utils/is'

const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)

</script>

<template>
    <div class="flex items-center overflow-hidden">
    <div class="w-10 h-10 overflow-hidden rounded-full shrink-0">
        <template v-if="isString(userInfo.avatar) && userInfo.avatar.length > 0">
            <NAvatar
            size="large"
            round
            :src="userInfo.avatar"
            :fallback-src="defaultAvatar"
        />
        </template>
        <template v-else>
            <NAvatar size="large" round :src="defaultAvatar" />
        </template>
    </div>

    <div style="display: flex; flex-wrap: wrap;">
        <div v-if="userInfo.available_num < 999" style="flex-basis: 100%; display: flex; margin-top: 5px;">
            <span style="flex-basis: 0; flex-grow: 1; min-width: 0;">剩余对话次数： {{ userInfo.available_num }}</span>
        </div>
        <div style="flex-basis: 100%; display: flex; margin-top: 5px;">
            <span style="flex-basis: 0; flex-grow: 1; min-width: 0;font-size: 8px;color: blue;">{{ $t('store.gpthometip') }}</span>
        </div>
        <!-- <div v-if="userInfo.available_num < 999" style="flex-basis: 100%; display: flex; margin-top: 5px;">
            <span style="flex-basis: 0; flex-grow: 1; min-width: 0;font-size: 8px;color: blue;">{{ $t('store.copyShareLinkTip') }}</span>
        </div> -->
    </div>
    </div>
</template>
