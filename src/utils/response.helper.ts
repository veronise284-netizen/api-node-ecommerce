import { PaginationMeta } from './pagination.helper';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: PaginationMeta;
  filters?: any;
  searchQuery?: string;
}

export const successResponse = <T>(
  data: T,
  message?: string
): ApiResponse<T> => {
  return {
    success: true,
    message,
    data
  };
};

export const errorResponse = (
  error: string,
  message?: string
): ApiResponse<null> => {
  return {
    success: false,
    message: message || 'An error occurred',
    error
  };
};

export const paginatedResponse = <T>(
  data: T[],
  pagination: PaginationMeta,
  filters?: any,
  searchQuery?: string
): ApiResponse<T[]> => {
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    pagination
  };

  if (filters && Object.keys(filters).length > 0) {
    response.filters = filters;
  }

  if (searchQuery) {
    response.searchQuery = searchQuery;
  }

  return response;
};
