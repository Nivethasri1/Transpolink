export type NotificationCategory = 'INCIDENT' | 'TRANSPORT' | 'COMPLIANCE';
export type NotificationStatus = 'UNREAD' | 'READ' | 'DISMISSED';

export interface NotificationRequest {
  userId: number;
  entityId?: number;
  message: string;
  category: NotificationCategory;
}

export interface NotificationResponse {
  notificationId: number;
  userId: number;
  entityId: number;
  message: string;
  category: NotificationCategory;
  status: NotificationStatus;
  createdDate: string;
}
