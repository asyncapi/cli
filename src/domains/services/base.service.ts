import { ServiceResult } from '@/interfaces';
import type { Diagnostic } from '@asyncapi/parser/cjs';

/**
 * Base service class providing common functionality for all domain services.
 * Provides standardized result handling and error management.
 */
export abstract class BaseService {
  /**
   * Creates a successful service result with the provided data.
   *
   * @param data - The data to include in the result
   * @returns A successful ServiceResult containing the data
   */
  protected createSuccessResult<T>(data: T): ServiceResult<T> {
    return {
      success: true,
      data,
    };
  }

  /**
   * Creates an error service result with the provided error message.
   *
   * @param error - The error message
   * @param diagnostics - Optional diagnostics array for validation errors
   * @returns A failed ServiceResult containing the error
   */
  protected createErrorResult<T>(
    error: string,
    diagnostics?: Diagnostic[],
  ): ServiceResult<T> {
    return {
      success: false,
      error,
      diagnostics,
    };
  }

  /**
   * Handles service errors by converting them to a standardized error result.
   *
   * @param error - The caught error (can be any type)
   * @returns A failed ServiceResult with the error message
   */
  protected async handleServiceError<T>(error: unknown): Promise<ServiceResult<T>> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return this.createErrorResult<T>(errorMessage);
  }
}
