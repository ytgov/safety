namespace Express {
  export interface Request {
    user?: any;
    store?: any;
    oidc?: any;
    auth?: any;

    isAuthenticated(): boolean;
  }
}
