import { acceptHMRUpdate, defineStore } from "pinia";
import { useApiStore } from "./ApiStore";
import { ACTION_URL } from "@/urls";
import { isArray, isEmpty, isNil } from "lodash";

export const useActionStore = defineStore("actions", {
  state: () => ({
    actions: [] as Action[],
    selectedAction: null as Action | null,
    totalCount: 0,
    isLoading: false,
  }),
  getters: {},
  actions: {
    async initialize() {
      console.log("Initializing Action Store");
    },

    async loadActions({
      page,
      perPage,
      search,
      status,
      review,
    }: {
      page: number | null;
      perPage: number | null;
      search: string | null;
      status: string | null;
      review: number | null;
    }) {
      this.isLoading = true;

      this.actions = [];
      this.totalCount = 0;

      const api = useApiStore();

      let queryUrl = `${ACTION_URL}?page=${page}&perPage=${perPage}&`;

      if (!isEmpty(search)) queryUrl += `search=${search}&`;
      if (!isNil(status)) queryUrl += `status=${status}&`;
      if (!isNil(review)) queryUrl += `review=${review}&`;

      return api.secureCall("get", queryUrl).then((resp) => {
        this.actions = resp.data;
        this.totalCount = resp.totalCount;
        this.isLoading = false;
        return resp.data;
      });
    },

    select(item: Action) {
      this.selectedAction = item;
    },

    async loadAction(slug: string) {
      this.isLoading = true;
      const api = useApiStore();

      return api.secureCall("get", `${ACTION_URL}/${slug}`).then((resp) => {
        this.selectedAction = resp.data;
        this.isLoading = false;
        return resp.data;
      });
    },

    async saveAction(action: Action) {
      if (!action) return;

      const api = useApiStore();

      if (action.id) {
        return api
          .secureCall("put", `${ACTION_URL}/${action.slug}`, action)
          .then((resp) => {
            this.loadAction(action.slug);
          })
          .catch(() => {
            console.log(`Error in save action`);
          });
      } else {
        return api
          .secureCall("post", `${ACTION_URL}`, action)
          .then((resp) => {
            //this.loadAction(action.slug);
          })
          .catch(() => {
            console.log(`Error in create action`);
          });
      }
    },

    async deleteAction(action: any) {
      if (!action || !action.id) return;

      const api = useApiStore();

      return api
        .secureCall("delete", `${ACTION_URL}/${action.slug}`)
        .then((resp) => resp)
        .catch(() => {
          console.log(`Error in delete action`);
        });
    },

    async completeAction(action: any) {
      if (!action || !action.id) return;
      const api = useApiStore();

      return api
        .secureCall("put", `${ACTION_URL}/${action.slug}/complete`, {
          control: action.control,
          notes: action.notes,
        })
        .then((resp) => {
          this.loadAction(action.slug);
        })
        .catch(() => {
          console.log(`Error in complete action`);
        });
    },

    async revertAction(action: any) {
      if (!action || !action.id) return;

      const api = useApiStore();

      return api
        .secureCall("put", `${ACTION_URL}/${action.slug}/revert`)
        .then((resp) => {
          this.loadAction(action.slug);
        })
        .catch(() => {
          console.log(`Error in revert action`);
        });
    },

    async hazardAction(action: any) {
      if (!action || !action.id) return;

      const api = useApiStore();

      return api
        .secureCall("put", `${ACTION_URL}/${action.slug}/hazard`, action)
        .then((resp) => {
          this.loadAction(action.slug);
        })
        .catch(() => {
          console.log(`Error in revert action`);
        });
    },
  },
});

export interface Action {
  id: number;
  slug: string;
  hazard_id?: number;
  incident_id?: number;
  creator_user_id?: number;
  creator_role_type_id?: number;
  actor_user_id?: number;
  actor_user_email?: string;
  actor_role_type_id?: number;
  created_at: Date;
  modified_at?: Date;
  due_date?: Date;
  description: string;
  action_type_code: string;
  sensitivity_code?: string;
  status_code?: string;
  notes?: string;
  complete_date?: Date;
  complete_name?: string;
  complete_user_id?: number;
  control: string;
  hazard_review: number;
  categories?: string[] | string;

  type?: ActionType;
  status?: ActionStatus;
  actor_display_name?: string;
  incident_slug?: string;
}

export interface ActionType {
  code: string;
  name: string;
  description: string;
}

export interface ActionStatus {
  code: string;
  name: string;
  description: string;
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useActionStore, import.meta.hot));
}
