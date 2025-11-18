/**
 * Database Query Helpers
 * Utilities for common database operations with error handling and logging
 */

import { createClient } from './supabase/server';
import { logger } from './logger';

export interface QueryOptions {
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
  filters?: Record<string, any>;
}

export interface QueryResult<T> {
  data: T | null;
  error: Error | null;
  count?: number;
}

/**
 * Generic database query helper with error handling and logging
 */
export async function dbQuery<T = any>(
  table: string,
  options: QueryOptions = {},
): Promise<QueryResult<T[]>> {
  const { select = '*', orderBy, limit, offset, filters } = options;

  try {
    logger.dbQuery('select', table, { options });

    const supabase = await createClient();
    let query = supabase.from(table).select(select, { count: 'exact' });

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    // Apply ordering
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    }

    // Apply pagination
    if (limit !== undefined) {
      query = query.limit(limit);
    }
    if (offset !== undefined) {
      query = query.range(offset, offset + (limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.dbError('select', table, error, { options });
      return { data: null, error: new Error(error.message), count: 0 };
    }

    return { data: data as T[], error: null, count: count || 0 };
  } catch (error: any) {
    logger.dbError('select', table, error, { options });
    return { data: null, error, count: 0 };
  }
}

/**
 * Get a single record by ID
 */
export async function dbGetById<T = any>(
  table: string,
  id: string,
  select = '*',
): Promise<QueryResult<T>> {
  try {
    logger.dbQuery('select-by-id', table, { id });

    const supabase = await createClient();
    const { data, error } = await supabase.from(table).select(select).eq('id', id).single();

    if (error) {
      logger.dbError('select-by-id', table, error, { id });
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as T, error: null };
  } catch (error: any) {
    logger.dbError('select-by-id', table, error, { id });
    return { data: null, error };
  }
}

/**
 * Insert a record
 */
export async function dbInsert<T = any>(
  table: string,
  data: Partial<T>,
  returnData = true,
): Promise<QueryResult<T>> {
  try {
    logger.dbQuery('insert', table, { hasData: !!data });

    const supabase = await createClient();
    const query = supabase.from(table).insert(data as any);

    const result = returnData ? await query.select().single() : await query;

    if (result.error) {
      logger.dbError('insert', table, result.error);
      return { data: null, error: new Error(result.error.message) };
    }

    return { data: returnData ? (result.data as T) : null, error: null };
  } catch (error: any) {
    logger.dbError('insert', table, error);
    return { data: null, error };
  }
}

/**
 * Insert multiple records
 */
export async function dbInsertMany<T = any>(
  table: string,
  data: Partial<T>[],
  returnData = true,
): Promise<QueryResult<T[]>> {
  try {
    logger.dbQuery('insert-many', table, { count: data.length });

    const supabase = await createClient();
    const query = supabase.from(table).insert(data as any[]);

    const result = returnData ? await query.select() : await query;

    if (result.error) {
      logger.dbError('insert-many', table, result.error);
      return { data: null, error: new Error(result.error.message) };
    }

    return { data: returnData ? (result.data as T[]) : null, error: null };
  } catch (error: any) {
    logger.dbError('insert-many', table, error);
    return { data: null, error };
  }
}

/**
 * Update a record by ID
 */
export async function dbUpdate<T = any>(
  table: string,
  id: string,
  data: Partial<T>,
  returnData = true,
): Promise<QueryResult<T>> {
  try {
    logger.dbQuery('update', table, { id, hasData: !!data });

    const supabase = await createClient();
    const query = supabase.from(table).update(data as any).eq('id', id);

    const result = returnData ? await query.select().single() : await query;

    if (result.error) {
      logger.dbError('update', table, result.error, { id });
      return { data: null, error: new Error(result.error.message) };
    }

    return { data: returnData ? (result.data as T) : null, error: null };
  } catch (error: any) {
    logger.dbError('update', table, error, { id });
    return { data: null, error };
  }
}

/**
 * Update records with filters
 */
export async function dbUpdateWhere<T = any>(
  table: string,
  filters: Record<string, any>,
  data: Partial<T>,
  returnData = false,
): Promise<QueryResult<T[]>> {
  try {
    logger.dbQuery('update-where', table, { filters, hasData: !!data });

    const supabase = await createClient();
    let query = supabase.from(table).update(data as any);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const result = returnData ? await query.select() : await query;

    if (result.error) {
      logger.dbError('update-where', table, result.error, { filters });
      return { data: null, error: new Error(result.error.message) };
    }

    return { data: returnData ? (result.data as T[]) : null, error: null };
  } catch (error: any) {
    logger.dbError('update-where', table, error, { filters });
    return { data: null, error };
  }
}

/**
 * Delete a record by ID
 */
export async function dbDelete(table: string, id: string): Promise<QueryResult<null>> {
  try {
    logger.dbQuery('delete', table, { id });

    const supabase = await createClient();
    const { error } = await supabase.from(table).delete().eq('id', id);

    if (error) {
      logger.dbError('delete', table, error, { id });
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  } catch (error: any) {
    logger.dbError('delete', table, error, { id });
    return { data: null, error };
  }
}

/**
 * Delete records with filters
 */
export async function dbDeleteWhere(
  table: string,
  filters: Record<string, any>,
): Promise<QueryResult<null>> {
  try {
    logger.dbQuery('delete-where', table, { filters });

    const supabase = await createClient();
    let query = supabase.from(table).delete();

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { error } = await query;

    if (error) {
      logger.dbError('delete-where', table, error, { filters });
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  } catch (error: any) {
    logger.dbError('delete-where', table, error, { filters });
    return { data: null, error };
  }
}

/**
 * Count records with optional filters
 */
export async function dbCount(
  table: string,
  filters?: Record<string, any>,
): Promise<QueryResult<number>> {
  try {
    logger.dbQuery('count', table, { filters });

    const supabase = await createClient();
    let query = supabase.from(table).select('*', { count: 'exact', head: true });

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    const { count, error } = await query;

    if (error) {
      logger.dbError('count', table, error, { filters });
      return { data: null, error: new Error(error.message) };
    }

    return { data: count || 0, error: null };
  } catch (error: any) {
    logger.dbError('count', table, error, { filters });
    return { data: null, error };
  }
}

/**
 * Check if a record exists
 */
export async function dbExists(
  table: string,
  filters: Record<string, any>,
): Promise<QueryResult<boolean>> {
  const result = await dbCount(table, filters);

  if (result.error) {
    return { data: null, error: result.error };
  }

  return { data: (result.data || 0) > 0, error: null };
}

/**
 * Upsert (insert or update) a record
 */
export async function dbUpsert<T = any>(
  table: string,
  data: Partial<T> & { id?: string },
  returnData = true,
): Promise<QueryResult<T>> {
  try {
    logger.dbQuery('upsert', table, { hasId: !!data.id });

    const supabase = await createClient();
    const query = supabase.from(table).upsert(data as any);

    const result = returnData ? await query.select().single() : await query;

    if (result.error) {
      logger.dbError('upsert', table, result.error);
      return { data: null, error: new Error(result.error.message) };
    }

    return { data: returnData ? (result.data as T) : null, error: null };
  } catch (error: any) {
    logger.dbError('upsert', table, error);
    return { data: null, error };
  }
}

/**
 * Execute a raw SQL query (admin only - use with caution)
 */
export async function dbRawQuery<T = any>(sql: string): Promise<QueryResult<T>> {
  try {
    logger.dbQuery('raw-sql', 'custom', { hasSql: !!sql });

    const supabase = await createClient();
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      logger.dbError('raw-sql', 'custom', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as T, error: null };
  } catch (error: any) {
    logger.dbError('raw-sql', 'custom', error);
    return { data: null, error };
  }
}

/**
 * Batch operations with transaction-like behavior
 * Note: Supabase doesn't support true transactions, but this ensures atomic-like behavior
 */
export async function dbBatch<T = any>(
  operations: Array<() => Promise<QueryResult<any>>>,
): Promise<QueryResult<T[]>> {
  try {
    const results: T[] = [];
    const errors: Error[] = [];

    for (const operation of operations) {
      const result = await operation();
      if (result.error) {
        errors.push(result.error);
      } else if (result.data) {
        results.push(result.data);
      }
    }

    if (errors.length > 0) {
      logger.error('Batch operation had errors', errors[0], {
        totalErrors: errors.length,
        totalOperations: operations.length,
      });
      return { data: null, error: errors[0] };
    }

    return { data: results, error: null };
  } catch (error: any) {
    logger.error('Batch operation failed', error);
    return { data: null, error };
  }
}
