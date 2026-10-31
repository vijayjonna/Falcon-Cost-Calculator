import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderOpen,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  Clock,
  Download,
  Upload,
  X,
  Layers,
  ArrowRight,
  FileText,
  Cloud,
  Smartphone,
} from 'lucide-react';
import { ProjectData } from '../types';
import { formatCurrency, calculateRoomCost } from '../utils';
import { exportProjectFile } from '../storage';
import { exportProjectToXLSX } from '../excelExport';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProject: ProjectData;
  allProjects: ProjectData[];
  onSelectProject: (project: ProjectData) => void;
  onCreateNewProject: (name: string) => void;
  onDuplicateProject: (project: ProjectData) => void;
  onDeleteProject: (projectId: string) => void;
  onImportProject: (file: File) => void;
  isDarkMode: boolean;
  currentUser?: any;
  onOpenCloudSync?: () => void;
}

export function ProjectManagerModal({
  isOpen,
  onClose,
  activeProject,
  allProjects,
  onSelectProject,
  onCreateNewProject,
  onDuplicateProject,
  onDeleteProject,
  onImportProject,
  isDarkMode,
  currentUser,
  onOpenCloudSync,
}: ProjectManagerModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewInput, setShowNewInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) =>
      (p.name || 'Untitled').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allProjects, searchTerm]);

  const handleCreateSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newProjectName.trim();
    onCreateNewProject(trimmed || 'New Project');
    setNewProjectName('');
    setShowNewInput(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportProject(file);
      e.target.value = '';
    }
  };

  const formatRelativeTime = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return new Date(timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    if (diffHours > 0) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    if (diffMin > 0) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const calculateProjectTotal = (p: ProjectData) => {
    try {
      return p.rooms.reduce((acc, room) => {
        const cost = calculateRoomCost(room, p.globalPrices);
        return acc + cost.totalRoomCost;
      }, 0);
    } catch {
      return 0;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className={`w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              isDarkMode ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-900/50' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
            }`}>
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Saved Projects &amp; Files</h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Switch between saved projects or start a new estimate
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewInput(true)}
              className="bg-[#134d9c] hover:bg-[#0f3e7c] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Project</span>
            </button>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Create New Project Inline Input */}
        <AnimatePresence>
          {showNewInput && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleCreateSubmit}
              className={`p-4 border-b flex items-center gap-3 ${
                isDarkMode ? 'bg-indigo-950/20 border-slate-800' : 'bg-indigo-50/50 border-indigo-100'
              }`}
            >
              <FileText className={`h-4 w-4 shrink-0 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <input
                type="text"
                autoFocus
                placeholder="Enter new project name (e.g. Jo, 3BHK Penthouse, Villa 4)"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                Create &amp; Open
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewInput(false);
                  setNewProjectName('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600'
                }`}
              >
                Cancel
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Cloud Sync & Phone Access Notice */}
        <div className={`px-4 py-3 border-b flex items-center justify-between gap-3 text-xs ${
          isDarkMode ? 'bg-slate-850/70 border-slate-800' : 'bg-indigo-50/70 border-indigo-100'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white shrink-0 shadow-xs">
              <Cloud className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 dark:text-slate-100 truncate">
                  {currentUser ? 'Cloud Synced across Devices' : 'Sync Files to Phone & Computer'}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shrink-0">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {currentUser
                  ? `Logged in as ${currentUser.email} • Changes sync automatically between phone and PC`
                  : 'Sign in to access your estimates on both your computer and phone.'}
              </p>
            </div>
          </div>
          {onOpenCloudSync && (
            <button
              onClick={onOpenCloudSync}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors shrink-0 shadow-xs active:scale-95"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>{currentUser ? 'Open on Phone' : 'Connect Devices'}</span>
            </button>
          )}
        </div>

        {/* Search & Actions Bar */}
        <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
          isDarkMode ? 'border-slate-800 bg-slate-950/20' : 'border-slate-100 bg-white'
        }`}>
          <div className="relative flex-1 min-w-[200px]">
            <Search className={`h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 ${
              isDarkMode ? 'text-slate-500' : 'text-slate-400'
            }`} />
            <input
              type="text"
              placeholder="Search saved projects by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-colors ${
              isDarkMode
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              <Upload className="h-3.5 w-3.5 text-slate-400" />
              <span>Import File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[50vh]">
          {filteredProjects.length === 0 ? (
            <div className="py-12 text-center">
              <FolderOpen className={`h-10 w-10 mx-auto mb-2 opacity-30 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {searchTerm ? `No projects matching "${searchTerm}"` : 'No saved projects found'}
              </p>
              <button
                onClick={() => setShowNewInput(true)}
                className="mt-3 text-xs font-bold text-indigo-500 hover:underline"
              >
                + Create new project
              </button>
            </div>
          ) : (
            filteredProjects.map((p) => {
              const isActive = p.id === activeProject.id;
              const totalCost = calculateProjectTotal(p);
              const isConfirmingDelete = deleteConfirmId === p.id;

              return (
                <div
                  key={p.id}
                  className={`group relative rounded-xl border p-3.5 transition-all flex items-center justify-between gap-4 ${
                    isActive
                      ? isDarkMode
                        ? 'bg-slate-800/90 border-indigo-500/40 shadow-xs ring-1 ring-indigo-500/20'
                        : 'bg-indigo-50/70 border-indigo-200 shadow-xs'
                      : isDarkMode
                      ? 'bg-slate-850/50 hover:bg-slate-800/80 border-slate-800'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80'
                  }`}
                >
                  {/* Left: Project Info */}
                  <div
                    onClick={() => {
                      onSelectProject(p);
                      onClose();
                    }}
                    className="flex-1 cursor-pointer min-w-0"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-black truncate ${
                        isActive
                          ? isDarkMode ? 'text-indigo-300' : 'text-indigo-900'
                          : isDarkMode ? 'text-slate-100 group-hover:text-indigo-400' : 'text-slate-900 group-hover:text-indigo-600'
                      }`}>
                        {p.name || 'Untitled Project'}
                      </span>
                      {currentUser && (
                        <span
                          className="text-slate-400 dark:text-slate-500 hover:text-indigo-400"
                          title="Synced to your Cloud account (accessible on phone & PC)"
                        >
                          <Cloud className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        </span>
                      )}
                      {isActive && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                          isDarkMode
                            ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/50'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}>
                          <Check className="h-2.5 w-2.5" />
                          Currently Open
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                      <span className={`flex items-center gap-1 font-semibold ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        <Layers className="h-3 w-3 opacity-70" />
                        {p.rooms.length} {p.rooms.length === 1 ? 'Space' : 'Spaces'}
                      </span>

                      <span className="text-slate-300 dark:text-slate-700">&bull;</span>

                      <span className={`font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {formatCurrency(totalCost, p.currency || '₹')}
                      </span>

                      <span className="text-slate-300 dark:text-slate-700">&bull;</span>

                      <span className={`flex items-center gap-1 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        <Clock className="h-3 w-3 opacity-70" />
                        Updated {formatRelativeTime(p.updatedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!isActive && (
                      <button
                        onClick={() => {
                          onSelectProject(p);
                          onClose();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                          isDarkMode
                            ? 'bg-slate-800 hover:bg-slate-700 text-indigo-400'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                        }`}
                        title="Open this file"
                      >
                        <span>Open</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}

                    <button
                      onClick={() => onDuplicateProject(p)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                          : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                      }`}
                      title="Duplicate project"
                    >
                      <Copy className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => exportProjectToXLSX(p)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'hover:bg-slate-800 text-slate-400 hover:text-emerald-400'
                          : 'hover:bg-emerald-50 text-slate-500 hover:text-emerald-700'
                      }`}
                      title="Export as XLSX"
                    >
                      <Download className="h-4 w-4" />
                    </button>

                    {allProjects.length > 1 && (
                      isConfirmingDelete ? (
                        <div className="flex items-center gap-1 bg-rose-500/10 p-1 rounded-lg border border-rose-500/30">
                          <span className="text-[10px] font-bold text-rose-500 px-1">Delete?</span>
                          <button
                            onClick={() => {
                              onDeleteProject(p.id!);
                              setDeleteConfirmId(null);
                            }}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(p.id!)}
                          className={`p-1.5 rounded-lg transition-colors text-slate-400 hover:text-rose-500 ${
                            isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-rose-50'
                          }`}
                          title="Delete project"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className={`p-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          isDarkMode ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-500'
        }`}>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">Auto-save is active: All changes are saved automatically</span>
          </div>

          <div className="flex items-center gap-2">
            <span>{allProjects.length} total saved {allProjects.length === 1 ? 'file' : 'files'}</span>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
