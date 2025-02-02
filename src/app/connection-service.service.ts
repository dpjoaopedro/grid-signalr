import { inject, Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BlotterService } from './blotter.service';
import { Operation } from './models/operation';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class ConnectionServiceService {
  private readonly connection: signalR.HubConnection;
  blotterService = inject(BlotterService);
  notificationService = inject(NotificationService);
  clientId!: string;

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5235/pricer')
      .withAutomaticReconnect([0, 2000, 10000, 30000]) // Add retry intervals
      .build();

    this.startConnection();
    this.setupSignalRConnection();
  }

  getConnection() {
    return this.connection;
  }

  private startConnection() {
    this.connection.start().catch((err) => {
      console.error('Failed to connect with SignalR:', err);
      setTimeout(() => this.startConnection(), 5000); // Retry after 5 seconds
    });
  }

  setupSignalRConnection() {
    this.connection.onreconnecting((error) => {
      console.warn(`Connection lost due to error "${error}". Reconnecting.`);
    });

    this.connection.onreconnected((connectionId) => {
      console.log(
        `Connection reestablished. Connected with connectionId "${connectionId}".`
      );
    });

    this.connection.onclose((error) => {
      console.error(
        `Connection closed due to error "${error}". Attempting to reconnect.`
      );
      setTimeout(() => this.startConnection(), 5000); // Retry after 5 seconds
    });

    this.connection.on('ReceiveConnectionId', (connectionId: string) => {
      this.clientId = connectionId;
    });

    this.connection.on(
      'ReceiveInitialOperations',
      (operations: Operation[]) => {
        this.blotterService.setInitialOperations(operations);
      }
    );

    this.connection.on('ReceiveOperation', (operation: Operation) => {
      this.blotterService.setNewOperation(operation);
    });

    this.connection.on(
      'ReceiveChangeOperationValue',
      (changeOp: Partial<Operation>) => {
        this.blotterService.updateOperation(changeOp);
      }
    );

    this.connection.on(
      'NotificationToggled',
      (enabled: boolean) => {
        console.log('Notification enabled:', enabled);
        this.notificationService.setNotificationsEnabled(enabled);
      }
    );
  }
}
