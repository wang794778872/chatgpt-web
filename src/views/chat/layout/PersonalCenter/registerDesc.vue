<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NModal, NTabPane, NTabs } from 'naive-ui'
import { SvgIcon } from '@/components/common'
// import { t } from '@/locales'
import codeAbout from './codeAbout.vue'

interface Props {
    visible: boolean
}

interface Emit {
    (e: 'update:visible', visible: boolean): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const active = ref('codeAbout')

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
    <div>
        <NModal  v-model:show="show" :auto-focus="false" preset="card" style="width: 95%; max-width: 640px">
            <div>
                <NTabs v-model:value="active" type="line" animated>
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
