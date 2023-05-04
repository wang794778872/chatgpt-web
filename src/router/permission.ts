import type { Router } from 'vue-router'
import { useAuthStoreWithout } from '@/store/modules/auth'
import { useUserStore } from '@/store'

export function setupPageGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStoreWithout()
    if (!authStore.session) {
      try {
        const userStore = useUserStore()
        // console.log("id", userStore.userInfo.id)
        const data = await authStore.getSession(userStore.userInfo.id)
        if (Number(data.ext_available_num) > 0) {
            if (userStore.userInfo.available_num < 0)
                userStore.updateUserInfo({ available_num: data.ext_available_num })
            else
                userStore.updateUserInfo({ available_num: userStore.userInfo.available_num+data.ext_available_num })
            // console.log("update available_num", userStore.userInfo.available_num)
        }

        if (String(data.auth) === 'false' && authStore.token)
          authStore.removeToken()
        if (to.path === '/500')
          next({ name: 'Root' })
        else
          next()
      }
      catch (error) {
        if (to.path !== '/500')
          next({ name: '500' })
        else
          next()
      }
    }
    else {
      next()
    }
  })
}
