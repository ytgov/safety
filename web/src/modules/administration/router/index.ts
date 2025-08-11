import { RouteRecordRaw } from "vue-router";

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
  {
    path: "administration/locations",
    component: () => import("@/modules/administration/modules/locations/views/LocationList.vue"),
    meta: {
      requireSystemAdmin: true,
    },
  },
  {
    path: "administration/injest-data",
    component: () =>
      import("@/modules/administration/modules/data-ingestions/views/DataIngestionList.vue"),
    meta: {
      requireSystemAdmin: true,
    },
  },
  {
    path: "administration/committees",
    component: () => import("@/modules/administration/modules/committees/views/CommitteeList.vue"),
    meta: {
      requireSystemAdmin: true,
    },
  },
  {
    path: "administration/committees/:id",
    component: () => import("@/modules/administration/modules/committees/views/CommitteeEdit.vue"),
    meta: {
      requireSystemAdmin: true,
    },
  },
  {
    path: "administration/inspection-locations",
    component: () =>
      import("@/modules/administration/modules/inspection-locations/views/LocationList.vue"),
    meta: {
      requireSystemAdmin: true,
    },
  },
];

export default routes;
