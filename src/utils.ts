import { RoomData, PriceItemKey, DEFAULT_PRICES } from './types';

export function getEffectivePrice(
  itemKey: PriceItemKey,
  room: RoomData,
  globalPrices: Record<PriceItemKey, number>
): number {
  const override = room.priceOverrides[itemKey];
  if (override !== undefined && override !== null && !isNaN(override)) {
    return override;
  }
  return globalPrices[itemKey] ?? DEFAULT_PRICES[itemKey].defaultPrice;
}

export interface RoomCostBreakdown {
  plywoodCost: number;
  mdfCost: number;
  colorLaminateCost: number;
  acrylicLaminateCost: number;
  halfWhiteLaminateCost: number;
  louversCost: number;
  hingeCost: number;
  telescopeCost: number;
  handle6InchCost: number;
  handle9InchCost: number;
  plywoodBoxLaborCost: number;
  plywoodFrameLaborCost: number;
  mdfBoxLaborCost: number;
  mdfFrameLaborCost: number;
  adhesiveCost: number;

  plywoodBoxOtherHardwareCost: number;
  plywoodFrameOtherHardwareCost: number;
  mdfBoxOtherHardwareCost: number;
  mdfFrameOtherHardwareCost: number;
  totalOtherHardwareCost: number;

  totalMaterials: number;
  totalHardware: number;
  totalLabor: number;
  totalRoomCost: number;

  // New derived values for box vs frame rate analysis
  plywoodBoxTotalValue: number;
  plywoodFrameTotalValue: number;
  mdfBoxTotalValue: number;
  mdfFrameTotalValue: number;

  plywoodBoxCalculatedRatePerCFT: number;
  plywoodFrameCalculatedRatePerSqFt: number;
  mdfBoxCalculatedRatePerCFT: number;
  mdfFrameCalculatedRatePerSqFt: number;

  // detailed breakdown components for derived rates
  plywoodBoxBoardCost: number;
  plywoodFrameBoardCost: number;
  mdfBoxBoardCost: number;
  mdfFrameBoardCost: number;

  colorLaminateBoxCost: number;
  colorLaminateFrameCost: number;
  acrylicLaminateBoxCost: number;
  acrylicLaminateFrameCost: number;
  halfWhiteLaminateBoxCost: number;
  halfWhiteLaminateFrameCost: number;

  pBoxLouversCost: number;
  pFrameLouversCost: number;

  pBoxHingeCost: number;
  pFrameHingeCost: number;
  mBoxHingeCost: number;
  mFrameHingeCost: number;

  pBoxTelescopeCost: number;
  mBoxTelescopeCost: number;

  pBoxHandle6Cost: number;
  pFrameHandle6Cost: number;
  mBoxHandle6Cost: number;
  mFrameHandle6Cost: number;

  pBoxHandle9Cost: number;
  pFrameHandle9Cost: number;
  mBoxHandle9Cost: number;
  mFrameHandle9Cost: number;

  pBoxAdhesiveCost: number;
  pFrameAdhesiveCost: number;
  mdfBoxAdhesiveCost: number;
  mdfFrameAdhesiveCost: number;
  totalAdhesiveQty: number;
}

export function calculateRoomCost(
  room: RoomData,
  globalPrices: Record<PriceItemKey, number>
): RoomCostBreakdown {
  // Get prices
  const plywoodPrice = getEffectivePrice('plywood', room, globalPrices);
  const mdfPrice = getEffectivePrice('mdf', room, globalPrices);
  const colorLaminatePrice = getEffectivePrice('colorLaminate', room, globalPrices);
  const acrylicLaminatePrice = getEffectivePrice('acrylicLaminate', room, globalPrices);
  const halfWhiteLaminatePrice = getEffectivePrice('halfWhiteLaminate', room, globalPrices);
  const louversPrice = getEffectivePrice('louvers', room, globalPrices);
  const hingePrice = getEffectivePrice('hinge', room, globalPrices);
  const telescopePrice = getEffectivePrice('telescope', room, globalPrices);
  const handle6InchPrice = getEffectivePrice('handle6Inch', room, globalPrices);
  const handle9InchPrice = getEffectivePrice('handle9Inch', room, globalPrices);
  const adhesivePrice = getEffectivePrice('adhesive', room, globalPrices);

  // Separate labor prices
  const plywoodBoxLaborPrice = getEffectivePrice('plywoodBoxLabor', room, globalPrices);
  const plywoodFrameLaborPrice = getEffectivePrice('plywoodFrameLabor', room, globalPrices);
  const mdfBoxLaborPrice = getEffectivePrice('mdfBoxLabor', room, globalPrices);
  const mdfFrameLaborPrice = getEffectivePrice('mdfFrameLabor', room, globalPrices);

  // Conversion: 1 sheet of Plywood/MDF = 32 sq.ft
  const SQFT_PER_SHEET = 32;

  // A - Plywood Box calculation (quantities entered in sheets, price is in per sq.ft)
  const totalPlywoodSheets = (room.plywoodBoxSheets || 0) + (room.plywoodFrameSheets || 0);
  const plywoodSqft = totalPlywoodSheets * SQFT_PER_SHEET;
  const plywoodCost = plywoodSqft * plywoodPrice;

  // B - MDF Box calculation (quantities entered in sheets, price is in per sq.ft)
  const totalMdfSheets = (room.mdfBoxSheets || 0) + (room.mdfFrameSheets || 0);
  const mdfSqft = totalMdfSheets * SQFT_PER_SHEET;
  const mdfCost = mdfSqft * mdfPrice;

  // Laminates (entered in sheets, price is per sheet, separated for box and frame)
  const colorLaminateBox = room.colorLaminateBoxSheets !== undefined ? room.colorLaminateBoxSheets : (room.colorLaminateSheets || 0);
  const colorLaminateFrame = room.colorLaminateFrameSheets !== undefined ? room.colorLaminateFrameSheets : 0;
  const colorLaminateSheetsCount = colorLaminateBox + colorLaminateFrame;
  const colorLaminateCost = colorLaminateSheetsCount * colorLaminatePrice;

  const acrylicLaminateBox = room.acrylicLaminateBoxSheets !== undefined ? room.acrylicLaminateBoxSheets : (room.acrylicLaminateSheets || 0);
  const acrylicLaminateFrame = room.acrylicLaminateFrameSheets !== undefined ? room.acrylicLaminateFrameSheets : 0;
  const acrylicLaminateSheetsCount = acrylicLaminateBox + acrylicLaminateFrame;
  const acrylicLaminateCost = acrylicLaminateSheetsCount * acrylicLaminatePrice;

  const halfWhiteLaminateBox = room.halfWhiteLaminateBoxSheets !== undefined ? room.halfWhiteLaminateBoxSheets : (room.halfWhiteLaminateSheets || 0);
  const halfWhiteLaminateFrame = room.halfWhiteLaminateFrameSheets !== undefined ? room.halfWhiteLaminateFrameSheets : 0;
  const halfWhiteLaminateSheetsCount = halfWhiteLaminateBox + halfWhiteLaminateFrame;
  const halfWhiteLaminateCost = halfWhiteLaminateSheetsCount * halfWhiteLaminatePrice;

  // Louvers/Fluted Panels (entered in panels, price is per panel)
  const pBoxLouversQty = room.plywoodBoxLouversPanels !== undefined ? room.plywoodBoxLouversPanels : 0;
  const pFrameLouversQty = room.plywoodFrameLouversPanels !== undefined ? room.plywoodFrameLouversPanels : 0;
  const calculatedLouversQty = room.plywoodBoxLouversPanels !== undefined
    ? (pBoxLouversQty + pFrameLouversQty)
    : (room.louversPanels || 0);
  const louversCost = calculatedLouversQty * louversPrice;

  // Hardware:
  // Use new detailed hinge inputs if defined, otherwise fall back to raw hingeQty
  const pBoxHingeQty = room.plywoodBoxHingeQty !== undefined ? room.plywoodBoxHingeQty : 0;
  const pFrameHingeQty = room.plywoodFrameHingeQty !== undefined ? room.plywoodFrameHingeQty : 0;
  const mBoxHingeQty = room.mdfBoxHingeQty !== undefined ? room.mdfBoxHingeQty : 0;
  const mFrameHingeQty = room.mdfFrameHingeQty !== undefined ? room.mdfFrameHingeQty : 0;

  const calculatedHingeQty = room.plywoodBoxHingeQty !== undefined
    ? (pBoxHingeQty + pFrameHingeQty + mBoxHingeQty + mFrameHingeQty)
    : (room.hingeQty || 0);

  const hingeCost = calculatedHingeQty * hingePrice;

  // Telescopes
  const pBoxTelescopeQty = room.plywoodBoxTelescopeQty !== undefined ? room.plywoodBoxTelescopeQty : 0;
  const mBoxTelescopeQty = room.mdfBoxTelescopeQty !== undefined ? room.mdfBoxTelescopeQty : 0;
  const calculatedTelescopeQty = room.plywoodBoxTelescopeQty !== undefined
    ? (pBoxTelescopeQty + mBoxTelescopeQty)
    : (room.telescopeQty || 0);
  const telescopeCost = calculatedTelescopeQty * telescopePrice;

  // Handles 6"
  const pBoxHandle6Qty = room.plywoodBoxHandle6Qty !== undefined ? room.plywoodBoxHandle6Qty : 0;
  const pFrameHandle6Qty = room.plywoodFrameHandle6Qty !== undefined ? room.plywoodFrameHandle6Qty : 0;
  const mBoxHandle6Qty = room.mdfBoxHandle6Qty !== undefined ? room.mdfBoxHandle6Qty : 0;
  const mFrameHandle6Qty = room.mdfFrameHandle6Qty !== undefined ? room.mdfFrameHandle6Qty : 0;
  const calculatedHandle6Qty = room.plywoodBoxHandle6Qty !== undefined
    ? (pBoxHandle6Qty + pFrameHandle6Qty + mBoxHandle6Qty + mFrameHandle6Qty)
    : (room.handle6Qty || 0);
  const handle6InchCost = calculatedHandle6Qty * handle6InchPrice;

  // Handles 9"
  const pBoxHandle9Qty = room.plywoodBoxHandle9Qty !== undefined ? room.plywoodBoxHandle9Qty : 0;
  const pFrameHandle9Qty = room.plywoodFrameHandle9Qty !== undefined ? room.plywoodFrameHandle9Qty : 0;
  const mBoxHandle9Qty = room.mdfBoxHandle9Qty !== undefined ? room.mdfBoxHandle9Qty : 0;
  const mFrameHandle9Qty = room.mdfFrameHandle9Qty !== undefined ? room.mdfFrameHandle9Qty : 0;
  const calculatedHandle9Qty = room.plywoodBoxHandle9Qty !== undefined
    ? (pBoxHandle9Qty + pFrameHandle9Qty + mBoxHandle9Qty + mFrameHandle9Qty)
    : (room.handle9Qty || 0);
  const handle9InchCost = calculatedHandle9Qty * handle9InchPrice;

  // E - Addon Adhesive: 1kg for 1 plywood/MDF sheet used, with separate quantities configured
  const actualPlywoodAdhesiveQty = room.adhesiveQty !== undefined ? room.adhesiveQty : totalPlywoodSheets;
  const actualMdfAdhesiveQty = room.mdfAdhesiveQty !== undefined ? room.mdfAdhesiveQty : totalMdfSheets;
  const totalAdhesiveQty = actualPlywoodAdhesiveQty + actualMdfAdhesiveQty;
  const adhesiveCost = totalAdhesiveQty * adhesivePrice;

  // Separated Labor costs (calculated individually for box and frame, box in CFT, frame in SqFt)
  const plywoodBoxLaborCost = (room.plywoodBoxCFT || 0) * plywoodBoxLaborPrice;
  const plywoodFrameLaborCost = (room.plywoodFrameSqFt || 0) * plywoodFrameLaborPrice;
  const mdfBoxLaborCost = (room.mdfBoxCFT || 0) * mdfBoxLaborPrice;
  const mdfFrameLaborCost = (room.mdfFrameSqFt || 0) * mdfFrameLaborPrice;

  // Detailed allocation for arriving at separate rates
  const colorLaminateBoxCost = colorLaminateBox * colorLaminatePrice;
  const colorLaminateFrameCost = colorLaminateFrame * colorLaminatePrice;
  const acrylicLaminateBoxCost = acrylicLaminateBox * acrylicLaminatePrice;
  const acrylicLaminateFrameCost = acrylicLaminateFrame * acrylicLaminatePrice;
  const halfWhiteLaminateBoxCost = halfWhiteLaminateBox * halfWhiteLaminatePrice;
  const halfWhiteLaminateFrameCost = halfWhiteLaminateFrame * halfWhiteLaminatePrice;

  const totalBoxLaminateCost = colorLaminateBoxCost + acrylicLaminateBoxCost + halfWhiteLaminateBoxCost;
  const totalFrameLaminateCost = colorLaminateFrameCost + acrylicLaminateFrameCost + halfWhiteLaminateFrameCost;

  const plywoodBoxBoardCost = (room.plywoodBoxSheets || 0) * SQFT_PER_SHEET * plywoodPrice;
  const plywoodFrameBoardCost = (room.plywoodFrameSheets || 0) * SQFT_PER_SHEET * plywoodPrice;
  const mdfBoxBoardCost = (room.mdfBoxSheets || 0) * SQFT_PER_SHEET * mdfPrice;
  const mdfFrameBoardCost = (room.mdfFrameSheets || 0) * SQFT_PER_SHEET * mdfPrice;

  // Ratios for sharing common box/frame laminates and accessories
  const totalBoxSheets = (room.plywoodBoxSheets || 0) + (room.mdfBoxSheets || 0);
  const plyBoxRatio = totalBoxSheets > 0 ? (room.plywoodBoxSheets || 0) / totalBoxSheets : 0;
  const mdfBoxRatio = totalBoxSheets > 0 ? (room.mdfBoxSheets || 0) / totalBoxSheets : 0;

  const totalFrameSheets = (room.plywoodFrameSheets || 0) + (room.mdfFrameSheets || 0);
  const plyFrameRatio = totalFrameSheets > 0 ? (room.plywoodFrameSheets || 0) / totalFrameSheets : 0;
  const mdfFrameRatio = totalFrameSheets > 0 ? (room.mdfFrameSheets || 0) / totalFrameSheets : 0;

  // Distribute hinge cost
  const pBoxHingeCost = room.plywoodBoxHingeQty !== undefined ? pBoxHingeQty * hingePrice : hingeCost * plyBoxRatio * 0.7;
  const pFrameHingeCost = room.plywoodBoxHingeQty !== undefined ? pFrameHingeQty * hingePrice : hingeCost * plyFrameRatio * 0.3;
  const mBoxHingeCost = room.plywoodBoxHingeQty !== undefined ? mBoxHingeQty * hingePrice : hingeCost * mdfBoxRatio * 0.7;
  const mFrameHingeCost = room.plywoodBoxHingeQty !== undefined ? mFrameHingeQty * hingePrice : hingeCost * mdfFrameRatio * 0.3;

  // Distribute telescope (all in box)
  const pBoxTelescopeCost = room.plywoodBoxTelescopeQty !== undefined ? pBoxTelescopeQty * telescopePrice : telescopeCost * plyBoxRatio;
  const mBoxTelescopeCost = room.mdfBoxTelescopeQty !== undefined ? mBoxTelescopeQty * telescopePrice : telescopeCost * mdfBoxRatio;

  // Distribute handles (separately for box and frame, as requested)
  const pBoxHandle6Cost = room.plywoodBoxHandle6Qty !== undefined ? pBoxHandle6Qty * handle6InchPrice : 0;
  const pFrameHandle6Cost = room.plywoodFrameHandle6Qty !== undefined ? pFrameHandle6Qty * handle6InchPrice : handle6InchCost * plyFrameRatio;
  const mBoxHandle6Cost = room.mdfBoxHandle6Qty !== undefined ? mBoxHandle6Qty * handle6InchPrice : 0;
  const mFrameHandle6Cost = room.mdfFrameHandle6Qty !== undefined ? mFrameHandle6Qty * handle6InchPrice : handle6InchCost * mdfFrameRatio;

  const pBoxHandle9Cost = room.plywoodBoxHandle9Qty !== undefined ? pBoxHandle9Qty * handle9InchPrice : 0;
  const pFrameHandle9Cost = room.plywoodFrameHandle9Qty !== undefined ? pFrameHandle9Qty * handle9InchPrice : handle9InchCost * plyFrameRatio;
  const mBoxHandle9Cost = room.mdfBoxHandle9Qty !== undefined ? mBoxHandle9Qty * handle9InchPrice : 0;
  const mFrameHandle9Cost = room.mdfFrameHandle9Qty !== undefined ? mFrameHandle9Qty * handle9InchPrice : handle9InchCost * mdfFrameRatio;

  // Adhesive cost (separated for plywood and MDF, proportionally distributed)
  const pBoxAdhesiveCost = totalPlywoodSheets > 0 ? ((room.plywoodBoxSheets || 0) / totalPlywoodSheets) * actualPlywoodAdhesiveQty * adhesivePrice : 0;
  const pFrameAdhesiveCost = totalPlywoodSheets > 0 ? ((room.plywoodFrameSheets || 0) / totalPlywoodSheets) * actualPlywoodAdhesiveQty * adhesivePrice : 0;
  const mdfBoxAdhesiveCost = totalMdfSheets > 0 ? ((room.mdfBoxSheets || 0) / totalMdfSheets) * actualMdfAdhesiveQty * adhesivePrice : 0;
  const mdfFrameAdhesiveCost = totalMdfSheets > 0 ? ((room.mdfFrameSheets || 0) / totalMdfSheets) * actualMdfAdhesiveQty * adhesivePrice : 0;

  // Distribute louvers (for ply box and frame separately, as requested)
  const pBoxLouversCost = room.plywoodBoxLouversPanels !== undefined ? pBoxLouversQty * louversPrice : (room.louversPanels || 0) * louversPrice * plyBoxRatio;
  const pFrameLouversCost = room.plywoodFrameLouversPanels !== undefined ? pFrameLouversQty * louversPrice : (room.louversPanels || 0) * louversPrice * plyFrameRatio;

  // Other Hardware direct currency inputs (for Box and Shutter/Frame)
  const plywoodBoxOtherHardwareCost = room.plywoodBoxOtherHardwareCost || 0;
  const plywoodFrameOtherHardwareCost = room.plywoodFrameOtherHardwareCost || 0;
  const mdfBoxOtherHardwareCost = room.mdfBoxOtherHardwareCost || 0;
  const mdfFrameOtherHardwareCost = room.mdfFrameOtherHardwareCost || 0;
  const totalOtherHardwareCost =
    plywoodBoxOtherHardwareCost +
    plywoodFrameOtherHardwareCost +
    mdfBoxOtherHardwareCost +
    mdfFrameOtherHardwareCost;

  // Total value of the entries for Box and Frame separately (materials, hardware & salary)
  const plywoodBoxTotalValue =
    plywoodBoxBoardCost +
    totalBoxLaminateCost +
    pBoxHingeCost +
    pBoxTelescopeCost +
    pBoxHandle6Cost +
    pBoxHandle9Cost +
    plywoodBoxOtherHardwareCost +
    pBoxAdhesiveCost +
    pBoxLouversCost +
    plywoodBoxLaborCost;

  const plywoodFrameTotalValue =
    plywoodFrameBoardCost +
    totalFrameLaminateCost +
    pFrameHingeCost +
    pFrameHandle6Cost +
    pFrameHandle9Cost +
    plywoodFrameOtherHardwareCost +
    pFrameAdhesiveCost +
    pFrameLouversCost +
    plywoodFrameLaborCost;

  const mdfBoxTotalValue =
    mdfBoxBoardCost +
    mBoxHingeCost +
    mBoxTelescopeCost +
    mBoxHandle6Cost +
    mBoxHandle9Cost +
    mdfBoxOtherHardwareCost +
    mdfBoxAdhesiveCost +
    mdfBoxLaborCost;

  const mdfFrameTotalValue =
    mdfFrameBoardCost +
    mFrameHingeCost +
    mFrameHandle6Cost +
    mFrameHandle9Cost +
    mdfFrameOtherHardwareCost +
    mdfFrameAdhesiveCost +
    mdfFrameLaborCost;

  // Calculate rates per CFT / SqFt
  const plywoodBoxCalculatedRatePerCFT = (room.plywoodBoxCFT || 0) > 0 ? plywoodBoxTotalValue / room.plywoodBoxCFT : 0;
  const plywoodFrameCalculatedRatePerSqFt = (room.plywoodFrameSqFt || 0) > 0 ? plywoodFrameTotalValue / room.plywoodFrameSqFt : 0;

  const mdfBoxCalculatedRatePerCFT = (room.mdfBoxCFT || 0) > 0 ? mdfBoxTotalValue / room.mdfBoxCFT : 0;
  const mdfFrameCalculatedRatePerSqFt = (room.mdfFrameSqFt || 0) > 0 ? mdfFrameTotalValue / room.mdfFrameSqFt : 0;

  const totalMaterials =
    plywoodCost +
    mdfCost +
    colorLaminateCost +
    acrylicLaminateCost +
    halfWhiteLaminateCost +
    louversCost +
    adhesiveCost;

  const totalHardware = hingeCost + telescopeCost + handle6InchCost + handle9InchCost + totalOtherHardwareCost;
  const totalLabor = plywoodBoxLaborCost + plywoodFrameLaborCost + mdfBoxLaborCost + mdfFrameLaborCost;
  const totalRoomCost = totalMaterials + totalHardware + totalLabor;

  return {
    plywoodCost,
    mdfCost,
    colorLaminateCost,
    acrylicLaminateCost,
    halfWhiteLaminateCost,
    louversCost,
    hingeCost,
    telescopeCost,
    handle6InchCost,
    handle9InchCost,
    plywoodBoxLaborCost,
    plywoodFrameLaborCost,
    mdfBoxLaborCost,
    mdfFrameLaborCost,
    adhesiveCost,
    totalMaterials,
    totalHardware,
    totalLabor,
    totalRoomCost,

    plywoodBoxTotalValue,
    plywoodFrameTotalValue,
    mdfBoxTotalValue,
    mdfFrameTotalValue,

    plywoodBoxCalculatedRatePerCFT,
    plywoodFrameCalculatedRatePerSqFt,
    mdfBoxCalculatedRatePerCFT,
    mdfFrameCalculatedRatePerSqFt,

    plywoodBoxBoardCost,
    plywoodFrameBoardCost,
    mdfBoxBoardCost,
    mdfFrameBoardCost,

    colorLaminateBoxCost,
    colorLaminateFrameCost,
    acrylicLaminateBoxCost,
    acrylicLaminateFrameCost,
    halfWhiteLaminateBoxCost,
    halfWhiteLaminateFrameCost,

    pBoxLouversCost,
    pFrameLouversCost,

    pBoxHingeCost,
    pFrameHingeCost,
    mBoxHingeCost,
    mFrameHingeCost,

    pBoxTelescopeCost,
    mBoxTelescopeCost,

    pBoxHandle6Cost,
    pFrameHandle6Cost,
    mBoxHandle6Cost,
    mFrameHandle6Cost,

    pBoxHandle9Cost,
    pFrameHandle9Cost,
    mBoxHandle9Cost,
    mFrameHandle9Cost,

    pBoxAdhesiveCost,
    pFrameAdhesiveCost,
    mdfBoxAdhesiveCost,
    mdfFrameAdhesiveCost,
    totalAdhesiveQty,

    plywoodBoxOtherHardwareCost,
    plywoodFrameOtherHardwareCost,
    mdfBoxOtherHardwareCost,
    mdfFrameOtherHardwareCost,
    totalOtherHardwareCost,
  };
}

export function formatCurrency(value: number, currencySymbol: string): string {
  return `${currencySymbol}${value.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}`;
}

export interface GroupedMaterialSummary {
  itemKey: PriceItemKey;
  label: string;
  category: string;
  rate: number;
  unit: string;
  quantity: number;
  totalCost: number;
  rooms: { name: string; qty: number; cost: number; details?: string }[];
}

const SUMMARY_ORDER: PriceItemKey[] = [
  'plywood',
  'mdf',
  'colorLaminate',
  'acrylicLaminate',
  'halfWhiteLaminate',
  'louvers',
  'hinge',
  'telescope',
  'handle6Inch',
  'handle9Inch',
  'adhesive',
  'plywoodBoxLabor',
  'plywoodFrameLabor',
  'mdfBoxLabor',
  'mdfFrameLabor'
];

const ITEM_KEYS_TO_GROUP: { key: PriceItemKey; label: string; unit: string; getQtyAndCost: (room: RoomData, rate: number) => { qty: number; cost: number; details?: string } }[] = [
  {
    key: 'plywood',
    label: 'Plywood Core Board',
    unit: 'sheet',
    getQtyAndCost: (room, rate) => {
      const box = room.plywoodBoxSheets || 0;
      const frame = room.plywoodFrameSheets || 0;
      const qty = box + frame;
      const ratePerSheet = rate * 32;
      return {
        qty,
        cost: qty * ratePerSheet,
        details: qty > 0 ? `${qty.toFixed(1)} sht (${box.toFixed(1)} Box, ${frame.toFixed(1)} Frame)` : undefined
      };
    }
  },
  {
    key: 'mdf',
    label: 'MDF Core Board',
    unit: 'sheet',
    getQtyAndCost: (room, rate) => {
      const box = room.mdfBoxSheets || 0;
      const frame = room.mdfFrameSheets || 0;
      const qty = box + frame;
      const ratePerSheet = rate * 32;
      return {
        qty,
        cost: qty * ratePerSheet,
        details: qty > 0 ? `${qty.toFixed(1)} sht (${box.toFixed(1)} Box, ${frame.toFixed(1)} Frame)` : undefined
      };
    }
  },
  {
    key: 'colorLaminate',
    label: 'Color Laminate Sheets',
    unit: 'sheet',
    getQtyAndCost: (room, rate) => {
      const box = room.colorLaminateBoxSheets !== undefined ? room.colorLaminateBoxSheets : (room.colorLaminateSheets || 0);
      const frame = room.colorLaminateFrameSheets !== undefined ? room.colorLaminateFrameSheets : 0;
      const qty = box + frame;
      return {
        qty,
        cost: qty * rate,
        details: qty > 0 ? `${qty} sht (${box} Box, ${frame} Frame)` : undefined
      };
    }
  },
  {
    key: 'acrylicLaminate',
    label: 'Acrylic Laminate Sheets',
    unit: 'sheet',
    getQtyAndCost: (room, rate) => {
      const box = room.acrylicLaminateBoxSheets !== undefined ? room.acrylicLaminateBoxSheets : (room.acrylicLaminateSheets || 0);
      const frame = room.acrylicLaminateFrameSheets !== undefined ? room.acrylicLaminateFrameSheets : 0;
      const qty = box + frame;
      return {
        qty,
        cost: qty * rate,
        details: qty > 0 ? `${qty} sht (${box} Box, ${frame} Frame)` : undefined
      };
    }
  },
  {
    key: 'halfWhiteLaminate',
    label: 'Half White Laminate Sheets',
    unit: 'sheet',
    getQtyAndCost: (room, rate) => {
      const box = room.halfWhiteLaminateBoxSheets !== undefined ? room.halfWhiteLaminateBoxSheets : (room.halfWhiteLaminateSheets || 0);
      const frame = room.halfWhiteLaminateFrameSheets !== undefined ? room.halfWhiteLaminateFrameSheets : 0;
      const qty = box + frame;
      return {
        qty,
        cost: qty * rate,
        details: qty > 0 ? `${qty} sht (${box} Box, ${frame} Frame)` : undefined
      };
    }
  },
  {
    key: 'louvers',
    label: 'Louvers / Fluted Panels',
    unit: 'panel',
    getQtyAndCost: (room, rate) => {
      const box = room.plywoodBoxLouversPanels !== undefined ? room.plywoodBoxLouversPanels : 0;
      const frame = room.plywoodFrameLouversPanels !== undefined ? room.plywoodFrameLouversPanels : 0;
      const qty = room.plywoodBoxLouversPanels !== undefined
        ? (box + frame)
        : (room.louversPanels || 0);
      return {
        qty,
        cost: qty * rate,
        details: qty > 0 && room.plywoodBoxLouversPanels !== undefined ? `${qty} pnl (${box} Box, ${frame} Frame)` : undefined
      };
    }
  },
  {
    key: 'hinge',
    label: 'Soft-Close Hinges',
    unit: 'pc',
    getQtyAndCost: (room, rate) => {
      const pBoxHingeQty = room.plywoodBoxHingeQty !== undefined ? room.plywoodBoxHingeQty : 0;
      const pFrameHingeQty = room.plywoodFrameHingeQty !== undefined ? room.plywoodFrameHingeQty : 0;
      const mBoxHingeQty = room.mdfBoxHingeQty !== undefined ? room.mdfBoxHingeQty : 0;
      const mFrameHingeQty = room.mdfFrameHingeQty !== undefined ? room.mdfFrameHingeQty : 0;

      const qty = room.plywoodBoxHingeQty !== undefined
        ? (pBoxHingeQty + pFrameHingeQty + mBoxHingeQty + mFrameHingeQty)
        : (room.hingeQty || 0);
      return { qty, cost: qty * rate };
    }
  },
  {
    key: 'telescope',
    label: 'Telescopic Channels',
    unit: 'pair',
    getQtyAndCost: (room, rate) => {
      const pBoxTelescopeQty = room.plywoodBoxTelescopeQty !== undefined ? room.plywoodBoxTelescopeQty : 0;
      const mBoxTelescopeQty = room.mdfBoxTelescopeQty !== undefined ? room.mdfBoxTelescopeQty : 0;
      const qty = room.plywoodBoxTelescopeQty !== undefined
        ? (pBoxTelescopeQty + mBoxTelescopeQty)
        : (room.telescopeQty || 0);
      return { qty, cost: qty * rate };
    }
  },
  {
    key: 'handle6Inch',
    label: 'Cabinet Handles 6"',
    unit: 'pc',
    getQtyAndCost: (room, rate) => {
      const pBoxHandle6Qty = room.plywoodBoxHandle6Qty !== undefined ? room.plywoodBoxHandle6Qty : 0;
      const pFrameHandle6Qty = room.plywoodFrameHandle6Qty !== undefined ? room.plywoodFrameHandle6Qty : 0;
      const mBoxHandle6Qty = room.mdfBoxHandle6Qty !== undefined ? room.mdfBoxHandle6Qty : 0;
      const mFrameHandle6Qty = room.mdfFrameHandle6Qty !== undefined ? room.mdfFrameHandle6Qty : 0;
      const qty = room.plywoodBoxHandle6Qty !== undefined
        ? (pBoxHandle6Qty + pFrameHandle6Qty + mBoxHandle6Qty + mFrameHandle6Qty)
        : (room.handle6Qty || 0);
      return { qty, cost: qty * rate };
    }
  },
  {
    key: 'handle9Inch',
    label: 'Cabinet Handles 9"',
    unit: 'pc',
    getQtyAndCost: (room, rate) => {
      const pBoxHandle9Qty = room.plywoodBoxHandle9Qty !== undefined ? room.plywoodBoxHandle9Qty : 0;
      const pFrameHandle9Qty = room.plywoodFrameHandle9Qty !== undefined ? room.plywoodFrameHandle9Qty : 0;
      const mBoxHandle9Qty = room.mdfBoxHandle9Qty !== undefined ? room.mdfBoxHandle9Qty : 0;
      const mFrameHandle9Qty = room.mdfFrameHandle9Qty !== undefined ? room.mdfFrameHandle9Qty : 0;
      const qty = room.plywoodBoxHandle9Qty !== undefined
        ? (pBoxHandle9Qty + pFrameHandle9Qty + mBoxHandle9Qty + mFrameHandle9Qty)
        : (room.handle9Qty || 0);
      return { qty, cost: qty * rate };
    }
  },
  {
    key: 'adhesive',
    label: 'Synthetic Resin Adhesive',
    unit: 'kg',
    getQtyAndCost: (room, rate) => {
      const totalPlywoodSheets = (room.plywoodBoxSheets || 0) + (room.plywoodFrameSheets || 0);
      const totalMdfSheets = (room.mdfBoxSheets || 0) + (room.mdfFrameSheets || 0);
      const pQty = room.adhesiveQty !== undefined ? room.adhesiveQty : totalPlywoodSheets;
      const mQty = room.mdfAdhesiveQty !== undefined ? room.mdfAdhesiveQty : totalMdfSheets;
      const qty = pQty + mQty;
      return { qty, cost: qty * rate };
    }
  },
  {
    key: 'plywoodBoxLabor',
    label: 'Plywood Box (Carcass) Labor',
    unit: 'cft',
    getQtyAndCost: (room, rate) => {
      const qty = room.plywoodBoxCFT || 0;
      return { qty, cost: qty * rate };
    }
  },
  {
    key: 'plywoodFrameLabor',
    label: 'Plywood Frame (Shutter) Labor',
    unit: 'sq.ft',
    getQtyAndCost: (room, rate) => {
      const qty = room.plywoodFrameSqFt || 0;
      return { qty, cost: qty * rate };
    }
  },
  {
    key: 'mdfBoxLabor',
    label: 'MDF Box (Carcass) Labor',
    unit: 'cft',
    getQtyAndCost: (room, rate) => {
      const qty = room.mdfBoxCFT || 0;
      return { qty, cost: qty * rate };
    }
  },
  {
    key: 'mdfFrameLabor',
    label: 'MDF Frame (Shutter) Labor',
    unit: 'sq.ft',
    getQtyAndCost: (room, rate) => {
      const qty = room.mdfFrameSqFt || 0;
      return { qty, cost: qty * rate };
    }
  }
];

export function getGroupedMaterials(
  rooms: RoomData[],
  globalPrices: Record<PriceItemKey, number>
): GroupedMaterialSummary[] {
  const groups: Record<string, GroupedMaterialSummary> = {};

  for (const itemConf of ITEM_KEYS_TO_GROUP) {
    for (const room of rooms) {
      const rate = getEffectivePrice(itemConf.key, room, globalPrices);
      const { qty, cost, details } = itemConf.getQtyAndCost(room, rate);

      if (qty > 0) {
        const displayRate = (itemConf.key === 'plywood' || itemConf.key === 'mdf') ? rate * 32 : rate;
        const groupKey = `${itemConf.key}_${displayRate}`;
        if (!groups[groupKey]) {
          groups[groupKey] = {
            itemKey: itemConf.key,
            label: itemConf.label,
            category: itemConf.key === 'plywood' || itemConf.key === 'mdf' ? 'base' :
                      itemConf.key.includes('Laminate') ? 'laminate' :
                      itemConf.key.includes('Labor') ? 'labor' :
                      itemConf.key.includes('hinge') || itemConf.key.includes('telescope') || itemConf.key.includes('handle') ? 'hardware' : 'extra',
            rate: displayRate,
            unit: itemConf.unit,
            quantity: 0,
            totalCost: 0,
            rooms: []
          };
        }

        groups[groupKey].quantity += qty;
        groups[groupKey].totalCost += cost;

        const existingRoomIdx = groups[groupKey].rooms.findIndex(r => r.name === room.name);
        if (existingRoomIdx >= 0) {
          groups[groupKey].rooms[existingRoomIdx].qty += qty;
          groups[groupKey].rooms[existingRoomIdx].cost += cost;
          if (details) {
            groups[groupKey].rooms[existingRoomIdx].details = details;
          }
        } else {
          groups[groupKey].rooms.push({
            name: room.name,
            qty,
            cost,
            details
          });
        }
      }
    }
  }

  return Object.values(groups).sort((a, b) => {
    const idxA = SUMMARY_ORDER.indexOf(a.itemKey);
    const idxB = SUMMARY_ORDER.indexOf(b.itemKey);
    if (idxA !== idxB) {
      return idxA - idxB;
    }
    return b.rate - a.rate;
  });
}
