import { authGuard } from "@auth0/auth0-vue";
import { RouteLocation } from "vue-router";
import { useUserStore } from "@/store/UserStore";

const routes = [
  {
    path: "/administration",
    component: () => import("@/layouts/Default.vue"),
    children: [
      {
        path: "",
        component: () => import("../views/Dashboard.vue"),
        beforeEnter: requireAccess,
        meta: {
          allow_admin: true,
        },
      },
      {
        path: "users",
        component: () => import("../modules/users/views/UserList.vue"),
        beforeEnter: requireAccess,
        meta: {
          require_admin: true,
        },
      },
    ],
  },
];

async function requireAccess(to: RouteLocation): Promise<boolean | string> {
  let hasAuth = await authGuard(to);
  if (!hasAuth) return false;

  let user = await waitForUserToLoad();

  if (user.STATUS != "Active") return "/NotAuthorized?Requires-Active";

  if (to.meta && to.meta.allow_admin && user.IS_ADMIN == "Y") return true;

  if (to.meta && to.meta.require_admin) {
    if (user.IS_ADMIN != "Y") return "/NotAuthorized?Requires-Admin";
    return true;
  }

  if (to.meta && to.meta.role) {
    if (user.ROLE == to.meta.role) return true;

    return "/NotAuthorized?Requires-" + to.meta.role;
  }

  return true;
}

export async function waitForUserToLoad(): Promise<any> {
  let u = useUserStore();
  await u.initialize();
  return u.user;
}

export default routes;
