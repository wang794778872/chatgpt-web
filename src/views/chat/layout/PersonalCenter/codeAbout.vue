<script lang="ts" setup>
import { ref } from 'vue'
// import { ref, computed } from 'vue'

const wxQRCodeUrl = ref('https://s1.locimg.com/2023/05/04/5825fc6f9b82b.png')

</script>
<template>
    <div class="p-4 space-y-5 min-h-[200px] text-center">
        扫描下面二维码添加好友，获得专属激活码
        <div>
            <img :src="wxQRCodeUrl" alt="QR Code" class="mx-auto">
        </div>
    </div>
</template>
