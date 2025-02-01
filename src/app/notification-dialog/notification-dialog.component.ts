import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-notification-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isVisible" class="notification-overlay">
      <div class="notification-content">
        <p>Operation {{operationId}} was updated but is currently filtered out</p>
        <p>Value: {{ value }}</p>
        <button (click)="hide()">Dismiss</button>
      </div>
    </div>
    `,
  styles: [`
    .notification-overlay {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
    }
    .notification-content {
      background: #333;
      color: white;
      padding: 15px;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    button {
      background: #666;
      border: none;
      color: white;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
    }
  `]
})
export class NotificationDialogComponent {
  isVisible = false;
  operationId?: number;
  value?: number;

  show(data: { id: number, value: number }) {
    this.operationId = data.id;
    this.value = data.value;
    this.isVisible = true;
    setTimeout(() => this.hide(), 5000); // Auto-hide after 5 seconds
  }

  hide() {
    this.isVisible = false;
  }
}
