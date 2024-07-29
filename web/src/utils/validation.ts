export const requiredRule = (value: string) => {
  if (value) return true;
  return "This field is required.";
};

export const emailRule = (value: string) => {
  if (/.+@.+\..+/.test(value)) return true;

  return "E-mail must be valid.";
};
