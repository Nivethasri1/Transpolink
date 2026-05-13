import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { NotificationRequest, NotificationResponse } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private base = environment.apiUrl;

  private _unreadCount = new BehaviorSubject<number>(0);
  unreadCount$ = this._unreadCount.asObservable();

  constructor(private http: HttpClient) {}

  send(req: NotificationRequest) {
    return this.http.post<NotificationResponse>(`${this.base}/notifications`, req);
  }

  getAll() {
    return this.http.get<NotificationResponse[]>(`${this.base}/notifications`).pipe(
      tap(list => this._unreadCount.next(list.filter(n => n.status === 'UNREAD').length))
    );
  }

  getByUser(userId: number) {
    return this.http.get<NotificationResponse[]>(`${this.base}/notifications/user/${userId}`).pipe(
      tap(list => this._unreadCount.next(list.filter(n => n.status === 'UNREAD').length))
    );
  }

  getUnreadByUser(userId: number) {
    return this.http.get<NotificationResponse[]>(`${this.base}/notifications/user/${userId}/unread`);
  }

  markAsRead(id: number) {
    return this.http.patch<NotificationResponse>(`${this.base}/notifications/${id}/read`, {}).pipe(
      tap(() => {
        const current = this._unreadCount.getValue();
        if (current > 0) this._unreadCount.next(current - 1);
      })
    );
  }

  refreshUnreadCount(userId: number): void {
    this.getByUser(userId).subscribe(notifications => {
      this._unreadCount.next(notifications.filter(n => n.status === 'UNREAD').length);
    });
  }
}
