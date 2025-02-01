import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as signalR from '@microsoft/signalr';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridApi, RowStyle, themeQuartz } from 'ag-grid-community';
import { Operation } from './models/operation';
import { NotificationDialogComponent } from './notification-dialog/notification-dialog.component';

import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

// Register all community features
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule,
    NotificationDialogComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild(NotificationDialogComponent)
  notificationDialog!: NotificationDialogComponent;

  private connection: signalR.HubConnection;
  private gridApi!: GridApi;
  clientId: string | null = null;
  operations: Operation[] = [];
  operationsMap = new Map<string | number, Operation>();
  operationCounter = 1;
  autoSendInterval: any = null;
  interval = 1000;
  showControlPanel = true;
  notificationsEnabled = false; // Add this property
  showOperations = false; // Add this line after other property declarations

  theme = themeQuartz.withParams({
    headerHeight: "30px",
    headerTextColor: "white",
    headerBackgroundColor: "black",
    headerCellHoverBackgroundColor: "rgba(80, 40, 140, 0.66)",
    headerCellMovingBackgroundColor: "rgb(80, 40, 140)",
  });

  rowStyle: RowStyle = { background: 'black' };
  getRowStyle = (params: any) => {
    if (params.data.status === 'Pending') {
      return { color: 'orange' };
    } else if (params.data.status === 'Completed') {
      return { color: 'green' };
    } else if (params.data.status === 'Cancelled') {
      return { color: 'red' };
    }
    return undefined;
  };

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

  // Add grid configuration
  columnDefs: ColDef[] = [
    { field: 'id', sortable: true, filter: true, sort: 'desc' },
    { field: 'type', sortable: true, filter: true },
    { field: 'amount', sortable: true, filter: true },
    { field: 'value', sortable: true, filter: true },
    { field: 'description', sortable: true, filter: true },
    {
      field: 'date',
      sortable: true,
      filter: true,
      valueFormatter: (params) => new Date(params.value).toLocaleString(),
    },
    { field: 'status', sortable: true, filter: true },
    { field: 'currency', sortable: true, filter: true },
    { field: 'market', sortable: true, filter: true },
    { field: 'fee', sortable: true, filter: true },
    { field: 'traderName', sortable: true, filter: true },
    { field: 'quantity', sortable: true, filter: true },
    { field: 'price', sortable: true, filter: true },
    { field: 'category', sortable: true, filter: true },
    { field: 'isActive', sortable: true, filter: true },
    { field: 'priority', sortable: true, filter: true },
  ];

  defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    resizable: true,
  };

  getRowId = (params: any) => {
    return params.data.id.toString();
  };


  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5235/pricer')
      .withAutomaticReconnect([0, 2000, 10000, 30000]) // Add retry intervals
      .build();
  }

  ngOnInit() {
    this.startConnection();
    this.setupSignalRConnection() 
  }

  ngOnDestroy() {
    this.stopAutoSend();
    this.connection.stop();
  }

  private setupSignalRConnection() {
    this.connection.onreconnecting((error) => {
      console.warn(`Connection lost due to error "${error}". Reconnecting.`);
    });

    this.connection.onreconnected((connectionId) => {
      console.log(`Connection reestablished. Connected with connectionId "${connectionId}".`);
    });

    this.connection.onclose((error) => {
      console.error(`Connection closed due to error "${error}". Attempting to reconnect.`);
      setTimeout(() => this.startConnection(), 5000); // Retry after 5 seconds
    });

    this.connection.on('ReceiveConnectionId', (connectionId: string) => {
      this.clientId = connectionId;
    });

    this.connection.on(
      'ReceiveInitialOperations',
      (operations: Operation[]) => {
        this.operations = operations;
        this.operationsMap.clear();
        operations.forEach((op) => this.operationsMap.set(op.id, op));
        this.operationCounter = operations.length + 1;
      }
    );

    this.connection.on('ReceiveOperation', (operation: Operation) => {
      this.applyDeltaUpdate(operation);
    });

    this.connection.on(
      'ReceiveChangeOperationValue',
      (changeOp: Partial<Operation>) => {
        this.applyDeltaUpdate(changeOp);
      }
    );
  }

  private startConnection() {
    this.connection.start().catch((err) => {
      console.error('Failed to connect with SignalR:', err);
      setTimeout(() => this.startConnection(), 5000); // Retry after 5 seconds
    });
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
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

  changeValue() {
    try {
      const changeOp = JSON.parse(this.changeValueOperation);
      this.connection.invoke('ChangeOperationValue', changeOp);
    } catch (err) {
      console.error('Invalid JSON:', err);
    }
  }

  private generateOperation(): Operation {
    const types = ['Buy', 'Sell', 'Trade'];
    const statuses = ['Pending', 'Completed', 'Cancelled'];
    const currencies = ['USD', 'EUR', 'GBP', 'JPY'];
    const markets = ['NYSE', 'NASDAQ', 'LSE', 'TSE'];
    const traders = ['John', 'Alice', 'Bob', 'Carol'];
    const categories = ['Stocks', 'Bonds', 'Forex', 'Crypto'];

    return {
      id: this.operationCounter++,
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

  applyDeltaUpdate(operation: Operation | Partial<Operation>) {
    const transaction = {
      update: [] as Partial<Operation>[],
      add: [] as Operation[],
    };
    const existingOperation = this.operationsMap.get(operation.id!);

    if (existingOperation) {
      const updatedData = { ...existingOperation, ...operation };
      this.operationsMap.set(operation.id!, updatedData);
      transaction.update.push(updatedData);

      // Check if updated operation is filtered out and notifications are enabled
      if (
        this.matchesCurrentFilters(updatedData) &&
        this.notificationsEnabled
      ) {
        this.notificationDialog.show({
          id: updatedData.id,
          value: updatedData.value,
        });
      }
    } else {
      const newOperation = operation as Operation;
      this.operationsMap.set(operation.id!, newOperation);
      transaction.add.push(newOperation);

      // Check if new operation is filtered out and notifications are enabled
      if (
        this.matchesCurrentFilters(newOperation) &&
        this.notificationsEnabled
      ) {
        this.notificationDialog.show({
          id: newOperation.id,
          value: newOperation.value,
        });
      }
    }

    this.gridApi.applyTransaction(transaction);
  }

  private matchesCurrentFilters(operation: Operation): boolean {
    if (!this.gridApi) return true;

    const filterModel = this.gridApi.getFilterModel();
    if (!filterModel || Object.keys(filterModel).length === 0) return true;

    for (const [field, filter] of Object.entries(filterModel)) {
      const value = operation[field as keyof Operation];
      const condition = (filter as any).condition1 || filter;

      switch (condition.type) {
        case 'equals':
          if (value?.toString() !== condition.filter?.toString()) return false;
          break;
        case 'notEqual':
          if (value?.toString() === condition.filter?.toString()) return false;
          break;
        case 'contains':
          if (!value?.toString().includes(condition.filter)) return false;
          break;
        case 'greaterThan':
          if (!(Number(value) > Number(condition.filter))) return false;
          break;
        case 'lessThan':
          if (!(Number(value) < Number(condition.filter))) return false;
          break;
      }
    }
    return true;
  }

  toggleNotifications() {
    this.notificationsEnabled = !this.notificationsEnabled;
  }
}
