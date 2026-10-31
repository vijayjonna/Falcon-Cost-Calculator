export type PriceItemKey =
  | 'plywood'
  | 'mdf'
  | 'colorLaminate'
  | 'acrylicLaminate'
  | 'halfWhiteLaminate'
  | 'louvers'
  | 'hinge'
  | 'telescope'
  | 'handle6Inch'
  | 'handle9Inch'
  | 'plywoodBoxLabor'
  | 'plywoodFrameLabor'
  | 'mdfBoxLabor'
  | 'mdfFrameLabor'
  | 'adhesive';

export interface PriceItem {
  key: PriceItemKey;
  label: string;
  category: 'base' | 'laminate' | 'extra' | 'hardware' | 'labor';
  unit: string;
  defaultPrice: number;
}

export const DEFAULT_PRICES: Record<PriceItemKey, PriceItem> = {
  plywood: {
    key: 'plywood',
    label: 'Plywood Rate',
    category: 'base',
    unit: 'sq.ft',
    defaultPrice: 95, // standard rate per sq.ft
  },
  mdf: {
    key: 'mdf',
    label: 'MDF Rate',
    category: 'base',
    unit: 'sq.ft',
    defaultPrice: 65, // standard rate per sq.ft
  },
  colorLaminate: {
    key: 'colorLaminate',
    label: 'Color Laminate',
    category: 'laminate',
    unit: 'sheet',
    defaultPrice: 1600, // per sheet (approx 32 sq.ft)
  },
  acrylicLaminate: {
    key: 'acrylicLaminate',
    label: 'Acrylic Laminate',
    category: 'laminate',
    unit: 'sheet',
    defaultPrice: 4800, // per sheet
  },
  halfWhiteLaminate: {
    key: 'halfWhiteLaminate',
    label: 'Half White Laminate (Inner)',
    category: 'laminate',
    unit: 'sheet',
    defaultPrice: 950, // per sheet
  },
  louvers: {
    key: 'louvers',
    label: 'Louvers / Fluted Panels',
    category: 'extra',
    unit: 'panel',
    defaultPrice: 1800, // per panel
  },
  hinge: {
    key: 'hinge',
    label: 'Soft-Close Hinges',
    category: 'hardware',
    unit: 'pc',
    defaultPrice: 150,
  },
  telescope: {
    key: 'telescope',
    label: 'Telescopic Drawer Channels',
    category: 'hardware',
    unit: 'pair',
    defaultPrice: 350,
  },
  handle6Inch: {
    key: 'handle6Inch',
    label: 'Handles (6 inches)',
    category: 'hardware',
    unit: 'pc',
    defaultPrice: 120,
  },
  handle9Inch: {
    key: 'handle9Inch',
    label: 'Handles (9 inches)',
    category: 'hardware',
    unit: 'pc',
    defaultPrice: 200,
  },
  plywoodBoxLabor: {
    key: 'plywoodBoxLabor',
    label: 'Plywood Box (Carcass) Labor',
    category: 'labor',
    unit: 'cft',
    defaultPrice: 150,
  },
  plywoodFrameLabor: {
    key: 'plywoodFrameLabor',
    label: 'Plywood Frame (Shutter) Labor',
    category: 'labor',
    unit: 'sq.ft',
    defaultPrice: 100,
  },
  mdfBoxLabor: {
    key: 'mdfBoxLabor',
    label: 'MDF Box (Carcass) Labor',
    category: 'labor',
    unit: 'cft',
    defaultPrice: 130,
  },
  mdfFrameLabor: {
    key: 'mdfFrameLabor',
    label: 'MDF Frame (Shutter) Labor',
    category: 'labor',
    unit: 'sq.ft',
    defaultPrice: 80,
  },
  adhesive: {
    key: 'adhesive',
    label: 'Adhesive Rate',
    category: 'extra',
    unit: 'kg',
    defaultPrice: 250,
  },
};

export interface RoomData {
  id: string;
  name: string;
  
  // A - Plywood Box quantities in sheets
  plywoodBoxSheets: number;
  plywoodFrameSheets: number;

  // B - MDF Box quantities in sheets
  mdfBoxSheets: number;
  mdfFrameSheets: number;
  louversPanels: number; // louvers in panels
  plywoodBoxLouversPanels?: number;
  plywoodFrameLouversPanels?: number;

  // Laminates in sheets (separated for box and frame, and fallback for backward compatibility)
  colorLaminateSheets?: number;
  colorLaminateBoxSheets: number;
  colorLaminateFrameSheets: number;

  acrylicLaminateSheets?: number;
  acrylicLaminateBoxSheets: number;
  acrylicLaminateFrameSheets: number;

  halfWhiteLaminateSheets?: number;
  halfWhiteLaminateBoxSheets: number;
  halfWhiteLaminateFrameSheets: number;

  // Hardware pieces / pairs
  hingeQty: number;
  plywoodBoxHingeQty: number;
  plywoodFrameHingeQty: number;
  mdfBoxHingeQty: number;
  mdfFrameHingeQty: number;
  
  telescopeQty: number;
  plywoodBoxTelescopeQty: number;
  mdfBoxTelescopeQty: number;

  handle6Qty: number;
  plywoodBoxHandle6Qty: number;
  plywoodFrameHandle6Qty: number;
  mdfBoxHandle6Qty: number;
  mdfFrameHandle6Qty: number;

  handle9Qty: number;
  plywoodBoxHandle9Qty: number;
  plywoodFrameHandle9Qty: number;
  mdfBoxHandle9Qty: number;
  mdfFrameHandle9Qty: number;

  // Labor specific custom inputs (CFT for Box, Sq.Ft for Frame)
  plywoodBoxCFT: number;
  plywoodFrameSqFt: number;
  mdfBoxCFT: number;
  mdfFrameSqFt: number;

  // E - Addon quantities
  adhesiveQty: number;
  mdfAdhesiveQty?: number;

  // Other Hardware direct currency inputs (Box & Shutter/Frame)
  plywoodBoxOtherHardwareCost?: number;
  plywoodFrameOtherHardwareCost?: number;
  mdfBoxOtherHardwareCost?: number;
  mdfFrameOtherHardwareCost?: number;

  priceOverrides: Record<PriceItemKey, number | undefined>;
}

export interface ProjectData {
  id?: string;
  name: string;
  clientName: string;
  currency: string;
  globalPrices: Record<PriceItemKey, number>;
  rooms: RoomData[];
  userId?: string;
  updatedAt?: number;
  createdAt?: number;
}
