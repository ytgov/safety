namespace Express {
  export interface Request {
    user?: any;
    store?: any;
    oidc?: any;
    auth?: any;
    files: any | any[];

    isAuthenticated(): boolean;
  }
}
