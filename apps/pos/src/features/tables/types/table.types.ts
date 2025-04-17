/**
 * Represents a single table object returned by the API.
 * Maps to: Schema TableResponseDto
 */
export interface TableResponseDto {
  id: string;
  storeId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents the definition of a table when creating multiple tables in a batch.
 * Maps to: Schema BatchCreateTableDto
 */
export interface BatchCreateTableDto {
  /** Display name or number for the table (must be unique within the batch and store) */
  name: string;
}

/**
 * The payload structure for replacing all tables in a store.
 * Maps to: Schema BatchReplaceTablesDto (Request Body for PUT /stores/{storeId}/tables/batch-replace)
 */
export interface BatchReplaceTablesDto {
  /**
   * An array of table definitions that will replace ALL existing tables for the store.
   * Send an empty array to delete all tables.
   */
  tables: BatchCreateTableDto[];
}

/**
 * Represents the data returned after a successful batch operation (like replacing tables).
 * Maps to: Schema BatchOperationResponseDto
 */
export interface BatchOperationResponseDto {
  /** Number of records affected (e.g., tables created). */
  count: number;
}
