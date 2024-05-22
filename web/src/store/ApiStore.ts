import { defineStore, acceptHMRUpdate } from "pinia";
import { useNotificationStore } from "@/store/NotificationStore";
import { SecureAPICall, APICall } from "./helpers/axiosAPIConfig";
import { AuthHelper } from "@/plugins/auth";
import { router } from "@/routes";

//refs are reactive variables
//computed are reactive variables that are derived from other reactive variables
// functions are equivalent to methods/actions in vue2

export const useApiStore = defineStore("api", () => {
  const auth = AuthHelper;

  const m = useNotificationStore();

  function doApiErrorMessage(err: any) {
    if (!err) return;
    let status_code = 500;
    let text = err.message;

    if (err.response) {
      status_code = err.response.status || 500;
      if (err.response.data && err.response.data.message) text = err.response.data.message;
    }

    if (status_code == 403) {
      router.push("/NotAvailable");
      return;
    }
    if (status_code == 404) {
      router.push("/NotFound");
      return;
    }

    let message = {
      status_code: status_code,
      text,
      icon: "mdi-error",
      variant: "error",
    };
    m.notify(message);
  }

  async function secureCall(method: string, url: string, data?: any) {
    let response;
    /* if (!auth.isAuthenticated.value) {
      console.log("Not Authenticated");
      response = { error: "Not Authenticated" };
      return;
    } */
    response = await auth.getAccessTokenSilently().then(async (token) => {
      return await SecureAPICall(method, token)
        .request({ url, data })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          doApiErrorMessage(err);
          return { error: err };
        });
    });

    return response;
  }

  async function call(method: string, url: string, data?: any) {
    let response = await APICall(method)
      .request({ url, data })
      .then((res) => {
        doApiErrorMessage(res.data.error);
        return res.data;
      })
      .catch((err) => {
        doApiErrorMessage(err);
        return { error: err };
      });

    return response;
  }

  return {
    secureCall,
    call,
  };
});

// hot reloading for this store
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useApiStore, import.meta.hot));
}
