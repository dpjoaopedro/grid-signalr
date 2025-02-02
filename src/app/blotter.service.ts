import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { Operation } from './models/operation';

@Injectable({
  providedIn: 'root',
})
export class BlotterService {
  operations = signal<Operation[]>([]);
  operationsMap = new Map<string | number, Operation>();
  operationCounter = 1;

  _newOperationSubject = new Subject<Operation>();
  $newOperation = this._newOperationSubject.asObservable();

  _updateOperationSubject = new Subject<Partial<Operation>>();
  $updateOperation = this._updateOperationSubject.asObservable();

  setInitialOperations(operations: Operation[]) {
    this.operations.set(operations);
    this.operationsMap.clear();
    this.operations().forEach((op) => this.operationsMap.set(op.id, op));
    this.operationCounter = operations.length + 1;
  }

  setNewOperation(operation: Operation) {
    this._newOperationSubject.next(operation);
  }
  updateOperation(changeOp: Partial<Operation>) {
    this._updateOperationSubject.next(changeOp);
  }
}
