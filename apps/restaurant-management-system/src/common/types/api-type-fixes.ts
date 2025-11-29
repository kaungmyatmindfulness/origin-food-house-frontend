/**
 * API Type Utilities and Extensions
 *
 * This file provides:
 * 1. Utility functions for handling nullable string values
 * 2. Type extensions for API types that need additional frontend-specific fields
 * 3. Strongly-typed definitions for loosely-typed backend fields (e.g., businessHours)
 *
 * NOTE: Most API types are now correctly generated and should be imported directly
 * from '@repo/api/generated/types'. Only use this file for:
 * - Utility functions (extractNullableString, isNullableString, getErrorMessage)
 * - BusinessHours/DayHours types (backend returns as Record<string, unknown>)
 * - SupportedLocale and TranslationMap helper types
 */

// ============================================================================
// Helper Types for Translations
// ============================================================================

/**
 * Supported locales in the application.
 */
export type SupportedLocale = 'en' | 'zh' | 'my' | 'th';

/**
 * Base translation map structure for locale -> translation data.
 * Used when the generated types use Record<string, T> but we want stricter typing.
 */
export type TranslationMap<T> = Partial<Record<SupportedLocale, T>>;

// ============================================================================
// Business Hours Types (Backend returns as Record<string, unknown>)
// ============================================================================

/**
 * Business hours configuration for a single day.
 * The backend StoreSettingResponseDto returns businessHours as { [key: string]: unknown }
 * but the actual structure is this strongly-typed format.
 */
export interface DayHours {
  closed: boolean;
  open?: string;
  close?: string;
}

/**
 * Weekly business hours configuration.
 */
export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Type guard to check if a value is a valid nullable string (not Record<string, never>).
 * Use this when you need to handle potentially malformed types at runtime.
 */
export function isNullableString(
  value: unknown
): value is string | null | undefined {
  return value === null || value === undefined || typeof value === 'string';
}

/**
 * Safely extracts a nullable string from a value that might be an empty object.
 * Returns undefined for empty objects.
 *
 * Note: This function was originally created to handle the OpenAPI generator bug
 * that produced Record<string, never> instead of string | null. The bug has been
 * fixed, but this utility remains useful for defensive programming.
 */
export function extractNullableString(
  value: unknown
): string | null | undefined {
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value === 'string') {
    return value;
  }
  // Handle edge case of empty objects (should no longer occur with fixed types)
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return undefined;
  }
  return undefined;
}

/**
 * Safely extracts an error message from an unknown error value.
 * Useful for catch blocks where the error type is unknown.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}
