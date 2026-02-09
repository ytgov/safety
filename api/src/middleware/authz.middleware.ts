import { NextFunction, Request, Response } from "express";
import { expressjwt as jwt } from "express-jwt";
import axios from "axios";
import jwksRsa, { type GetVerificationKey } from "jwks-rsa";
import { AUTH0_DOMAIN, AUTH0_AUDIENCE } from "../config";
import { UserService } from "../services";

console.log(AUTH0_AUDIENCE, AUTH0_DOMAIN);

export const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${AUTH0_DOMAIN}/.well-known/jwks.json`,
  }) as GetVerificationKey,

  // Validate the audience and the issuer.
  audience: AUTH0_AUDIENCE,
  issuer: [`${AUTH0_DOMAIN}/`],
  algorithms: ["RS256"],
});

export async function loadUser(req: Request, res: Response, next: NextFunction) {
  const db = new UserService();

  let sub = req.auth.sub;
  const token = req.headers.authorization || "";
  let u = await db.getBySub(sub);

  if (u) {
    req.user = { ...req.auth, ...u };
    return next();
  }

  await axios
    .get(`${AUTH0_DOMAIN}/userinfo`, { headers: { authorization: token } })
    .then(async (resp: any) => {
      if (resp.data && resp.data.sub) {
        console.log("Userinfo response", resp.data);

        let email = resp.data.email;
        let first_name = resp.data.given_name;
        let last_name = resp.data.family_name;
        sub = resp.data.sub;

        let u = await db.getBySub(sub);

        if (u) {
          req.user = { ...req.auth, ...u };
        } else {
          if (!email) email = `${first_name}.${last_name}@yukon-no-email.ca`;

          let e = await db.getByEmail(email);
          console.log("EMAIL", email, e);

          if (e && e.auth_subject == email) {
            // If the user exists but the auth_subject is not set, update it
            req.user = { ...req.auth, ...e };

            await db.update(e.id, {
              auth_subject: sub,
              first_name: e.first_name,
              last_name: e.last_name,
              display_name: `${first_name} ${last_name}`,
              department: "",
              division: "",
              branch: "",
              unit: "",
              is_active: 1,
              title: "",
            });

            return next();
          } else if (e) {
            // If the user exists but the auth_subject is different, update it
            req.user = { ...req.auth, ...e };

            await db.update(e.id, {
              auth_subject: sub,
              first_name: e.first_name,
              last_name: e.last_name,
              display_name: `${first_name} ${last_name}`,
            });

            return next();
          }

          let newUser = {
            email: email,
            auth_subject: sub,
            first_name: first_name,
            last_name: last_name,
            display_name: `${first_name} ${last_name}`,
            department: "",
            division: "",
            branch: "",
            unit: "",
            is_active: 1,
            title: "",
          };

          await db.create(newUser);
          req.user = { ...req.user, ...newUser };
        }
      } else {
        console.log("Payload from Auth0 is strange or failed for", req.auth);
      }

      if (!req.user) {
        // the user doesn't exist in the database yet, therefore not authorize
        return res.status(401).send("Not Authorized");
      }

      next();
    })
    .catch((err: any) => {
      console.log("ERROR pulling userinfo", err);
    });
}
