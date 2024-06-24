import { UserRole } from "./user-role-model";

export interface User {
  id: number;
  email: string;
  auth_subject: string;
  first_name: string;
  last_name: string;
  display_name: string;
  title: string;
  department: string;
  division: string;
  branch: string;
  unit: string;
  is_active: boolean | string;

  roles?: UserRole[];
}

export interface User_Create {
  email: string;
  auth_subject: string;
  first_name: string;
  last_name: string;
  display_name: string;
  title: string;
  department: string;
  division: string;
  branch: string;
  unit: string;
  is_active: boolean | string;
}

export interface User_Update {
  auth_subject: string;
  first_name: string;
  last_name: string;
  display_name: string;
  title: string;
  department: string;
  division: string;
  branch: string;
  unit: string;
  is_active: boolean | string;
}

/* export class UserHelper {
  fromDTO(dto: any): User {
    return {
      EMAIL: dto.EMAIL,
      USER_ID: dto.USER_ID,
      FIRST_NAME: dto.FIRST_NAME,
      LAST_NAME: dto.LAST_NAME,
      STATUS: dto.STATUS,
      IS_ADMIN: dto.IS_ADMIN,
      YNET_ID: dto.YNET_ID,
      CREATE_DATE: dto.CREATE_DATE,
      ROLE: dto.ROLE,
    };
  }
}
 */
