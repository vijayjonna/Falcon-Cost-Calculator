import React, { useState, useEffect } from 'react';
import { RoomData, PriceItemKey } from '../types';
import { calculateRoomCost, getEffectivePrice, formatCurrency } from '../utils';
import { Layers, Box, DoorClosed, CheckCircle2, PackageCheck, Hammer, Sparkles, Ruler } from 'lucide-react';

interface ScopeItem {
  id: string;
  name: string;
  category: string;
  badge: string;
  badgeColor: string;
  qtyStr: string;
  areaVolStr: string;
  unitRateStr: string;
  cost: number;
}

interface ScopeDetailTabProps {
  title: string;
  subtitle: string;
  materialName: 'Plywood' | 'MDF';
  icon: React.ElementType;
  accent: 'blue' | 'sky' | 'purple' | 'fuchsia';
  totalValue: number;
  metricLabel: string;
  metricValue: string;
  derivedRate: number;
  rateUnit: string;
  boardSheets: number;
  items: ScopeItem[];
  currency: string;
  isDarkMode: boolean;
}

const ScopeDetailTab: React.FC<ScopeDetailTabProps> = ({
  title,
  subtitle,
  materialName,
  icon: Icon,
  accent,
  totalValue,
  metricLabel,
  metricValue,
  derivedRate,
  rateUnit,
  boardSheets,
  items,
  currency,
  isDarkMode,
}) => {
  const defaultAccent = {
    card: isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50/80 border-slate-200',
    text: isDarkMode ? 'text-white' : 'text-slate-900',
    badge: isDarkMode ? 'bg-slate-850 text-slate-200 border-slate-750' : 'bg-slate-100 text-slate-800 border-slate-200',
    header: isDarkMode ? 'bg-slate-850 text-slate-200' : 'bg-slate-100 text-slate-800',
  };

  const accentClasses = {
    blue: defaultAccent,
    sky: defaultAccent,
    purple: defaultAccent,
    fuchsia: defaultAccent,
  }[accent];

  return (
    <div className="space-y-4">
      {/* Scope Overview Hero Card */}
      <div className={`p-4 rounded-xl border ${accentClasses.card}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 mb-3 border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg border ${accentClasses.badge}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className={`text-sm font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {title} Detailed Cost Breakdown
              </h4>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black px-3 py-1.5 rounded-lg border ${accentClasses.badge}`}>
              Total {title}: {formatCurrency(totalValue, currency)}
            </span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Component Value</span>
            <span className={`text-lg font-black block mt-0.5 ${accentClasses.text}`}>
              {formatCurrency(totalValue, currency)}
            </span>
          </div>
          <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Derived Unit Rate</span>
            <span className={`text-lg font-black block mt-0.5 ${accentClasses.text}`}>
              {formatCurrency(derivedRate, currency)}
              <span className="text-xs font-semibold text-slate-400"> {rateUnit}</span>
            </span>
          </div>
          <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{metricLabel}</span>
            <span className={`text-lg font-black block mt-0.5 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
              {metricValue}
            </span>
          </div>
          <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{materialName} Core Sheets</span>
            <span className={`text-lg font-black block mt-0.5 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
              {boardSheets.toFixed(1)} <span className="text-xs font-semibold text-slate-400">sheets</span>
            </span>
          </div>
        </div>
      </div>

      {/* Itemized Component Table */}
      <div className={`border rounded-xl overflow-hidden shadow-xs ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b font-bold text-[10px] uppercase tracking-wider ${accentClasses.header}`}>
                <th className="p-3 w-12 text-center">S.No.</th>
                <th className="p-3">Component / Resource Description</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Input Qty</th>
                <th className="p-3 text-right">Derived Area / Vol</th>
                <th className="p-3 text-right">Unit Rate</th>
                <th className="p-3 text-right">Calculated Cost</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/70' : 'divide-slate-150'}`}>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                    No items entered for this component yet.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.id} className={isDarkMode ? 'hover:bg-slate-850/50' : 'hover:bg-slate-50/70'}>
                    <td className="p-3 text-center font-mono text-slate-400 font-bold">{idx + 1}</td>
                    <td className={`p-3 font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {item.name}
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold">{item.qtyStr}</td>
                    <td className="p-3 text-right text-slate-400">{item.areaVolStr}</td>
                    <td className="p-3 text-right text-slate-500">{item.unitRateStr}</td>
                    <td className="p-3 text-right font-black">{formatCurrency(item.cost, currency)}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className={`border-t-2 font-black ${
                isDarkMode ? 'bg-slate-950 text-white border-slate-700' : 'bg-slate-100 text-slate-900 border-slate-300'
              }`}>
                <td colSpan={3} className="p-3.5 uppercase tracking-wider text-xs">
                  Total Allocated Value for {title}
                </td>
                <td colSpan={3} className="p-3.5 text-right font-semibold text-slate-500 text-xs">
                  Derived Unit Rate: {formatCurrency(derivedRate, currency)} {rateUnit}
                </td>
                <td className={`p-3.5 text-right text-base font-black ${accentClasses.text}`}>
                  {formatCurrency(totalValue, currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Formula & Derivation Explainer */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
        isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <Ruler className={`h-4 w-4 shrink-0 ${accentClasses.text}`} />
          <div>
            <span className="font-extrabold block">Rate Calculation Formula:</span>
            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
              Total Component Value ({formatCurrency(totalValue, currency)}) &divide; {metricLabel} ({metricValue}) = {formatCurrency(derivedRate, currency)} {rateUnit}
            </span>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-lg font-black border text-center ${accentClasses.badge}`}>
          Final Derived Rate: {formatCurrency(derivedRate, currency)} {rateUnit}
        </div>
      </div>
    </div>
  );
};

interface CostCalculationSheetProps {
  room: RoomData;
  globalPrices: Record<PriceItemKey, number>;
  currency: string;
  isDarkMode: boolean;
}

export const CostCalculationSheet: React.FC<CostCalculationSheetProps> = ({
  room,
  globalPrices,
  currency,
  isDarkMode,
}) => {
  const SQFT_PER_SHEET = 32;
  const rCost = calculateRoomCost(room, globalPrices);

  // Prices
  const plywoodPrice = getEffectivePrice('plywood', room, globalPrices);
  const mdfPrice = getEffectivePrice('mdf', room, globalPrices);
  const colorLaminatePrice = getEffectivePrice('colorLaminate', room, globalPrices);
  const acrylicLaminatePrice = getEffectivePrice('acrylicLaminate', room, globalPrices);
  const halfWhiteLaminatePrice = getEffectivePrice('halfWhiteLaminate', room, globalPrices);
  const louversPrice = getEffectivePrice('louvers', room, globalPrices);
  const adhesivePrice = getEffectivePrice('adhesive', room, globalPrices);
  const hingePrice = getEffectivePrice('hinge', room, globalPrices);
  const telescopePrice = getEffectivePrice('telescope', room, globalPrices);
  const handle6Price = getEffectivePrice('handle6Inch', room, globalPrices);
  const handle9Price = getEffectivePrice('handle9Inch', room, globalPrices);
  const plywoodBoxLaborPrice = getEffectivePrice('plywoodBoxLabor', room, globalPrices);
  const plywoodFrameLaborPrice = getEffectivePrice('plywoodFrameLabor', room, globalPrices);
  const mdfBoxLaborPrice = getEffectivePrice('mdfBoxLabor', room, globalPrices);
  const mdfFrameLaborPrice = getEffectivePrice('mdfFrameLabor', room, globalPrices);

  // Quantities
  const pBoxSheets = room.plywoodBoxSheets || 0;
  const pFrameSheets = room.plywoodFrameSheets || 0;
  const totalPlywoodSheets = pBoxSheets + pFrameSheets;

  const mBoxSheets = room.mdfBoxSheets || 0;
  const mFrameSheets = room.mdfFrameSheets || 0;
  const totalMdfSheets = mBoxSheets + mFrameSheets;

  const colorBox = room.colorLaminateBoxSheets !== undefined ? room.colorLaminateBoxSheets : (room.colorLaminateSheets || 0);
  const colorFrame = room.colorLaminateFrameSheets !== undefined ? room.colorLaminateFrameSheets : 0;
  const totalColorSheets = colorBox + colorFrame;

  const acrylicBox = room.acrylicLaminateBoxSheets !== undefined ? room.acrylicLaminateBoxSheets : (room.acrylicLaminateSheets || 0);
  const acrylicFrame = room.acrylicLaminateFrameSheets !== undefined ? room.acrylicLaminateFrameSheets : 0;
  const totalAcrylicSheets = acrylicBox + acrylicFrame;

  const hwBox = room.halfWhiteLaminateBoxSheets !== undefined ? room.halfWhiteLaminateBoxSheets : (room.halfWhiteLaminateSheets || 0);
  const hwFrame = room.halfWhiteLaminateFrameSheets !== undefined ? room.halfWhiteLaminateFrameSheets : 0;
  const totalHalfWhiteSheets = hwBox + hwFrame;

  const totalAllLaminates = totalColorSheets + totalAcrylicSheets + totalHalfWhiteSheets;
  const totalBoxLaminates = colorBox + acrylicBox + hwBox;
  const totalFrameLaminates = colorFrame + acrylicFrame + hwFrame;

  const pBoxLouvers = room.plywoodBoxLouversPanels !== undefined ? room.plywoodBoxLouversPanels : 0;
  const pFrameLouvers = room.plywoodFrameLouversPanels !== undefined ? room.plywoodFrameLouversPanels : 0;
  const totalLouvers = room.plywoodBoxLouversPanels !== undefined ? (pBoxLouvers + pFrameLouvers) : (room.louversPanels || 0);

  // Hinges
  const pBoxHinges = room.plywoodBoxHingeQty !== undefined ? room.plywoodBoxHingeQty : 0;
  const pFrameHinges = room.plywoodFrameHingeQty !== undefined ? room.plywoodFrameHingeQty : 0;
  const mBoxHinges = room.mdfBoxHingeQty !== undefined ? room.mdfBoxHingeQty : 0;
  const mFrameHinges = room.mdfFrameHingeQty !== undefined ? room.mdfFrameHingeQty : 0;
  const totalHinges = room.plywoodBoxHingeQty !== undefined
    ? (pBoxHinges + pFrameHinges + mBoxHinges + mFrameHinges)
    : (room.hingeQty || 0);

  // Telescopes
  const pBoxTelescope = room.plywoodBoxTelescopeQty !== undefined ? room.plywoodBoxTelescopeQty : 0;
  const mBoxTelescope = room.mdfBoxTelescopeQty !== undefined ? room.mdfBoxTelescopeQty : 0;
  const totalTelescopes = room.plywoodBoxTelescopeQty !== undefined
    ? (pBoxTelescope + mBoxTelescope)
    : (room.telescopeQty || 0);

  // Handles 6"
  const pBoxHandle6 = room.plywoodBoxHandle6Qty !== undefined ? room.plywoodBoxHandle6Qty : 0;
  const pFrameHandle6 = room.plywoodFrameHandle6Qty !== undefined ? room.plywoodFrameHandle6Qty : 0;
  const mBoxHandle6 = room.mdfBoxHandle6Qty !== undefined ? room.mdfBoxHandle6Qty : 0;
  const mFrameHandle6 = room.mdfFrameHandle6Qty !== undefined ? room.mdfFrameHandle6Qty : 0;
  const totalHandle6 = room.plywoodBoxHandle6Qty !== undefined
    ? (pBoxHandle6 + pFrameHandle6 + mBoxHandle6 + mFrameHandle6)
    : (room.handle6Qty || 0);

  // Handles 9"
  const pBoxHandle9 = room.plywoodBoxHandle9Qty !== undefined ? room.plywoodBoxHandle9Qty : 0;
  const pFrameHandle9 = room.plywoodFrameHandle9Qty !== undefined ? room.plywoodFrameHandle9Qty : 0;
  const mBoxHandle9 = room.mdfBoxHandle9Qty !== undefined ? room.mdfBoxHandle9Qty : 0;
  const mFrameHandle9 = room.mdfFrameHandle9Qty !== undefined ? room.mdfFrameHandle9Qty : 0;
  const totalHandle9 = room.plywoodBoxHandle9Qty !== undefined
    ? (pBoxHandle9 + pFrameHandle9 + mBoxHandle9 + mFrameHandle9)
    : (room.handle9Qty || 0);

  // Adhesives
  const actualPlywoodAdhesiveQty = room.adhesiveQty !== undefined ? room.adhesiveQty : totalPlywoodSheets;
  const actualMdfAdhesiveQty = room.mdfAdhesiveQty !== undefined ? room.mdfAdhesiveQty : totalMdfSheets;
  const pBoxAdhesiveQty = totalPlywoodSheets > 0 ? (pBoxSheets / totalPlywoodSheets) * actualPlywoodAdhesiveQty : 0;
  const pFrameAdhesiveQty = totalPlywoodSheets > 0 ? (pFrameSheets / totalPlywoodSheets) * actualPlywoodAdhesiveQty : 0;
  const mBoxAdhesiveQty = totalMdfSheets > 0 ? (mBoxSheets / totalMdfSheets) * actualMdfAdhesiveQty : 0;
  const mFrameAdhesiveQty = totalMdfSheets > 0 ? (mFrameSheets / totalMdfSheets) * actualMdfAdhesiveQty : 0;

  // Labor
  const pBoxCFT = room.plywoodBoxCFT || 0;
  const pFrameSqFt = room.plywoodFrameSqFt || 0;
  const mBoxCFT = room.mdfBoxCFT || 0;
  const mFrameSqFt = room.mdfFrameSqFt || 0;

  // Check if each component has data entered/specified
  const hasPlyBox =
    pBoxSheets > 0 ||
    pBoxCFT > 0 ||
    colorBox > 0 ||
    acrylicBox > 0 ||
    hwBox > 0 ||
    pBoxLouvers > 0 ||
    pBoxHinges > 0 ||
    pBoxTelescope > 0 ||
    pBoxHandle6 > 0 ||
    pBoxHandle9 > 0 ||
    (room.plywoodBoxOtherHardwareCost || 0) > 0 ||
    rCost.plywoodBoxTotalValue > 0;

  const hasPlyShutter =
    pFrameSheets > 0 ||
    pFrameSqFt > 0 ||
    colorFrame > 0 ||
    acrylicFrame > 0 ||
    hwFrame > 0 ||
    pFrameLouvers > 0 ||
    pFrameHinges > 0 ||
    pFrameHandle6 > 0 ||
    pFrameHandle9 > 0 ||
    (room.plywoodFrameOtherHardwareCost || 0) > 0 ||
    rCost.plywoodFrameTotalValue > 0;

  const hasMdfBox =
    mBoxSheets > 0 ||
    mBoxCFT > 0 ||
    mBoxHinges > 0 ||
    mBoxTelescope > 0 ||
    mBoxHandle6 > 0 ||
    mBoxHandle9 > 0 ||
    (room.mdfBoxOtherHardwareCost || 0) > 0 ||
    rCost.mdfBoxTotalValue > 0;

  const hasMdfShutter =
    mFrameSheets > 0 ||
    mFrameSqFt > 0 ||
    mFrameHinges > 0 ||
    mFrameHandle6 > 0 ||
    mFrameHandle9 > 0 ||
    (room.mdfFrameOtherHardwareCost || 0) > 0 ||
    rCost.mdfFrameTotalValue > 0;

  type CostTabKey = 'overall' | 'ply_box' | 'ply_shutter' | 'mdf_box' | 'mdf_shutter';
  const [activeTab, setActiveTab] = useState<CostTabKey>('overall');

  const availableTabs: {
    key: CostTabKey;
    label: string;
    subLabel: string;
    icon: React.ElementType;
    colorClass: string;
    activeClass: string;
    badge: string;
  }[] = [
    {
      key: 'overall',
      label: 'Overall Space',
      subLabel: 'Cumulative Total',
      icon: Layers,
      colorClass: 'text-slate-400',
      activeClass: isDarkMode
        ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-xs ring-1 ring-slate-700'
        : 'bg-white text-slate-900 border-[#134d9c] shadow-xs ring-1 ring-[#134d9c]/20',
      badge: formatCurrency(rCost.totalRoomCost, currency),
    },
    ...(hasPlyBox
      ? [
          {
            key: 'ply_box' as CostTabKey,
            label: 'Plywood Box',
            subLabel: 'Carcass Unit',
            icon: Box,
            colorClass: 'text-slate-400',
            activeClass: isDarkMode
              ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-xs ring-1 ring-slate-700'
              : 'bg-white text-slate-900 border-[#134d9c] shadow-xs ring-1 ring-[#134d9c]/20',
            badge: formatCurrency(rCost.plywoodBoxTotalValue, currency),
          },
        ]
      : []),
    ...(hasPlyShutter
      ? [
          {
            key: 'ply_shutter' as CostTabKey,
            label: 'Plywood Shutter',
            subLabel: 'Frame Unit',
            icon: DoorClosed,
            colorClass: 'text-slate-400',
            activeClass: isDarkMode
              ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-xs ring-1 ring-slate-700'
              : 'bg-white text-slate-900 border-[#134d9c] shadow-xs ring-1 ring-[#134d9c]/20',
            badge: formatCurrency(rCost.plywoodFrameTotalValue, currency),
          },
        ]
      : []),
    ...(hasMdfBox
      ? [
          {
            key: 'mdf_box' as CostTabKey,
            label: 'MDF Box',
            subLabel: 'Carcass Unit',
            icon: Box,
            colorClass: 'text-slate-400',
            activeClass: isDarkMode
              ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-xs ring-1 ring-slate-700'
              : 'bg-white text-slate-900 border-[#134d9c] shadow-xs ring-1 ring-[#134d9c]/20',
            badge: formatCurrency(rCost.mdfBoxTotalValue, currency),
          },
        ]
      : []),
    ...(hasMdfShutter
      ? [
          {
            key: 'mdf_shutter' as CostTabKey,
            label: 'MDF Shutter',
            subLabel: 'Frame Unit',
            icon: DoorClosed,
            colorClass: 'text-slate-400',
            activeClass: isDarkMode
              ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-xs ring-1 ring-slate-700'
              : 'bg-white text-slate-900 border-[#134d9c] shadow-xs ring-1 ring-[#134d9c]/20',
            badge: formatCurrency(rCost.mdfFrameTotalValue, currency),
          },
        ]
      : []),
  ];

  useEffect(() => {
    // If current tab is no longer available in the active space, switch back to 'overall'
    if (!availableTabs.some((t) => t.key === activeTab)) {
      setActiveTab('overall');
    }
  }, [room.id, activeTab, hasPlyBox, hasPlyShutter, hasMdfBox, hasMdfShutter]);

  // Build items list for Plywood Box
  const plyBoxItems: ScopeItem[] = [
    ...(pBoxSheets > 0
      ? [
          {
            id: 'ply-box-board',
            name: 'Plywood Core Board - Carcass (Box)',
            category: 'Board Core',
            badge: 'Carcass (Box)',
            badgeColor: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
            qtyStr: `${pBoxSheets.toFixed(1)} sht`,
            areaVolStr: `${(pBoxSheets * SQFT_PER_SHEET).toFixed(0)} sqft`,
            unitRateStr: `${formatCurrency(plywoodPrice, currency)}/sqft (${formatCurrency(plywoodPrice * SQFT_PER_SHEET, currency)}/sht)`,
            cost: rCost.plywoodBoxBoardCost,
          },
        ]
      : []),
    ...(colorBox > 0
      ? [
          {
            id: 'ply-box-color-lam',
            name: 'Color Laminate (0.8mm) - Carcass (Box)',
            category: 'Laminate',
            badge: 'Box Surfaces',
            badgeColor: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
            qtyStr: `${colorBox.toFixed(1)} sht`,
            areaVolStr: `${(colorBox * SQFT_PER_SHEET).toFixed(0)} sqft`,
            unitRateStr: `${formatCurrency(colorLaminatePrice, currency)}/sht`,
            cost: rCost.colorLaminateBoxCost,
          },
        ]
      : []),
    ...(acrylicBox > 0
      ? [
          {
            id: 'ply-box-acrylic-lam',
            name: 'Acrylic Laminate (1.5mm) - Carcass (Box)',
            category: 'Laminate',
            badge: 'Box Surfaces',
            badgeColor: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
            qtyStr: `${acrylicBox.toFixed(1)} sht`,
            areaVolStr: `${(acrylicBox * SQFT_PER_SHEET).toFixed(0)} sqft`,
            unitRateStr: `${formatCurrency(acrylicLaminatePrice, currency)}/sht`,
            cost: rCost.acrylicLaminateBoxCost,
          },
        ]
      : []),
    ...(hwBox > 0
      ? [
          {
            id: 'ply-box-hw-lam',
            name: 'Half White Inner Laminate (0.7mm) - Carcass (Box)',
            category: 'Laminate',
            badge: 'Internal Box',
            badgeColor: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
            qtyStr: `${hwBox.toFixed(1)} sht`,
            areaVolStr: `${(hwBox * SQFT_PER_SHEET).toFixed(0)} sqft`,
            unitRateStr: `${formatCurrency(halfWhiteLaminatePrice, currency)}/sht`,
            cost: rCost.halfWhiteLaminateBoxCost,
          },
        ]
      : []),
    ...(pBoxLouvers > 0
      ? [
          {
            id: 'ply-box-louvers',
            name: 'Decorative Louvers Panels - Carcass (Box)',
            category: 'Addon Materials',
            badge: 'Box Panels',
            badgeColor: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20',
            qtyStr: `${pBoxLouvers.toFixed(1)} panels`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(louversPrice, currency)}/panel`,
            cost: rCost.pBoxLouversCost,
          },
        ]
      : []),
    ...(pBoxAdhesiveQty > 0
      ? [
          {
            id: 'ply-box-adhesive',
            name: 'Synthetic Resin Adhesive - Carcass (Box Share)',
            category: 'Adhesive',
            badge: 'Lamination Adhesive',
            badgeColor: 'bg-teal-500/10 text-teal-500 border border-teal-500/20',
            qtyStr: `${pBoxAdhesiveQty.toFixed(1)} kg`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(adhesivePrice, currency)}/kg`,
            cost: rCost.pBoxAdhesiveCost,
          },
        ]
      : []),
    ...(pBoxHinges > 0
      ? [
          {
            id: 'ply-box-hinges',
            name: 'Soft-Close Concealed Hinges - Carcass (Box)',
            category: 'Hardware',
            badge: 'Box Hinges',
            badgeColor: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
            qtyStr: `${pBoxHinges} pcs`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(hingePrice, currency)}/pc`,
            cost: rCost.pBoxHingeCost,
          },
        ]
      : []),
    ...(pBoxTelescope > 0
      ? [
          {
            id: 'ply-box-telescope',
            name: 'Telescopic Drawer Channels - Carcass (Box)',
            category: 'Hardware',
            badge: 'Box Drawers',
            badgeColor: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
            qtyStr: `${pBoxTelescope} sets`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(telescopePrice, currency)}/set`,
            cost: rCost.pBoxTelescopeCost,
          },
        ]
      : []),
    ...(pBoxHandle6 > 0
      ? [
          {
            id: 'ply-box-handle6',
            name: 'Designer Handles 6" - Carcass (Box)',
            category: 'Hardware',
            badge: 'Box Handles',
            badgeColor: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
            qtyStr: `${pBoxHandle6} pcs`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(handle6Price, currency)}/pc`,
            cost: rCost.pBoxHandle6Cost,
          },
        ]
      : []),
    ...(pBoxHandle9 > 0
      ? [
          {
            id: 'ply-box-handle9',
            name: 'Designer Handles 9" - Carcass (Box)',
            category: 'Hardware',
            badge: 'Box Handles',
            badgeColor: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
            qtyStr: `${pBoxHandle9} pcs`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(handle9Price, currency)}/pc`,
            cost: rCost.pBoxHandle9Cost,
          },
        ]
      : []),
    ...((room.plywoodBoxOtherHardwareCost || 0) > 0
      ? [
          {
            id: 'ply-box-other-hw',
            name: 'Other Hardware - Carcass (Box Lump Sum)',
            category: 'Hardware',
            badge: 'Box Addons',
            badgeColor: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
            qtyStr: '1 entry',
            areaVolStr: '-',
            unitRateStr: formatCurrency(room.plywoodBoxOtherHardwareCost || 0, currency),
            cost: room.plywoodBoxOtherHardwareCost || 0,
          },
        ]
      : []),
    ...(pBoxCFT > 0
      ? [
          {
            id: 'ply-box-labor',
            name: 'Carpentry Labor & Fabrication - Plywood Box (Carcass)',
            category: 'Labor',
            badge: 'Carcass Labor',
            badgeColor: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
            qtyStr: `${pBoxCFT.toFixed(1)} cft`,
            areaVolStr: `${pBoxCFT.toFixed(1)} cft volume`,
            unitRateStr: `${formatCurrency(plywoodBoxLaborPrice, currency)}/cft`,
            cost: rCost.plywoodBoxLaborCost,
          },
        ]
      : []),
  ];

  // Build items list for Plywood Shutter
  const plyShutterItems: ScopeItem[] = [
    ...(pFrameSheets > 0
      ? [
          {
            id: 'ply-shutter-board',
            name: 'Plywood Core Board - Shutter (Frame)',
            category: 'Board Core',
            badge: 'Shutter (Frame)',
            badgeColor: 'bg-sky-500/10 text-sky-500 border border-sky-500/20',
            qtyStr: `${pFrameSheets.toFixed(1)} sht`,
            areaVolStr: `${(pFrameSheets * SQFT_PER_SHEET).toFixed(0)} sqft`,
            unitRateStr: `${formatCurrency(plywoodPrice, currency)}/sqft (${formatCurrency(plywoodPrice * SQFT_PER_SHEET, currency)}/sht)`,
            cost: rCost.plywoodFrameBoardCost,
          },
        ]
      : []),
    ...(colorFrame > 0
      ? [
          {
            id: 'ply-shutter-color-lam',
            name: 'Color Laminate (0.8mm) - Shutter (Frame)',
            category: 'Laminate',
            badge: 'Shutter Face',
            badgeColor: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
            qtyStr: `${colorFrame.toFixed(1)} sht`,
            areaVolStr: `${(colorFrame * SQFT_PER_SHEET).toFixed(0)} sqft`,
            unitRateStr: `${formatCurrency(colorLaminatePrice, currency)}/sht`,
            cost: rCost.colorLaminateFrameCost,
          },
        ]
      : []),
    ...(acrylicFrame > 0
      ? [
          {
            id: 'ply-shutter-acrylic-lam',
            name: 'Acrylic Laminate (1.5mm) - Shutter (Frame)',
            category: 'Laminate',
            badge: 'Shutter Face',
            badgeColor: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
            qtyStr: `${acrylicFrame.toFixed(1)} sht`,
            areaVolStr: `${(acrylicFrame * SQFT_PER_SHEET).toFixed(0)} sqft`,
            unitRateStr: `${formatCurrency(acrylicLaminatePrice, currency)}/sht`,
            cost: rCost.acrylicLaminateFrameCost,
          },
        ]
      : []),
    ...(hwFrame > 0
      ? [
          {
            id: 'ply-shutter-hw-lam',
            name: 'Half White Inner Laminate (0.7mm) - Shutter (Frame)',
            category: 'Laminate',
            badge: 'Internal Shutter',
            badgeColor: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
            qtyStr: `${hwFrame.toFixed(1)} sht`,
            areaVolStr: `${(hwFrame * SQFT_PER_SHEET).toFixed(0)} sqft`,
            unitRateStr: `${formatCurrency(halfWhiteLaminatePrice, currency)}/sht`,
            cost: rCost.halfWhiteLaminateFrameCost,
          },
        ]
      : []),
    ...(pFrameLouvers > 0
      ? [
          {
            id: 'ply-shutter-louvers',
            name: 'Decorative Louvers Panels - Shutter (Frame)',
            category: 'Addon Materials',
            badge: 'Shutter Face',
            badgeColor: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20',
            qtyStr: `${pFrameLouvers.toFixed(1)} panels`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(louversPrice, currency)}/panel`,
            cost: rCost.pFrameLouversCost,
          },
        ]
      : []),
    ...(pFrameAdhesiveQty > 0
      ? [
          {
            id: 'ply-shutter-adhesive',
            name: 'Synthetic Resin Adhesive - Shutter (Frame Share)',
            category: 'Adhesive',
            badge: 'Shutter Adhesive',
            badgeColor: 'bg-teal-500/10 text-teal-500 border border-teal-500/20',
            qtyStr: `${pFrameAdhesiveQty.toFixed(1)} kg`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(adhesivePrice, currency)}/kg`,
            cost: rCost.pFrameAdhesiveCost,
          },
        ]
      : []),
    ...(pFrameHinges > 0
      ? [
          {
            id: 'ply-shutter-hinges',
            name: 'Soft-Close Concealed Hinges - Shutter (Frame)',
            category: 'Hardware',
            badge: 'Shutter Hinges',
            badgeColor: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
            qtyStr: `${pFrameHinges} pcs`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(hingePrice, currency)}/pc`,
            cost: rCost.pFrameHingeCost,
          },
        ]
      : []),
    ...(pFrameHandle6 > 0
      ? [
          {
            id: 'ply-shutter-handle6',
            name: 'Designer Handles 6" - Shutter (Frame)',
            category: 'Hardware',
            badge: 'Shutter Handles',
            badgeColor: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
            qtyStr: `${pFrameHandle6} pcs`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(handle6Price, currency)}/pc`,
            cost: rCost.pFrameHandle6Cost,
          },
        ]
      : []),
    ...(pFrameHandle9 > 0
      ? [
          {
            id: 'ply-shutter-handle9',
            name: 'Designer Handles 9" - Shutter (Frame)',
            category: 'Hardware',
            badge: 'Shutter Handles',
            badgeColor: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
            qtyStr: `${pFrameHandle9} pcs`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(handle9Price, currency)}/pc`,
            cost: rCost.pFrameHandle9Cost,
          },
        ]
      : []),
    ...((room.plywoodFrameOtherHardwareCost || 0) > 0
      ? [
          {
            id: 'ply-shutter-other-hw',
            name: 'Other Hardware - Shutter (Frame Lump Sum)',
            category: 'Hardware',
            badge: 'Shutter Addons',
            badgeColor: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
            qtyStr: '1 entry',
            areaVolStr: '-',
            unitRateStr: formatCurrency(room.plywoodFrameOtherHardwareCost || 0, currency),
            cost: room.plywoodFrameOtherHardwareCost || 0,
          },
        ]
      : []),
    ...(pFrameSqFt > 0
      ? [
          {
            id: 'ply-shutter-labor',
            name: 'Carpentry Labor & Fabrication - Plywood Frame (Shutter)',
            category: 'Labor',
            badge: 'Shutter Labor',
            badgeColor: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
            qtyStr: `${pFrameSqFt.toFixed(1)} sqft`,
            areaVolStr: `${pFrameSqFt.toFixed(1)} sqft area`,
            unitRateStr: `${formatCurrency(plywoodFrameLaborPrice, currency)}/sqft`,
            cost: rCost.plywoodFrameLaborCost,
          },
        ]
      : []),
  ];

  // Build items list for MDF Box
  const mdfBoxItems: ScopeItem[] = [
    ...(mBoxSheets > 0
      ? [
          {
            id: 'mdf-box-board',
            name: 'MDF Core Board - Carcass (Box)',
            category: 'Board Core',
            badge: 'MDF Carcass',
            badgeColor: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
            qtyStr: `${mBoxSheets.toFixed(1)} sht`,
            areaVolStr: `${(mBoxSheets * SQFT_PER_SHEET).toFixed(0)} sqft`,
            unitRateStr: `${formatCurrency(mdfPrice, currency)}/sqft (${formatCurrency(mdfPrice * SQFT_PER_SHEET, currency)}/sht)`,
            cost: rCost.mdfBoxBoardCost,
          },
        ]
      : []),
    ...(mBoxAdhesiveQty > 0
      ? [
          {
            id: 'mdf-box-adhesive',
            name: 'Synthetic Resin Adhesive - MDF Box Share',
            category: 'Adhesive',
            badge: 'MDF Box Adhesive',
            badgeColor: 'bg-teal-500/10 text-teal-500 border border-teal-500/20',
            qtyStr: `${mBoxAdhesiveQty.toFixed(1)} kg`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(adhesivePrice, currency)}/kg`,
            cost: rCost.mdfBoxAdhesiveCost,
          },
        ]
      : []),
    ...(mBoxHinges > 0
      ? [
          {
            id: 'mdf-box-hinges',
            name: 'Soft-Close Concealed Hinges - MDF Carcass (Box)',
            category: 'Hardware',
            badge: 'MDF Box Hinges',
            badgeColor: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
            qtyStr: `${mBoxHinges} pcs`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(hingePrice, currency)}/pc`,
            cost: rCost.mBoxHingeCost,
          },
        ]
      : []),
    ...(mBoxTelescope > 0
      ? [
          {
            id: 'mdf-box-telescope',
            name: 'Telescopic Drawer Channels - MDF Carcass (Box)',
            category: 'Hardware',
            badge: 'MDF Box Drawers',
            badgeColor: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
            qtyStr: `${mBoxTelescope} sets`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(telescopePrice, currency)}/set`,
            cost: rCost.mBoxTelescopeCost,
          },
        ]
      : []),
    ...(mBoxHandle6 > 0
      ? [
          {
            id: 'mdf-box-handle6',
            name: 'Designer Handles 6" - MDF Carcass (Box)',
            category: 'Hardware',
            badge: 'MDF Box Handles',
            badgeColor: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
            qtyStr: `${mBoxHandle6} pcs`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(handle6Price, currency)}/pc`,
            cost: rCost.mBoxHandle6Cost,
          },
        ]
      : []),
    ...(mBoxHandle9 > 0
      ? [
          {
            id: 'mdf-box-handle9',
            name: 'Designer Handles 9" - MDF Carcass (Box)',
            category: 'Hardware',
            badge: 'MDF Box Handles',
            badgeColor: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
            qtyStr: `${mBoxHandle9} pcs`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(handle9Price, currency)}/pc`,
            cost: rCost.mBoxHandle9Cost,
          },
        ]
      : []),
    ...((room.mdfBoxOtherHardwareCost || 0) > 0
      ? [
          {
            id: 'mdf-box-other-hw',
            name: 'Other Hardware - MDF Carcass (Box Lump Sum)',
            category: 'Hardware',
            badge: 'MDF Box Addons',
            badgeColor: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
            qtyStr: '1 entry',
            areaVolStr: '-',
            unitRateStr: formatCurrency(room.mdfBoxOtherHardwareCost || 0, currency),
            cost: room.mdfBoxOtherHardwareCost || 0,
          },
        ]
      : []),
    ...(mBoxCFT > 0
      ? [
          {
            id: 'mdf-box-labor',
            name: 'Carpentry Labor & Fabrication - MDF Box (Carcass)',
            category: 'Labor',
            badge: 'MDF Carcass Labor',
            badgeColor: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
            qtyStr: `${mBoxCFT.toFixed(1)} cft`,
            areaVolStr: `${mBoxCFT.toFixed(1)} cft volume`,
            unitRateStr: `${formatCurrency(mdfBoxLaborPrice, currency)}/cft`,
            cost: rCost.mdfBoxLaborCost,
          },
        ]
      : []),
  ];

  // Build items list for MDF Shutter
  const mdfShutterItems: ScopeItem[] = [
    ...(mFrameSheets > 0
      ? [
          {
            id: 'mdf-shutter-board',
            name: 'MDF Core Board - Shutter (Frame)',
            category: 'Board Core',
            badge: 'MDF Shutter',
            badgeColor: 'bg-fuchsia-500/10 text-fuchsia-500 border border-fuchsia-500/20',
            qtyStr: `${mFrameSheets.toFixed(1)} sht`,
            areaVolStr: `${(mFrameSheets * SQFT_PER_SHEET).toFixed(0)} sqft`,
            unitRateStr: `${formatCurrency(mdfPrice, currency)}/sqft (${formatCurrency(mdfPrice * SQFT_PER_SHEET, currency)}/sht)`,
            cost: rCost.mdfFrameBoardCost,
          },
        ]
      : []),
    ...(mFrameAdhesiveQty > 0
      ? [
          {
            id: 'mdf-shutter-adhesive',
            name: 'Synthetic Resin Adhesive - MDF Shutter Share',
            category: 'Adhesive',
            badge: 'MDF Shutter Adhesive',
            badgeColor: 'bg-teal-500/10 text-teal-500 border border-teal-500/20',
            qtyStr: `${mFrameAdhesiveQty.toFixed(1)} kg`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(adhesivePrice, currency)}/kg`,
            cost: rCost.mdfFrameAdhesiveCost,
          },
        ]
      : []),
    ...(mFrameHinges > 0
      ? [
          {
            id: 'mdf-shutter-hinges',
            name: 'Soft-Close Concealed Hinges - MDF Shutter (Frame)',
            category: 'Hardware',
            badge: 'MDF Shutter Hinges',
            badgeColor: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
            qtyStr: `${mFrameHinges} pcs`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(hingePrice, currency)}/pc`,
            cost: rCost.mFrameHingeCost,
          },
        ]
      : []),
    ...(mFrameHandle6 > 0
      ? [
          {
            id: 'mdf-shutter-handle6',
            name: 'Designer Handles 6" - MDF Shutter (Frame)',
            category: 'Hardware',
            badge: 'MDF Shutter Handles',
            badgeColor: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
            qtyStr: `${mFrameHandle6} pcs`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(handle6Price, currency)}/pc`,
            cost: rCost.mFrameHandle6Cost,
          },
        ]
      : []),
    ...(mFrameHandle9 > 0
      ? [
          {
            id: 'mdf-shutter-handle9',
            name: 'Designer Handles 9" - MDF Shutter (Frame)',
            category: 'Hardware',
            badge: 'MDF Shutter Handles',
            badgeColor: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
            qtyStr: `${mFrameHandle9} pcs`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(handle9Price, currency)}/pc`,
            cost: rCost.mFrameHandle9Cost,
          },
        ]
      : []),
    ...((room.mdfFrameOtherHardwareCost || 0) > 0
      ? [
          {
            id: 'mdf-shutter-other-hw',
            name: 'Other Hardware - MDF Shutter (Frame Lump Sum)',
            category: 'Hardware',
            badge: 'MDF Shutter Addons',
            badgeColor: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
            qtyStr: '1 entry',
            areaVolStr: '-',
            unitRateStr: formatCurrency(room.mdfFrameOtherHardwareCost || 0, currency),
            cost: room.mdfFrameOtherHardwareCost || 0,
          },
        ]
      : []),
    ...(mFrameSqFt > 0
      ? [
          {
            id: 'mdf-shutter-labor',
            name: 'Carpentry Labor & Fabrication - MDF Frame (Shutter)',
            category: 'Labor',
            badge: 'MDF Shutter Labor',
            badgeColor: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
            qtyStr: `${mFrameSqFt.toFixed(1)} sqft`,
            areaVolStr: `${mFrameSqFt.toFixed(1)} sqft area`,
            unitRateStr: `${formatCurrency(mdfFrameLaborPrice, currency)}/sqft`,
            cost: rCost.mdfFrameLaborCost,
          },
        ]
      : []),
  ];

  // Consolidated overall items for Space (without splitting into box and shutter)
  const overallTableItems: {
    id: string;
    name: string;
    category: string;
    badgeColor: string;
    qtyStr: string;
    areaVolStr: string;
    unitRateStr: string;
    cost: number;
  }[] = [
    ...(totalPlywoodSheets > 0
      ? [
          {
            id: 'overall-plywood',
            name: 'Plywood Core Board',
            category: 'Core Board',
            badgeColor: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
            qtyStr: `${totalPlywoodSheets.toFixed(1)} sht`,
            areaVolStr: `${(totalPlywoodSheets * SQFT_PER_SHEET).toFixed(0)} sqft`,
            unitRateStr: `${formatCurrency(plywoodPrice, currency)}/sqft (${formatCurrency(plywoodPrice * SQFT_PER_SHEET, currency)}/sht)`,
            cost: rCost.plywoodCost,
          },
        ]
      : []),
    ...(totalMdfSheets > 0
      ? [
          {
            id: 'overall-mdf',
            name: 'MDF Core Board',
            category: 'Core Board',
            badgeColor: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
            qtyStr: `${totalMdfSheets.toFixed(1)} sht`,
            areaVolStr: `${(totalMdfSheets * SQFT_PER_SHEET).toFixed(0)} sqft`,
            unitRateStr: `${formatCurrency(mdfPrice, currency)}/sqft (${formatCurrency(mdfPrice * SQFT_PER_SHEET, currency)}/sht)`,
            cost: rCost.mdfCost,
          },
        ]
      : []),
    ...(totalColorSheets > 0
      ? [
          {
            id: 'overall-color-lam',
            name: 'Color Laminate (0.8mm)',
            category: 'Laminate',
            badgeColor: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
            qtyStr: `${totalColorSheets.toFixed(1)} sht`,
            areaVolStr: `${(totalColorSheets * SQFT_PER_SHEET).toFixed(0)} sqft`,
            unitRateStr: `${formatCurrency(colorLaminatePrice, currency)}/sht`,
            cost: rCost.colorLaminateCost,
          },
        ]
      : []),
    ...(totalAcrylicSheets > 0
      ? [
          {
            id: 'overall-acrylic-lam',
            name: 'Acrylic Laminate (1.5mm)',
            category: 'Laminate',
            badgeColor: 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20',
            qtyStr: `${totalAcrylicSheets.toFixed(1)} sht`,
            areaVolStr: `${(totalAcrylicSheets * SQFT_PER_SHEET).toFixed(0)} sqft`,
            unitRateStr: `${formatCurrency(acrylicLaminatePrice, currency)}/sht`,
            cost: rCost.acrylicLaminateCost,
          },
        ]
      : []),
    ...(totalHalfWhiteSheets > 0
      ? [
          {
            id: 'overall-hw-lam',
            name: 'Half White Inner Lining Laminate (0.7mm)',
            category: 'Laminate',
            badgeColor: 'bg-slate-500/10 text-slate-500 border border-slate-500/20',
            qtyStr: `${totalHalfWhiteSheets.toFixed(1)} sht`,
            areaVolStr: `${(totalHalfWhiteSheets * SQFT_PER_SHEET).toFixed(0)} sqft`,
            unitRateStr: `${formatCurrency(halfWhiteLaminatePrice, currency)}/sht`,
            cost: rCost.halfWhiteLaminateCost,
          },
        ]
      : []),
    ...(totalLouvers > 0
      ? [
          {
            id: 'overall-louvers',
            name: 'Decorative Louvers / Fluted Panels',
            category: 'Addon Materials',
            badgeColor: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20',
            qtyStr: `${totalLouvers.toFixed(1)} panels`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(louversPrice, currency)}/panel`,
            cost: rCost.louversCost,
          },
        ]
      : []),
    ...(rCost.totalAdhesiveQty > 0
      ? [
          {
            id: 'overall-adhesive',
            name: 'Synthetic Resin Adhesive',
            category: 'Adhesive',
            badgeColor: 'bg-teal-500/10 text-teal-500 border border-teal-500/20',
            qtyStr: `${rCost.totalAdhesiveQty.toFixed(1)} kg`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(adhesivePrice, currency)}/kg`,
            cost: rCost.adhesiveCost,
          },
        ]
      : []),
    ...(totalHinges > 0
      ? [
          {
            id: 'overall-hinges',
            name: 'Soft-Close Concealed Hinges',
            category: 'Hardware',
            badgeColor: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
            qtyStr: `${totalHinges} pcs`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(hingePrice, currency)}/pc`,
            cost: rCost.hingeCost,
          },
        ]
      : []),
    ...(totalTelescopes > 0
      ? [
          {
            id: 'overall-telescopes',
            name: 'Drawer Telescopic Channels',
            category: 'Hardware',
            badgeColor: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
            qtyStr: `${totalTelescopes} pairs`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(telescopePrice, currency)}/pair`,
            cost: rCost.telescopeCost,
          },
        ]
      : []),
    ...(totalHandle6 > 0
      ? [
          {
            id: 'overall-handle6',
            name: 'Cabinet Designer Handles 6"',
            category: 'Hardware',
            badgeColor: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
            qtyStr: `${totalHandle6} pcs`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(handle6Price, currency)}/pc`,
            cost: rCost.handle6InchCost,
          },
        ]
      : []),
    ...(totalHandle9 > 0
      ? [
          {
            id: 'overall-handle9',
            name: 'Cabinet Designer Handles 9"',
            category: 'Hardware',
            badgeColor: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
            qtyStr: `${totalHandle9} pcs`,
            areaVolStr: '-',
            unitRateStr: `${formatCurrency(handle9Price, currency)}/pc`,
            cost: rCost.handle9InchCost,
          },
        ]
      : []),
    ...(rCost.totalOtherHardwareCost > 0
      ? [
          {
            id: 'overall-other-hw',
            name: 'Other Hardware (Lump Sum / Custom Addons)',
            category: 'Hardware',
            badgeColor: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
            qtyStr: 'Lump Sum',
            areaVolStr: '-',
            unitRateStr: formatCurrency(rCost.totalOtherHardwareCost, currency),
            cost: rCost.totalOtherHardwareCost,
          },
        ]
      : []),
    ...(pBoxCFT > 0 || mBoxCFT > 0
      ? [
          {
            id: 'overall-carcass-labor',
            name: 'Carpentry Fabrication Labor - Carcass (Box)',
            category: 'Labor',
            badgeColor: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
            qtyStr: `${(pBoxCFT + mBoxCFT).toFixed(1)} cft`,
            areaVolStr: `${(pBoxCFT + mBoxCFT).toFixed(1)} cft volume`,
            unitRateStr: `${formatCurrency((rCost.plywoodBoxLaborCost + rCost.mdfBoxLaborCost) / (pBoxCFT + mBoxCFT), currency)}/cft`,
            cost: rCost.plywoodBoxLaborCost + rCost.mdfBoxLaborCost,
          },
        ]
      : []),
    ...(pFrameSqFt > 0 || mFrameSqFt > 0
      ? [
          {
            id: 'overall-shutter-labor',
            name: 'Carpentry Fabrication Labor - Shutter (Frame)',
            category: 'Labor',
            badgeColor: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
            qtyStr: `${(pFrameSqFt + mFrameSqFt).toFixed(1)} sqft`,
            areaVolStr: `${(pFrameSqFt + mFrameSqFt).toFixed(1)} sqft area`,
            unitRateStr: `${formatCurrency((rCost.plywoodFrameLaborCost + rCost.mdfFrameLaborCost) / (pFrameSqFt + mFrameSqFt), currency)}/sqft`,
            cost: rCost.plywoodFrameLaborCost + rCost.mdfFrameLaborCost,
          },
        ]
      : []),
  ];

  const hasAnyData =
    totalPlywoodSheets > 0 ||
    totalMdfSheets > 0 ||
    totalAllLaminates > 0 ||
    totalLouvers > 0 ||
    totalHinges > 0 ||
    totalTelescopes > 0 ||
    totalHandle6 > 0 ||
    totalHandle9 > 0 ||
    pBoxCFT > 0 ||
    pFrameSqFt > 0 ||
    mBoxCFT > 0 ||
    mFrameSqFt > 0 ||
    rCost.totalAdhesiveQty > 0 ||
    (rCost.totalOtherHardwareCost || 0) > 0;

  return (
    <div className="space-y-4">
      {/* Dynamic 5-Tab Navigation Bar */}
      <div className={`p-1.5 rounded-xl border ${
        isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-slate-100/90 border-slate-200'
      }`}>
        <div className="flex flex-wrap gap-1.5">
          {availableTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-[135px] sm:min-w-[160px] px-3 py-2 rounded-lg text-left transition-all border flex items-center justify-between gap-2 cursor-pointer ${
                  isActive
                    ? tab.activeClass
                    : isDarkMode
                    ? 'bg-slate-850/60 hover:bg-slate-800 border-transparent text-slate-300'
                    : 'bg-white hover:bg-slate-50 border-transparent text-slate-700 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <TabIcon className={`h-4 w-4 shrink-0 ${tab.colorClass}`} />
                  <div className="truncate">
                    <div className="text-xs font-black truncate">{tab.label}</div>
                    <div className={`text-[10px] font-medium truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {tab.subLabel}
                    </div>
                  </div>
                </div>
                <span className={`text-[11px] font-black shrink-0 px-2 py-0.5 rounded-md ${
                  isActive
                    ? isDarkMode ? 'bg-black/30' : 'bg-black/5'
                    : isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 2: Plywood Box Specific Details */}
      {activeTab === 'ply_box' && hasPlyBox && (
        <ScopeDetailTab
          title="Plywood Box (Carcass)"
          subtitle={`Detailed resource components, hardware, labor & derived rates for ${room.name} Plywood Carcass`}
          materialName="Plywood"
          icon={Box}
          accent="blue"
          totalValue={rCost.plywoodBoxTotalValue}
          metricLabel="Fabrication Volume"
          metricValue={`${pBoxCFT.toFixed(1)} cft`}
          derivedRate={pBoxCFT > 0 ? rCost.plywoodBoxTotalValue / pBoxCFT : 0}
          rateUnit="/ cft"
          boardSheets={pBoxSheets}
          items={plyBoxItems}
          currency={currency}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Tab 3: Plywood Shutter Specific Details */}
      {activeTab === 'ply_shutter' && hasPlyShutter && (
        <ScopeDetailTab
          title="Plywood Shutter (Frame)"
          subtitle={`Detailed resource components, hardware, labor & derived rates for ${room.name} Plywood Frame & Shutters`}
          materialName="Plywood"
          icon={DoorClosed}
          accent="sky"
          totalValue={rCost.plywoodFrameTotalValue}
          metricLabel="Shutter Surface Area"
          metricValue={`${pFrameSqFt.toFixed(1)} sqft`}
          derivedRate={pFrameSqFt > 0 ? rCost.plywoodFrameTotalValue / pFrameSqFt : 0}
          rateUnit="/ sq.ft"
          boardSheets={pFrameSheets}
          items={plyShutterItems}
          currency={currency}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Tab 4: MDF Box Specific Details */}
      {activeTab === 'mdf_box' && hasMdfBox && (
        <ScopeDetailTab
          title="MDF Box (Carcass)"
          subtitle={`Detailed resource components, hardware, labor & derived rates for ${room.name} MDF Carcass`}
          materialName="MDF"
          icon={Box}
          accent="purple"
          totalValue={rCost.mdfBoxTotalValue}
          metricLabel="Fabrication Volume"
          metricValue={`${mBoxCFT.toFixed(1)} cft`}
          derivedRate={mBoxCFT > 0 ? rCost.mdfBoxTotalValue / mBoxCFT : 0}
          rateUnit="/ cft"
          boardSheets={mBoxSheets}
          items={mdfBoxItems}
          currency={currency}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Tab 5: MDF Shutter Specific Details */}
      {activeTab === 'mdf_shutter' && hasMdfShutter && (
        <ScopeDetailTab
          title="MDF Shutter (Frame)"
          subtitle={`Detailed resource components, hardware, labor & derived rates for ${room.name} MDF Frame & Shutters`}
          materialName="MDF"
          icon={DoorClosed}
          accent="fuchsia"
          totalValue={rCost.mdfFrameTotalValue}
          metricLabel="Shutter Surface Area"
          metricValue={`${mFrameSqFt.toFixed(1)} sqft`}
          derivedRate={mFrameSqFt > 0 ? rCost.mdfFrameTotalValue / mFrameSqFt : 0}
          rateUnit="/ sq.ft"
          boardSheets={mFrameSheets}
          items={mdfShutterItems}
          currency={currency}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Tab 1: Overall Space Cumulative View */}
      {activeTab === 'overall' && (
        <>
      {/* 1. Quick Requirements Summary Banner for Selected Space */}
      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50/80 border-slate-200'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b pb-3 mb-3 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-indigo-500" />
              <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Cumulative Space Requirements: {room.name}
              </h4>
            </div>
            <p className={`text-[11px] font-medium mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Consolidated totals for all core boards, laminates, hardware, and labor for this space.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
              isDarkMode ? 'bg-indigo-950/60 border-indigo-800/80 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'
            }`}>
              Space Budget: {formatCurrency(rCost.totalRoomCost, currency)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Plywood Card */}
          <div className={`p-3 rounded-xl border flex flex-col justify-between ${
            isDarkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Plywood Core
              </span>
              <Box className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {totalPlywoodSheets.toFixed(1)}
                </span>
                <span className="text-[10px] font-bold text-slate-400">sht Total</span>
              </div>
              <div className={`text-[9px] font-bold mt-1.5 pt-1.5 border-t flex justify-between ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                <span>Total Area:</span>
                <span className="font-extrabold text-blue-500">{(totalPlywoodSheets * SQFT_PER_SHEET).toFixed(0)} sqft</span>
              </div>
            </div>
          </div>

          {/* MDF Card */}
          <div className={`p-3 rounded-xl border flex flex-col justify-between ${
            isDarkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                MDF Core
              </span>
              <Box className="h-3.5 w-3.5 text-purple-500" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {totalMdfSheets.toFixed(1)}
                </span>
                <span className="text-[10px] font-bold text-slate-400">sht Total</span>
              </div>
              <div className={`text-[9px] font-bold mt-1.5 pt-1.5 border-t flex justify-between ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                <span>Total Area:</span>
                <span className="font-extrabold text-purple-500">{(totalMdfSheets * SQFT_PER_SHEET).toFixed(0)} sqft</span>
              </div>
            </div>
          </div>

          {/* Laminates Card */}
          <div className={`p-3 rounded-xl border flex flex-col justify-between ${
            isDarkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Laminates
              </span>
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {totalAllLaminates.toFixed(1)}
                </span>
                <span className="text-[10px] font-bold text-slate-400">sht Total</span>
              </div>
              <div className={`text-[9px] font-bold mt-1.5 pt-1.5 border-t flex justify-between ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                <span>Color/Acrylic/Inner:</span>
                <span className="font-extrabold text-amber-500">{totalColorSheets.toFixed(1)}/{totalAcrylicSheets.toFixed(1)}/{totalHalfWhiteSheets.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Hardware Card */}
          <div className={`p-3 rounded-xl border flex flex-col justify-between ${
            isDarkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Fittings & Hardware
              </span>
              <DoorClosed className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {totalHinges + totalTelescopes + totalHandle6 + totalHandle9}
                </span>
                <span className="text-[10px] font-bold text-slate-400">pcs Total</span>
              </div>
              <div className={`text-[9px] font-bold mt-1.5 pt-1.5 border-t flex justify-between ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                <span>Hinges / Slides / Handles:</span>
                <span className="font-extrabold text-emerald-500">{totalHinges}/{totalTelescopes}/{totalHandle6 + totalHandle9}</span>
              </div>
            </div>
          </div>

          {/* Labor / Volume Card */}
          <div className={`p-3 rounded-xl border flex flex-col justify-between ${
            isDarkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Labor Scope
              </span>
              <Hammer className="h-3.5 w-3.5 text-rose-500" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {formatCurrency(rCost.totalLabor, currency)}
                </span>
              </div>
              <div className={`text-[9px] font-bold mt-1.5 pt-1.5 border-t flex justify-between ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                <span>Box Vol / Shutter Area:</span>
                <span className="font-extrabold text-rose-500">{(pBoxCFT + mBoxCFT).toFixed(1)} cft / {(pFrameSqFt + mFrameSqFt).toFixed(1)} sqft</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Consolidated Cumulative Cost Calculation Table */}
      {!hasAnyData ? (
        <div className={`p-10 border rounded-xl text-center space-y-2 ${isDarkMode ? 'border-slate-800 bg-slate-900/40 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
          <Layers className="h-8 w-8 mx-auto text-slate-400 opacity-60" />
          <p className="font-bold text-sm">No material quantities or measurements entered for this space yet.</p>
          <p className="text-xs">Switch to the "1. Space Details & Quantities" tab to enter box and shutter sheets, fittings, and labor.</p>
        </div>
      ) : (
        <div className={`border rounded-xl overflow-hidden shadow-xs ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-bold text-[10px] uppercase tracking-wider ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  <th className="p-3 w-12 text-center">#</th>
                  <th className="p-3">Component / Resource Description</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Input Qty</th>
                  <th className="p-3 text-right">Derived Area / Volume</th>
                  <th className="p-3 text-right">Unit Rate</th>
                  <th className="p-3 text-right">Calculated Cost</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/70' : 'divide-slate-150'}`}>
                {overallTableItems.map((item, idx) => (
                  <tr key={item.id} className={isDarkMode ? 'hover:bg-slate-850/50' : 'hover:bg-slate-50/70'}>
                    <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className={`p-3 font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {item.name}
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.badgeColor}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3 text-right font-extrabold text-slate-900 dark:text-white">
                      {item.qtyStr}
                    </td>
                    <td className="p-3 text-right text-slate-600 dark:text-slate-400">
                      {item.areaVolStr}
                    </td>
                    <td className="p-3 text-right text-slate-500">
                      {item.unitRateStr}
                    </td>
                    <td className="p-3 text-right font-black text-slate-900 dark:text-white">
                      {formatCurrency(item.cost, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* GRAND TOTAL ROW */}
              <tfoot>
                <tr className={`border-t-2 text-xs font-black ${
                  isDarkMode ? 'bg-slate-950 text-white border-slate-700' : 'bg-slate-100 text-slate-900 border-slate-300'
                }`}>
                  <td colSpan={3} className="p-3.5 text-sm uppercase tracking-wider">
                    Grand Total Estimated Cost: {room.name}
                  </td>
                  <td colSpan={3} className="p-3.5 text-right font-medium text-slate-500">
                    Materials: {formatCurrency(rCost.totalMaterials, currency)} | Hardware: {formatCurrency(rCost.totalHardware, currency)} | Labor: {formatCurrency(rCost.totalLabor, currency)}
                  </td>
                  <td className="p-3.5 text-right text-base font-black text-[#134d9c] dark:text-indigo-400">
                    {formatCurrency(rCost.totalRoomCost, currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 3. Space Derived Rates Display */}
      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center gap-2 mb-3">
          <Ruler className="h-4 w-4 text-indigo-500" />
          <h5 className={`text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Derived Rates for {room.name} (Calculated with all materials, hardware & labor)
          </h5>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-bold text-slate-400 block">Plywood Carcass Rate</span>
            <span className="text-base font-black text-[#134d9c] dark:text-blue-400 block mt-0.5">
              {formatCurrency((room.plywoodBoxCFT || 0) > 0 ? rCost.plywoodBoxTotalValue / room.plywoodBoxCFT : 0, currency)}
              <span className="text-[10px] font-medium text-slate-400"> / cft</span>
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Total Value: {formatCurrency(rCost.plywoodBoxTotalValue, currency)}</span>
          </div>
          <div className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-bold text-slate-400 block">Plywood Shutter Rate</span>
            <span className="text-base font-black text-[#134d9c] dark:text-indigo-400 block mt-0.5">
              {formatCurrency((room.plywoodFrameSqFt || 0) > 0 ? rCost.plywoodFrameTotalValue / room.plywoodFrameSqFt : 0, currency)}
              <span className="text-[10px] font-medium text-slate-400"> / sqft</span>
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Total Value: {formatCurrency(rCost.plywoodFrameTotalValue, currency)}</span>
          </div>
          <div className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-bold text-slate-400 block">MDF Carcass Rate</span>
            <span className="text-base font-black text-[#134d9c] dark:text-blue-400 block mt-0.5">
              {formatCurrency((room.mdfBoxCFT || 0) > 0 ? rCost.mdfBoxTotalValue / room.mdfBoxCFT : 0, currency)}
              <span className="text-[10px] font-medium text-slate-400"> / cft</span>
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Total Value: {formatCurrency(rCost.mdfBoxTotalValue, currency)}</span>
          </div>
          <div className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-bold text-slate-400 block">MDF Shutter Rate</span>
            <span className="text-base font-black text-[#134d9c] dark:text-indigo-400 block mt-0.5">
              {formatCurrency((room.mdfFrameSqFt || 0) > 0 ? rCost.mdfFrameTotalValue / room.mdfFrameSqFt : 0, currency)}
              <span className="text-[10px] font-medium text-slate-400"> / sqft</span>
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Total Value: {formatCurrency(rCost.mdfFrameTotalValue, currency)}</span>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
};
