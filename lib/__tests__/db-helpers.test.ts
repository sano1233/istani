import {
  dbQuery,
  dbGetById,
  dbInsert,
  dbInsertMany,
  dbUpdate,
  dbUpdateWhere,
  dbDelete,
  dbDeleteWhere,
  dbCount,
  dbExists,
  dbUpsert,
  dbBatch,
  QueryOptions,
} from '../db-helpers';

// Mock dependencies
jest.mock('../supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('../logger', () => ({
  logger: {
    dbQuery: jest.fn(),
    dbError: jest.fn(),
    error: jest.fn(),
  },
}));

describe('db-helpers', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a fresh mock for each test
    mockSupabase = {
      from: jest.fn(),
    };
    
    const { createClient } = require('../supabase/server');
    createClient.mockResolvedValue(mockSupabase);
  });

  describe('dbQuery', () => {
    it('should query records with default options', async () => {
      const mockData = [{ id: 1, name: 'Test' }];
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        data: mockData,
        error: null,
        count: 1,
      };

      mockSupabase.from.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue(mockQuery);

      const result = await dbQuery('users');

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(result.count).toBe(1);
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
    });

    it('should apply filters', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        data: [],
        error: null,
        count: 0,
      };

      mockSupabase.from.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue(mockQuery);

      await dbQuery('users', {
        filters: { status: 'active', role: 'admin' },
      });

      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'active');
      expect(mockQuery.eq).toHaveBeenCalledWith('role', 'admin');
    });

    it('should skip null and undefined filters', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        data: [],
        error: null,
        count: 0,
      };

      mockSupabase.from.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue(mockQuery);

      await dbQuery('users', {
        filters: { status: 'active', role: null, age: undefined },
      });

      expect(mockQuery.eq).toHaveBeenCalledTimes(1);
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'active');
    });

    it('should apply ordering', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        data: [],
        error: null,
        count: 0,
      };

      mockSupabase.from.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue(mockQuery);

      await dbQuery('users', {
        orderBy: { column: 'created_at', ascending: false },
      });

      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should apply limit', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        data: [],
        error: null,
        count: 0,
      };

      mockSupabase.from.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue(mockQuery);

      await dbQuery('users', { limit: 10 });

      expect(mockQuery.limit).toHaveBeenCalledWith(10);
    });

    it('should apply pagination with range', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        data: [],
        error: null,
        count: 0,
      };

      mockSupabase.from.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue(mockQuery);

      await dbQuery('users', { offset: 20, limit: 10 });

      expect(mockQuery.range).toHaveBeenCalledWith(20, 29);
    });

    it('should handle database errors', async () => {
      const mockError = { message: 'Database error' };
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        data: null,
        error: mockError,
        count: 0,
      };

      mockSupabase.from.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue(mockQuery);

      const result = await dbQuery('users');

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Database error');
    });
  });

  describe('dbGetById', () => {
    it('should fetch a single record by ID', async () => {
      const mockData = { id: '123', name: 'Test' };
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await dbGetById('users', '123');

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '123');
    });

    it('should use custom select fields', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: {}, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      await dbGetById('users', '123', 'id,name,email');

      expect(mockQuery.select).toHaveBeenCalledWith('id,name,email');
    });

    it('should handle not found errors', async () => {
      const mockError = { message: 'Record not found' };
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await dbGetById('users', '999');

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
    });
  });

  describe('dbInsert', () => {
    it('should insert a record and return it', async () => {
      const inputData = { name: 'John', email: 'john@example.com' };
      const mockData = { id: '123', ...inputData };
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await dbInsert('users', inputData);

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(mockQuery.insert).toHaveBeenCalledWith(inputData);
    });

    it('should insert without returning data', async () => {
      const inputData = { name: 'John' };
      const mockQuery = {
        insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await dbInsert('users', inputData, false);

      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });

    it('should handle insert errors', async () => {
      const mockError = { message: 'Unique constraint violation' };
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await dbInsert('users', { email: 'duplicate@example.com' });

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
    });
  });

  describe('dbInsertMany', () => {
    it('should insert multiple records', async () => {
      const inputData = [
        { name: 'John' },
        { name: 'Jane' },
      ];
      const mockData = [
        { id: '1', name: 'John' },
        { id: '2', name: 'Jane' },
      ];
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await dbInsertMany('users', inputData);

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(mockQuery.insert).toHaveBeenCalledWith(inputData);
    });
  });

  describe('dbUpdate', () => {
    it('should update a record by ID', async () => {
      const updateData = { name: 'Updated Name' };
      const mockData = { id: '123', name: 'Updated Name' };
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await dbUpdate('users', '123', updateData);

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(mockQuery.update).toHaveBeenCalledWith(updateData);
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '123');
    });

    it('should update without returning data', async () => {
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await dbUpdate('users', '123', { name: 'Test' }, false);

      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });
  });

  describe('dbUpdateWhere', () => {
    it('should update records matching filters', async () => {
      const filters = { status: 'pending' };
      const updateData = { status: 'approved' };
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await dbUpdateWhere('orders', filters, updateData);

      expect(result.error).toBeNull();
      expect(mockQuery.update).toHaveBeenCalledWith(updateData);
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'pending');
    });
  });

  describe('dbDelete', () => {
    it('should delete a record by ID', async () => {
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await dbDelete('users', '123');

      expect(result.error).toBeNull();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '123');
    });

    it('should handle delete errors', async () => {
      const mockError = { message: 'Foreign key constraint' };
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: mockError }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await dbDelete('users', '123');

      expect(result.error).toBeInstanceOf(Error);
    });
  });

  describe('dbDeleteWhere', () => {
    it('should delete records matching filters', async () => {
      const filters = { status: 'archived' };
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await dbDeleteWhere('posts', filters);

      expect(result.error).toBeNull();
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'archived');
    });
  });

  describe('dbCount', () => {
    it('should count all records', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue({ count: 42, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await dbCount('users');

      expect(result.data).toBe(42);
      expect(result.error).toBeNull();
    });

    it('should count with filters', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ count: 10, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await dbCount('users', { status: 'active' });

      expect(result.data).toBe(10);
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'active');
    });

    it('should handle count errors', async () => {
      const mockError = { message: 'Count failed' };
      const mockQuery = {
        select: jest.fn().mockResolvedValue({ count: null, error: mockError }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await dbCount('users');

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
    });
  });

  describe('dbExists', () => {
    it('should return true when records exist', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ count: 1, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await dbExists('users', { email: 'test@example.com' });

      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should return false when no records exist', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ count: 0, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await dbExists('users', { email: 'notfound@example.com' });

      expect(result.data).toBe(false);
      expect(result.error).toBeNull();
    });
  });

  describe('dbUpsert', () => {
    it('should upsert a record', async () => {
      const data = { id: '123', name: 'Test' };
      const mockQuery = {
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await dbUpsert('users', data);

      expect(result.data).toEqual(data);
      expect(result.error).toBeNull();
      expect(mockQuery.upsert).toHaveBeenCalledWith(data);
    });
  });

  describe('dbBatch', () => {
    it('should execute multiple operations successfully', async () => {
      const operations = [
        async () => ({ data: { id: 1 }, error: null }),
        async () => ({ data: { id: 2 }, error: null }),
        async () => ({ data: { id: 3 }, error: null }),
      ];

      const result = await dbBatch(operations);

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(3);
      expect(result.data).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });

    it('should stop on first error', async () => {
      const error = new Error('Operation failed');
      const operations = [
        async () => ({ data: { id: 1 }, error: null }),
        async () => ({ data: null, error }),
        async () => ({ data: { id: 3 }, error: null }),
      ];

      const result = await dbBatch(operations);

      expect(result.error).toBe(error);
      expect(result.data).toBeNull();
    });

    it('should handle empty operations', async () => {
      const result = await dbBatch([]);

      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
    });
  });
});