import { RouteRecordRaw } from "vue-router";
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

export default routes;
