export type MovementType = 
  | 'AUTOMATIC' 
  | 'MANUAL_WIND' 
  | 'TOURBILLON' 
  | 'PERPETUAL_CALENDAR' 
  | 'QUARTZ' 
  | 'SPRING_DRIVE';

export type CaseMaterial = 
  | 'STAINLESS_STEEL' 
  | 'ROSE_GOLD' 
  | 'YELLOW_GOLD' 
  | 'WHITE_GOLD' 
  | 'PLATINUM' 
  | 'TITANIUM' 
  | 'CERAMIC' 
  | 'CARBON';

export type InventoryStatus = 
  | 'AVAILABLE' 
  | 'RESERVED' 
  | 'IN_TRANSIT' 
  | 'SOLD' 
  | 'UNDER_INSPECTION';

export type OrderStatus = 
  | 'PENDING_PAYMENT' 
  | 'ESCROW_HELD' 
  | 'PROCESSING' 
  | 'DISPATCHED' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'REFUNDED';

export type UserRole = 
  | 'CUSTOMER' 
  | 'SUPPORT_STAFF' 
  | 'INVENTORY_MANAGER' 
  | 'SUPER_ADMIN';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  originCountry: string;
  description: string;
  logoUrl?: string;
}

export interface WatchProduct {
  id: string;
  brandId: string;
  brandName: string;
  referenceNumber: string;
  modelName: string;
  slug: string;
  retailPriceCents: number;
  movement: MovementType;
  calibre: string;
  powerReserveHours: number;
  caseDiameterMm: number;
  caseThicknessMm: number;
  caseMaterial: CaseMaterial;
  waterResistanceAtm: number;
  dialColor: string;
  complications: string[];
  isLimitedEdition: boolean;
  totalProductionLimit?: number;
  description: string;
  heroImage: string;
  secondaryImage?: string;
  gallery: Array<{
    url: string;
    isPrimary?: boolean;
    type: 'image' | 'macro' | '360' | '3d';
    caption?: string;
  }>;
  specifications: {
    frequencyVph?: number;
    jewels?: number;
    crystal?: string;
    caseback?: string;
    strapMaterial?: string;
    claspType?: string;
    lugWidthMm?: number;
    certification?: string;
    weightGrams?: number;
  };
  isActive: boolean;
  inStockCount: number;
}

export interface CartItem {
  product: WatchProduct;
  quantity: number;
  reservationId?: string;
  reservedUntil?: number; // timestamp ms
  serialNumber?: string;
}

export interface FilterState {
  searchQuery: string;
  brands: string[];
  movements: MovementType[];
  materials: CaseMaterial[];
  complications: string[];
  minPrice: number;
  maxPrice: number;
  diameterMin: number;
  diameterMax: number;
  waterResistanceAtmMin?: number;
  onlyLimitedEdition: boolean;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'diameter' | 'newest';
}
