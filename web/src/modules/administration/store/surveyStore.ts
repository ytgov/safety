import { defineStore } from "pinia";
//import { SURVEY_URL } from "@/urls";
import { useApiStore } from "@/store/ApiStore";

const SURVEY_URL = ""

export const useAdminSurveyStore = defineStore("adminSurvey", {
  state: () => ({
    survey: { survey: {}, questions: [] },
    isLoading: false,
  }),
  actions: {
    async initialize() {},

    async loadSurvey(id: any) {
      this.isLoading = true;
      let api = useApiStore();

      await api
        .call("get", `${SURVEY_URL}/${id}`)
        .then((resp) => {
          this.setSurvey(resp.data);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },

    async loadSurveyPreview(id: any) {
      this.isLoading = true;
      let api = useApiStore();

      await api
        .call("get", `${SURVEY_URL}/${id}/preview`)
        .then((resp) => {
          this.setSurvey(resp.data);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },

    setSurvey(value: any) {
      for (let q of value.questions) {
        q.answer = null;
        q.isValid = () => {
          if (q.OPTIONAL == 1) return true;
          let trimAnswer = `${q.answer}`.replace("null", "").trim();
          if (trimAnswer && trimAnswer.length > 0) return true;
          return false;
        };
      }

      this.survey = value;
    },
  },
});
