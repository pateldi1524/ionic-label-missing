import { TestBed } from '@angular/core/testing';

import { SqlStorageService } from './sql-storage.service';

describe('SqlStorageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SqlStorageService = TestBed.get(SqlStorageService);
    expect(service).toBeTruthy();
  });
});
