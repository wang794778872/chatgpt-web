<script setup lang='ts'>
import type { CSSProperties } from "vue";
import { computed, ref, watch } from "vue";
import {
  NButton,
  NLayoutSider,
  NCollapse,
  NCollapseItem,
  useMessage,
  resultDark,
} from "naive-ui";
// import { NButton, NLayoutSider, NDialog, NSelect, NCollapse } from 'naive-ui'
import List from "./List.vue";
import Footer from "./Footer.vue";
import { useAppStore, useChatStore } from "@/store";
// import { useAppStore, useChatStore, useUserStore } from '@/store'
import { useUserStore } from "@/store";
import { useBasicLayout } from "@/hooks/useBasicLayout";
import { PromptStore } from "@/components/common";
import PersonalCenter from "../PersonalCenter/index.vue";
import { fetchMemberInfo } from "@/api";

import Swal from "sweetalert2";
// import { copyText } from '@/utils/format'

const appStore = useAppStore();
const chatStore = useChatStore();

const { isMobile } = useBasicLayout();
const show = ref(false);
const showPerson = ref(false);

const userStore = useUserStore();
const isLogin = computed(() => Boolean(userStore.userInfo.is_login));
const collapsed = computed(() => appStore.siderCollapsed);
const cur_model = computed(() => chatStore.getModelByUuid(chatStore.active));

const ms = useMessage();

interface SessionResponse {
  status: string;
  message: string;
  data: any;
}
const wxQRCodeUrl =
  "https://www.aifuturecome.com/wp-content/uploads/2023/05/我的.png";

async function handleGPT4Info() {
  console.log("handleGPT4Info");
  const result = await Swal.fire({
    title: "您还不能使用GPT4！",
    html: `
				<div class="p-4 space-y-5 min-h-[200px] text-center">
						扫描下面二维码添加好友，获得专属激活码激活后，可正常使用此功能
						<div>
								<img src="${wxQRCodeUrl}" alt="QR Code" class="mx-auto">
						</div>
				</div>
        `,
    showCancelButton: false,
    confirmButtonText: "确认",
    position: "top",
    toast: true,
    preConfirm: () => {
      return [];
    },
  });
}

async function handleverifyGPT4() {
  const userStore = useUserStore();
  try {
    const { data } = await fetchMemberInfo<SessionResponse>(
      userStore.userInfo.member_id
    );
    console.log("12333", data.data.gpt4_everyday_count);
    if (
      data.data.gpt4_everyday_count == 0 ||
      data.data.gpt4_everyday_count == undefined
    ) {
      return false;
    }
    return true;
  } catch (error: any) {
    if (
      error.data.gpt4_everyday_count != undefined &&
      error.data.gpt4_everyday_count > 0
    ) {
      return true;
    }
    console.log(error);
    return false;
  }
}

let availGPT4: boolean = false;

async function handleAdd() {
  console.log("handleAdd");
  const result = await Swal.fire({
    title: "请选择",
    html: `
            <div>
            模型：
            <select id="selectBox1" class="swal2-input">
                <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                <option value="gpt-4">gpt-4</option>
            </select>
						</div>
						<div>
						名称：
            <input id="inputBox1" class="swal2-input" value="New Chat">
            </input>
            </div>
        `,
    showCancelButton: true,
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    position: "top",
    toast: true,
    preConfirm: () => {
      return [
        document.getElementById("selectBox1").value,
        document.getElementById("inputBox1").value,
      ];
    },
  });
  if (result && result.isConfirmed == true) {
    console.log(`您选择模型： ${result.value[0]}`);
    if (result.value[0] == "gpt-4") {
      if ((await handleverifyGPT4()) == false) {
        handleGPT4Info();
        console.log("111111111");
        return;
      }
    }
    console.log(`您选择名称： ${result.value[1]}`);
    chatStore.addHistory({
      title: result.value[1],
      uuid: Date.now(),
      isEdit: false,
      model: result.value[0],
    }); //'gpt-3.5-turbo'
    if (isMobile.value) appStore.setSiderCollapsed(true);
  } else {
    console.log("取消创建聊天");
  }
}

async function handleGpt4() {
  availGPT4 = await handleverifyGPT4();
  if (availGPT4 == false) await handleGPT4Info();
  //ms.error("不支持gpt-4模型");
  console.log("333333333", availGPT4, collapsed.value);
  //appStore.setSiderCollapsed(!collapsed.value);
}

function handleUpdateCollapsed() {
  appStore.setSiderCollapsed(!collapsed.value);
}

const getMobileClass = computed<CSSProperties>(() => {
  if (isMobile.value) {
    return {
      position: "fixed",
      zIndex: 50,
    };
  }
  return {};
});

const mobileSafeArea = computed(() => {
  if (isMobile.value) {
    return {
      paddingBottom: "env(safe-area-inset-bottom)",
    };
  }
  return {};
});

watch(
  isMobile,
  (val) => {
    appStore.setSiderCollapsed(val);
  },
  {
    immediate: true,
    flush: "post",
  }
);

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
    <div class="flex flex-col" :style="mobileSafeArea">
      <main class="flex flex-col flex-1 min-h-0 overflow-auto">
        <div class="p-4">
          <NButton dashed block @click="handleAdd">
            {{ $t("chat.newChatButton") }}
          </NButton>
        </div>
        <NCollapse default-expanded-names="1" accordion>
          <div
            class="collapse-container"
            style="height: 340px; overflow-y: auto"
          >
            <NCollapseItem
              :title="
                cur_model === 'gpt-3.5-turbo'
                  ? `【正在使用】GPT-3.5`
                  : 'GPT-3.5'
              "
              name="1"
            >
              <List gptmodel="gpt-3.5-turbo" />
            </NCollapseItem>
            <NCollapseItem
              :title="cur_model === 'gpt-4' ? `【正在使用】GPT-4` : 'GPT-4'"
              name="2"
              @click="handleGpt4"
            >
              <template v-if="availGPT4">
                <List gptmodel="gpt-4" />
              </template>
            </NCollapseItem>
          </div>
        </NCollapse>
      </main>
      <div class="p-4">
        <NButton block @click="show = true">
          {{ $t("store.siderButton") }}
        </NButton>
        <NButton block>
          <a href="https://www.aifuturecome.com/" target="_blank">{{
            $t("store.gpthome")
          }}</a>
        </NButton>
        <NButton v-if="isLogin" block @click="showPerson = true">
          {{ $t("store.personalCenter") }}
        </NButton>
        <NButton v-else block @click="showPerson = true">
          {{ $t("store.personalLogin") }}
        </NButton>
      </div>
      <Footer />
    </div>
  </NLayoutSider>
  <template v-if="isMobile">
    <div
      v-show="!collapsed"
      class="fixed inset-0 z-40 bg-black/40"
      @click="handleUpdateCollapsed"
    />
  </template>
  <PromptStore v-model:visible="show" />
  <PersonalCenter v-model:visible="showPerson" />
</template>

