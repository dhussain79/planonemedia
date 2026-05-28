export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type MediaType = "NEWSPAPER" | "MAGAZINE" | "TV" | "RADIO" | "OUTDOOR" | "ONLINE" | "CINEMA" | "OTHER";

export type SupplierStatus = "ACTIVE" | "INACTIVE" | "PENDING_VERIFICATION";

export type BookingStatus = "DRAFT" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
