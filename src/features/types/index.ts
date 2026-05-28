export interface MediaFeature {
  id: string;
  title: string;
  slug: string | null;
  mediaType: string | null;
  region: string | null;
  supplierName: string | null;
}

export interface SupplierFeature {
  id: string;
  companyName: string;
  status: string;
  mediaCount: number;
}

export interface BookingFeature {
  id: string;
  mediaId: string;
  buyerId: string;
  startDate: Date;
  endDate: Date;
  status: string;
  totalAmount: number;
}
