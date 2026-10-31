import React from 'react';
import { RoomData } from '../types';

const SQFT_PER_SHEET = 32;

interface PlywoodTabProps {
  activeRoom: RoomData;
  handleUpdateRoom: (roomId: string, updates: Partial<RoomData>) => void;
  isDarkMode: boolean;
  currency?: string;
}

export const PlywoodTab: React.FC<PlywoodTabProps> = ({
  activeRoom,
  handleUpdateRoom,
  isDarkMode,
  currency = '₹',
}) => {
  return (
    <div className="space-y-4">
      {/* Plywood - A */}
      <div className={`rounded-xl p-4 border space-y-3 ${isDarkMode ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-50/50 border-slate-200/60'}`}>
        <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5 ${isDarkMode ? 'text-slate-100 border-slate-800' : 'text-slate-900 border-slate-200'}`}>
          <span className="h-2 w-2 rounded-full bg-[#134d9c]" />
          A - Plywood Board & Frame (Sheets & Labor metrics)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between mb-1.5 items-center">
              <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Carcass/Box Plywood (Sheets)</label>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${isDarkMode ? 'text-slate-300 bg-slate-800 border-slate-700' : 'text-slate-700 bg-slate-100 border-slate-200'}`}>
                {((activeRoom.plywoodBoxSheets || 0) * SQFT_PER_SHEET).toFixed(0)} sq.ft
              </span>
            </div>
            <div>
              <input
                type="number"
                min="0"
                step="0.1"
                value={activeRoom.plywoodBoxSheets || 0}
                onChange={(e) => handleUpdateRoom(activeRoom.id, { plywoodBoxSheets: Math.max(0, Number(e.target.value)) })}
                className={`w-full border rounded text-center text-xs font-bold py-1.5 ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
              />
            </div>
          </div>

          <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between mb-1.5 items-center">
              <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Shutter/Frame Plywood (Sheets)</label>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${isDarkMode ? 'text-slate-300 bg-slate-800 border-slate-700' : 'text-slate-700 bg-slate-100 border-slate-200'}`}>
                {((activeRoom.plywoodFrameSheets || 0) * SQFT_PER_SHEET).toFixed(0)} sq.ft
              </span>
            </div>
            <div>
              <input
                type="number"
                min="0"
                step="0.1"
                value={activeRoom.plywoodFrameSheets || 0}
                onChange={(e) => handleUpdateRoom(activeRoom.id, { plywoodFrameSheets: Math.max(0, Number(e.target.value)) })}
                className={`w-full border rounded text-center text-xs font-bold py-1.5 ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
              />
            </div>
          </div>
        </div>

        {/* Plywood Labor inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1 pt-1 border-t border-dashed border-slate-200 dark:border-slate-850">
          <div className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between mb-1 items-center">
              <span className={`text-[11px] font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Box Labor (CFT)</span>
              <span className={`text-[10px] font-bold px-1 rounded ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-500'}`}>
                Volume
              </span>
            </div>
            <input
              type="number"
              min="0"
              step="0.1"
              value={activeRoom.plywoodBoxCFT || 0}
              onChange={(e) => handleUpdateRoom(activeRoom.id, { plywoodBoxCFT: Math.max(0, Number(e.target.value)) })}
              className={`w-full text-center text-xs font-bold py-1 border rounded ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
            />
          </div>

          <div className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between mb-1 items-center">
              <span className={`text-[11px] font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Frame Labor (Sq.Ft)</span>
              <span className={`text-[10px] font-bold px-1 rounded ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-500'}`}>
                Area
              </span>
            </div>
            <input
              type="number"
              min="0"
              step="0.1"
              value={activeRoom.plywoodFrameSqFt || 0}
              onChange={(e) => handleUpdateRoom(activeRoom.id, { plywoodFrameSqFt: Math.max(0, Number(e.target.value)) })}
              className={`w-full text-center text-xs font-bold py-1 border rounded ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
            />
          </div>
        </div>
      </div>

      {/* Laminate Finishes & Louvers - Box C */}
      <div className={`rounded-xl p-4 border space-y-3 ${isDarkMode ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-50/50 border-slate-200/60'}`}>
        <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5 ${isDarkMode ? 'text-slate-100 border-slate-800' : 'text-slate-900 border-slate-200'}`}>
          <span className="h-2 w-2 rounded-full bg-[#134d9c]" />
          C - Exterior & Interior Laminate Sheets & Louvers
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Color Laminate */}
          <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'} space-y-2`}>
            <div className="flex justify-between items-center border-b pb-1.5">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Color Laminate</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${isDarkMode ? 'text-slate-300 bg-slate-800 border-slate-700' : 'text-slate-700 bg-slate-100 border-slate-200'}`}>
                {(((activeRoom.colorLaminateBoxSheets !== undefined ? activeRoom.colorLaminateBoxSheets : (activeRoom.colorLaminateSheets || 0)) + (activeRoom.colorLaminateFrameSheets || 0))).toFixed(1)} sht
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 items-end">
              <div className="space-y-1">
                <label className={`text-[10px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Box (Sht)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={activeRoom.colorLaminateBoxSheets !== undefined ? activeRoom.colorLaminateBoxSheets : (activeRoom.colorLaminateSheets || 0)}
                  onChange={(e) => handleUpdateRoom(activeRoom.id, { colorLaminateBoxSheets: Math.max(0, Number(e.target.value)) })}
                  className={`w-full min-w-0 text-center text-xs font-bold py-1.5 border rounded ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
              </div>
              <div className="space-y-1">
                <label className={`text-[10px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Frame (Sht)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={activeRoom.colorLaminateFrameSheets || 0}
                  onChange={(e) => handleUpdateRoom(activeRoom.id, { colorLaminateFrameSheets: Math.max(0, Number(e.target.value)) })}
                  className={`w-full min-w-0 text-center text-xs font-bold py-1.5 border rounded ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
              </div>
            </div>
          </div>

          {/* Acrylic Laminate */}
          <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'} space-y-2`}>
            <div className="flex justify-between items-center border-b pb-1.5">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Acrylic Laminate</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${isDarkMode ? 'text-slate-300 bg-slate-800 border-slate-700' : 'text-slate-700 bg-slate-100 border-slate-200'}`}>
                {(((activeRoom.acrylicLaminateBoxSheets !== undefined ? activeRoom.acrylicLaminateBoxSheets : (activeRoom.acrylicLaminateSheets || 0)) + (activeRoom.acrylicLaminateFrameSheets || 0))).toFixed(1)} sht
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 items-end">
              <div className="space-y-1">
                <label className={`text-[10px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Box (Sht)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={activeRoom.acrylicLaminateBoxSheets !== undefined ? activeRoom.acrylicLaminateBoxSheets : (activeRoom.acrylicLaminateSheets || 0)}
                  onChange={(e) => handleUpdateRoom(activeRoom.id, { acrylicLaminateBoxSheets: Math.max(0, Number(e.target.value)) })}
                  className={`w-full min-w-0 text-center text-xs font-bold py-1.5 border rounded ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
              </div>
              <div className="space-y-1">
                <label className={`text-[10px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Frame (Sht)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={activeRoom.acrylicLaminateFrameSheets || 0}
                  onChange={(e) => handleUpdateRoom(activeRoom.id, { acrylicLaminateFrameSheets: Math.max(0, Number(e.target.value)) })}
                  className={`w-full min-w-0 text-center text-xs font-bold py-1.5 border rounded ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
              </div>
            </div>
          </div>

          {/* Half White Inner */}
          <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'} space-y-2`}>
            <div className="flex justify-between items-center border-b pb-1.5">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Half White Inner</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${isDarkMode ? 'text-slate-300 bg-slate-800 border-slate-700' : 'text-slate-700 bg-slate-100 border-slate-200'}`}>
                {(((activeRoom.halfWhiteLaminateBoxSheets !== undefined ? activeRoom.halfWhiteLaminateBoxSheets : (activeRoom.halfWhiteLaminateSheets || 0)) + (activeRoom.halfWhiteLaminateFrameSheets || 0))).toFixed(1)} sht
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 items-end">
              <div className="space-y-1">
                <label className={`text-[10px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Box (Sht)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={activeRoom.halfWhiteLaminateBoxSheets !== undefined ? activeRoom.halfWhiteLaminateBoxSheets : (activeRoom.halfWhiteLaminateSheets || 0)}
                  onChange={(e) => handleUpdateRoom(activeRoom.id, { halfWhiteLaminateBoxSheets: Math.max(0, Number(e.target.value)) })}
                  className={`w-full min-w-0 text-center text-xs font-bold py-1.5 border rounded ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
              </div>
              <div className="space-y-1">
                <label className={`text-[10px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Frame (Sht)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={activeRoom.halfWhiteLaminateFrameSheets || 0}
                  onChange={(e) => handleUpdateRoom(activeRoom.id, { halfWhiteLaminateFrameSheets: Math.max(0, Number(e.target.value)) })}
                  className={`w-full min-w-0 text-center text-xs font-bold py-1.5 border rounded ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
              </div>
            </div>
          </div>

          {/* Louvers / Fluted */}
          <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'} space-y-2`}>
            <div className="flex justify-between items-center border-b pb-1.5">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Louvers / Fluted</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${isDarkMode ? 'text-slate-300 bg-slate-800 border-slate-700' : 'text-slate-700 bg-slate-100 border-slate-200'}`}>
                {((activeRoom.plywoodBoxLouversPanels || 0) + (activeRoom.plywoodFrameLouversPanels || 0))} pnl
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 items-end">
              <div className="space-y-1">
                <label className={`text-[10px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Box (Pnl)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={activeRoom.plywoodBoxLouversPanels !== undefined ? activeRoom.plywoodBoxLouversPanels : 0}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    handleUpdateRoom(activeRoom.id, {
                      plywoodBoxLouversPanels: val,
                      louversPanels: val + (activeRoom.plywoodFrameLouversPanels || 0)
                    });
                  }}
                  className={`w-full min-w-0 text-center text-xs font-bold py-1.5 border rounded ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
              </div>
              <div className="space-y-1">
                <label className={`text-[10px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Frame (Pnl)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={activeRoom.plywoodFrameLouversPanels !== undefined ? activeRoom.plywoodFrameLouversPanels : 0}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    handleUpdateRoom(activeRoom.id, {
                      plywoodFrameLouversPanels: val,
                      louversPanels: (activeRoom.plywoodBoxLouversPanels || 0) + val
                    });
                  }}
                  className={`w-full min-w-0 text-center text-xs font-bold py-1.5 border rounded ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plywood Hardware - Box D */}
      <div className={`rounded-xl p-4 border space-y-3 ${isDarkMode ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-50/50 border-slate-200/60'}`}>
        <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5 ${isDarkMode ? 'text-slate-100 border-slate-800' : 'text-slate-900 border-slate-200'}`}>
          <span className="h-2 w-2 rounded-full bg-[#134d9c]" />
          D - Plywood Hardware Fittings & Handle Choices
        </h4>

        <div className="space-y-3">
          {/* Hinges Sub-Section */}
          <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/60 border-slate-150'} space-y-2`}>
            <div className="flex justify-between items-center border-b pb-1">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Hinges (Plywood Box & Frame)</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                Total: {((activeRoom.plywoodBoxHingeQty || 0) + (activeRoom.plywoodFrameHingeQty || 0))} pcs
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-0.5">
                <label className={`text-[9px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Ply Box Hinges</label>
                <input
                  type="number"
                  min="0"
                  value={activeRoom.plywoodBoxHingeQty || 0}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    handleUpdateRoom(activeRoom.id, {
                      plywoodBoxHingeQty: val,
                      hingeQty: val + (activeRoom.plywoodFrameHingeQty || 0) + (activeRoom.mdfBoxHingeQty || 0) + (activeRoom.mdfFrameHingeQty || 0)
                    });
                  }}
                  className={`w-full border rounded text-center text-xs font-bold py-0.5 ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                />
              </div>
              <div className="space-y-0.5">
                <label className={`text-[9px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Ply Frame Hinges</label>
                <input
                  type="number"
                  min="0"
                  value={activeRoom.plywoodFrameHingeQty || 0}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    handleUpdateRoom(activeRoom.id, {
                      plywoodFrameHingeQty: val,
                      hingeQty: (activeRoom.plywoodBoxHingeQty || 0) + val + (activeRoom.mdfBoxHingeQty || 0) + (activeRoom.mdfFrameHingeQty || 0)
                    });
                  }}
                  className={`w-full border rounded text-center text-xs font-bold py-0.5 ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                />
              </div>
            </div>
          </div>

          {/* Telescopes Sub-Section */}
          <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/60 border-slate-150'} space-y-2`}>
            <div className="flex justify-between items-center border-b pb-1">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Drawer Telescopes (Plywood Box)</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                Total: {(activeRoom.plywoodBoxTelescopeQty || 0)} pairs
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-0.5">
                <label className={`text-[9px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Plywood Box Telescopes</label>
                <input
                  type="number"
                  min="0"
                  value={activeRoom.plywoodBoxTelescopeQty || 0}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    handleUpdateRoom(activeRoom.id, {
                      plywoodBoxTelescopeQty: val,
                      telescopeQty: val + (activeRoom.mdfBoxTelescopeQty || 0)
                    });
                  }}
                  className={`w-full border rounded text-center text-xs font-bold py-0.5 ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                />
              </div>
            </div>
          </div>

          {/* Handles 6" Sub-Section */}
          <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/60 border-slate-150'} space-y-2`}>
            <div className="flex justify-between items-center border-b pb-1">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Cabinet Handles 6" (Plywood Box & Frame)</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                Total: {((activeRoom.plywoodBoxHandle6Qty || 0) + (activeRoom.plywoodFrameHandle6Qty || 0))} pcs
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-0.5">
                <label className={`text-[9px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Ply Box Handles</label>
                <input
                  type="number"
                  min="0"
                  value={activeRoom.plywoodBoxHandle6Qty || 0}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    handleUpdateRoom(activeRoom.id, {
                      plywoodBoxHandle6Qty: val,
                      handle6Qty: val + (activeRoom.plywoodFrameHandle6Qty || 0) + (activeRoom.mdfBoxHandle6Qty || 0) + (activeRoom.mdfFrameHandle6Qty || 0)
                    });
                  }}
                  className={`w-full border rounded text-center text-xs font-bold py-0.5 ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                />
              </div>
              <div className="space-y-0.5">
                <label className={`text-[9px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Ply Frame Handles</label>
                <input
                  type="number"
                  min="0"
                  value={activeRoom.plywoodFrameHandle6Qty || 0}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    handleUpdateRoom(activeRoom.id, {
                      plywoodFrameHandle6Qty: val,
                      handle6Qty: (activeRoom.plywoodBoxHandle6Qty || 0) + val + (activeRoom.mdfBoxHandle6Qty || 0) + (activeRoom.mdfFrameHandle6Qty || 0)
                    });
                  }}
                  className={`w-full border rounded text-center text-xs font-bold py-0.5 ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                />
              </div>
            </div>
          </div>

          {/* Handles 9" Sub-Section */}
          <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/60 border-slate-150'} space-y-2`}>
            <div className="flex justify-between items-center border-b pb-1">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Cabinet Handles 9" (Plywood Box & Frame)</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${isDarkMode ? 'bg-slate-850 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                Total: {((activeRoom.plywoodBoxHandle9Qty || 0) + (activeRoom.plywoodFrameHandle9Qty || 0))} pcs
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-0.5">
                <label className={`text-[9px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Ply Box Handles</label>
                <input
                  type="number"
                  min="0"
                  value={activeRoom.plywoodBoxHandle9Qty || 0}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    handleUpdateRoom(activeRoom.id, {
                      plywoodBoxHandle9Qty: val,
                      handle9Qty: val + (activeRoom.plywoodFrameHandle6Qty || 0) + (activeRoom.mdfBoxHandle6Qty || 0) + (activeRoom.mdfFrameHandle6Qty || 0)
                    });
                  }}
                  className={`w-full border rounded text-center text-xs font-bold py-0.5 ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                />
              </div>
              <div className="space-y-0.5">
                <label className={`text-[9px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Ply Frame Handles</label>
                <input
                  type="number"
                  min="0"
                  value={activeRoom.plywoodFrameHandle9Qty || 0}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    handleUpdateRoom(activeRoom.id, {
                      plywoodFrameHandle9Qty: val,
                      handle9Qty: (activeRoom.plywoodBoxHandle9Qty || 0) + val + (activeRoom.mdfBoxHandle9Qty || 0) + (activeRoom.mdfFrameHandle9Qty || 0)
                    });
                  }}
                  className={`w-full border rounded text-center text-xs font-bold py-0.5 ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plywood Adhesive & Other Hardware - Box E */}
      <div className={`rounded-xl p-4 border space-y-3 ${isDarkMode ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-50/50 border-slate-200/60'}`}>
        <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center justify-between border-b pb-1.5 ${isDarkMode ? 'text-slate-100 border-slate-800' : 'text-slate-900 border-slate-200'}`}>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#134d9c]" />
            <span>E - Plywood Addons & Other Hardware</span>
          </div>
          <span className={`text-[10px] lowercase font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            adhesive & misc hardware
          </span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Plywood Adhesive */}
          <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-200'} space-y-1`}>
            <div className="flex justify-between mb-1">
              <label className={`text-[11px] font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Plywood Adhesive (kg)</label>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${isDarkMode ? 'text-slate-300 bg-slate-800 border-slate-700' : 'text-slate-700 bg-slate-100 border-slate-200'}`}>
                Ply require: {((activeRoom.plywoodBoxSheets || 0) + (activeRoom.plywoodFrameSheets || 0)).toFixed(1)} kg
              </span>
            </div>
            <input
              type="number"
              min="0"
              step="0.1"
              value={activeRoom.adhesiveQty !== undefined ? activeRoom.adhesiveQty : ((activeRoom.plywoodBoxSheets || 0) + (activeRoom.plywoodFrameSheets || 0))}
              onChange={(e) => handleUpdateRoom(activeRoom.id, { adhesiveQty: Math.max(0, Number(e.target.value)) })}
              className={`w-full text-center text-xs font-bold py-1 border rounded ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
            />
          </div>

          {/* Other Hardware (Box and Shutter) */}
          <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-200'} space-y-2`}>
            <div className="flex justify-between items-center border-b pb-1">
              <label className={`text-[11px] font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                Other Hardware ({currency})
              </label>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                Total: {currency}{(((activeRoom.plywoodBoxOtherHardwareCost || 0) + (activeRoom.plywoodFrameOtherHardwareCost || 0))).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div className="space-y-1">
                <label className={`text-[10px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Box Hardware ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1 text-xs font-bold text-slate-400">{currency}</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 3000"
                    value={activeRoom.plywoodBoxOtherHardwareCost || ''}
                    onChange={(e) => handleUpdateRoom(activeRoom.id, { plywoodBoxOtherHardwareCost: Math.max(0, Number(e.target.value)) })}
                    className={`w-full pl-6 pr-2 text-right text-xs font-bold py-1 border rounded ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={`text-[10px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Shutter Hardware ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1 text-xs font-bold text-slate-400">{currency}</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 1500"
                    value={activeRoom.plywoodFrameOtherHardwareCost || ''}
                    onChange={(e) => handleUpdateRoom(activeRoom.id, { plywoodFrameOtherHardwareCost: Math.max(0, Number(e.target.value)) })}
                    className={`w-full pl-6 pr-2 text-right text-xs font-bold py-1 border rounded ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
