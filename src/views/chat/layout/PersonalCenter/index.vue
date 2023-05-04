<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NModal, NTabPane, NTabs } from 'naive-ui'
import { SvgIcon } from '@/components/common'
import { useUserStore } from '@/store'
// import { t } from '@/locales'
import Person from './Person.vue'
import UserLogin from '../UserLogin.vue'
import codeActive from './codeActive.vue'
import codeAbout from './codeAbout.vue'

interface Props {
    visible: boolean
}

interface Emit {
    (e: 'update:visible', visible: boolean): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const active = ref('Person')

const userStore = useUserStore()

const isLogin = computed(() => Boolean(userStore.userInfo.is_login))


const show = computed({
    get() {
        return props.visible
    },
    set(visible: boolean) {
        emit('update:visible', visible)
    },
})
</script>

<template>
    <div v-if="!isLogin">
        <UserLogin :visible="show" />
    </div>
    <div v-else>
        <NModal  v-model:show="show" :auto-focus="false" preset="card" style="width: 95%; max-width: 640px">
            <div>
                <NTabs v-model:value="active" type="line" animated>
                    <NTabPane name="Person" tab="Person">
                        <template #tab>
                            <SvgIcon class="text-lg" icon="ri:file-user-line" />
                            <span class="ml-2">{{ $t('store.personalCenter') }}</span>
                        </template>
                        <div class="min-h-[100px]">
                            <Person />
                        </div>
                    </NTabPane>
                    <NTabPane name="codeActive" tab="codeActive">
                        <template #tab>
                            <SvgIcon class="text-lg" icon="ri:file-user-line" />
                            <span class="ml-2">{{ $t('store.codeActive') }}</span>
                        </template>
                        <div class="min-h-[100px]">
                            <codeActive />
                        </div>
                    </NTabPane>
                    <NTabPane name="codeAbout" tab="codeAbout">
                        <template #tab>
                            <SvgIcon class="text-lg" icon="ri:file-user-line" />
                            <span class="ml-2">{{ $t('store.codeAbout') }}</span>
                        </template>
                        <div class="min-h-[100px]">
                            <codeAbout />
                        </div>
                    </NTabPane>
                </NTabs>
            </div>
        </NModal>
    </div>
</template>
