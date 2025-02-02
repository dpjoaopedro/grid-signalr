import { TestBed } from '@angular/core/testing';

import { BlotterService } from './blotter.service';

describe('BlotterService', () => {
  let service: BlotterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlotterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
