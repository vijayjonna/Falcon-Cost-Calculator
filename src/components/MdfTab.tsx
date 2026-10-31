import React from 'react';
import { RoomData } from '../types';

const SQFT_PER_SHEET = 32;

interface MdfTabProps {
  activeRoom: RoomData;
  handleUpdateRoom: (roomId: string, updates: Partial<RoomData>) => void;
  isDarkMode: boolean;
  currency?: string;
}

export const MdfTab: React.FC<MdfTabProps> = ({
  activeRoom,
  handleUpdateRoom,
  isDarkMode,
  currency = '₹',
}) => {
  return (
    <div className="space-y-4">
      {/* MDF - B */}
      <div className={`rounded-xl p-4 border space-y-3 ${isDarkMode ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-50/50 border-slate-200/60'}`}>
        <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5 ${isDarkMode ? 'text-slate-100 border-slate-800' : 'text-slate-900 border-slate-200'}`}>
          <span className="h-2 w-2 rounded-full bg-[#134d9c]" />
          B - MDF Board & Frame (Sheets & Labor metrics)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between mb-1.5 items-center">
              <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} block`}>MDF (Sht)</label>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${isDarkMode ? 'text-slate-300 bg-slate-800 border-slate-700' : 'text-slate-700 bg-slate-100 border-slate-200'}`}>
                {((activeRoom.mdfBoxSheets || 0) * SQFT_PER_SHEET).toFixed(0)} sqft
              </span>
            </div>
            <input
              type="number"
              min="0"
              step="0.1"
              value={activeRoom.mdfBoxSheets || 0}
              onChange={(e) => handleUpdateRoom(activeRoom.id, { mdfBoxSheets: Math.max(0, Number(e.target.value)) })}
              className={`w-full text-center text-xs font-bold py-1.5 border rounded ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
            />
          </div>

          <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between mb-1.5 items-center">
              <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} block`}>MDF Frame (Sht)</label>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${isDarkMode ? 'text-slate-300 bg-slate-800 border-slate-700' : 'text-slate-700 bg-slate-100 border-slate-200'}`}>
                {((activeRoom.mdfFrameSheets || 0) * SQFT_PER_SHEET).toFixed(0)} sqft
              </span>
            </div>
            <input
              type="number"
              min="0"
              step="0.1"
              value={activeRoom.mdfFrameSheets || 0}
              onChange={(e) => handleUpdateRoom(activeRoom.id, { mdfFrameSheets: Math.max(0, Number(e.target.value)) })}
              className={`w-full text-center text-xs font-bold py-1.5 border rounded ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
            />
          </div>
        </div>

        {/* MDF Labor inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1 pt-1 border-t border-dashed border-slate-200 dark:border-slate-850">
          <div className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between mb-1 items-center">
              <span className={`text-[11px] font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>MDF Labor (CFT)</span>
              <span className={`text-[10px] font-bold px-1 rounded ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-500'}`}>
                Volume
              </span>
            </div>
            <input
              type="number"
              min="0"
              step="0.1"
              value={activeRoom.mdfBoxCFT || 0}
              onChange={(e) => handleUpdateRoom(activeRoom.id, { mdfBoxCFT: Math.max(0, Number(e.target.value)) })}
              className={`w-full text-center text-xs font-bold py-1 border rounded ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
            />
          </div>

          <div className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between mb-1 items-center">
              <span className={`text-[11px] font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>MDF Frame Labor (Sq.Ft)</span>
              <span className={`text-[10px] font-bold px-1 rounded ${isDarkMode ? 'bg-slate-850 text-slate-300' : 'bg-slate-50 text-slate-500'}`}>
                Area
              </span>
            </div>
            <input
              type="number"
              min="0"
              step="0.1"
              value={activeRoom.mdfFrameSqFt || 0}
              onChange={(e) => handleUpdateRoom(activeRoom.id, { mdfFrameSqFt: Math.max(0, Number(e.target.value)) })}
              className={`w-full text-center text-xs font-bold py-1 border rounded ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
            />
          </div>
        </div>
      </div>

      {/* MDF Hardware - Box D */}
      <div className={`rounded-xl p-4 border space-y-3 ${isDarkMode ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-50/50 border-slate-200/60'}`}>
        <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5 ${isDarkMode ? 'text-slate-100 border-slate-800' : 'text-slate-900 border-slate-200'}`}>
          <span className="h-2 w-2 rounded-full bg-[#134d9c]" />
          D - MDF Hardware Fittings & Handle Choices
        </h4>

        <div className="space-y-3">
          {/* Hinges Sub-Section */}
          <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/60 border-slate-150'} space-y-2`}>
            <div className="flex justify-between items-center border-b pb-1">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Hinges (MDF Box & Frame)</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                Total: {((activeRoom.mdfBoxHingeQty || 0) + (activeRoom.mdfFrameHingeQty || 0))} pcs
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-0.5">
                <label className={`text-[9px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>MDF Box Hinges</label>
                <input
                  type="number"
                  min="0"
                  value={activeRoom.mdfBoxHingeQty || 0}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    handleUpdateRoom(activeRoom.id, {
                      mdfBoxHingeQty: val,
                      hingeQty: (activeRoom.plywoodBoxHingeQty || 0) + (activeRoom.plywoodFrameHingeQty || 0) + val + (activeRoom.mdfFrameHingeQty || 0)
                    });
                  }}
                  className={`w-full border rounded text-center text-xs font-bold py-0.5 ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                />
              </div>
              <div className="space-y-0.5">
                <label className={`text-[9px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>MDF Frame Hinges</label>
                <input
                  type="number"
                  min="0"
                  value={activeRoom.mdfFrameHingeQty || 0}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    handleUpdateRoom(activeRoom.id, {
                      mdfFrameHingeQty: val,
                      hingeQty: (activeRoom.plywoodBoxHingeQty || 0) + (activeRoom.plywoodFrameHingeQty || 0) + (activeRoom.mdfBoxHingeQty || 0) + val
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
              <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Drawer Telescopes (MDF Box)</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${isDarkMode ? 'bg-slate-850 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                Total: {(activeRoom.mdfBoxTelescopeQty || 0)} pairs
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-0.5">
                <label className={`text-[9px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>MDF Box Telescopes</label>
                <input
                  type="number"
                  min="0"
                  value={activeRoom.mdfBoxTelescopeQty || 0}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    handleUpdateRoom(activeRoom.id, {
                      mdfBoxTelescopeQty: val,
                      telescopeQty: (activeRoom.plywoodBoxTelescopeQty || 0) + val
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
              <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Cabinet Handles 6" (MDF Box & Frame)</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${isDarkMode ? 'bg-slate-850 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                Total: {((activeRoom.mdfBoxHandle6Qty || 0) + (activeRoom.mdfFrameHandle6Qty || 0))} pcs
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-0.5">
                <label className={`text-[9px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>MDF Box Handles</label>
                <input
                  type="number"
                  min="0"
                  value={activeRoom.mdfBoxHandle6Qty || 0}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    handleUpdateRoom(activeRoom.id, {
                      mdfBoxHandle6Qty: val,
                      handle6Qty: (activeRoom.plywoodBoxHandle6Qty || 0) + (activeRoom.plywoodFrameHandle6Qty || 0) + val + (activeRoom.mdfFrameHandle6Qty || 0)
                    });
                  }}
                  className={`w-full border rounded text-center text-xs font-bold py-0.5 ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                />
              </div>
              <div className="space-y-0.5">
                <label className={`text-[9px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>MDF Frame Handles</label>
                <input
                  type="number"
                  min="0"
                  value={activeRoom.mdfFrameHandle6Qty || 0}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    handleUpdateRoom(activeRoom.id, {
                      mdfFrameHandle6Qty: val,
                      handle6Qty: (activeRoom.plywoodBoxHandle6Qty || 0) + (activeRoom.plywoodFrameHandle6Qty || 0) + (activeRoom.mdfBoxHandle6Qty || 0) + val
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
              <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Cabinet Handles 9" (MDF Box & Frame)</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${isDarkMode ? 'bg-slate-850 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                Total: {((activeRoom.mdfBoxHandle9Qty || 0) + (activeRoom.mdfFrameHandle9Qty || 0))} pcs
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-0.5">
                <label className={`text-[9px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>MDF Box Handles</label>
                <input
                  type="number"
                  min="0"
                  value={activeRoom.mdfBoxHandle9Qty || 0}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    handleUpdateRoom(activeRoom.id, {
                      mdfBoxHandle9Qty: val,
                      handle9Qty: (activeRoom.plywoodBoxHandle9Qty || 0) + (activeRoom.plywoodFrameHandle9Qty || 0) + val + (activeRoom.mdfFrameHandle9Qty || 0)
                    });
                  }}
                  className={`w-full border rounded text-center text-xs font-bold py-0.5 ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                />
              </div>
              <div className="space-y-0.5">
                <label className={`text-[9px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>MDF Frame Handles</label>
                <input
                  type="number"
                  min="0"
                  value={activeRoom.mdfFrameHandle9Qty || 0}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    handleUpdateRoom(activeRoom.id, {
                      mdfFrameHandle9Qty: val,
                      handle9Qty: (activeRoom.plywoodBoxHandle9Qty || 0) + (activeRoom.plywoodFrameHandle9Qty || 0) + (activeRoom.mdfBoxHandle9Qty || 0) + val
                    });
                  }}
                  className={`w-full border rounded text-center text-xs font-bold py-0.5 ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MDF Adhesive & Other Hardware - Box E */}
      <div className={`rounded-xl p-4 border space-y-3 ${isDarkMode ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-50/50 border-slate-200/60'}`}>
        <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center justify-between border-b pb-1.5 ${isDarkMode ? 'text-slate-100 border-slate-800' : 'text-slate-900 border-slate-200'}`}>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#134d9c]" />
            <span>E - MDF Addons & Other Hardware</span>
          </div>
          <span className={`text-[10px] lowercase font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            adhesive & misc hardware
          </span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* MDF Adhesive */}
          <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-200'} space-y-1`}>
            <div className="flex justify-between mb-1">
              <label className={`text-[11px] font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>MDF Adhesive (kg)</label>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${isDarkMode ? 'text-slate-300 bg-slate-800 border-slate-700' : 'text-slate-700 bg-slate-100 border-slate-200'}`}>
                MDF require: {((activeRoom.mdfBoxSheets || 0) + (activeRoom.mdfFrameSheets || 0)).toFixed(1)} kg
              </span>
            </div>
            <input
              type="number"
              min="0"
              step="0.1"
              value={activeRoom.mdfAdhesiveQty !== undefined ? activeRoom.mdfAdhesiveQty : ((activeRoom.mdfBoxSheets || 0) + (activeRoom.mdfFrameSheets || 0))}
              onChange={(e) => handleUpdateRoom(activeRoom.id, { mdfAdhesiveQty: Math.max(0, Number(e.target.value)) })}
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
                Total: {currency}{(((activeRoom.mdfBoxOtherHardwareCost || 0) + (activeRoom.mdfFrameOtherHardwareCost || 0))).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div className="space-y-1">
                <label className={`text-[10px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  MDF Box Hardware ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1 text-xs font-bold text-slate-400">{currency}</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 3000"
                    value={activeRoom.mdfBoxOtherHardwareCost || ''}
                    onChange={(e) => handleUpdateRoom(activeRoom.id, { mdfBoxOtherHardwareCost: Math.max(0, Number(e.target.value)) })}
                    className={`w-full pl-6 pr-2 text-right text-xs font-bold py-1 border rounded ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={`text-[10px] font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  MDF Shutter Hardware ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1 text-xs font-bold text-slate-400">{currency}</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 1500"
                    value={activeRoom.mdfFrameOtherHardwareCost || ''}
                    onChange={(e) => handleUpdateRoom(activeRoom.id, { mdfFrameOtherHardwareCost: Math.max(0, Number(e.target.value)) })}
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
