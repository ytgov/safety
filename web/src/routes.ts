import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

import adminRoutes from "@/modules/administration/router";
import { authGuard } from "@auth0/auth0-vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/layouts/DefaultNoAuth.vue"),
    children: [
      {
        path: "",
        component: () => import("@/views/Home.vue"),
        meta: {
          requiresAuth: false,
        },
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
        path: "report-an-incident-offline",
        component: () => import("@/components/incident/CreatePageOffline.vue"),
        meta: {
          requiresAuth: false,
        },
      },
      {
        path: "report-an-incident/complete",
        component: () => import("@/components/incident/CreateCompletePage.vue"),
      },
      {
        path: "report-an-incident-offline/complete",
        component: () => import("@/components/incident/CreateCompletePageOffline.vue"),
        meta: {
          requiresAuth: false,
        },
      },
      {
        path: "actions",
        component: () => import("@/components/action/ActionListPage.vue"),
      },
      {
        path: "actions/:id",
        component: () => import("@/components/action/ActionPage.vue"),
      },
      {
        path: "reports",
        component: () => import("@/components/report/ReportListPage.vue"),
      },
      {
        path: "reports/:id",
        component: () => import("@/components/incident/DetailsPage.vue"),
      },
      {
        path: "inspections",
        component: () => import("@/components/inspection/InspectionListPage.vue"),
      },
      {
        path: "inspections/:id",
        component: () => import("@/components/inspection/InspectionDetailsPage.vue"),
      },
      {
        path: "task/:id",
        component: () => import("@/components/incident/TaskDetailsPage.vue"),
      },

      {
        path: "inspection",
        component: () => import("@/components/inspection/CreateInspectionPage.vue"),
      },

      {
        path: "hazard-library",
        component: () => import("@/components/hazard-library/HazardListPage.vue"),
      },

      {
        path: "sign-in",
        component: () => import("@/modules/authentication/views/SignIn.vue"),
        meta: {
          requiresAuth: false,
        },
      },

      ...adminRoutes,

      {
        path: "/:pathMatch(.*)*",
        name: "Not Found",
        component: () => import("@/views/NotFound.vue"),
        meta: {
          requiresAuth: false,
        },
      },
    ],
  },
];

import { useUserStore } from "@/store/UserStore";

export async function waitForUserToLoad(): Promise<any> {
  let u = useUserStore();
  await u.initialize();
  return u;
}

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth === false) {
    console.log("route allowed - no auth required");
    return true;
  }

  console.log("Await authGuard");
  const isAuthenticated = await authGuard(to);

  if (isAuthenticated) {
    console.log("You are authenticated");

    if (to.meta.requireSystemAdmin) {
      const u = await waitForUserToLoad();
      console.log("User Is Admin", u.isSystemAdmin);
      return u.isSystemAdmin;
    }

    console.log(" route allowed");
    return true;
  }

  console.log("You are NOT authenticated - route blocked");
  return false;
});
