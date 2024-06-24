import axios from "axios";
import moment from "moment";
import { AD_CLIENT_ID, AD_CLIENT_SECRET, AD_TENANT_ID } from "../config";

const AD_SCOPE = "https://graph.microsoft.com/.default";

export class DirectoryService {
  connected = false;
  token = "";
  authHeader = {};
  validUntil = moment();

  constructor() {}

  async connect(): Promise<any> {
    if (this.connected) return;

    let body = `client_id=${AD_CLIENT_ID}&scope=${AD_SCOPE}&client_secret=${AD_CLIENT_SECRET}&grant_type=client_credentials`;

    return axios
      .post(`https://login.microsoftonline.com/${AD_TENANT_ID}/oauth2/v2.0/token`, body, {
        headers: { "Content-type": "application/x-www-form-urlencoded" },
      })
      .then((resp) => {
        this.token = resp.data.access_token;
        this.authHeader = { Authorization: `Bearer ${this.token}`, ConsistencyLevel: "eventual" };
        this.connected = true;
        this.validUntil = moment().add(resp.data.expires_in, "seconds");
      })
      .catch((error) => {
        console.error("GRAPH ERROR: ", error);
      });
  }

  async search(terms: string): Promise<any> {
    if (terms && terms.length > 3) {
      if (moment().isAfter(this.validUntil)) {
        this.connected = false;
        await this.connect();

        if (!this.connected) return [];
      }

      let pieces = terms.replace(".", " ").replace("&", " ").split(" ");
      let queryStmts = new Array<string>();

      for (let piece of pieces) {
        piece = piece.trim();

        if (piece == "") continue;

        queryStmts.push(
          `(startsWith(givenName,'${piece}') or startsWith(surname,'${piece}') or startsWith(userprincipalname,'${piece}') or startsWith(jobTitle, '${piece}') )`
        );
      }

      const selectStmt =
        "&$select=surname,givenName,department,userPrincipalName,mail,jobTitle,officeLocation,division,manager";

      return axios
        .get<AzureADUserGetResponse>(
          `https://graph.microsoft.com/v1.0/users?$count=true&$filter=${queryStmts.join(" AND ")} ${selectStmt}`,
          { headers: this.authHeader }
        )
        .then((resp) => {
          if (resp.data && resp.data.value) {
            let list = new Array<any>();

            for (let dir of resp.data.value) {
              // get rid of results for external people like contractors
              if (dir.userPrincipalName.toLowerCase().endsWith("xnet.gov.yk.ca")) continue;
              if (dir.userPrincipalName.toLowerCase().endsWith("yukongovernment.onmicrosoft.com")) continue;
              if (dir.userPrincipalName.toLowerCase().endsWith("-susp@ynet.gov.yk.ca")) continue;
              if (dir.userPrincipalName.toLowerCase().startsWith("admin")) continue;
              if ((dir.jobTitle || "").toLowerCase() == "yg contractor") continue;

              let long_name = `${dir.givenName} ${dir.surname} (${dir.userPrincipalName
                .toLowerCase()
                .replace("@ynet.gov.yk.ca", "")})`;
              let title = "Unknown title";

              if (dir.department) {
                long_name += ` ${dir.department}`;
              } else dir.department = "Unknown department";

              if (dir.jobTitle) {
                long_name += ` :  ${dir.jobTitle}`;
                title = dir.jobTitle;
              }

              list.push({
                display_name: `${dir.givenName} ${dir.surname}`,
                first_name: dir.givenName,
                last_name: dir.surname,
                ynet_id: dir.userPrincipalName.toLowerCase().replace("@ynet.gov.yk.ca", ""),
                email: dir.mail,
                long_name,
                title,
                department: dir.department,
                officeLocation: dir.officeLocation,
                userPrincipalName: dir.userPrincipalName.toLowerCase(),
              });
            }

            return list;
          }
        })
        .catch((error) => {
          console.log("GRAPH ERROR", error);
          return [];
        });
    }

    return [];
  }
}

export interface AzureADGroupGetResponse {
  value: AzureADGroup[];
}

export interface AzureADUserGetResponse {
  value: AzureADUser[];
}

export interface AzureADGroup {
  id: string;
  displayName: string;
  members: AzureADUser[];
}

export interface AzureADUser {
  id: string;
  givenName: string;
  surname: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  jobTitle: string;
  department: string;
  officeLocation: string;
}
