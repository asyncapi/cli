import { ServiceResult } from '@/interfaces';

export abstract class BaseService {
  protected createSuccessResult<T>(data: T): ServiceResult<T> {
    return {
      success: true,
      data,
    };
  }

  protected createErrorResult(
    error: string,
    diagnostics?: any[],
  ): ServiceResult {
    return {
      success: false,
      error,
      diagnostics,
    };
  }

  protected async handleServiceError(error: any): Promise<ServiceResult> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return this.createErrorResult(errorMessage);
  }
}
