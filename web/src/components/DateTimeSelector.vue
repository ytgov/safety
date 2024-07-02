<template>
  <div class="top" :class="has_focus ? 'hf' : ''">
    <div style="position: absolute; z-index: 22; height: 5px !important; width: 100%; top: -1px">
      <div class="inlay">
        <label>{{ label }}</label>
      </div>
    </div>
    <VueDatePicker
      v-model="output"
      format="yyyy/MM/dd h:mm a"
      :teleport="true"
      :auto-apply="true"
      :text-input="true"
      :enable-time-picker="true"
      :max-date="max"
      :min-date="min"
      @open="has_focus = true"
      @closed="has_focus = false"
      @update:model-value=""
      :readonly="isReadonly"
      :clearable="false"
      position="left"
      :is-24="false"
      required
      :action-row="{ showCancel: false }"
      placeholder="YYYY/MM/DD HH:MM am" />
  </div>
</template>

<script>
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

export default {
  props: ["modelValue", "label", "max", "readonly", "min"],
  components: { VueDatePicker },
  computed: {},
  data() {
    return {
      output: null,
      has_focus: false,
      isReadonly: false,
    };
  },
  mounted() {
    if (this.modelValue) {
      this.output = this.modelValue;
    }
    if (this.readonly && this.readonly == true) this.isReadonly = true;
  },
  watch: {
    output(to, from) {
      this.$emit("input", this.output);
      this.$emit("update:modelValue", this.output);
    },
  },
};
</script>

<style>
.hf label {
  opacity: 1;
}
.inlay label {
  color: rgb(50, 50, 50);
  opacity: 0.6;
  font-size: 12px;
  position: relative;
  top: -8px;
}

.top {
  border: 1px #ffffff00 solid;
  position: relative;
  top: -1px;
  left: -1px;
}

.inlay {
  background-color: white !important;
  margin-left: 12px;
  margin-top: -1px;
  padding: 0 4px;
  height: 10px;
  display: inline-block;
  position: relative;
}

.dp__input_wrap input {
  padding: 12px 16px 12px 34px;
  background-color: white;
  border: 1px #b0b0b0 solid;
  font-family: "Courier New", Courier, monospace;
  font-size: 16px;
  color: #323232;
}

.hf .dp__input_wrap input {
  border: 2px rgb(50, 50, 50) solid;
  padding: 11px 15px 11px 33px;
}
</style>
