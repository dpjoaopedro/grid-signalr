import { Component, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BlotterService } from '../blotter.service';
import { ConnectionServiceService } from '../connection-service.service';
import { Operation } from '../models/operation';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-control-panel',
  imports: [FormsModule],
  templateUrl: './control-panel.component.html',
  styleUrl: './control-panel.component.css',
})
export class ControlPanelComponent implements OnDestroy {
  interval = 1000;
  connection = inject(ConnectionServiceService).getConnection();
  notificationService = inject(NotificationService);
  blotterService = inject(BlotterService);
  autoSendInterval: any = null;

  newOperation: string = JSON.stringify(
    {
      id: 1,
      type: 'buy',
      amount: 100,
      description: 'Sample operation',
      value: 50.5,
    },
    null,
    2
  );

  changeValueOperation: string = JSON.stringify(
    {
      id: 1,
      value: 75.5,
    },
    null,
    2
  );

  toggleNotifications(event: Event) {
    const input = event.target as HTMLInputElement;
    this.connection.invoke('ToggleNotification', input.checked);
  }

  ngOnDestroy(): void {
    this.stopAutoSend();
  }

  sendOperation() {
    try {
      const operation = JSON.parse(this.newOperation);
      operation.date = new Date();
      this.connection.invoke('SendOperation', operation);
    } catch (err) {
      console.error('Invalid JSON:', err);
    }
  }

  startAutoSend() {
    if (this.interval < 100) return;
    this.stopAutoSend();

    this.autoSendInterval = setInterval(() => {
      const operation = this.generateOperation();
      this.connection
        .invoke('SendOperation', operation)
        .catch((err) => console.error(err));
    }, this.interval);
  }

  stopAutoSend() {
    if (this.autoSendInterval) {
      clearInterval(this.autoSendInterval);
      this.autoSendInterval = null;
    }
  }

  isAutoSending(): boolean {
    return this.autoSendInterval !== null;
  }

  changeValue() {
    try {
      const changeOp = JSON.parse(this.changeValueOperation);
      this.connection.invoke('ChangeOperationValue', changeOp);
    } catch (err) {
      console.error('Invalid JSON:', err);
    }
  }

  generateOperation(): Operation {
    const types = ['Buy', 'Sell', 'Trade'];
    const statuses = ['Pending', 'Completed', 'Cancelled'];
    const currencies = ['USD', 'EUR', 'GBP', 'JPY'];
    const markets = ['NYSE', 'NASDAQ', 'LSE', 'TSE'];
    const traders = ['John', 'Alice', 'Bob', 'Carol'];
    const categories = ['Stocks', 'Bonds', 'Forex', 'Crypto'];

    return {
      id: this.blotterService.operationCounter++,
      type: types[Math.floor(Math.random() * types.length)],
      amount: Math.floor(Math.random() * 1000),
      date: new Date(),
      description: 'Auto generated operation',
      value: parseFloat((Math.random() * 100).toFixed(2)),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      currency: currencies[Math.floor(Math.random() * currencies.length)],
      market: markets[Math.floor(Math.random() * markets.length)],
      fee: parseFloat((Math.random() * 100).toFixed(2)),
      traderName: traders[Math.floor(Math.random() * traders.length)],
      quantity: Math.floor(Math.random() * 1000) + 1,
      price: parseFloat((Math.random() * 1000).toFixed(2)),
      category: categories[Math.floor(Math.random() * categories.length)],
      isActive: Math.random() > 0.5,
      priority: Math.floor(Math.random() * 5) + 1,
    };
  }
}
