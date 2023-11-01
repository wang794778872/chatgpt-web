<script lang="ts" setup>
// import { ref } from 'vue'
import { ref, computed } from "vue";
import { NButton } from "naive-ui";
import { useUserStore } from "@/store";
import { fetchMemberInfo } from "@/api";

interface SessionResponse {
  status: string;
  message: string;
  data: any;
}

async function afterhandleMemberInfo(data: any) {
  try {
    if (data.status == "success") {
      if (data.data.stop_time == 9999) {
        return { data: "会员永久有效" };
      } else if (data.data.stop_time > 9999) {
        const now: number = new Date().getTime();
        const date = new Date(data.data.stop_time); // 将毫秒级时间戳转换格式
        const year = date.getFullYear().toString().padStart(4, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const hour = date.getHours().toString().padStart(2, "0");
        const minute = date.getMinutes().toString().padStart(2, "0");
        const second = date.getSeconds().toString().padStart(2, "0");
        // console.log(date);
        let member_info = "";
        if (data.data.stop_time >= now) {
          member_info = `会员可使用至 ${year}-${month}-${day} ${hour}:${minute}:${second} (生效中)`;
        } else {
          member_info = `会员可使用至 ${year}-${month}-${day} ${hour}:${minute}:${second} (已过期)`;
        }
        if (data.data.avail_num > 0) {
          member_info += `\n其他可用对话${data.data.avail_num}次\n（使用规则：先按照时间使用，当过期后可消耗对话次数继续使用）`;
        }
        if (
          data.data.gpt4_everyday_count == 0 ||
          data.data.gpt4_everyday_count == undefined
        ) {
          member_info += `\n\n另外：\n无可用的gpt-4模型额度，请联系管理员获取专属激活码激活`;
        } else {
          member_info += `\n\n另外：\ngpt-4模型每天可对话${data.data.gpt4_everyday_count}次\n`;
          let today_avail_count = data.data.gpt4_everyday_count;
          console.log(
            data.data.gpt4_last_usetime,
            Math.floor(new Date().getTime() / 86400),
            data.data.gpt4_today_count
          );
          if (
            Math.floor(data.data.gpt4_last_usetime) ==
            Math.floor(new Date().getTime() / 86400)
          )
            today_avail_count -= data.data.gpt4_today_count;
          member_info += `\ngpt-4模型今天剩余可对话${today_avail_count}次\n`;
        }
        return { data: member_info };
      } else if (data.data.avail_num > 0) {
        return { data: `其他可用对话${data.data.avail_num}次` };
      } else {
        return { data: "会员额度已用完" };
      }
    }
  } catch (error: any) {
    console.log(error);
  }
  return { data: "" };
}

async function handleMemberInfo() {
  const userStore = useUserStore();
  // console.log("handleMemberInfo", userStore.userInfo.member_id)
  try {
    const { data } = await fetchMemberInfo<SessionResponse>(
      userStore.userInfo.member_id
    );
    // console.log("handleMemberInfo", data)
    return afterhandleMemberInfo(data);
  } catch (error: any) {
    // console.log(error)
    return afterhandleMemberInfo(error);
  }
}

const member_info = ref("");

const tmp_member_info = computed(async () => {
  try {
    const result = await handleMemberInfo();
    // console.log("handleMemberInfo", result.data)
    member_info.value = result.data;
    return result.data;
  } catch (error) {
    member_info.value = error.data;
    // console.log(error);
    return error.data;
  }
});

function handleQuit() {
  const userStore = useUserStore();
  userStore.setLoginState(false, "");
  window.location.reload();
}
</script>

<template>
  <div class="p-4 space-y-5 min-h-[200px]">
    <div class="space-y-6">
      <!-- <div v-if="member_info" class="flex items-center space-x-4">
            {{ member_info }}
        </div> -->
      <div class="flex items-center space-x-4 whitespace-pre-wrap">
        {{ tmp_member_info ? member_info : "" }}
      </div>
      <div class="flex items-center space-x-4">
        <NButton size="small" @click="handleQuit"> 退出账号 </NButton>
      </div>
    </div>
  </div>
</template>
