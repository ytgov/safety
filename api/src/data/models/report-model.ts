export interface Report {
  id: number;
  email: string;
  createDate: Date;
  date: Date;
  description: string;
  eventType: string;
  generalLocation: string;
  specificLocation: string;
  supervisorNotified: boolean;
  status: string;
}
