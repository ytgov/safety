import * as config from "./config";

export const LOGIN_URL = `${config.apiBaseUrl}/api/auth/login`;
export const AUTH_CHECK_URL = `${config.apiBaseUrl}/api/auth/isAuthenticated`;
export const LOGOUT_URL = `${config.apiBaseUrl}/api/auth/logout`;
export const PROFILE_URL = `${config.apiBaseUrl}/api/user/me`;

export const USERS_URL = `${config.apiBaseUrl}/api/user`;
export const REPORTS_URL = `${config.apiBaseUrl}/api/reports`;
export const INSPECTIONS_URL = `${config.apiBaseUrl}/api/inspections`;
export const OFFLINEREPORTS_URL = `${config.apiBaseUrl}/api/offline-reports`;
export const DIRECTORY_URL = `${config.apiBaseUrl}/api/directory`;

export const DEPARTMENT_URL = `${config.apiBaseUrl}/api/department`;
export const ROLE_URL = `${config.apiBaseUrl}/api/role`;
export const LOCATION_URL = `${config.apiBaseUrl}/api/location`;
export const INSPECTION_LOCATION_URL = `${config.apiBaseUrl}/api/inspection-location`;
export const DATA_INJECTION_URL = `${config.apiBaseUrl}/api/data-injection`;
export const DATA_INJECTION_SOURCE_URL = `${config.apiBaseUrl}/api/data-injection-source`;
export const ATTACHMENT_URL = `${config.apiBaseUrl}/api/attachment`;
export const HAZARD_URL = `${config.apiBaseUrl}/api/hazard`;
export const ACTION_URL = `${config.apiBaseUrl}/api/action`;
export const COMMITTEE_URL = `${config.apiBaseUrl}/api/committees`;
