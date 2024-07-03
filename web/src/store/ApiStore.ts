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

  const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

  async function secureCall(method: string, url: string, data?: any) {
    let response;

    if (auth.isLoading.value != false) {
      for (let i = 0; i < 30; i++) {
        await timer(200);
        if (auth.isLoading.value != true) break;
      }
    }

    if (!auth.isAuthenticated.value) {
      console.log("Not Authenticated");
      response = { error: "Not Authenticated" };
      throw Error("Not Authenticated");
    }

    response = await auth.getAccessTokenSilently().then(async (token) => {
      return await SecureAPICall(method, token)
        .request({ url, data })
        .then((res) => {
          if (res.data.messages && res.data.messages.length > 0) {
            for (const message of res.data.messages) {
              m.notify(message);
            }
          }

          return res.data;
        })
        .catch((err) => {
          doApiErrorMessage(err);
          return { error: err };
        });
    });

    return response;
  }

  async function secureUpload(method: string, url: string, data?: any) {
    let response;
    /* if (!auth.isAuthenticated.value) {
      console.log("Not Authenticated");
      response = { error: "Not Authenticated" };
      return;
    } */
    response = await auth.getAccessTokenSilently().then(async (token) => {
      return await SecureAPICall(method, token)
        .request({ url, data, headers: { "Content-Type": "multipart/form-data" } })
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
    secureUpload,
    secureCall,
    call,
  };
});

// hot reloading for this store
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useApiStore, import.meta.hot));
}
