import * as XLSX from 'xlsx';
import { ProjectData } from './types';
import { calculateRoomCost, getEffectivePrice, getGroupedMaterials } from './utils';

export function exportProjectToXLSX(project: ProjectData) {
  const wb = XLSX.utils.book_new();

  const currencySymbol = project.currency || '₹';

  const formatCurrencyVal = (val: number) => {
    return `${currencySymbol} ` + (val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Calculate room costs and totals for this project
  const roomCalculations = project.rooms.map((room) => ({
    room,
    costs: calculateRoomCost(room, project.globalPrices),
  }));

  const totals = roomCalculations.reduce(
    (acc, curr) => {
      acc.materials += curr.costs.totalMaterials;
      acc.hardware += curr.costs.totalHardware;
      acc.labor += curr.costs.totalLabor;
      acc.grandTotal += curr.costs.totalRoomCost;

      acc.plywoodBoxSheets += curr.room.plywoodBoxSheets || 0;
      acc.plywoodFrameSheets += curr.room.plywoodFrameSheets || 0;
      acc.plywoodSheets += (curr.room.plywoodBoxSheets || 0) + (curr.room.plywoodFrameSheets || 0);

      acc.mdfBoxSheets += curr.room.mdfBoxSheets || 0;
      acc.mdfFrameSheets += curr.room.mdfFrameSheets || 0;
      acc.mdfSheets += (curr.room.mdfBoxSheets || 0) + (curr.room.mdfFrameSheets || 0);

      acc.plywoodBoxCFT += curr.room.plywoodBoxCFT || 0;
      acc.plywoodFrameSqFt += curr.room.plywoodFrameSqFt || 0;
      acc.mdfBoxCFT += curr.room.mdfBoxCFT || 0;
      acc.mdfFrameSqFt += curr.room.mdfFrameSqFt || 0;

      acc.plywoodBoxTotalValue += curr.costs.plywoodBoxTotalValue;
      acc.plywoodFrameTotalValue += curr.costs.plywoodFrameTotalValue;
      acc.mdfBoxTotalValue += curr.costs.mdfBoxTotalValue;
      acc.mdfFrameTotalValue += curr.costs.mdfFrameTotalValue;

      acc.plywoodBoxBoardCost += curr.costs.plywoodBoxBoardCost;
      acc.plywoodFrameBoardCost += curr.costs.plywoodFrameBoardCost;
      acc.mdfBoxBoardCost += curr.costs.mdfBoxBoardCost;
      acc.mdfFrameBoardCost += curr.costs.mdfFrameBoardCost;

      acc.colorLaminateBoxCost += curr.costs.colorLaminateBoxCost;
      acc.colorLaminateFrameCost += curr.costs.colorLaminateFrameCost;
      acc.acrylicLaminateBoxCost += curr.costs.acrylicLaminateBoxCost;
      acc.acrylicLaminateFrameCost += curr.costs.acrylicLaminateFrameCost;
      acc.halfWhiteLaminateBoxCost += curr.costs.halfWhiteLaminateBoxCost;
      acc.halfWhiteLaminateFrameCost += curr.costs.halfWhiteLaminateFrameCost;
      acc.pBoxLouversCost += curr.costs.pBoxLouversCost;
      acc.pFrameLouversCost += curr.costs.pFrameLouversCost;

      acc.pBoxHingeCost += curr.costs.pBoxHingeCost;
      acc.pFrameHingeCost += curr.costs.pFrameHingeCost;
      acc.mBoxHingeCost += curr.costs.mBoxHingeCost;
      acc.mFrameHingeCost += curr.costs.mFrameHingeCost;

      acc.pBoxTelescopeCost += curr.costs.pBoxTelescopeCost;
      acc.mBoxTelescopeCost += curr.costs.mBoxTelescopeCost;

      acc.pBoxHandle6Cost += curr.costs.pBoxHandle6Cost;
      acc.pFrameHandle6Cost += curr.costs.pFrameHandle6Cost;
      acc.mBoxHandle6Cost += curr.costs.mBoxHandle6Cost;
      acc.mFrameHandle6Cost += curr.costs.mFrameHandle6Cost;

      acc.pBoxHandle9Cost += curr.costs.pBoxHandle9Cost;
      acc.pFrameHandle9Cost += curr.costs.pFrameHandle9Cost;
      acc.mBoxHandle9Cost += curr.costs.mBoxHandle9Cost;
      acc.mFrameHandle9Cost += curr.costs.mFrameHandle9Cost;

      acc.pBoxAdhesiveCost += curr.costs.pBoxAdhesiveCost;
      acc.pFrameAdhesiveCost += curr.costs.pFrameAdhesiveCost;
      acc.mdfBoxAdhesiveCost += curr.costs.mdfBoxAdhesiveCost;
      acc.mdfFrameAdhesiveCost += curr.costs.mdfFrameAdhesiveCost;

      acc.plywoodBoxLaborCost += curr.costs.plywoodBoxLaborCost;
      acc.plywoodFrameLaborCost += curr.costs.plywoodFrameLaborCost;
      acc.mdfBoxLaborCost += curr.costs.mdfBoxLaborCost;
      acc.mdfFrameLaborCost += curr.costs.mdfFrameLaborCost;

      acc.plywoodBoxOtherHardwareCost += curr.costs.plywoodBoxOtherHardwareCost || 0;
      acc.plywoodFrameOtherHardwareCost += curr.costs.plywoodFrameOtherHardwareCost || 0;
      acc.mdfBoxOtherHardwareCost += curr.costs.mdfBoxOtherHardwareCost || 0;
      acc.mdfFrameOtherHardwareCost += curr.costs.mdfFrameOtherHardwareCost || 0;
      acc.totalOtherHardwareCost += curr.costs.totalOtherHardwareCost || 0;

      return acc;
    },
    {
      materials: 0,
      hardware: 0,
      labor: 0,
      grandTotal: 0,
      plywoodSheets: 0,
      plywoodBoxSheets: 0,
      plywoodFrameSheets: 0,
      mdfSheets: 0,
      mdfBoxSheets: 0,
      mdfFrameSheets: 0,
      plywoodBoxCFT: 0,
      plywoodFrameSqFt: 0,
      mdfBoxCFT: 0,
      mdfFrameSqFt: 0,
      plywoodBoxTotalValue: 0,
      plywoodFrameTotalValue: 0,
      mdfBoxTotalValue: 0,
      mdfFrameTotalValue: 0,
      plywoodBoxBoardCost: 0,
      plywoodFrameBoardCost: 0,
      mdfBoxBoardCost: 0,
      mdfFrameBoardCost: 0,
      colorLaminateBoxCost: 0,
      colorLaminateFrameCost: 0,
      acrylicLaminateBoxCost: 0,
      acrylicLaminateFrameCost: 0,
      halfWhiteLaminateBoxCost: 0,
      halfWhiteLaminateFrameCost: 0,
      pBoxLouversCost: 0,
      pFrameLouversCost: 0,
      pBoxHingeCost: 0,
      pFrameHingeCost: 0,
      mBoxHingeCost: 0,
      mFrameHingeCost: 0,
      pBoxTelescopeCost: 0,
      mBoxTelescopeCost: 0,
      pBoxHandle6Cost: 0,
      pFrameHandle6Cost: 0,
      mBoxHandle6Cost: 0,
      mFrameHandle6Cost: 0,
      pBoxHandle9Cost: 0,
      pFrameHandle9Cost: 0,
      mBoxHandle9Cost: 0,
      mFrameHandle9Cost: 0,
      pBoxAdhesiveCost: 0,
      pFrameAdhesiveCost: 0,
      mdfBoxAdhesiveCost: 0,
      mdfFrameAdhesiveCost: 0,
      plywoodBoxLaborCost: 0,
      plywoodFrameLaborCost: 0,
      mdfBoxLaborCost: 0,
      mdfFrameLaborCost: 0,
      plywoodBoxOtherHardwareCost: 0,
      plywoodFrameOtherHardwareCost: 0,
      mdfBoxOtherHardwareCost: 0,
      mdfFrameOtherHardwareCost: 0,
      totalOtherHardwareCost: 0,
    }
  );

  const groupedMaterials = getGroupedMaterials(project.rooms, project.globalPrices);

  // 1. Project Summary Sheet
  const summaryRows: any[][] = [
    ["FALCON COST CALCULATOR - PROJECT BUDGET SUMMARY REPORT"],
    ["Project Reference Name:", project.name || "Untitled Project"],
    ["Currency:", currencySymbol],
    ["Date Generated:", new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })],
    [],
    ["1. OVERALL BUDGET ESTIMATE SUMMARY"],
    ["Budget Category", `Total Calculated Cost (${currencySymbol})`, "Share of Overall Budget"],
    ["Materials Cost", formatCurrencyVal(totals.materials), ((totals.materials / (totals.grandTotal || 1)) * 100).toFixed(1) + "%"],
    ["Hardware Cost", formatCurrencyVal(totals.hardware), ((totals.hardware / (totals.grandTotal || 1)) * 100).toFixed(1) + "%"],
    ["Labor Cost", formatCurrencyVal(totals.labor), ((totals.labor / (totals.grandTotal || 1)) * 100).toFixed(1) + "%"],
    ["GRAND TOTAL PROJECT BUDGET", formatCurrencyVal(totals.grandTotal), "100.0%"],
    [],
    ["2. BOARD MATERIAL SHEETS QUANTITY SUMMARY"],
    ["Board Material Type", "Total Sheets Required", "Carcass (Box) Sheets", "Shutter (Frame) Sheets"],
    ["Plywood Core Board", totals.plywoodSheets.toFixed(1), totals.plywoodBoxSheets.toFixed(1), totals.plywoodFrameSheets.toFixed(1)],
    ["MDF Core Board", totals.mdfSheets.toFixed(1), totals.mdfBoxSheets.toFixed(1), totals.mdfFrameSheets.toFixed(1)]
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 34 }, { wch: 28 }, { wch: 28 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Project Summary");

  // 2. Consolidated BOM Sheet
  const bomRows: any[][] = [
    ["CONSOLIDATED BILL OF MATERIALS (BOM) & SERVICES"],
    ["Project Reference:", project.name || "Untitled Project"],
    [],
    ["S.No.", "Material / Service Description", "Category", `Unit Rate (${currencySymbol})`, "Unit", "Aggregated Qty", `Total Cost (${currencySymbol})`, "Distribution Across Spaces"]
  ];

  groupedMaterials.forEach((item, index) => {
    bomRows.push([
      index + 1,
      item.label,
      item.category,
      formatCurrencyVal(item.rate),
      item.unit,
      item.quantity.toFixed(1),
      formatCurrencyVal(item.totalCost),
      item.rooms.map((r) => `${r.name}: ${r.qty.toFixed(1)} ${item.unit} (${formatCurrencyVal(r.cost)})`).join('; ')
    ]);
  });

  if (totals.totalOtherHardwareCost > 0) {
    const otherHwRooms: string[] = [];
    project.rooms.forEach((r) => {
      const roomOtherHw =
        (r.plywoodBoxOtherHardwareCost || 0) +
        (r.plywoodFrameOtherHardwareCost || 0) +
        (r.mdfBoxOtherHardwareCost || 0) +
        (r.mdfFrameOtherHardwareCost || 0);
      if (roomOtherHw > 0) {
        otherHwRooms.push(`${r.name}: (${formatCurrencyVal(roomOtherHw)})`);
      }
    });

    bomRows.push([
      groupedMaterials.length + 1,
      "Other Hardware (Box & Shutter custom entry)",
      "Hardware",
      "-",
      "entry",
      "-",
      formatCurrencyVal(totals.totalOtherHardwareCost),
      otherHwRooms.join('; ')
    ]);
  }

  bomRows.push([]);
  bomRows.push([
    "",
    "GRAND TOTAL",
    "",
    "",
    "",
    "",
    formatCurrencyVal(totals.grandTotal),
    ""
  ]);

  const wsBom = XLSX.utils.aoa_to_sheet(bomRows);
  wsBom['!cols'] = [
    { wch: 8 },  // S.No
    { wch: 45 }, // Description
    { wch: 18 }, // Category
    { wch: 18 }, // Unit Rate
    { wch: 10 }, // Unit
    { wch: 16 }, // Aggregated Qty
    { wch: 22 }, // Total Cost
    { wch: 60 }  // Distribution
  ];
  XLSX.utils.book_append_sheet(wb, wsBom, "Consolidated BOM");

  // 3. Derived Cost Rates Sheet
  const derivedRatesRows: any[][] = [
    ["DERIVED UNIT COST RATES ANALYSIS SUMMARY"],
    ["Project Reference:", project.name || "Untitled Project"],
    [],
    ["1. PLYWOOD DERIVED UNIT COST RATES"],
    [
      "Rate Type Description", 
      `Calculated Derived Rate (${currencySymbol})`, 
      "Unit", 
      "Total Base Board Cost", 
      "Total Laminates & Louvers Cost", 
      "Standard Hardware Cost", 
      "Other Hardware Cost",
      "Total Adhesive Cost", 
      "Total Labor Cost", 
      "Aggregate Calculated Cost", 
      "Total Aggregated Volume/Area"
    ],
    [
      "Carcass / Box Plywood Rate",
      formatCurrencyVal(totals.plywoodBoxCFT > 0 ? totals.plywoodBoxTotalValue / totals.plywoodBoxCFT : 0),
      "/ cft",
      formatCurrencyVal(totals.plywoodBoxBoardCost),
      formatCurrencyVal(totals.colorLaminateBoxCost + totals.acrylicLaminateBoxCost + totals.halfWhiteLaminateBoxCost + totals.pBoxLouversCost),
      formatCurrencyVal(totals.pBoxHingeCost + totals.pBoxTelescopeCost + totals.pBoxHandle6Cost + totals.pBoxHandle9Cost),
      formatCurrencyVal(totals.plywoodBoxOtherHardwareCost),
      formatCurrencyVal(totals.pBoxAdhesiveCost),
      formatCurrencyVal(totals.plywoodBoxLaborCost),
      formatCurrencyVal(totals.plywoodBoxTotalValue),
      totals.plywoodBoxCFT.toFixed(1) + " cft"
    ],
    [
      "Shutter / Frame Plywood Rate",
      formatCurrencyVal(totals.plywoodFrameSqFt > 0 ? totals.plywoodFrameTotalValue / totals.plywoodFrameSqFt : 0),
      "/ sq.ft",
      formatCurrencyVal(totals.plywoodFrameBoardCost),
      formatCurrencyVal(totals.colorLaminateFrameCost + totals.acrylicLaminateFrameCost + totals.halfWhiteLaminateFrameCost + totals.pFrameLouversCost),
      formatCurrencyVal(totals.pFrameHingeCost + totals.pFrameHandle6Cost + totals.pFrameHandle9Cost),
      formatCurrencyVal(totals.plywoodFrameOtherHardwareCost),
      formatCurrencyVal(totals.pFrameAdhesiveCost),
      formatCurrencyVal(totals.plywoodFrameLaborCost),
      formatCurrencyVal(totals.plywoodFrameTotalValue),
      totals.plywoodFrameSqFt.toFixed(1) + " sqft"
    ],
    [],
    ["2. MDF DERIVED UNIT COST RATES"],
    [
      "Rate Type Description", 
      `Calculated Derived Rate (${currencySymbol})`, 
      "Unit", 
      "Total Base Board Cost", 
      "Total Laminates & Louvers Cost", 
      "Standard Hardware Cost", 
      "Other Hardware Cost",
      "Total Adhesive Cost", 
      "Total Labor Cost", 
      "Aggregate Calculated Cost", 
      "Total Aggregated Volume/Area"
    ],
    [
      "Carcass / Box MDF Rate",
      formatCurrencyVal(totals.mdfBoxCFT > 0 ? totals.mdfBoxTotalValue / totals.mdfBoxCFT : 0),
      "/ cft",
      formatCurrencyVal(totals.mdfBoxBoardCost),
      formatCurrencyVal(0),
      formatCurrencyVal(totals.mBoxHingeCost + totals.mBoxTelescopeCost + totals.mBoxHandle6Cost + totals.mBoxHandle9Cost),
      formatCurrencyVal(totals.mdfBoxOtherHardwareCost),
      formatCurrencyVal(totals.mdfBoxAdhesiveCost),
      formatCurrencyVal(totals.mdfBoxLaborCost),
      formatCurrencyVal(totals.mdfBoxTotalValue),
      totals.mdfBoxCFT.toFixed(1) + " cft"
    ],
    [
      "Shutter / Frame MDF Rate",
      formatCurrencyVal(totals.mdfFrameSqFt > 0 ? totals.mdfFrameTotalValue / totals.mdfFrameSqFt : 0),
      "/ sq.ft",
      formatCurrencyVal(totals.mdfFrameBoardCost),
      formatCurrencyVal(0),
      formatCurrencyVal(totals.mFrameHingeCost + totals.mFrameHandle6Cost + totals.mFrameHandle9Cost),
      formatCurrencyVal(totals.mdfFrameOtherHardwareCost),
      formatCurrencyVal(totals.mdfFrameAdhesiveCost),
      formatCurrencyVal(totals.mdfFrameLaborCost),
      formatCurrencyVal(totals.mdfFrameTotalValue),
      totals.mdfFrameSqFt.toFixed(1) + " sqft"
    ]
  ];

  const wsDerived = XLSX.utils.aoa_to_sheet(derivedRatesRows);
  wsDerived['!cols'] = [
    { wch: 30 }, // Rate Type Description
    { wch: 25 }, // Calculated Derived Rate
    { wch: 10 }, // Unit
    { wch: 20 }, // Board Cost
    { wch: 26 }, // Laminates Cost
    { wch: 22 }, // Standard Hardware Cost
    { wch: 20 }, // Other Hardware Cost
    { wch: 18 }, // Adhesive Cost
    { wch: 18 }, // Labor Cost
    { wch: 22 }, // Aggregate Calculated Cost
    { wch: 24 }  // Volume
  ];
  XLSX.utils.book_append_sheet(wb, wsDerived, "Derived Cost Rates");

  // 4. Space-by-Space Sheets
  project.rooms.forEach((room) => {
    const rCost = calculateRoomCost(room, project.globalPrices);
    
    const roomRows: any[][] = [
      [`COST ESTIMATE DETAIL - ${room.name.toUpperCase()}`],
      ["Project Reference:", project.name || "Untitled Project"],
      [],
      ["1. SPACE BUDGET OVERVIEW"],
      ["Budget Category", `Calculated Cost (${currencySymbol})`, "Share of Space Budget"],
      ["Materials Cost", formatCurrencyVal(rCost.totalMaterials), ((rCost.totalMaterials / (rCost.totalRoomCost || 1)) * 100).toFixed(1) + "%"],
      ["Hardware Cost", formatCurrencyVal(rCost.totalHardware), ((rCost.totalHardware / (rCost.totalRoomCost || 1)) * 100).toFixed(1) + "%"],
      ["Labor Cost", formatCurrencyVal(rCost.totalLabor), ((rCost.totalLabor / (rCost.totalRoomCost || 1)) * 100).toFixed(1) + "%"],
      ["TOTAL ESTIMATED BUDGET FOR THIS SPACE", formatCurrencyVal(rCost.totalRoomCost), "100.0%"],
      [],
      ["2. DETAILED BILL OF MATERIALS (BOM) FOR THIS SPACE"],
      ["S.No.", "Component / Resource Description", "Category", "Quantity Input", "Unit", `Rate Charged (${currencySymbol})`, `Calculated Cost (${currencySymbol})`]
    ];

    const addDetailRow = (label: string, category: string, qty: number, unit: string, rate: number | string, total: number) => {
      if (qty > 0) {
        roomRows.push([
          sNo++,
          label,
          category,
          typeof qty === 'number' ? qty.toFixed(1) : qty,
          unit,
          typeof rate === 'number' ? formatCurrencyVal(rate) : rate,
          formatCurrencyVal(total)
        ]);
      }
    };

    const addSummaryTotalRow = (label: string, totalQty: number, unit: string, totalCost: number) => {
      if (totalQty > 0) {
        roomRows.push([
          "TOTAL",
          label,
          "Overall Scope",
          totalQty.toFixed(1) + " (Total)",
          unit,
          "-",
          formatCurrencyVal(totalCost)
        ]);
      }
    };

    let sNo = 1;
    const plyPrice = getEffectivePrice('plywood', room, project.globalPrices);
    const mdfPrice = getEffectivePrice('mdf', room, project.globalPrices);
    const colorLamPrice = getEffectivePrice('colorLaminate', room, project.globalPrices);
    const acrylicLamPrice = getEffectivePrice('acrylicLaminate', room, project.globalPrices);
    const hwLamPrice = getEffectivePrice('halfWhiteLaminate', room, project.globalPrices);
    const louversPrice = getEffectivePrice('louvers', room, project.globalPrices);
    const adhesivePrice = getEffectivePrice('adhesive', room, project.globalPrices);
    const hingePrice = getEffectivePrice('hinge', room, project.globalPrices);
    const telescopePrice = getEffectivePrice('telescope', room, project.globalPrices);
    const handle6Price = getEffectivePrice('handle6Inch', room, project.globalPrices);
    const handle9Price = getEffectivePrice('handle9Inch', room, project.globalPrices);

    // 1. Plywood Core Board
    const pBoxSht = room.plywoodBoxSheets || 0;
    const pFrameSht = room.plywoodFrameSheets || 0;
    const totalPSht = pBoxSht + pFrameSht;
    if (totalPSht > 0) {
      addDetailRow("Plywood Core Board - Carcass (Box)", "Materials", pBoxSht, "sheets", plyPrice * 32, rCost.plywoodBoxBoardCost);
      addDetailRow("Plywood Core Board - Shutter (Frame)", "Materials", pFrameSht, "sheets", plyPrice * 32, rCost.plywoodFrameBoardCost);
      addSummaryTotalRow("Overall Plywood Required for this Space", totalPSht, "sheets", rCost.plywoodCost);
    }

    // 2. MDF Core Board
    const mBoxSht = room.mdfBoxSheets || 0;
    const mFrameSht = room.mdfFrameSheets || 0;
    const totalMSht = mBoxSht + mFrameSht;
    if (totalMSht > 0) {
      addDetailRow("MDF Core Board - Carcass (Box)", "Materials", mBoxSht, "sheets", mdfPrice * 32, rCost.mdfBoxBoardCost);
      addDetailRow("MDF Core Board - Shutter (Frame)", "Materials", mFrameSht, "sheets", mdfPrice * 32, rCost.mdfFrameBoardCost);
      addSummaryTotalRow("Overall MDF Required for this Space", totalMSht, "sheets", rCost.mdfCost);
    }

    // 3. Color Laminates
    const cBox = room.colorLaminateBoxSheets !== undefined ? room.colorLaminateBoxSheets : (room.colorLaminateSheets || 0);
    const cFrame = room.colorLaminateFrameSheets !== undefined ? room.colorLaminateFrameSheets : 0;
    const totalColor = cBox + cFrame;
    if (totalColor > 0) {
      addDetailRow("Color Laminate - Carcass (Box)", "Materials", cBox, "sheets", colorLamPrice, rCost.colorLaminateBoxCost);
      addDetailRow("Color Laminate - Shutter (Frame)", "Materials", cFrame, "sheets", colorLamPrice, rCost.colorLaminateFrameCost);
      addSummaryTotalRow("Overall Color Laminate Required for this Space", totalColor, "sheets", rCost.colorLaminateCost);
    }

    // 4. Acrylic Laminates
    const aBox = room.acrylicLaminateBoxSheets !== undefined ? room.acrylicLaminateBoxSheets : (room.acrylicLaminateSheets || 0);
    const aFrame = room.acrylicLaminateFrameSheets !== undefined ? room.acrylicLaminateFrameSheets : 0;
    const totalAcrylic = aBox + aFrame;
    if (totalAcrylic > 0) {
      addDetailRow("Acrylic Laminate - Carcass (Box)", "Materials", aBox, "sheets", acrylicLamPrice, rCost.acrylicLaminateBoxCost);
      addDetailRow("Acrylic Laminate - Shutter (Frame)", "Materials", aFrame, "sheets", acrylicLamPrice, rCost.acrylicLaminateFrameCost);
      addSummaryTotalRow("Overall Acrylic Laminate Required for this Space", totalAcrylic, "sheets", rCost.acrylicLaminateCost);
    }

    // 5. Half White Inner Laminates
    const hBox = room.halfWhiteLaminateBoxSheets !== undefined ? room.halfWhiteLaminateBoxSheets : (room.halfWhiteLaminateSheets || 0);
    const hFrame = room.halfWhiteLaminateFrameSheets !== undefined ? room.halfWhiteLaminateFrameSheets : 0;
    const totalHW = hBox + hFrame;
    if (totalHW > 0) {
      addDetailRow("Half White Inner - Carcass (Box)", "Materials", hBox, "sheets", hwLamPrice, rCost.halfWhiteLaminateBoxCost);
      addDetailRow("Half White Inner - Shutter (Frame)", "Materials", hFrame, "sheets", hwLamPrice, rCost.halfWhiteLaminateFrameCost);
      addSummaryTotalRow("Overall Half White Inner Required for this Space", totalHW, "sheets", rCost.halfWhiteLaminateCost);
    }

    // 6. Louvers
    const pBoxLouv = room.plywoodBoxLouversPanels !== undefined ? room.plywoodBoxLouversPanels : 0;
    const pFrameLouv = room.plywoodFrameLouversPanels !== undefined ? room.plywoodFrameLouversPanels : 0;
    const totalLouvers = room.plywoodBoxLouversPanels !== undefined ? (pBoxLouv + pFrameLouv) : (room.louversPanels || 0);
    if (totalLouvers > 0) {
      addDetailRow("Louvers Panels - Carcass (Box)", "Materials", pBoxLouv, "panels", louversPrice, rCost.pBoxLouversCost);
      addDetailRow("Louvers Panels - Shutter (Frame)", "Materials", pFrameLouv, "panels", louversPrice, rCost.pFrameLouversCost);
      addSummaryTotalRow("Overall Louvers Required for this Space", totalLouvers, "panels", rCost.louversCost);
    }

    // 7. Synthetic Resin Adhesive
    if (rCost.totalAdhesiveQty > 0) {
      const pBoxAdh = totalPSht > 0 ? (pBoxSht / totalPSht) * (room.adhesiveQty || totalPSht) : 0;
      const pFrameAdh = totalPSht > 0 ? (pFrameSht / totalPSht) * (room.adhesiveQty || totalPSht) : 0;
      const mBoxAdh = totalMSht > 0 ? (mBoxSht / totalMSht) * (room.mdfAdhesiveQty || totalMSht) : 0;
      const mFrameAdh = totalMSht > 0 ? (mFrameSht / totalMSht) * (room.mdfAdhesiveQty || totalMSht) : 0;
      addDetailRow("Adhesive - Plywood Box", "Materials", pBoxAdh, "kg", adhesivePrice, rCost.pBoxAdhesiveCost);
      addDetailRow("Adhesive - Plywood Shutter", "Materials", pFrameAdh, "kg", adhesivePrice, rCost.pFrameAdhesiveCost);
      addDetailRow("Adhesive - MDF Box", "Materials", mBoxAdh, "kg", adhesivePrice, rCost.mdfBoxAdhesiveCost);
      addDetailRow("Adhesive - MDF Shutter", "Materials", mFrameAdh, "kg", adhesivePrice, rCost.mdfFrameAdhesiveCost);
      addSummaryTotalRow("Overall Synthetic Resin Adhesive Required for this Space", rCost.totalAdhesiveQty, "kg", rCost.adhesiveCost);
    }

    // 8. Soft-Close Hinges
    const pBoxH = room.plywoodBoxHingeQty || 0;
    const pFrameH = room.plywoodFrameHingeQty || 0;
    const mBoxH = room.mdfBoxHingeQty || 0;
    const mFrameH = room.mdfFrameHingeQty || 0;
    const totalH = room.plywoodBoxHingeQty !== undefined ? (pBoxH + pFrameH + mBoxH + mFrameH) : (room.hingeQty || 0);
    if (totalH > 0) {
      addDetailRow("Soft-Close Hinges - Plywood Box", "Hardware", pBoxH, "pcs", hingePrice, rCost.pBoxHingeCost);
      addDetailRow("Soft-Close Hinges - Plywood Shutter", "Hardware", pFrameH, "pcs", hingePrice, rCost.pFrameHingeCost);
      addDetailRow("Soft-Close Hinges - MDF Box", "Hardware", mBoxH, "pcs", hingePrice, rCost.mBoxHingeCost);
      addDetailRow("Soft-Close Hinges - MDF Shutter", "Hardware", mFrameH, "pcs", hingePrice, rCost.mFrameHingeCost);
      addSummaryTotalRow("Overall Soft-Close Hinges Required for this Space", totalH, "pcs", rCost.hingeCost);
    }

    // 9. Drawer Telescopes
    const pBoxTel = room.plywoodBoxTelescopeQty || 0;
    const mBoxTel = room.mdfBoxTelescopeQty || 0;
    const totalTel = room.plywoodBoxTelescopeQty !== undefined ? (pBoxTel + mBoxTel) : (room.telescopeQty || 0);
    if (totalTel > 0) {
      addDetailRow("Telescopic Channels - Plywood Box", "Hardware", pBoxTel, "pairs", telescopePrice, rCost.pBoxTelescopeCost);
      addDetailRow("Telescopic Channels - MDF Box", "Hardware", mBoxTel, "pairs", telescopePrice, rCost.mBoxTelescopeCost);
      addSummaryTotalRow("Overall Telescopic Channels Required for this Space", totalTel, "pairs", rCost.telescopeCost);
    }

    // 10. Handles 6"
    const pBoxH6 = room.plywoodBoxHandle6Qty || 0;
    const pFrameH6 = room.plywoodFrameHandle6Qty || 0;
    const mBoxH6 = room.mdfBoxHandle6Qty || 0;
    const mFrameH6 = room.mdfFrameHandle6Qty || 0;
    const totalH6 = room.plywoodBoxHandle6Qty !== undefined ? (pBoxH6 + pFrameH6 + mBoxH6 + mFrameH6) : (room.handle6Qty || 0);
    if (totalH6 > 0) {
      addDetailRow("Handles 6\" - Plywood Box", "Hardware", pBoxH6, "pcs", handle6Price, rCost.pBoxHandle6Cost);
      addDetailRow("Handles 6\" - Plywood Shutter", "Hardware", pFrameH6, "pcs", handle6Price, rCost.pFrameHandle6Cost);
      addDetailRow("Handles 6\" - MDF Box", "Hardware", mBoxH6, "pcs", handle6Price, rCost.mBoxHandle6Cost);
      addDetailRow("Handles 6\" - MDF Shutter", "Hardware", mFrameH6, "pcs", handle6Price, rCost.mFrameHandle6Cost);
      addSummaryTotalRow("Overall Handles 6\" Required for this Space", totalH6, "pcs", rCost.handle6InchCost);
    }

    // 11. Handles 9"
    const pBoxH9 = room.plywoodBoxHandle9Qty || 0;
    const pFrameH9 = room.plywoodFrameHandle9Qty || 0;
    const mBoxH9 = room.mdfBoxHandle9Qty || 0;
    const mFrameH9 = room.mdfFrameHandle9Qty || 0;
    const totalH9 = room.plywoodBoxHandle9Qty !== undefined ? (pBoxH9 + pFrameH9 + mBoxH9 + mFrameH9) : (room.handle9Qty || 0);
    if (totalH9 > 0) {
      addDetailRow("Handles 9\" - Plywood Box", "Hardware", pBoxH9, "pcs", handle9Price, rCost.pBoxHandle9Cost);
      addDetailRow("Handles 9\" - Plywood Shutter", "Hardware", pFrameH9, "pcs", handle9Price, rCost.pFrameHandle9Cost);
      addDetailRow("Handles 9\" - MDF Box", "Hardware", mBoxH9, "pcs", handle9Price, rCost.mBoxHandle9Cost);
      addDetailRow("Handles 9\" - MDF Shutter", "Hardware", mFrameH9, "pcs", handle9Price, rCost.mFrameHandle9Cost);
      addSummaryTotalRow("Overall Handles 9\" Required for this Space", totalH9, "pcs", rCost.handle9InchCost);
    }

    // 12. Other Hardware (Box & Shutter lump sum entries)
    if (rCost.totalOtherHardwareCost > 0) {
      if ((room.plywoodBoxOtherHardwareCost || 0) > 0) {
        addDetailRow("Other Hardware - Plywood Carcass (Box)", "Hardware", 1, "entry", room.plywoodBoxOtherHardwareCost || 0, room.plywoodBoxOtherHardwareCost || 0);
      }
      if ((room.plywoodFrameOtherHardwareCost || 0) > 0) {
        addDetailRow("Other Hardware - Plywood Shutter (Frame)", "Hardware", 1, "entry", room.plywoodFrameOtherHardwareCost || 0, room.plywoodFrameOtherHardwareCost || 0);
      }
      if ((room.mdfBoxOtherHardwareCost || 0) > 0) {
        addDetailRow("Other Hardware - MDF Carcass (Box)", "Hardware", 1, "entry", room.mdfBoxOtherHardwareCost || 0, room.mdfBoxOtherHardwareCost || 0);
      }
      if ((room.mdfFrameOtherHardwareCost || 0) > 0) {
        addDetailRow("Other Hardware - MDF Shutter (Frame)", "Hardware", 1, "entry", room.mdfFrameOtherHardwareCost || 0, room.mdfFrameOtherHardwareCost || 0);
      }
      addSummaryTotalRow("Overall Other Hardware for this Space", 1, "space", rCost.totalOtherHardwareCost);
    }

    // 13. Labor
    const pBoxLaborPrice = getEffectivePrice('plywoodBoxLabor', room, project.globalPrices);
    const pFrameLaborPrice = getEffectivePrice('plywoodFrameLabor', room, project.globalPrices);
    const mBoxLaborPrice = getEffectivePrice('mdfBoxLabor', room, project.globalPrices);
    const mFrameLaborPrice = getEffectivePrice('mdfFrameLabor', room, project.globalPrices);

    if (rCost.totalLabor > 0) {
      addDetailRow("Plywood Box (Carcass) Labor", "Labor", room.plywoodBoxCFT || 0, "cft", pBoxLaborPrice, rCost.plywoodBoxLaborCost);
      addDetailRow("Plywood Frame (Shutter) Labor", "Labor", room.plywoodFrameSqFt || 0, "sq.ft", pFrameLaborPrice, rCost.plywoodFrameLaborCost);
      addDetailRow("MDF Box (Carcass) Labor", "Labor", room.mdfBoxCFT || 0, "cft", mBoxLaborPrice, rCost.mdfBoxLaborCost);
      addDetailRow("MDF Frame (Shutter) Labor", "Labor", room.mdfFrameSqFt || 0, "sq.ft", mFrameLaborPrice, rCost.mdfFrameLaborCost);
      addSummaryTotalRow("Overall Labor Cost for this Space", 1, "space", rCost.totalLabor);
    }

    roomRows.push([]);
    roomRows.push(["3. SPACE DERIVED UNIT COST RATES ANALYSIS"]);
    roomRows.push(["Derived Rate Type", `Calculated Derived Rate (${currencySymbol})`, "Unit", "Total Sum Value", "Aggregated Volume/Area"]);
    roomRows.push([
      "Carcass / Box Plywood Derived Rate",
      formatCurrencyVal((room.plywoodBoxCFT || 0) > 0 ? rCost.plywoodBoxTotalValue / room.plywoodBoxCFT : 0),
      "/ cft",
      formatCurrencyVal(rCost.plywoodBoxTotalValue),
      (room.plywoodBoxCFT || 0).toFixed(1) + " cft"
    ]);
    roomRows.push([
      "Shutter / Frame Plywood Derived Rate",
      formatCurrencyVal((room.plywoodFrameSqFt || 0) > 0 ? rCost.plywoodFrameTotalValue / room.plywoodFrameSqFt : 0),
      "/ sq.ft",
      formatCurrencyVal(rCost.plywoodFrameTotalValue),
      (room.plywoodFrameSqFt || 0).toFixed(1) + " sqft"
    ]);
    roomRows.push([
      "Carcass / Box MDF Derived Rate",
      formatCurrencyVal((room.mdfBoxCFT || 0) > 0 ? rCost.mdfBoxTotalValue / room.mdfBoxCFT : 0),
      "/ cft",
      formatCurrencyVal(rCost.mdfBoxTotalValue),
      (room.mdfBoxCFT || 0).toFixed(1) + " cft"
    ]);
    roomRows.push([
      "Shutter / Frame MDF Derived Rate",
      formatCurrencyVal((room.mdfFrameSqFt || 0) > 0 ? rCost.mdfFrameTotalValue / room.mdfFrameSqFt : 0),
      "/ sq.ft",
      formatCurrencyVal(rCost.mdfFrameTotalValue),
      (room.mdfFrameSqFt || 0).toFixed(1) + " sqft"
    ]);

    const wsRoom = XLSX.utils.aoa_to_sheet(roomRows);
    wsRoom['!cols'] = [
      { wch: 8 },  // S.No.
      { wch: 45 }, // Description
      { wch: 18 }, // Category
      { wch: 16 }, // Quantity
      { wch: 10 }, // Unit
      { wch: 20 }, // Rate
      { wch: 22 }  // Subtotal
    ];
    
    const sanitizedRoomName = room.name.replace(/[\\\/\?\*\[\]]/g, "").substring(0, 31) || `Space ${room.id}`;
    XLSX.utils.book_append_sheet(wb, wsRoom, sanitizedRoomName);
  });

  const safeFileName = (project.name || "Falcon_Carpentry_Estimate")
    .replace(/[\\\/\?\*\[\]:"]/g, "_")
    .trim();
  XLSX.writeFile(wb, `${safeFileName}.xlsx`);
}
