import { authGuard } from "@auth0/auth0-vue";
import { RouteLocation, RouteRecordRaw } from "vue-router";
import { useUserStore } from "@/store/UserStore";

const routes: RouteRecordRaw[] = [
  {
    path: "administration",
    component: () => import("../views/Dashboard.vue"),
    meta: {
      requireSystemAdmin: true,
    },
  },
  {
    path: "administration/users",
    component: () => import("../modules/users/views/UserList.vue"),
    meta: {
      requireSystemAdmin: true,
    },
  },
];

export async function waitForUserToLoad(): Promise<any> {
  let u = useUserStore();
  await u.initialize();
  return u.user;
}

export default routes;
