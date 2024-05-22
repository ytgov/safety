export interface User {
  EMAIL: string;
  USER_ID: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  STATUS: UserStatus;
  IS_ADMIN: boolean | string;
  YNET_ID: string;
  CREATE_DATE: Date;
  ROLE: string;

  display_name?: string;
  surveys?: number[];
}

export enum UserStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}

export interface User_Create {
  EMAIL: string;
  USER_ID: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  STATUS: UserStatus;
  CREATE_DATE: Date;
  IS_ADMIN: string;
  ROLE: string;
}

export interface User_Update {
  FIRST_NAME: string;
  LAST_NAME: string;
  STATUS: UserStatus;
  YNET_ID: string;
  ROLE: string;
  USER_ID?: string;
}

export interface UserRole {
  email: string;
  role: string;
}

export class UserHelper {
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
