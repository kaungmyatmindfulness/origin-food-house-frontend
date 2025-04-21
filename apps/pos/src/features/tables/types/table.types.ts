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
 * Represents the data needed to create or update a single table within a batch sync.
 * Maps to: Schema UpsertTableDto
 */
export interface UpsertTableDto {
  /** ID (UUID) of the table to update. Omit to create a new table. */
  id?: string;
  /** Display name or number for the table (must be unique within the store) */
  name: string;
}

/**
 * The payload structure for synchronizing tables in a store.
 * Maps to: Schema BatchUpsertTableDto (Request Body for PUT /stores/{storeId}/tables/batch-sync)
 */
export interface BatchUpsertTableDto {
  /**
   * An array of table objects to create or update.
   * Existing tables for the store NOT included in this list (by ID) will be deleted.
   */
  tables: UpsertTableDto[];
}
