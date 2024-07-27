import { createAuth0 } from "@auth0/auth0-vue";
import { production, development } from "../../auth-config.json";

let config = production;

if (window.location.host == "localhost:8080") config = development;

export default createAuth0({
  domain: config.domain,
  clientId: config.client_id,
  authorizationParams: {
    audience: config.audience,
    redirect_uri: window.location.origin,
  },
});
