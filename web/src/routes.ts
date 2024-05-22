import { createRouter, createWebHistory, RouteLocation, RouteRecordRaw } from "vue-router";

import adminRoutes from "@/modules/administration/router";
import { authGuard, useAuth0 } from "@auth0/auth0-vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: () => import("@/layouts/DefaultNoAuth.vue"),
    children: [
      {
        path: "",
        component: () => import("@/views/Home.vue"),
      },
     
    ],
  },
  {
    path: "/sign-in",
    component: () => import("@/layouts/Blank.vue"),
    children: [
      {
        path: "",
        component: () => import("@/modules/authentication/views/SignIn.vue"),
      },
    ],
  },

  ...adminRoutes,

  {
    path: "/:pathMatch(.*)*",
    name: "Not Found",
    component: () => import("@/views/NotFound.vue"),
  },
];

import { AuthHelper } from "@/plugins/auth";

async function requireLogin(to: RouteLocation): Promise<boolean | string> {
  let auth = AuthHelper;
  let hasAuth = await authGuard(to);

  if (hasAuth) {
    return true;
  }

  return "/survey/not-found";
}

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
