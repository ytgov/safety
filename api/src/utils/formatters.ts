import moment from "moment";
import _, { isDate } from "lodash";
import { DateTime } from "luxon";
import markdownit from "markdown-it";

import { DB_CLIENT } from "../config";
import { db as knex } from "../data";

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
  let containsNewlines = RegExp(/.*\n/g).test(input);
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

export function InsertableDate(input: string | null) {
  if (input) {
    let date = new Date();

    if (isDate(input)) date = input;

    let jsD = DateTime.fromJSDate(new Date(input));
    let isD = DateTime.fromISO(input);

    if (jsD.isValid) date = jsD.toJSDate();
    if (isD.isValid) date = isD.toJSDate();

    if (DB_CLIENT == "oracledb") {
      console.log("CONVERTING FOR ORACLE", input);

      return knex.raw(
        `TO_TIMESTAMP('${DateTime.fromJSDate(date).toFormat("yyyy-MM-dd HH:mm:ss")}', 'YYYY-MM-DD HH24:MI:SS')`
      );
    }

    return date;
  }

  return null;
}
