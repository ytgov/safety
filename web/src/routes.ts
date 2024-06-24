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
      {
        path: "report-a-hazard",
        component: () => import("@/components/hazard/CreatePage.vue"),
      },
      {
        path: "report-an-incident",
        component: () => import("@/components/incident/CreatePage.vue"),
      },
      {
        path: "report-an-incident/complete",
        component: () => import("@/components/incident/CreateCompletePage.vue"),
      },
      {
        path: "reports/:id",
        component: () => import("@/components/incident/DetailsPage.vue"),
      },

      {
        path: "sign-in",
        component: () => import("@/modules/authentication/views/SignIn.vue"),
      },
    ],
  },

  /*  {
    path: "/sign-in",
    component: () => import("@/layouts/Blank.vue"),
    children: [
      {
        path: "",
        component: () => import("@/modules/authentication/views/SignIn.vue"),
      },
    ],
  }, */

  ...adminRoutes,

  {
    path: "/:pathMatch(.*)*",
    name: "Not Found",
    component: () => import("@/views/NotFound.vue"),
  },
];

import { AuthHelper } from "@/plugins/auth";
import { useUserStore } from "@/store/UserStore";

async function requireLogin(to: RouteLocation): Promise<boolean | string> {
  let auth = AuthHelper;
  let hasAuth = await authGuard(to);

  if (hasAuth) {
    return true;
  }

  return "/";
}

export async function waitForUserToLoad(): Promise<any> {
  let u = useUserStore();
  await u.initialize();
  return u.user;
}

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
