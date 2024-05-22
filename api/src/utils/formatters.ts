import moment from "moment";
import _ from "lodash";
import markdownit from "markdown-it";

export function FormatDate(input: Date): string {
  return moment(input).format("YYYY-MM-DD");
}

export function FormatMoney(amount: number): string {
  return Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function CleanDouble(input: any): number {
  let output = _.replace(input, new RegExp(",", "g"), "");
  output = _.replace(output, new RegExp("\\$", "g"), "");
  output = _.replace(output, new RegExp("-", "g"), "");

  return Number(output);
}

export function CleanInteger(input: any): number {
  return Math.round(CleanDouble(input));
}

export function RenderMarkdown(input: string): { output: string; isMarkdown: boolean } {
  let containsNewlines = RegExp(/.*\n/g).test(input)
  let containsHash = input.includes("#");

  if (containsNewlines || containsHash) {
    return {
      output: markdownit({
        html: true,
        linkify: true,
        typographer: true,
      }).render(input),
      isMarkdown: true,
    };
  }

  return { output: input, isMarkdown: false };
}
