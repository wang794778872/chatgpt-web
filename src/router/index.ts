import type { App } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import { setupPageGuard } from './permission'
import { ChatLayout } from '@/views/chat/layout'
// const Chat = defineAsyncComponent(() => import('@/views/chat/index.vue'));
import { useUserStore } from '@/store'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Root',
    component: ChatLayout,
    redirect: '/chat',
    children: [
      {
        path: '/chat/:uuid?',
        name: 'Chat',
        component: () => import('@/views/chat/index.vue'),
      },
    ],
  },

  {
    path: '/share/:share_key?',
    name: 'shareChat',
    beforeEnter: (to, from, next) => {
        const shareKey = to.params.share_key  as string;
        // console.log(to.params);
        if (shareKey) {
            // console.log(`获取到的分享密钥为：${shareKey}`);
            const userStore = useUserStore()
            userStore.updateUserInfo({ shared_id: shareKey })
            to.params.share_key = shareKey;
        }
        next();
    },
    component: ChatLayout,
    // redirect: '/chat',
    children: [
        {
          path: '/chat/:uuid?',
          name: 'Chat',
          component: () => import('@/views/chat/index.vue'),
        },
      ],
    // props:true,
  },

  {
    path: '/404',
    name: '404',
    component: () => import('@/views/exception/404/index.vue'),
  },
  {
    path: '/500',
    name: '500',
    component: () => import('@/views/exception/500/index.vue'),
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    redirect: '/404',
  },

]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

setupPageGuard(router)

export async function setupRouter(app: App) {
  app.use(router)
  await router.isReady()
}
