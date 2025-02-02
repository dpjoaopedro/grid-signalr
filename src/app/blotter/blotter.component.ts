import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridApi, RowStyle, themeQuartz } from 'ag-grid-community';
import { BlotterService } from '../blotter.service';
import { ConnectionServiceService } from '../connection-service.service';
import { Operation } from '../models/operation';
import { NotificationDialogComponent } from '../notification-dialog/notification-dialog.component';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-blotter',
  imports: [AgGridModule, NotificationDialogComponent],
  templateUrl: './blotter.component.html',
  styleUrl: './blotter.component.css',
})
export class BlotterComponent implements OnInit {
  @ViewChild(NotificationDialogComponent)
  notificationDialog!: NotificationDialogComponent;

  connectionService = inject(ConnectionServiceService);
  connection = this.connectionService.getConnection();

  blotterService = inject(BlotterService);
  operationsMap = this.blotterService.operationsMap;
  operations = this.blotterService.operations;

  private gridApi!: GridApi;

  notificationService = inject(NotificationService);
  notificationsEnabled = this.notificationService.notificationsEnabled;

  showOperations = false; // Add this line after other property declarations

  theme = themeQuartz.withParams({
    headerHeight: '30px',
    headerTextColor: 'white',
    headerBackgroundColor: 'black',
    headerCellHoverBackgroundColor: 'rgba(80, 40, 140, 0.66)',
    headerCellMovingBackgroundColor: 'rgb(80, 40, 140)',
    borderColor: 'black',
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

  ngOnInit(): void {
    this.blotterService.$newOperation.subscribe((operation) => {
      this.applyDeltaUpdate(operation);
    });

    this.blotterService.$updateOperation.subscribe((operation) => {
      this.applyDeltaUpdate(operation);
    });
  }

  getRowId = (params: any) => {
    return params.data.id.toString();
  };

  onGridReady(params: any) {
    this.gridApi = params.api;
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
        this.notificationsEnabled()
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
      this.gridApi.applyTransactionAsync(transaction);

      if (
        this.matchesCurrentFilters(newOperation) &&
        this.notificationsEnabled()
      ) {
        this.notificationDialog.show({
          id: newOperation.id,
          value: newOperation.value,
        });
      }
    }

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
}
