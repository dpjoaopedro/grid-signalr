import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  notificationsEnabled = signal(false);
  setNotificationsEnabled(enabled: boolean) {
    this.notificationsEnabled.set(enabled);
  }
}
