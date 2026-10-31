import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  Settings,
  Calculator,
  Layers,
  Wrench,
  Check,
  FileText,
  X,
  Printer,
  RefreshCw,
  Sliders,
  TrendingUp,
  Package,
  Edit2,
  Info,
  Sun,
  Moon,
  Box,
  ChevronDown,
  FileSpreadsheet,
  Download,
  FolderOpen,
  Folder,
  Smartphone,
  Cloud,
  LogIn,
  LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';

import { RoomData, ProjectData, PriceItemKey } from './types';
import { calculateRoomCost, formatCurrency, getEffectivePrice, getGroupedMaterials } from './utils';
import { PlywoodTab } from './components/PlywoodTab';
import { MdfTab } from './components/MdfTab';
import { CostCalculationSheet } from './components/CostCalculationSheet';
import { ProjectManagerModal } from './components/ProjectManagerModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { FalconLogo } from './components/FalconLogo';
import { exportProjectToXLSX } from './excelExport';
import {
  subscribeToAuth,
  subscribeToUserProjects,
  saveProjectToCloud,
  deleteProjectFromCloud,
  syncLocalProjectsToCloud,
  logout,
} from './cloudSync';
import { testFirestoreConnection } from './firebase';
import {
  loadAllProjects,
  loadActiveProject,
  saveActiveProject,
  createNewProjectInStorage,
  duplicateProjectInStorage,
  deleteProjectFromStorage,
  importProjectFile,
  FALCON_THEME_KEY,
  FALCON_ACTIVE_ID_KEY,
  DEFAULT_ROOM,
} from './storage';

const SQFT_PER_SHEET = 32;

const INITIAL_PROJECT_STATE: ProjectData = {
  name: 'New Project',
  clientName: '',
  currency: '₹',
  globalPrices: {
    plywood: 0,
    mdf: 0,
    colorLaminate: 0,
    acrylicLaminate: 0,
    halfWhiteLaminate: 0,
    louvers: 0,
    hinge: 0,
    telescope: 0,
    handle6Inch: 0,
    handle9Inch: 0,
    plywoodBoxLabor: 0,
    plywoodFrameLabor: 0,
    mdfBoxLabor: 0,
    mdfFrameLabor: 0,
    adhesive: 0,
  },
  rooms: [
    {
      id: 'room-1',
      name: 'Estimation Area 1',
      plywoodBoxSheets: 0,
      plywoodFrameSheets: 0,
      mdfBoxSheets: 0,
      mdfFrameSheets: 0,
      louversPanels: 0,
      plywoodBoxLouversPanels: 0,
      plywoodFrameLouversPanels: 0,
      colorLaminateBoxSheets: 0,
      colorLaminateFrameSheets: 0,
      acrylicLaminateBoxSheets: 0,
      acrylicLaminateFrameSheets: 0,
      halfWhiteLaminateBoxSheets: 0,
      halfWhiteLaminateFrameSheets: 0,
      hingeQty: 0,
      plywoodBoxHingeQty: 0,
      plywoodFrameHingeQty: 0,
      mdfBoxHingeQty: 0,
      mdfFrameHingeQty: 0,
      telescopeQty: 0,
      plywoodBoxTelescopeQty: 0,
      mdfBoxTelescopeQty: 0,
      handle6Qty: 0,
      plywoodBoxHandle6Qty: 0,
      plywoodFrameHandle6Qty: 0,
      mdfBoxHandle6Qty: 0,
      mdfFrameHandle6Qty: 0,
      handle9Qty: 0,
      plywoodBoxHandle9Qty: 0,
      plywoodFrameHandle9Qty: 0,
      mdfBoxHandle9Qty: 0,
      mdfFrameHandle9Qty: 0,
      plywoodBoxCFT: 0,
      plywoodFrameSqFt: 0,
      mdfBoxCFT: 0,
      mdfFrameSqFt: 0,
      adhesiveQty: 0,
      mdfAdhesiveQty: 0,
      priceOverrides: {
        plywood: undefined,
        mdf: undefined,
        colorLaminate: undefined,
        acrylicLaminate: undefined,
        halfWhiteLaminate: undefined,
        louvers: undefined,
        hinge: undefined,
        telescope: undefined,
        handle6Inch: undefined,
        handle9Inch: undefined,
        plywoodBoxLabor: undefined,
        plywoodFrameLabor: undefined,
        mdfBoxLabor: undefined,
        mdfFrameLabor: undefined,
        adhesive: undefined,
      },
    }
  ],
};

const NEW_ROOM_DEFAULT = (index: number): RoomData => ({
  id: `room-${Date.now()}-${index}`,
  name: `Estimation Area ${index + 1}`,
  plywoodBoxSheets: 0,
  plywoodFrameSheets: 0,
  mdfBoxSheets: 0,
  mdfFrameSheets: 0,
  louversPanels: 0,
  plywoodBoxLouversPanels: 0,
  plywoodFrameLouversPanels: 0,
  colorLaminateBoxSheets: 0,
  colorLaminateFrameSheets: 0,
  acrylicLaminateBoxSheets: 0,
  acrylicLaminateFrameSheets: 0,
  halfWhiteLaminateBoxSheets: 0,
  halfWhiteLaminateFrameSheets: 0,
  hingeQty: 0,
  plywoodBoxHingeQty: 0,
  plywoodFrameHingeQty: 0,
  mdfBoxHingeQty: 0,
  mdfFrameHingeQty: 0,
  telescopeQty: 0,
  plywoodBoxTelescopeQty: 0,
  mdfBoxTelescopeQty: 0,
  handle6Qty: 0,
  plywoodBoxHandle6Qty: 0,
  plywoodFrameHandle6Qty: 0,
  mdfBoxHandle6Qty: 0,
  mdfFrameHandle6Qty: 0,
  handle9Qty: 0,
  plywoodBoxHandle9Qty: 0,
  plywoodFrameHandle9Qty: 0,
  mdfBoxHandle9Qty: 0,
  mdfFrameHandle9Qty: 0,
  plywoodBoxCFT: 0,
  plywoodFrameSqFt: 0,
  mdfBoxCFT: 0,
  mdfFrameSqFt: 0,
  adhesiveQty: 0,
  mdfAdhesiveQty: 0,
  priceOverrides: {
    plywood: undefined,
    mdf: undefined,
    colorLaminate: undefined,
    acrylicLaminate: undefined,
    halfWhiteLaminate: undefined,
    louvers: undefined,
    hinge: undefined,
    telescope: undefined,
    handle6Inch: undefined,
    handle9Inch: undefined,
    plywoodBoxLabor: undefined,
    plywoodFrameLabor: undefined,
    mdfBoxLabor: undefined,
    mdfFrameLabor: undefined,
    adhesive: undefined,
  },
});

export default function App() {
  const [allProjects, setAllProjects] = useState<ProjectData[]>(() => loadAllProjects());
  const [project, setProject] = useState<ProjectData>(() => {
    const { project: active } = loadActiveProject();
    return active;
  });
  const [selectedRoomId, setSelectedRoomId] = useState<string>(() => {
    const { project: active } = loadActiveProject();
    return active.rooms[0]?.id || '';
  });
  const [activeTab, setActiveTab] = useState<'details' | 'overrides' | 'breakdown'>('details');
  const [activeDetailsTab, setActiveDetailsTab] = useState<'plywood' | 'mdf'>('plywood');
  const [summaryTab, setSummaryTab] = useState<'quantities' | 'derivedRates'>('quantities');
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [showProjectsModal, setShowProjectsModal] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [tempRoomName, setTempRoomName] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem(FALCON_THEME_KEY) === 'dark';
  });
  const [showSaveAsDropdown, setShowSaveAsDropdown] = useState<boolean>(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Cloud Sync & Multi-Device State (Phone & Computer)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'local-only'>('local-only');
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // Test Firestore connection on boot and listen to Auth state changes
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
      if (user) {
        setCloudSyncStatus('syncing');
        // Initial sync of existing local projects to user's cloud account
        const currentProjects = loadAllProjects();
        syncLocalProjectsToCloud(user.uid, currentProjects).then(() => {
          setCloudSyncStatus('synced');
        });
      } else {
        setCloudSyncStatus('local-only');
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to live updates from cloud across devices (computer <-> phone)
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToUserProjects(
      currentUser.uid,
      (cloudProjects) => {
        if (cloudProjects.length > 0) {
          setAllProjects(cloudProjects);
          // Keep active project matched
          setProject((prev) => {
            const found = cloudProjects.find((p) => p.id === prev.id);
            return found || cloudProjects[0];
          });
          setCloudSyncStatus('synced');
        }
      },
      (err) => {
        console.warn('Real-time sync error:', err);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Capture beforeinstallprompt for Android PWA / APK installation
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      setInstallPrompt(null);
    }
  };

  // Sync theme to localStorage and HTML root
  useEffect(() => {
    localStorage.setItem(FALCON_THEME_KEY, isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Keep selected room valid
  useEffect(() => {
    if (project.rooms.length > 0 && !project.rooms.some((r) => r.id === selectedRoomId)) {
      setSelectedRoomId(project.rooms[0].id);
    }
  }, [project.rooms, selectedRoomId]);

  // Auto-save project whenever any project detail changes
  useEffect(() => {
    setSaveStatus('saving');
    if (currentUser) setCloudSyncStatus('syncing');

    const timer = setTimeout(() => {
      const updatedList = saveActiveProject(project);
      setAllProjects(updatedList);
      setSaveStatus('saved');
      setLastSavedTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );

      // Save to cloud in real time if user is logged in
      if (currentUser && currentUser.uid) {
        saveProjectToCloud(currentUser.uid, project)
          .then(() => setCloudSyncStatus('synced'))
          .catch((err) => {
            console.error('Failed to sync to cloud:', err);
            setCloudSyncStatus('offline');
          });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [project, currentUser]);

  // Flush save on window unload/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveActiveProject(project);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [project]);

  const handleSelectProject = (selected: ProjectData) => {
    saveActiveProject(project);
    setProject(selected);
    setSelectedRoomId(selected.rooms[0]?.id || '');
    localStorage.setItem(FALCON_ACTIVE_ID_KEY, selected.id!);
    setSaveStatus('saved');
    setLastSavedTime('Just now');
  };

  const handleCreateProject = (name: string) => {
    saveActiveProject(project);
    const { newProject, allProjects: updated } = createNewProjectInStorage(name);
    setAllProjects(updated);
    setProject(newProject);
    setSelectedRoomId(newProject.rooms[0]?.id || '');
    setSaveStatus('saved');
    setLastSavedTime('Just now');
    if (currentUser) {
      saveProjectToCloud(currentUser.uid, newProject);
    }
  };

  const handleDuplicateProject = (source: ProjectData) => {
    saveActiveProject(project);
    const { duplicatedProject, allProjects: updated } = duplicateProjectInStorage(source);
    setAllProjects(updated);
    setProject(duplicatedProject);
    setSelectedRoomId(duplicatedProject.rooms[0]?.id || '');
    setSaveStatus('saved');
    setLastSavedTime('Just now');
    if (currentUser) {
      saveProjectToCloud(currentUser.uid, duplicatedProject);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    const { nextProject, allProjects: updated } = deleteProjectFromStorage(projectId);
    setAllProjects(updated);
    if (project.id === projectId) {
      setProject(nextProject);
      setSelectedRoomId(nextProject.rooms[0]?.id || '');
    }
    if (currentUser) {
      deleteProjectFromCloud(currentUser.uid, projectId);
    }
  };

  const handleImportProject = async (file: File) => {
    try {
      const imported = await importProjectFile(file);
      const all = loadAllProjects();
      setAllProjects(all);
      setProject(imported);
      setSelectedRoomId(imported.rooms[0]?.id || '');
      if (currentUser) {
        saveProjectToCloud(currentUser.uid, imported);
      }
    } catch {
      alert('Could not import file. Please select a valid Falcon JSON backup.');
    }
  };

  const activeRoom = useMemo(() => {
    return project.rooms.find((r) => r.id === selectedRoomId) || project.rooms[0];
  }, [project.rooms, selectedRoomId]);

  const roomCalculations = useMemo(() => {
    return project.rooms.map((room) => ({
      room,
      costs: calculateRoomCost(room, project.globalPrices),
    }));
  }, [project.rooms, project.globalPrices]);

  const totals = useMemo(() => {
    return roomCalculations.reduce(
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

        const colorBox = curr.room.colorLaminateBoxSheets !== undefined ? curr.room.colorLaminateBoxSheets : (curr.room.colorLaminateSheets || 0);
        const colorFrame = curr.room.colorLaminateFrameSheets !== undefined ? curr.room.colorLaminateFrameSheets : 0;
        acc.colorLaminateSheets += colorBox + colorFrame;

        const acrylicBox = curr.room.acrylicLaminateBoxSheets !== undefined ? curr.room.acrylicLaminateBoxSheets : (curr.room.acrylicLaminateSheets || 0);
        const acrylicFrame = curr.room.acrylicLaminateFrameSheets !== undefined ? curr.room.acrylicLaminateFrameSheets : 0;
        acc.acrylicLaminateSheets += acrylicBox + acrylicFrame;

        const hwBox = curr.room.halfWhiteLaminateBoxSheets !== undefined ? curr.room.halfWhiteLaminateBoxSheets : (curr.room.halfWhiteLaminateSheets || 0);
        const hwFrame = curr.room.halfWhiteLaminateFrameSheets !== undefined ? curr.room.halfWhiteLaminateFrameSheets : 0;
        acc.halfWhiteLaminateSheets += hwBox + hwFrame;

        const pBoxLouv = curr.room.plywoodBoxLouversPanels !== undefined ? curr.room.plywoodBoxLouversPanels : 0;
        const pFrameLouv = curr.room.plywoodFrameLouversPanels !== undefined ? curr.room.plywoodFrameLouversPanels : 0;
        const calculatedLouvers = curr.room.plywoodBoxLouversPanels !== undefined
          ? (pBoxLouv + pFrameLouv)
          : (curr.room.louversPanels || 0);
        acc.louversPanels += calculatedLouvers;

        const pBoxH = curr.room.plywoodBoxHingeQty !== undefined ? curr.room.plywoodBoxHingeQty : 0;
        const pFrameH = curr.room.plywoodFrameHingeQty !== undefined ? curr.room.plywoodFrameHingeQty : 0;
        const mBoxH = curr.room.mdfBoxHingeQty !== undefined ? curr.room.mdfBoxHingeQty : 0;
        const mFrameH = curr.room.mdfFrameHingeQty !== undefined ? curr.room.mdfFrameHingeQty : 0;

        const calculatedHinges = curr.room.plywoodBoxHingeQty !== undefined
          ? (pBoxH + pFrameH + mBoxH + mFrameH)
          : (curr.room.hingeQty || 0);

        const pBoxTel = curr.room.plywoodBoxTelescopeQty !== undefined ? curr.room.plywoodBoxTelescopeQty : 0;
        const mBoxTel = curr.room.mdfBoxTelescopeQty !== undefined ? curr.room.mdfBoxTelescopeQty : 0;
        const calculatedTelescopes = curr.room.plywoodBoxTelescopeQty !== undefined
          ? (pBoxTel + mBoxTel)
          : (curr.room.telescopeQty || 0);

        const pBoxH6 = curr.room.plywoodBoxHandle6Qty !== undefined ? curr.room.plywoodBoxHandle6Qty : 0;
        const pFrameH6 = curr.room.plywoodFrameHandle6Qty !== undefined ? curr.room.plywoodFrameHandle6Qty : 0;
        const mBoxH6 = curr.room.mdfBoxHandle6Qty !== undefined ? curr.room.mdfBoxHandle6Qty : 0;
        const mFrameH6 = curr.room.mdfFrameHandle6Qty !== undefined ? curr.room.mdfFrameHandle6Qty : 0;
        const calculatedH6 = curr.room.plywoodBoxHandle6Qty !== undefined
          ? (pBoxH6 + pFrameH6 + mBoxH6 + mFrameH6)
          : (curr.room.handle6Qty || 0);

        const pBoxH9 = curr.room.plywoodBoxHandle9Qty !== undefined ? curr.room.plywoodBoxHandle9Qty : 0;
        const pFrameH9 = curr.room.plywoodFrameHandle9Qty !== undefined ? curr.room.plywoodFrameHandle9Qty : 0;
        const mBoxH9 = curr.room.mdfBoxHandle9Qty !== undefined ? curr.room.mdfBoxHandle9Qty : 0;
        const mFrameH9 = curr.room.mdfFrameHandle9Qty !== undefined ? curr.room.mdfFrameHandle9Qty : 0;
        const calculatedH9 = curr.room.plywoodBoxHandle9Qty !== undefined
          ? (pBoxH9 + pFrameH9 + mBoxH9 + mFrameH9)
          : (curr.room.handle9Qty || 0);

        acc.hingeQty += calculatedHinges;
        acc.telescopeQty += calculatedTelescopes;
        acc.handle6Qty += calculatedH6;
        acc.handle9Qty += calculatedH9;

        acc.plywoodBoxCFT += curr.room.plywoodBoxCFT || 0;
        acc.plywoodFrameSqFt += curr.room.plywoodFrameSqFt || 0;
        acc.mdfBoxCFT += curr.room.mdfBoxCFT || 0;
        acc.mdfFrameSqFt += curr.room.mdfFrameSqFt || 0;
        acc.adhesiveQty += curr.costs.totalAdhesiveQty;

        acc.plywoodBoxTotalValue += curr.costs.plywoodBoxTotalValue || 0;
        acc.plywoodFrameTotalValue += curr.costs.plywoodFrameTotalValue || 0;
        acc.mdfBoxTotalValue += curr.costs.mdfBoxTotalValue || 0;
        acc.mdfFrameTotalValue += curr.costs.mdfFrameTotalValue || 0;

        acc.plywoodBoxBoardCost += curr.costs.plywoodBoxBoardCost || 0;
        acc.plywoodFrameBoardCost += curr.costs.plywoodFrameBoardCost || 0;
        acc.mdfBoxBoardCost += curr.costs.mdfBoxBoardCost || 0;
        acc.mdfFrameBoardCost += curr.costs.mdfFrameBoardCost || 0;

        acc.colorLaminateBoxCost += curr.costs.colorLaminateBoxCost || 0;
        acc.colorLaminateFrameCost += curr.costs.colorLaminateFrameCost || 0;
        acc.acrylicLaminateBoxCost += curr.costs.acrylicLaminateBoxCost || 0;
        acc.acrylicLaminateFrameCost += curr.costs.acrylicLaminateFrameCost || 0;
        acc.halfWhiteLaminateBoxCost += curr.costs.halfWhiteLaminateBoxCost || 0;
        acc.halfWhiteLaminateFrameCost += curr.costs.halfWhiteLaminateFrameCost || 0;

        acc.pBoxLouversCost += curr.costs.pBoxLouversCost || 0;
        acc.pFrameLouversCost += curr.costs.pFrameLouversCost || 0;

        acc.pBoxHingeCost += curr.costs.pBoxHingeCost || 0;
        acc.pFrameHingeCost += curr.costs.pFrameHingeCost || 0;
        acc.mBoxHingeCost += curr.costs.mBoxHingeCost || 0;
        acc.mFrameHingeCost += curr.costs.mFrameHingeCost || 0;

        acc.pBoxTelescopeCost += curr.costs.pBoxTelescopeCost || 0;
        acc.mBoxTelescopeCost += curr.costs.mBoxTelescopeCost || 0;

        acc.pBoxHandle6Cost += curr.costs.pBoxHandle6Cost || 0;
        acc.pFrameHandle6Cost += curr.costs.pFrameHandle6Cost || 0;
        acc.mBoxHandle6Cost += curr.costs.mBoxHandle6Cost || 0;
        acc.mFrameHandle6Cost += curr.costs.mFrameHandle6Cost || 0;

        acc.pBoxHandle9Cost += curr.costs.pBoxHandle9Cost || 0;
        acc.pFrameHandle9Cost += curr.costs.pFrameHandle9Cost || 0;
        acc.mBoxHandle9Cost += curr.costs.mBoxHandle9Cost || 0;
        acc.mFrameHandle9Cost += curr.costs.mFrameHandle9Cost || 0;

        acc.pBoxAdhesiveCost += curr.costs.pBoxAdhesiveCost || 0;
        acc.pFrameAdhesiveCost += curr.costs.pFrameAdhesiveCost || 0;
        acc.mdfBoxAdhesiveCost += curr.costs.mdfBoxAdhesiveCost || 0;
        acc.mdfFrameAdhesiveCost += curr.costs.mdfFrameAdhesiveCost || 0;

        acc.plywoodBoxLaborCost += curr.costs.plywoodBoxLaborCost || 0;
        acc.plywoodFrameLaborCost += curr.costs.plywoodFrameLaborCost || 0;
        acc.mdfBoxLaborCost += curr.costs.mdfBoxLaborCost || 0;
        acc.mdfFrameLaborCost += curr.costs.mdfFrameLaborCost || 0;

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
        plywoodBoxSheets: 0,
        plywoodFrameSheets: 0,
        plywoodSheets: 0,
        mdfBoxSheets: 0,
        mdfFrameSheets: 0,
        mdfSheets: 0,
        colorLaminateSheets: 0,
        acrylicLaminateSheets: 0,
        halfWhiteLaminateSheets: 0,
        louversPanels: 0,
        hingeQty: 0,
        telescopeQty: 0,
        handle6Qty: 0,
        handle9Qty: 0,
        plywoodBoxCFT: 0,
        plywoodFrameSqFt: 0,
        mdfBoxCFT: 0,
        mdfFrameSqFt: 0,
        adhesiveQty: 0,
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
  }, [roomCalculations]);

  const handleUpdateGlobalPrice = (key: PriceItemKey, val: number) => {
    setProject((prev) => ({
      ...prev,
      globalPrices: { ...prev.globalPrices, [key]: val >= 0 ? val : 0 },
    }));
  };

  const handleUpdateRoom = (roomId: string, updates: Partial<RoomData>) => {
    setProject((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) => (r.id === roomId ? { ...r, ...updates } : r)),
    }));
  };

  const handleUpdateOverride = (roomId: string, itemKey: PriceItemKey, val: number | undefined) => {
    setProject((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            priceOverrides: { ...r.priceOverrides, [itemKey]: val },
          };
        }
        return r;
      }),
    }));
  };

  const handleResetOverrides = (roomId: string) => {
    setProject((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            priceOverrides: {
              plywood: undefined,
              mdf: undefined,
              colorLaminate: undefined,
              acrylicLaminate: undefined,
              halfWhiteLaminate: undefined,
              louvers: undefined,
              hinge: undefined,
              telescope: undefined,
              handle6Inch: undefined,
              handle9Inch: undefined,
              plywoodBoxLabor: undefined,
              plywoodFrameLabor: undefined,
              mdfBoxLabor: undefined,
              mdfFrameLabor: undefined,
              adhesive: undefined,
            },
          };
        }
        return r;
      }),
    }));
  };

  const handleAddRoom = () => {
    const nextIndex = project.rooms.length;
    const newRoom = NEW_ROOM_DEFAULT(nextIndex);
    setProject((prev) => ({ ...prev, rooms: [...prev.rooms, newRoom] }));
    setSelectedRoomId(newRoom.id);
    setEditingRoomId(newRoom.id);
    setTempRoomName(newRoom.name);
  };

  const handleDuplicateRoom = (room: RoomData) => {
    const duplicated: RoomData = {
      ...room,
      id: `room-${Date.now()}`,
      name: `${room.name} (Copy)`,
      priceOverrides: { ...room.priceOverrides },
    };
    setProject((prev) => ({ ...prev, rooms: [...prev.rooms, duplicated] }));
    setSelectedRoomId(duplicated.id);
  };

  const handleDeleteRoom = (roomId: string) => {
    if (project.rooms.length <= 1) {
      alert("At least one estimation space is required.");
      return;
    }
    const filtered = project.rooms.filter((r) => r.id !== roomId);
    setProject((prev) => ({ ...prev, rooms: filtered }));
    if (selectedRoomId === roomId) {
      setSelectedRoomId(filtered[0].id);
    }
  };

  const startRenameRoom = (roomId: string, currentName: string) => {
    setEditingRoomId(roomId);
    setTempRoomName(currentName);
  };

  const saveRenameRoom = (roomId: string) => {
    if (tempRoomName.trim()) {
      handleUpdateRoom(roomId, { name: tempRoomName.trim() });
    }
    setEditingRoomId(null);
  };

  const filteredRooms = useMemo(() => {
    return project.rooms.filter((r) => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [project.rooms, searchTerm]);

  const chartData = useMemo(() => {
    return roomCalculations.map((item) => ({
      name: item.room.name,
      Materials: Math.round(item.costs.totalMaterials),
      Hardware: Math.round(item.costs.totalHardware),
      Labor: Math.round(item.costs.totalLabor),
    }));
  }, [roomCalculations]);

  const pieData = useMemo(() => {
    return [
      { name: 'Materials', value: Math.round(totals.materials), color: '#3b82f6' },
      { name: 'Hardware', value: Math.round(totals.hardware), color: '#f59e0b' },
      { name: 'Labor', value: Math.round(totals.labor), color: '#10b981' },
    ];
  }, [totals]);

  const groupedMaterials = useMemo(() => {
    return getGroupedMaterials(project.rooms, project.globalPrices);
  }, [project.rooms, project.globalPrices]);

  const handleExportSpreadsheet = () => {
    exportProjectToXLSX(project);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 w-full max-w-full overflow-x-hidden ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`} id="calculator-root">
      {/* Header Bar */}
      <header className={`border-b sticky top-0 z-45 px-3.5 sm:px-4 py-3 sm:py-3.5 shadow-xs transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`} id="header-nav">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="shrink-0 drop-shadow-md transition-transform hover:scale-105 duration-200">
              <FalconLogo className="h-8 w-8 sm:h-9 sm:w-9 rounded-2xl" isDarkMode={isDarkMode} />
            </div>
            <div className="min-w-0">
              <h1 className={`text-sm sm:text-lg font-bold tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Falcon Cost Calculator</h1>
              <p className={`hidden sm:block text-xs font-semibold truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Separate Plywood/MDF Carcass &amp; Shutter cost analyzer</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0 ml-auto">
            <button
              onClick={() => setShowConfigModal(true)}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-bold border flex items-center gap-1.5 shadow-xs transition-colors shrink-0 ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-755 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              id="btn-settings"
            >
              <Settings className={`h-4 w-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
              <span>Standard Rates</span>
            </button>

            {installPrompt && (
              <button
                onClick={handleInstallApp}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                title="Install Falcon Cost Calculator on your device"
                id="btn-install-app"
              >
                <Smartphone className="h-4 w-4" />
                <span>Install App</span>
              </button>
            )}

            {/* Round Logo / Google Profile Image Button with Dropdown at the right extreme */}
            <div className="relative shrink-0 ml-1" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu((prev) => !prev)}
                className={`relative h-9 w-9 rounded-full border shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center shrink-0 overflow-hidden focus:outline-none ${
                  currentUser
                    ? isDarkMode
                      ? 'border-indigo-500/60 bg-slate-800 ring-2 ring-indigo-500/30'
                      : 'border-indigo-400 bg-white ring-2 ring-indigo-400/30'
                    : isDarkMode
                      ? 'border-slate-700 bg-slate-800 hover:border-slate-500 text-slate-200'
                      : 'border-slate-300 bg-slate-100 hover:border-slate-400 text-slate-700'
                }`}
                title={
                  currentUser
                    ? `Account: ${currentUser.displayName || currentUser.email || 'User'}`
                    : 'Account menu'
                }
                id="btn-profile-round"
                aria-expanded={showUserMenu}
              >
                {currentUser ? (
                  currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Profile'}
                      className="h-full w-full object-cover rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-full w-full rounded-full bg-[#134d9c] text-white flex items-center justify-center font-bold text-xs uppercase">
                      {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                    </div>
                  )
                ) : (
                  <span className="font-bold text-xs tracking-wider select-none">
                    FC
                  </span>
                )}
                {currentUser && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div
                  className={`absolute right-0 mt-2 w-72 rounded-2xl border shadow-xl py-2 z-50 transition-all duration-150 animate-in fade-in zoom-in-95 ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-750 text-slate-100 shadow-black/50'
                      : 'bg-white border-slate-200 text-slate-800 shadow-slate-200/90'
                  }`}
                >
                  {currentUser ? (
                    // Signed In View
                    <>
                      {/* Account Details: profile picture, account name, and id */}
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {currentUser.photoURL ? (
                            <img
                              src={currentUser.photoURL}
                              alt={currentUser.displayName || 'Profile'}
                              className="h-10 w-10 object-cover rounded-full border border-indigo-400/50 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-[#134d9c] text-white flex items-center justify-center font-bold text-sm uppercase shrink-0">
                              {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                              {currentUser.displayName || 'Google Account'}
                            </p>
                            <p className={`text-[10px] truncate font-mono mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} title={currentUser.uid}>
                              ID: {currentUser.uid}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className={`my-1 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`} />

                      {/* Light or Dark Mode Switch */}
                      <div className="px-2 py-1">
                        <button
                          type="button"
                          onClick={() => {
                            const next = !isDarkMode;
                            setIsDarkMode(next);
                            localStorage.setItem(FALCON_THEME_KEY, next ? 'dark' : 'light');
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                            isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {isDarkMode ? (
                              <Moon className="h-4 w-4 text-indigo-400" />
                            ) : (
                              <Sun className="h-4 w-4 text-amber-500" />
                            )}
                            <span>Theme</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              {isDarkMode ? 'Dark' : 'Light'}
                            </span>
                            <div
                              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                                isDarkMode ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                              }`}
                            >
                              <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                            </div>
                          </div>
                        </button>
                      </div>

                      {/* Export Button */}
                      <div className="px-2 py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            handleExportSpreadsheet();
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                            isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                            <span>Export as XLSX</span>
                          </div>
                          <Download className={`h-3.5 w-3.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                        </button>
                      </div>

                      <div className={`my-1 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`} />

                      {/* Sign Out Button */}
                      <div className="px-2 pt-1 pb-1">
                        <button
                          type="button"
                          onClick={async () => {
                            setShowUserMenu(false);
                            try {
                              await logout();
                            } catch (err) {
                              console.error('Logout error:', err);
                            }
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 transition-colors ${
                            isDarkMode ? 'hover:bg-rose-500/10' : 'hover:bg-rose-50'
                          }`}
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    // Signed Out View
                    <>
                      {/* Sign In Button (opens popup window) */}
                      <div className="px-2 pt-1 pb-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            setIsCloudModalOpen(true);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#134d9c] hover:bg-[#0f3e7c] text-white text-xs font-bold transition-colors shadow-xs"
                          id="dropdown-btn-signin"
                        >
                          <LogIn className="h-4 w-4" />
                          <span>Sign In</span>
                        </button>
                      </div>

                      <div className={`my-1 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`} />

                      {/* Light or Dark Mode Switch */}
                      <div className="px-2 py-1">
                        <button
                          type="button"
                          onClick={() => {
                            const next = !isDarkMode;
                            setIsDarkMode(next);
                            localStorage.setItem(FALCON_THEME_KEY, next ? 'dark' : 'light');
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                            isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {isDarkMode ? (
                              <Moon className="h-4 w-4 text-indigo-400" />
                            ) : (
                              <Sun className="h-4 w-4 text-amber-500" />
                            )}
                            <span>Theme</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              {isDarkMode ? 'Dark' : 'Light'}
                            </span>
                            <div
                              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                                isDarkMode ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                              }`}
                            >
                              <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                            </div>
                          </div>
                        </button>
                      </div>

                      {/* Export Button */}
                      <div className="px-2 py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            handleExportSpreadsheet();
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                            isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                            <span>Export as XLSX</span>
                          </div>
                          <Download className={`h-3.5 w-3.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6" id="main-content">
        
        {/* Project Meta Information Banner */}
        <section className={`rounded-2xl border p-5 shadow-xs transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`} id="project-meta-section">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="space-y-1.5 md:col-span-2">
              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Project File Name
                </label>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="relative w-full sm:w-64 md:w-72 lg:w-80 shrink-0">
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) => setProject({ ...project, name: e.target.value })}
                    placeholder="e.g. Project Name"
                    className={`w-full border rounded-lg px-3 py-1.5 text-xs font-bold transition-all focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:bg-slate-850' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'}`}
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowProjectsModal(true)}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs ${
                      isDarkMode
                        ? 'bg-slate-800 hover:bg-slate-700 text-indigo-400 border-slate-700'
                        : 'bg-white hover:bg-slate-50 text-indigo-600 border-slate-300'
                    }`}
                    title="Open saved project files library"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    <span>Files ({allProjects.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateProject(`Project ${allProjects.length + 1}`)}
                    className="flex-1 sm:flex-none bg-[#134d9c] hover:bg-[#0f3e7c] text-white px-7 py-1.5 min-w-[95px] rounded-lg text-xs font-bold flex items-center justify-center transition-colors shrink-0 shadow-xs"
                    title="Create new project file"
                  >
                    <span>New</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className={`text-[10px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Currency</label>
              <div className={`flex gap-1 border rounded-lg p-1 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                {['₹', '$', '€', 'AED'].map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setProject({ ...project, currency: curr })}
                    className={`flex-1 text-center py-1 rounded text-[10px] font-extrabold transition-all ${
                      project.currency === curr
                        ? (isDarkMode ? 'bg-slate-700 text-indigo-400 border border-slate-600/50' : 'bg-white text-indigo-700 shadow-xs border border-slate-200/50')
                        : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>
            <div className={`border rounded-xl p-4 flex flex-col justify-center items-end text-right h-full ${isDarkMode ? 'bg-slate-850/80 border-slate-750' : 'bg-indigo-50/70 border-indigo-100'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Estimated Project Total</span>
              <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-indigo-950'}`}>
                {formatCurrency(totals.grandTotal, project.currency)}
              </span>
            </div>
          </div>
        </section>

        {/* Aggregate Volume Indicators */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-dashboard">
          <div className={`border rounded-2xl p-4 shadow-xs flex flex-col justify-between transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div>
              <span className={`text-[10px] font-bold block uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Materials Cost</span>
              <span className={`text-xl font-extrabold block mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(totals.materials, project.currency)}</span>
            </div>
            <span className={`text-[10px] font-semibold mt-2.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{Math.round((totals.materials / (totals.grandTotal || 1)) * 100)}% of project</span>
          </div>

          <div className={`border rounded-2xl p-4 shadow-xs flex flex-col justify-between transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div>
              <span className={`text-[10px] font-bold block uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Hardware fittings</span>
              <span className={`text-xl font-extrabold block mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(totals.hardware, project.currency)}</span>
            </div>
            <span className={`text-[10px] font-semibold mt-2.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{Math.round((totals.hardware / (totals.grandTotal || 1)) * 100)}% of project</span>
          </div>

          <div className={`border rounded-2xl p-4 shadow-xs flex flex-col justify-between transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div>
              <span className={`text-[10px] font-bold block uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Labor cost</span>
              <span className={`text-xl font-extrabold block mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(totals.labor, project.currency)}</span>
            </div>
            <span className={`text-[10px] font-semibold mt-2.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{Math.round((totals.labor / (totals.grandTotal || 1)) * 100)}% of project</span>
          </div>

          <div className={`border rounded-2xl p-4 shadow-xs flex flex-col justify-between transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div>
              <span className={`text-[10px] font-bold block uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Sheet Count</span>
              <span className={`text-sm font-bold block mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Plywood: {totals.plywoodSheets} | MDF: {totals.mdfSheets} sheets
              </span>
            </div>
            <span className={`text-[10px] font-semibold mt-2.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Total area: {(totals.plywoodSheets + totals.mdfSheets) * SQFT_PER_SHEET} sq.ft
            </span>
          </div>
        </section>

        {/* Workspace Splitted Column Design */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="workspace-layout">
          
          {/* Sidebar list of Rooms */}
          <aside className={`lg:col-span-4 rounded-2xl border p-4 space-y-4 flex flex-col h-[650px] transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <Layers className="h-4 w-4 text-indigo-500" />
                Spaces list ({project.rooms.length})
              </h3>
              <button
                onClick={handleAddRoom}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-0.5 border ${
                  isDarkMode
                    ? 'bg-indigo-950 hover:bg-indigo-900 text-indigo-400 border-indigo-900/60'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-100'
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add space</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search spaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full border rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold focus:outline-none focus:border-indigo-500 ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className={`absolute right-2.5 top-2.5 ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredRooms.map((room) => {
                const roomBreakdown = calculateRoomCost(room, project.globalPrices);
                const isSelected = room.id === selectedRoomId;
                const isRenaming = editingRoomId === room.id;

                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`group relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col ${
                      isSelected
                        ? (isDarkMode ? 'bg-slate-800/90 border-indigo-500/40 ring-1 ring-indigo-500/20' : 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-600/5')
                        : (isDarkMode ? 'bg-slate-850 hover:bg-slate-800 border-slate-800' : 'bg-white hover:bg-slate-50 border-slate-200')
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        {isRenaming ? (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={tempRoomName}
                              onChange={(e) => setTempRoomName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveRenameRoom(room.id);
                              }}
                              className={`border rounded px-1.5 py-0.5 text-xs font-bold w-full ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
                              autoFocus
                            />
                            <button
                              onClick={() => saveRenameRoom(room.id)}
                              className="bg-indigo-600 text-white p-1 rounded hover:bg-indigo-700"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{room.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startRenameRoom(room.id, room.name);
                              }}
                              className="text-slate-400 hover:text-indigo-400 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity animate-in"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1">
                          {((room.plywoodBoxSheets || 0) + (room.plywoodFrameSheets || 0)) > 0 && (
                            <span className={`text-[9px] border rounded px-1.5 py-0.5 font-semibold ${isDarkMode ? 'text-blue-400 bg-blue-950/40 border-blue-900/50' : 'text-blue-700 bg-blue-50 border-blue-100'}`}>
                              Plywood
                            </span>
                          )}
                          {((room.mdfBoxSheets || 0) + (room.mdfFrameSheets || 0)) > 0 && (
                            <span className={`text-[9px] border rounded px-1.5 py-0.5 font-semibold ${isDarkMode ? 'text-blue-400 bg-blue-950/40 border-blue-900/50' : 'text-blue-700 bg-blue-50 border-blue-100'}`}>
                              MDF
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-xs font-extrabold block ${isDarkMode ? 'text-indigo-400' : 'text-slate-900'}`}>
                          {formatCurrency(roomBreakdown.totalRoomCost, project.currency)}
                        </span>
                      </div>
                    </div>

                    <div className={`flex items-center justify-between border-t mt-2 pt-2 text-[9px] font-semibold ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200/50 text-slate-500'}`}>
                      <div>
                        <span>Ply: {room.plywoodBoxSheets + room.plywoodFrameSheets} | MDF: {room.mdfBoxSheets + room.mdfFrameSheets} sht</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateRoom(room);
                          }}
                          className={`p-1 rounded transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-indigo-950 text-indigo-400' : 'bg-slate-100 hover:bg-indigo-100/50'}`}
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoom(room.id);
                          }}
                          className={`p-1 rounded transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-red-950 text-red-400' : 'bg-slate-100 hover:bg-red-100/50'}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={`border p-3 rounded-xl ${isDarkMode ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                <Info className="h-3.5 w-3.5" /> Workspace Rule Note
              </span>
              <p className={`text-[9px] leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-505'}`}>
                Plywood/MDF boxes and frames are input in sheets. Labor for Plywood frame & box, and MDF frame & box are calculated separately based on standard rates.
              </p>
            </div>
          </aside>

          {/* Right Panel: Selected Workspace Workspace Cost Estimator */}
          <section className={`lg:col-span-8 rounded-2xl border p-5 shadow-xs flex flex-col h-[650px] transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            {activeRoom ? (
              <div className="space-y-4 flex-1 flex flex-col h-full overflow-hidden">
                
                {/* Header detail */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-150'}`}>
                  <div className="space-y-1">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${isDarkMode ? 'text-slate-300 bg-slate-800 border-slate-750' : 'text-slate-700 bg-slate-100 border-slate-200'}`}>
                      Active Space Estimator
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={activeRoom.name}
                        onChange={(e) => handleUpdateRoom(activeRoom.id, { name: e.target.value })}
                        className={`text-base font-extrabold border-b border-dashed border-transparent hover:border-slate-300 focus:border-[#134d9c] focus:outline-none max-w-sm py-0.5 transition-all ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                        placeholder="Space Name"
                      />
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-xl text-right border ${isDarkMode ? 'bg-slate-850/80 border-slate-750' : 'bg-slate-50 border-slate-200'}`}>
                    <span className={`text-[9px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Space Worksheet Subtotal</span>
                    <span className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {formatCurrency(calculateRoomCost(activeRoom, project.globalPrices).totalRoomCost, project.currency)}
                    </span>
                  </div>
                </div>

                {/* Sub-tabs */}
                <div className={`flex gap-2 border-b pb-1 text-xs shrink-0 overflow-x-auto ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-1.5 px-3 font-bold transition-all border-b-2 ${
                      activeTab === 'details'
                        ? (isDarkMode ? 'border-[#134d9c] text-white' : 'border-[#134d9c] text-[#134d9c]')
                        : (isDarkMode ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-800')
                    }`}
                  >
                    1. Quantities & Fittings
                  </button>
                  <button
                    onClick={() => setActiveTab('overrides')}
                    className={`pb-1.5 px-3 font-bold transition-all border-b-2 ${
                      activeTab === 'overrides'
                        ? (isDarkMode ? 'border-[#134d9c] text-white' : 'border-[#134d9c] text-[#134d9c]')
                        : (isDarkMode ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-800')
                    }`}
                  >
                    2. Specific Pricing Overrides
                  </button>
                  <button
                    onClick={() => setActiveTab('breakdown')}
                    className={`pb-1.5 px-3 font-bold transition-all border-b-2 ${
                      activeTab === 'breakdown'
                        ? (isDarkMode ? 'border-[#134d9c] text-white' : 'border-[#134d9c] text-[#134d9c]')
                        : (isDarkMode ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-800')
                    }`}
                  >
                    3. Cost Calculation Sheet
                  </button>
                </div>

                {/* Tab content scroll area */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                  
                  {activeTab === 'details' && (
                    <div className="space-y-4">
                      {/* Plywood and MDF separated sub-tabs */}
                      <div className={`flex gap-2 p-1 rounded-xl max-w-sm shrink-0 border transition-colors ${
                        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}>
                        <button
                          onClick={() => setActiveDetailsTab('plywood')}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                            activeDetailsTab === 'plywood'
                              ? 'bg-[#134d9c] text-white border-[#134d9c] shadow-xs'
                              : (isDarkMode ? 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 border-transparent')
                          }`}
                        >
                          <span className="h-2 w-2 rounded-full bg-slate-300" />
                          Plywood
                        </button>
                        <button
                          onClick={() => setActiveDetailsTab('mdf')}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                            activeDetailsTab === 'mdf'
                              ? 'bg-[#134d9c] text-white border-[#134d9c] shadow-xs'
                              : (isDarkMode ? 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 border-transparent')
                          }`}
                        >
                          <span className="h-2 w-2 rounded-full bg-slate-300" />
                          MDF
                        </button>
                      </div>

                      {activeDetailsTab === 'plywood' ? (
                        <PlywoodTab
                          activeRoom={activeRoom}
                          handleUpdateRoom={handleUpdateRoom}
                          isDarkMode={isDarkMode}
                          currency={project.currency}
                        />
                      ) : (
                        <MdfTab
                          activeRoom={activeRoom}
                          handleUpdateRoom={handleUpdateRoom}
                          isDarkMode={isDarkMode}
                          currency={project.currency}
                        />
                      )}
                    </div>
                  )}

                  {activeTab === 'overrides' && (
                    <div className="space-y-4">
                      <div className={`p-3 border rounded-xl text-[11px] font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDarkMode ? 'bg-indigo-950/40 border-indigo-900 text-indigo-300' : 'bg-indigo-50 border-indigo-100 text-slate-600'}`}>
                        <span>Enter customized prices for <b>this space only</b> below. Unspecified fields will automatically fall back to the standard global rates.</span>
                        <button
                          onClick={() => handleResetOverrides(activeRoom.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border transition-colors flex items-center justify-center gap-1.5 shadow-xs shrink-0 ${isDarkMode ? 'bg-red-950/60 hover:bg-red-900 text-red-400 border-red-900/60' : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'}`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 16.48M19 15v5h-5" /></svg>
                          Reset to Def
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-4 border rounded-xl space-y-3 ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <h5 className={`text-xs font-bold border-b pb-1 ${isDarkMode ? 'text-slate-200 border-slate-800' : 'text-slate-700 border-slate-200'}`}>Core Board overrides (per sq.ft)</h5>
                          <div className="flex items-center justify-between text-xs">
                            <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Plywood Board Override:</span>
                            <input
                              type="number"
                              placeholder={`Def: ₹${project.globalPrices.plywood}`}
                              value={activeRoom.priceOverrides.plywood || ''}
                              onChange={(e) => handleUpdateOverride(activeRoom.id, 'plywood', e.target.value ? Number(e.target.value) : undefined)}
                              className={`w-24 border rounded text-right px-2 py-0.5 text-xs font-bold ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-250 text-slate-850'}`}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>MDF Board Override:</span>
                            <input
                              type="number"
                              placeholder={`Def: ₹${project.globalPrices.mdf}`}
                              value={activeRoom.priceOverrides.mdf || ''}
                              onChange={(e) => handleUpdateOverride(activeRoom.id, 'mdf', e.target.value ? Number(e.target.value) : undefined)}
                              className={`w-24 border rounded text-right px-2 py-0.5 text-xs font-bold ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-250 text-slate-855'}`}
                            />
                          </div>
                        </div>

                        <div className={`p-4 border rounded-xl space-y-3 ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <h5 className={`text-xs font-bold border-b pb-1 ${isDarkMode ? 'text-slate-200 border-slate-800' : 'text-slate-700 border-slate-200'}`}>Laminate & Louvers overrides</h5>
                          <div className="flex items-center justify-between text-xs">
                            <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Color Laminate (/sht):</span>
                            <input
                              type="number"
                              placeholder={`Def: ₹${project.globalPrices.colorLaminate}`}
                              value={activeRoom.priceOverrides.colorLaminate || ''}
                              onChange={(e) => handleUpdateOverride(activeRoom.id, 'colorLaminate', e.target.value ? Number(e.target.value) : undefined)}
                              className={`w-24 border rounded text-right px-2 py-0.5 text-xs font-bold ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-250 text-slate-855'}`}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Acrylic Laminate (/sht):</span>
                            <input
                              type="number"
                              placeholder={`Def: ₹${project.globalPrices.acrylicLaminate}`}
                              value={activeRoom.priceOverrides.acrylicLaminate || ''}
                              onChange={(e) => handleUpdateOverride(activeRoom.id, 'acrylicLaminate', e.target.value ? Number(e.target.value) : undefined)}
                              className={`w-24 border rounded text-right px-2 py-0.5 text-xs font-bold ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-250 text-slate-855'}`}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Half White Inner (/sht):</span>
                            <input
                              type="number"
                              placeholder={`Def: ₹${project.globalPrices.halfWhiteLaminate}`}
                              value={activeRoom.priceOverrides.halfWhiteLaminate || ''}
                              onChange={(e) => handleUpdateOverride(activeRoom.id, 'halfWhiteLaminate', e.target.value ? Number(e.target.value) : undefined)}
                              className={`w-24 border rounded text-right px-2 py-0.5 text-xs font-bold ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-250 text-slate-855'}`}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Louvers (/panel):</span>
                            <input
                              type="number"
                              placeholder={`Def: ₹${project.globalPrices.louvers}`}
                              value={activeRoom.priceOverrides.louvers || ''}
                              onChange={(e) => handleUpdateOverride(activeRoom.id, 'louvers', e.target.value ? Number(e.target.value) : undefined)}
                              className={`w-24 border rounded text-right px-2 py-0.5 text-xs font-bold ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-250 text-slate-855'}`}
                            />
                          </div>
                        </div>

                        <div className={`p-4 border rounded-xl space-y-2 md:col-span-2 ${isDarkMode ? 'bg-slate-900/40 border-slate-880' : 'bg-slate-50 border-slate-200'}`}>
                          <h5 className={`text-xs font-bold border-b pb-1 ${isDarkMode ? 'text-slate-200 border-slate-800' : 'text-slate-700 border-slate-200'}`}>Hardware fittings & Addon overrides</h5>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div className="space-y-1">
                              <label className={`text-[10px] block font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Hinges</label>
                              <input
                                type="number"
                                placeholder={`Def: ₹${project.globalPrices.hinge}`}
                                value={activeRoom.priceOverrides.hinge || ''}
                                onChange={(e) => handleUpdateOverride(activeRoom.id, 'hinge', e.target.value ? Number(e.target.value) : undefined)}
                                className={`w-full border rounded text-center py-0.5 text-xs font-bold ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-250'}`}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className={`text-[10px] block font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Telescopes</label>
                              <input
                                type="number"
                                placeholder={`Def: ₹${project.globalPrices.telescope}`}
                                value={activeRoom.priceOverrides.telescope || ''}
                                onChange={(e) => handleUpdateOverride(activeRoom.id, 'telescope', e.target.value ? Number(e.target.value) : undefined)}
                                className={`w-full border rounded text-center py-0.5 text-xs font-bold ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-250'}`}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className={`text-[10px] block font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Handles 6"</label>
                              <input
                                type="number"
                                placeholder={`Def: ₹${project.globalPrices.handle6Inch}`}
                                value={activeRoom.priceOverrides.handle6Inch || ''}
                                onChange={(e) => handleUpdateOverride(activeRoom.id, 'handle6Inch', e.target.value ? Number(e.target.value) : undefined)}
                                className={`w-full border rounded text-center py-0.5 text-xs font-bold ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-250'}`}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className={`text-[10px] block font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Handles 9"</label>
                              <input
                                type="number"
                                placeholder={`Def: ₹${project.globalPrices.handle9Inch}`}
                                value={activeRoom.priceOverrides.handle9Inch || ''}
                                onChange={(e) => handleUpdateOverride(activeRoom.id, 'handle9Inch', e.target.value ? Number(e.target.value) : undefined)}
                                className={`w-full border rounded text-center py-0.5 text-xs font-bold ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-250'}`}
                              />
                            </div>
                            <div className="space-y-1 col-span-2 md:col-span-1">
                              <label className={`text-[10px] block font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Adhesive (kg)</label>
                              <input
                                type="number"
                                placeholder={`Def: ₹${project.globalPrices.adhesive || 0}`}
                                value={activeRoom.priceOverrides.adhesive || ''}
                                onChange={(e) => handleUpdateOverride(activeRoom.id, 'adhesive', e.target.value ? Number(e.target.value) : undefined)}
                                className={`w-full border rounded text-center py-0.5 text-xs font-bold ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-250'}`}
                              />
                            </div>
                          </div>
                        </div>

                        <div className={`p-4 border rounded-xl space-y-3 md:col-span-2 ${isDarkMode ? 'bg-slate-900/40 border-slate-880' : 'bg-slate-50 border-slate-200'}`}>
                          <h5 className={`text-xs font-bold border-b pb-1 ${isDarkMode ? 'text-slate-200 border-slate-800' : 'text-slate-700 border-slate-200'}`}>Labor Cost overrides (CFT for boxes, Sq.Ft for frames)</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Plywood Box Labor (/cft):</span>
                                <input
                                  type="number"
                                  placeholder={`Def: ₹${project.globalPrices.plywoodBoxLabor}`}
                                  value={activeRoom.priceOverrides.plywoodBoxLabor || ''}
                                  onChange={(e) => handleUpdateOverride(activeRoom.id, 'plywoodBoxLabor', e.target.value ? Number(e.target.value) : undefined)}
                                  className={`w-20 border rounded text-right px-1.5 py-0.5 font-bold ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-250 text-slate-850'}`}
                                />
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Plywood Frame Labor (/sqft):</span>
                                <input
                                  type="number"
                                  placeholder={`Def: ₹${project.globalPrices.plywoodFrameLabor}`}
                                  value={activeRoom.priceOverrides.plywoodFrameLabor || ''}
                                  onChange={(e) => handleUpdateOverride(activeRoom.id, 'plywoodFrameLabor', e.target.value ? Number(e.target.value) : undefined)}
                                  className={`w-20 border rounded text-right px-1.5 py-0.5 font-bold ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-250 text-slate-850'}`}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>MDF Box Labor (/cft):</span>
                                <input
                                  type="number"
                                  placeholder={`Def: ₹${project.globalPrices.mdfBoxLabor}`}
                                  value={activeRoom.priceOverrides.mdfBoxLabor || ''}
                                  onChange={(e) => handleUpdateOverride(activeRoom.id, 'mdfBoxLabor', e.target.value ? Number(e.target.value) : undefined)}
                                  className={`w-20 border rounded text-right px-1.5 py-0.5 font-bold ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-250'}`}
                                />
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>MDF Frame Labor (/sqft):</span>
                                <input
                                  type="number"
                                  placeholder={`Def: ₹${project.globalPrices.mdfFrameLabor}`}
                                  value={activeRoom.priceOverrides.mdfFrameLabor || ''}
                                  onChange={(e) => handleUpdateOverride(activeRoom.id, 'mdfFrameLabor', e.target.value ? Number(e.target.value) : undefined)}
                                  className={`w-20 border rounded text-right px-1.5 py-0.5 font-bold ${isDarkMode ? 'bg-slate-850 border-slate-700 text-white' : 'bg-white border-slate-250'}`}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'breakdown' && (
                    <CostCalculationSheet
                      room={activeRoom}
                      globalPrices={project.globalPrices}
                      currency={project.currency}
                      isDarkMode={isDarkMode}
                    />
                  )}

                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20 text-center">
                <Layers className="h-10 w-10 text-slate-300 mb-2" />
                <h4 className="font-extrabold text-slate-700">No Space Selected</h4>
              </div>
            )}
          </section>

        </div>

        {/* Global Visualization Charts Section */}
        <section className={`rounded-2xl border p-5 shadow-xs transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-905'}`} id="visualizations-section">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-indigo-500" />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Expense Distribution Summary
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-72">
              <span className={`text-[10px] font-bold uppercase tracking-wider mb-2 block ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>Room Wise Costs (Materials, Hardware, Labor)</span>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke={isDarkMode ? "#64748b" : "#94a3b8"} fontSize={10} tickLine={false} />
                    <YAxis stroke={isDarkMode ? "#64748b" : "#94a3b8"} fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' } : undefined} formatter={(value) => `${project.currency}${value.toLocaleString()}`} />
                    <Legend wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                    <Bar dataKey="Materials" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="Hardware" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="Labor" stackId="a" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`flex flex-col justify-center items-center h-72 border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-6 ${isDarkMode ? 'border-slate-800' : 'border-slate-150'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider mb-2 block self-start ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>Project cost split ratio</span>
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' } : undefined} formatter={(value) => `${project.currency}${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="w-full grid grid-cols-3 gap-1.5 text-center mt-2">
                {pieData.map((item) => (
                  <div key={item.name} className={`p-1.5 rounded-lg border ${isDarkMode ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
                    <div className="h-1.5 w-1.5 rounded-full mx-auto mb-1" style={{ backgroundColor: item.color }} />
                    <span className={`text-[9px] font-bold block leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.name}</span>
                    <span className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{Math.round((item.value / (totals.grandTotal || 1)) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Cumulative Materials & Quantities Summary */}
        <section className={`rounded-2xl border p-5 shadow-xs transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'}`} id="cumulative-quantities-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-500" />
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Cumulative Project Summary & Derived Rates
                </h3>
                <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Aggregated quantities and derived unit costs across all {project.rooms.length} rooms
                </p>
              </div>
            </div>

            {/* Tab buttons */}
            <div className={`flex p-1 rounded-xl text-xs font-bold shrink-0 border ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-[#f8fafc] border-transparent'
            }`}>
              <button
                onClick={() => setSummaryTab('quantities')}
                className={`px-3.5 py-1.5 rounded-lg transition-all border ${
                  summaryTab === 'quantities'
                    ? (isDarkMode ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs' : 'bg-[#134d9c] text-white border-[#134d9c] shadow-xs')
                    : (isDarkMode ? 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' : 'bg-transparent border-transparent text-[#354b52] hover:text-slate-600')
                }`}
              >
                Material Quantities
              </button>
              <button
                onClick={() => setSummaryTab('derivedRates')}
                className={`px-3.5 py-1.5 rounded-lg transition-all border ${
                  summaryTab === 'derivedRates'
                    ? (isDarkMode ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs' : 'bg-[#134d9c] text-white border-[#134d9c] shadow-xs')
                    : (isDarkMode ? 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' : 'bg-transparent border-transparent text-[#354b52] hover:text-slate-600')
                }`}
              >
                Derived Cost Rates
              </button>
            </div>
          </div>

          {summaryTab === 'quantities' && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Plywood Sheets Card */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-850/60 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
              <span className={`text-[9px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Plywood</span>
              <div>
                <span className="text-xl font-extrabold tracking-tight block mt-1">
                  {totals.plywoodSheets.toFixed(1)} <span className="text-[11px] font-bold text-slate-450">Sht</span>
                </span>
                <span className={`text-[9px] font-bold block mt-0.5 ${isDarkMode ? 'text-blue-400 bg-blue-950/40' : 'text-blue-600 bg-blue-50'} px-1 py-0.2 rounded w-fit`}>
                  {totals.plywoodBoxSheets.toFixed(1)} Box | {totals.plywoodFrameSheets.toFixed(1)} Frame
                </span>
              </div>
            </div>

            {/* MDF Sheets Card */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-850/60 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
              <span className={`text-[9px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>MDF</span>
              <div>
                <span className="text-xl font-extrabold tracking-tight block mt-1">
                  {totals.mdfSheets.toFixed(1)} <span className="text-[11px] font-bold text-slate-450">Sht</span>
                </span>
                <span className={`text-[9px] font-bold block mt-0.5 ${isDarkMode ? 'text-blue-400 bg-blue-950/40' : 'text-blue-600 bg-blue-50'} px-1 py-0.2 rounded w-fit`}>
                  {totals.mdfBoxSheets.toFixed(1)} Box | {totals.mdfFrameSheets.toFixed(1)} Frame
                </span>
              </div>
            </div>

            {/* Color Laminate Card */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-850/60 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
              <span className={`text-[9px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Color Laminate</span>
              <div>
                <span className="text-xl font-extrabold tracking-tight block mt-1">
                  {totals.colorLaminateSheets} <span className="text-[11px] font-bold text-slate-450">Sht</span>
                </span>
                <span className="text-[9px] font-semibold text-slate-400 block">Exterior styling</span>
              </div>
            </div>

            {/* Acrylic Laminate Card */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-850/60 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
              <span className={`text-[9px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Acrylic Laminate</span>
              <div>
                <span className="text-xl font-extrabold tracking-tight block mt-1">
                  {totals.acrylicLaminateSheets} <span className="text-[11px] font-bold text-slate-450">Sht</span>
                </span>
                <span className="text-[9px] font-semibold text-slate-400 block">Premium gloss</span>
              </div>
            </div>

            {/* Half White Laminate Card */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-850/60 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
              <span className={`text-[9px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Half White Inner</span>
              <div>
                <span className="text-xl font-extrabold tracking-tight block mt-1">
                  {totals.halfWhiteLaminateSheets} <span className="text-[11px] font-bold text-slate-450">Sht</span>
                </span>
                <span className="text-[9px] font-semibold text-slate-400 block">Inner liner</span>
              </div>
            </div>

            {/* Louvers Finish Card */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-850/60 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
              <span className={`text-[9px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Louvers finish</span>
              <div>
                <span className="text-xl font-extrabold tracking-tight block mt-1">
                  {totals.louversPanels} <span className="text-[11px] font-bold text-slate-450">Pnl</span>
                </span>
                <span className="text-[9px] font-semibold text-slate-400 block">Decorative slats</span>
              </div>
            </div>

            {/* Soft-Close Hinges Card */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-850/60 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
              <span className={`text-[9px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Soft Hinges</span>
              <div>
                <span className="text-xl font-extrabold tracking-tight block mt-1">
                  {totals.hingeQty} <span className="text-[11px] font-bold text-slate-450">Pcs</span>
                </span>
                <span className="text-[9px] font-semibold text-slate-400 block">Standard fitments</span>
              </div>
            </div>

            {/* Drawer Telescopes Card */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-850/60 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
              <span className={`text-[9px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Telescopes</span>
              <div>
                <span className="text-xl font-extrabold tracking-tight block mt-1">
                  {totals.telescopeQty} <span className="text-[11px] font-bold text-slate-450">Prs</span>
                </span>
                <span className="text-[9px] font-semibold text-slate-400 block">Heavy drawer rails</span>
              </div>
            </div>

            {/* Cabinet Handles 6" Card */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-850/60 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
              <span className={`text-[9px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Handles 6"</span>
              <div>
                <span className="text-xl font-extrabold tracking-tight block mt-1">
                  {totals.handle6Qty} <span className="text-[11px] font-bold text-slate-450">Pcs</span>
                </span>
                <span className="text-[9px] font-semibold text-slate-400 block">Drawer & pull handles</span>
              </div>
            </div>

            {/* Cabinet Handles 9" Card */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-850/60 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
              <span className={`text-[9px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Handles 9"</span>
              <div>
                <span className="text-xl font-extrabold tracking-tight block mt-1">
                  {totals.handle9Qty} <span className="text-[11px] font-bold text-slate-450">Pcs</span>
                </span>
                <span className="text-[9px] font-semibold text-slate-400 block">Large shutter pulls</span>
              </div>
            </div>

            {/* Adhesive Card */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-850/60 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
              <span className={`text-[9px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Adhesive</span>
              <div>
                <span className="text-xl font-extrabold tracking-tight block mt-1">
                  {totals.adhesiveQty} <span className="text-[11px] font-bold text-slate-450">Kg</span>
                </span>
                <span className="text-[9px] font-semibold text-slate-400 block">Synthetic resin</span>
              </div>
            </div>

            {/* Cumulative Labor Summary Card */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-850/60 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
              <span className={`text-[9px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Labor Volume</span>
              <div>
                <span className="text-[10px] font-bold block mt-1 leading-tight text-emerald-500 dark:text-emerald-400">
                  Ply: {totals.plywoodBoxCFT}cft / {totals.plywoodFrameSqFt}sqft
                </span>
                <span className="text-[10px] font-bold block leading-tight text-emerald-500 dark:text-emerald-400">
                  MDF: {totals.mdfBoxCFT}cft / {totals.mdfFrameSqFt}sqft
                </span>
              </div>
            </div>
          </div>
          )}

          {summaryTab === 'derivedRates' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Plywood Derived Unit Rates Box */}
              <div className={`p-5 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-900/60 border-blue-900/50' : 'bg-blue-50/20 border-blue-100'}`}>
                <div>
                  <div className="flex items-center gap-2 mb-4 border-b pb-2.5 border-blue-100/50 dark:border-blue-950/30">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
                    <h4 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`}>
                      Plywood Derived Unit Rates
                    </h4>
                  </div>

                  <div className="space-y-4">
                    {/* Plywood Box Rate */}
                    <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-white border-blue-50 shadow-xs'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            Carcass / Box Plywood Rate
                          </span>
                          <span className="text-2xl font-extrabold tracking-tight block mt-0.5">
                            {formatCurrency(
                              totals.plywoodBoxCFT > 0 ? totals.plywoodBoxTotalValue / totals.plywoodBoxCFT : 0,
                              project.currency
                            )} <span className="text-xs font-bold text-slate-400">/ cft</span>
                          </span>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-blue-950/40 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                          Box labor: {totals.plywoodBoxCFT.toFixed(1)} cft
                        </span>
                      </div>

                      {/* Itemized list of values added */}
                      <div className="mt-3 pt-3 border-t border-dashed border-slate-150 dark:border-slate-800 text-[11px] space-y-1.5 font-medium">
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>• Box Plywood Board (from A)</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {formatCurrency(totals.plywoodBoxBoardCost, project.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>• Box Laminates & Louvers (from C)</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {formatCurrency(
                              totals.colorLaminateBoxCost + totals.acrylicLaminateBoxCost + totals.halfWhiteLaminateBoxCost + totals.pBoxLouversCost,
                              project.currency
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>• Box Hardware (Hinges, Telescopes, Handles from D)</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {formatCurrency(
                              totals.pBoxHingeCost + totals.pBoxTelescopeCost + totals.pBoxHandle6Cost + totals.pBoxHandle9Cost,
                              project.currency
                            )}
                          </span>
                        </div>
                        {totals.plywoodBoxOtherHardwareCost > 0 && (
                          <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>• Box Other Hardware (from E)</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400">
                              {formatCurrency(totals.plywoodBoxOtherHardwareCost, project.currency)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>• Synthetic Resin Adhesive (1 kg/sheet * price)</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {formatCurrency(totals.pBoxAdhesiveCost, project.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>• Box Labor Cost / Salary (from Labor Costs)</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {formatCurrency(totals.plywoodBoxLaborCost, project.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1.5 border-t border-slate-100 dark:border-slate-850 text-slate-900 dark:text-white font-bold">
                          <span>Sum (Total Box Value)</span>
                          <span>{formatCurrency(totals.plywoodBoxTotalValue, project.currency)}</span>
                        </div>
                        <div className="text-[9px] text-indigo-500 dark:text-indigo-400 font-bold block text-right mt-1.5">
                          Rate = {formatCurrency(totals.plywoodBoxTotalValue, project.currency)} ÷ {totals.plywoodBoxCFT.toFixed(1)} cft
                        </div>
                      </div>
                    </div>

                    {/* Plywood Frame Rate */}
                    <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-white border-blue-50 shadow-xs'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            Shutter / Frame Plywood Rate
                          </span>
                          <span className="text-2xl font-extrabold tracking-tight block mt-0.5">
                            {formatCurrency(
                              totals.plywoodFrameSqFt > 0 ? totals.plywoodFrameTotalValue / totals.plywoodFrameSqFt : 0,
                              project.currency
                            )} <span className="text-xs font-bold text-slate-400">/ sq.ft</span>
                          </span>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-blue-950/40 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                          Frame labor: {totals.plywoodFrameSqFt.toFixed(1)} sq.ft
                        </span>
                      </div>

                      {/* Itemized list of values added */}
                      <div className="mt-3 pt-3 border-t border-dashed border-slate-150 dark:border-slate-800 text-[11px] space-y-1.5 font-medium">
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>• Frame Plywood Board (from A)</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {formatCurrency(totals.plywoodFrameBoardCost, project.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>• Frame Laminates & Louvers (from C)</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {formatCurrency(
                              totals.colorLaminateFrameCost + totals.acrylicLaminateFrameCost + totals.halfWhiteLaminateFrameCost + totals.pFrameLouversCost,
                              project.currency
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>• Frame Hardware (Hinges, Handles from D)</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {formatCurrency(
                              totals.pFrameHingeCost + totals.pFrameHandle6Cost + totals.pFrameHandle9Cost,
                              project.currency
                            )}
                          </span>
                        </div>
                        {totals.plywoodFrameOtherHardwareCost > 0 && (
                          <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>• Shutter Other Hardware (from E)</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400">
                              {formatCurrency(totals.plywoodFrameOtherHardwareCost, project.currency)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>• Synthetic Resin Adhesive (1 kg/sheet * price)</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {formatCurrency(totals.pFrameAdhesiveCost, project.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>• Frame Labor Cost / Salary (from Labor Costs)</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {formatCurrency(totals.plywoodFrameLaborCost, project.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1.5 border-t border-slate-100 dark:border-slate-850 text-slate-900 dark:text-white font-bold">
                          <span>Sum (Total Frame Value)</span>
                          <span>{formatCurrency(totals.plywoodFrameTotalValue, project.currency)}</span>
                        </div>
                        <div className="text-[9px] text-indigo-500 dark:text-indigo-400 font-bold block text-right mt-1.5">
                          Rate = {formatCurrency(totals.plywoodFrameTotalValue, project.currency)} ÷ {totals.plywoodFrameSqFt.toFixed(1)} sqft
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MDF Derived Unit Rates Box */}
              <div className={`p-5 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-900/60 border-blue-900/50' : 'bg-blue-50/20 border-blue-100'}`}>
                <div>
                  <div className="flex items-center gap-2 mb-4 border-b pb-2.5 border-blue-100/50 dark:border-blue-950/30">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
                    <h4 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`}>
                      MDF Derived Unit Rates
                    </h4>
                  </div>

                  <div className="space-y-4">
                    {/* MDF Box Rate */}
                    <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-white border-blue-50 shadow-xs'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            Carcass / Box MDF Rate
                          </span>
                          <span className="text-2xl font-extrabold tracking-tight block mt-0.5">
                            {formatCurrency(
                              totals.mdfBoxCFT > 0 ? totals.mdfBoxTotalValue / totals.mdfBoxCFT : 0,
                              project.currency
                            )} <span className="text-xs font-bold text-slate-400">/ cft</span>
                          </span>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-blue-950/40 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                          Box labor: {totals.mdfBoxCFT.toFixed(1)} cft
                        </span>
                      </div>

                      {/* Itemized list of values added */}
                      <div className="mt-3 pt-3 border-t border-dashed border-slate-150 dark:border-slate-800 text-[11px] space-y-1.5 font-medium">
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>• Box MDF Board (from B)</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {formatCurrency(totals.mdfBoxBoardCost, project.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>• Box Hardware (Hinges, Telescopes, Handles from D)</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {formatCurrency(
                              totals.mBoxHingeCost + totals.mBoxTelescopeCost + totals.mBoxHandle6Cost + totals.mBoxHandle9Cost,
                              project.currency
                            )}
                          </span>
                        </div>
                        {totals.mdfBoxOtherHardwareCost > 0 && (
                          <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>• MDF Box Other Hardware (from E)</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400">
                              {formatCurrency(totals.mdfBoxOtherHardwareCost, project.currency)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>• MDF Box Adhesive ( (total - ply adhesive) / 2 )</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {formatCurrency(totals.mdfBoxAdhesiveCost, project.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>• Box MDF Labor Cost / Salary (from Labor Costs)</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {formatCurrency(totals.mdfBoxLaborCost, project.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1.5 border-t border-slate-100 dark:border-slate-850 text-slate-900 dark:text-white font-bold">
                          <span>Sum (Total MDF Box Value)</span>
                          <span>{formatCurrency(totals.mdfBoxTotalValue, project.currency)}</span>
                        </div>
                        <div className="text-[9px] text-indigo-500 dark:text-indigo-400 font-bold block text-right mt-1.5">
                          Rate = {formatCurrency(totals.mdfBoxTotalValue, project.currency)} ÷ {totals.mdfBoxCFT.toFixed(1)} cft
                        </div>
                      </div>
                    </div>

                    {/* MDF Frame Rate */}
                    <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-white border-blue-50 shadow-xs'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            Shutter / Frame MDF Rate
                          </span>
                          <span className="text-2xl font-extrabold tracking-tight block mt-0.5">
                            {formatCurrency(
                              totals.mdfFrameSqFt > 0 ? totals.mdfFrameTotalValue / totals.mdfFrameSqFt : 0,
                              project.currency
                            )} <span className="text-xs font-bold text-slate-400">/ sq.ft</span>
                          </span>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-blue-950/40 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                          Frame labor: {totals.mdfFrameSqFt.toFixed(1)} sq.ft
                        </span>
                      </div>

                      {/* Itemized list of values added */}
                      <div className="mt-3 pt-3 border-t border-dashed border-slate-150 dark:border-slate-800 text-[11px] space-y-1.5 font-medium">
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>• Frame MDF Board (from B)</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {formatCurrency(totals.mdfFrameBoardCost, project.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>• Frame Hardware (Hinges, Handles from D)</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {formatCurrency(
                              totals.mFrameHingeCost + totals.mFrameHandle6Cost + totals.mFrameHandle9Cost,
                              project.currency
                            )}
                          </span>
                        </div>
                        {totals.mdfFrameOtherHardwareCost > 0 && (
                          <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>• MDF Shutter Other Hardware (from E)</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400">
                              {formatCurrency(totals.mdfFrameOtherHardwareCost, project.currency)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>• MDF Frame Adhesive ( (total - ply adhesive) / 2 )</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {formatCurrency(totals.mdfFrameAdhesiveCost, project.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>• Frame MDF Labor Cost / Salary (from Labor Costs)</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {formatCurrency(totals.mdfFrameLaborCost, project.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1.5 border-t border-slate-100 dark:border-slate-850 text-slate-900 dark:text-white font-bold">
                          <span>Sum (Total MDF Frame Value)</span>
                          <span>{formatCurrency(totals.mdfFrameTotalValue, project.currency)}</span>
                        </div>
                        <div className="text-[9px] text-indigo-500 dark:text-indigo-400 font-bold block text-right mt-1.5">
                          Rate = {formatCurrency(totals.mdfFrameTotalValue, project.currency)} ÷ {totals.mdfFrameSqFt.toFixed(1)} sqft
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Complete Project Comparison Sheet */}
        <section className={`rounded-2xl border p-5 shadow-xs transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'}`} id="comparison-section">
          <h3 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <FileText className="h-4 w-4 text-indigo-500" />
            Complete Project Estimation Breakdown per Area
          </h3>

          <div className={`border rounded-xl overflow-hidden ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b text-[10px] font-bold uppercase ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <th className="p-3">Area Name</th>
                  <th className="p-3">Core Material breakdown</th>
                  <th className="p-3 text-right">Materials Expense</th>
                  <th className="p-3 text-right">Hardware Parts</th>
                  <th className="p-3 text-right">Carpentry Labor</th>
                  <th className="p-3 text-right">Subtotal Price</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {roomCalculations.map(({ room, costs }) => (
                  <tr key={room.id} className={isDarkMode ? 'hover:bg-slate-850/50' : 'hover:bg-slate-50/50 transition-colors'}>
                    <td className={`p-3 font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{room.name}</td>
                    <td className={`p-3 text-[10px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {room.plywoodBoxSheets + room.plywoodFrameSheets > 0 && (
                        <div>• Plywood: {room.plywoodBoxSheets + room.plywoodFrameSheets} sheets</div>
                      )}
                      {room.mdfBoxSheets + room.mdfFrameSheets > 0 && (
                        <div>• MDF: {room.mdfBoxSheets + room.mdfFrameSheets} sheets</div>
                      )}
                      {room.louversPanels > 0 && (
                        <div className="text-indigo-500 font-bold dark:text-indigo-400">• Louvers: {room.louversPanels} panels</div>
                      )}
                      {costs.totalAdhesiveQty > 0 && (
                        <div>• Adhesive: {costs.totalAdhesiveQty} kg</div>
                      )}
                    </td>
                    <td className={`p-3 text-right font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {formatCurrency(costs.totalMaterials, project.currency)}
                    </td>
                    <td className={`p-3 text-right font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {formatCurrency(costs.totalHardware, project.currency)}
                    </td>
                    <td className={`p-3 text-right font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {formatCurrency(costs.totalLabor, project.currency)}
                    </td>
                    <td className={`p-3 text-right font-black text-xs sm:text-sm ${isDarkMode ? 'text-indigo-400' : 'text-[#134d9c]'}`}>
                      {formatCurrency(costs.totalRoomCost, project.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className={`font-black border-t ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                  <td className="p-3" colSpan={2}>Grand Total Estimation Summary</td>
                  <td className="p-3 text-right text-[#134d9c] dark:text-indigo-400 font-black">{formatCurrency(totals.materials, project.currency)}</td>
                  <td className="p-3 text-right text-[#134d9c] dark:text-indigo-400 font-black">{formatCurrency(totals.hardware, project.currency)}</td>
                  <td className="p-3 text-right text-[#134d9c] dark:text-indigo-400 font-black">{formatCurrency(totals.labor, project.currency)}</td>
                  <td className="p-3 text-right text-base text-[#134d9c] dark:text-indigo-300 font-black" colSpan={1}>
                    {formatCurrency(totals.grandTotal, project.currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Consolidated BOM by Rate */}
        <section className={`rounded-2xl border p-5 shadow-xs transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'}`} id="grouped-bom-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <Package className="h-4 w-4 text-indigo-500" />
                Consolidated Bill of Materials (BOM) & Labor by Rate
              </h3>
              <p className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-505'}`}>
                Materials and services grouped separately by customized unit rates across different spaces
              </p>
            </div>
            <span className={`text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider text-center ${isDarkMode ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/40' : 'bg-indigo-50 text-indigo-700'}`}>
              Price-Specific Grouping
            </span>
          </div>

          <div className={`border rounded-xl overflow-x-auto ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <table className="w-full min-w-[620px] text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b text-[10px] font-bold uppercase ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <th className="p-3">Material / Service Description</th>
                  <th className="p-3 text-right">Unit Rate</th>
                  <th className="p-3 text-right">Aggregated Qty</th>
                  <th className="p-3 text-right">Total Subtotal</th>
                  <th className="p-3">Distribution across Spaces</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {groupedMaterials.map((item, idx) => (
                  <tr key={`${item.itemKey}-${item.rate}-${idx}`} className={isDarkMode ? 'hover:bg-slate-850/50' : 'hover:bg-slate-50/50 transition-colors'}>
                    <td className="p-3">
                      <div className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{item.label}</div>
                      <div className="text-[9px] text-slate-400 font-medium capitalize">Category: {item.category}</div>
                    </td>
                    <td className="p-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                      {formatCurrency(item.rate, project.currency)} / {item.unit}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-800 dark:text-slate-200">
                      {item.quantity.toFixed(1)} <span className="text-[10px] font-normal text-slate-450">{item.unit}</span>
                    </td>
                    <td className="p-3 text-right font-extrabold text-[#134d9c] dark:text-indigo-400">
                      {formatCurrency(item.totalCost, project.currency)}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1.5 max-w-xs sm:max-w-md">
                        {item.rooms.map((room, rIdx) => (
                          <span
                            key={rIdx}
                            className={`inline-flex flex-col px-2 py-1 rounded text-[9px] font-bold border ${
                              isDarkMode
                                ? 'bg-slate-800 border-slate-700 text-slate-200'
                                : 'bg-slate-50 border-slate-150 text-slate-700'
                            }`}
                          >
                            <span className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>{room.name}</span>
                            <span className="text-[8px] font-semibold text-[#134d9c] dark:text-indigo-400 mt-0.5">
                              Qty: {room.qty.toFixed(1)} {item.unit} &middot; Cost: {formatCurrency(room.cost, project.currency)}
                            </span>
                            {room.details && (
                              <span className="text-[8px] font-medium text-slate-400 dark:text-slate-500 block mt-0.5 border-t border-slate-200 dark:border-slate-700/60 pt-0.5">
                                {room.details}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className={`font-black border-t ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                  <td className="p-3 font-extrabold" colSpan={3}>Consolidated Grand Total Summary</td>
                  <td className="p-3 text-right text-base font-black text-[#134d9c] dark:text-indigo-300">
                    {formatCurrency(totals.grandTotal, project.currency)}
                  </td>
                  <td className="p-3 text-[10px] text-slate-500 font-bold">
                    All Materials, Hardware &amp; Labor
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

      </main>

      {/* Global standard Rates Config Modal dialog */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
            >
              <div className={`flex justify-between items-center border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex items-center gap-2">
                  <Settings className={`h-5 w-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  <div>
                    <h3 className={`text-sm font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Project Standard Rates</h3>
                    <p className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Default base prices applied across all workspace areas</p>
                  </div>
                </div>
                <button onClick={() => setShowConfigModal(false)} className={`p-1 rounded-lg ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Board Materials */}
                <div className={`p-4 border rounded-xl space-y-3 ${isDarkMode ? 'bg-slate-850/40 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
                  <span className={`text-[10px] font-bold uppercase block border-b pb-1 ${isDarkMode ? 'text-slate-400 border-slate-800' : 'text-slate-400 border-slate-200'}`}>
                    Board Core Rate (per sq.ft)
                  </span>
                  
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>Plywood Board Rate:</span>
                    <div className="relative w-28">
                      <input
                        type="number"
                        value={project.globalPrices.plywood}
                        onChange={(e) => handleUpdateGlobalPrice('plywood', Number(e.target.value))}
                        className={`w-full border rounded px-2 py-1 text-xs font-bold text-right pr-9 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                      />
                      <span className="absolute right-1 top-1.5 text-[9px] text-slate-450 font-bold">/sqft</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>MDF Board Rate:</span>
                    <div className="relative w-28">
                      <input
                        type="number"
                        value={project.globalPrices.mdf}
                        onChange={(e) => handleUpdateGlobalPrice('mdf', Number(e.target.value))}
                        className={`w-full border rounded px-2 py-1 text-xs font-bold text-right pr-9 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                      />
                      <span className="absolute right-1 top-1.5 text-[9px] text-slate-450 font-bold">/sqft</span>
                    </div>
                  </div>
                </div>

                {/* Finishes per sheet & adhesive per kg */}
                <div className={`p-4 border rounded-xl space-y-3 ${isDarkMode ? 'bg-slate-850/40 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
                  <span className={`text-[10px] font-bold uppercase block border-b pb-1 ${isDarkMode ? 'text-slate-400 border-slate-800' : 'text-slate-400 border-slate-200'}`}>
                    Laminates / Louvers / Adhesive
                  </span>

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>Color Laminate:</span>
                    <div className="relative w-28">
                      <input
                        type="number"
                        value={project.globalPrices.colorLaminate}
                        onChange={(e) => handleUpdateGlobalPrice('colorLaminate', Number(e.target.value))}
                        className={`w-full border rounded px-2 py-1 text-xs font-bold text-right pr-8 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                      />
                      <span className="absolute right-1 top-1.5 text-[9px] text-slate-450 font-bold">/sht</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>Acrylic Laminate:</span>
                    <div className="relative w-28">
                      <input
                        type="number"
                        value={project.globalPrices.acrylicLaminate}
                        onChange={(e) => handleUpdateGlobalPrice('acrylicLaminate', Number(e.target.value))}
                        className={`w-full border rounded px-2 py-1 text-xs font-bold text-right pr-8 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                      />
                      <span className="absolute right-1 top-1.5 text-[9px] text-slate-450 font-bold">/sht</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>Louvers Finish:</span>
                    <div className="relative w-28">
                      <input
                        type="number"
                        value={project.globalPrices.louvers}
                        onChange={(e) => handleUpdateGlobalPrice('louvers', Number(e.target.value))}
                        className={`w-full border rounded px-2 py-1 text-xs font-bold text-right pr-8 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                      />
                      <span className="absolute right-1 top-1.5 text-[9px] text-slate-450 font-bold">/pnl</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>Half White Inner:</span>
                    <div className="relative w-28">
                      <input
                        type="number"
                        value={project.globalPrices.halfWhiteLaminate}
                        onChange={(e) => handleUpdateGlobalPrice('halfWhiteLaminate', Number(e.target.value))}
                        className={`w-full border rounded px-2 py-1 text-xs font-bold text-right pr-8 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                      />
                      <span className="absolute right-1 top-1.5 text-[9px] text-slate-450 font-bold">/sht</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>Adhesive Price:</span>
                    <div className="relative w-28">
                      <input
                        type="number"
                        value={project.globalPrices.adhesive || 0}
                        onChange={(e) => handleUpdateGlobalPrice('adhesive', Number(e.target.value))}
                        className={`w-full border rounded px-2 py-1 text-xs font-bold text-right pr-8 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                      />
                      <span className="absolute right-1 top-1.5 text-[9px] text-slate-450 font-bold">/kg</span>
                    </div>
                  </div>
                </div>

                {/* Hardware rates */}
                <div className={`p-4 border rounded-xl space-y-3 col-span-1 sm:col-span-2 ${isDarkMode ? 'bg-slate-850/40 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
                  <span className={`text-[10px] font-bold uppercase block border-b pb-1 ${isDarkMode ? 'text-slate-400 border-slate-800' : 'text-slate-400 border-slate-200'}`}>
                    Standard Hardware Prices (per unit)
                  </span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <span className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Hinges (pc):</span>
                      <input
                        type="number"
                        value={project.globalPrices.hinge}
                        onChange={(e) => handleUpdateGlobalPrice('hinge', Number(e.target.value))}
                        className={`border rounded px-2 py-1 text-xs font-bold text-center ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <span className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Telescopes (pair):</span>
                      <input
                        type="number"
                        value={project.globalPrices.telescope}
                        onChange={(e) => handleUpdateGlobalPrice('telescope', Number(e.target.value))}
                        className={`border rounded px-2 py-1 text-xs font-bold text-center ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <span className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Handles 6" (pc):</span>
                      <input
                        type="number"
                        value={project.globalPrices.handle6Inch}
                        onChange={(e) => handleUpdateGlobalPrice('handle6Inch', Number(e.target.value))}
                        className={`border rounded px-2 py-1 text-xs font-bold text-center ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <span className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Handles 9" (pc):</span>
                      <input
                        type="number"
                        value={project.globalPrices.handle9Inch}
                        onChange={(e) => handleUpdateGlobalPrice('handle9Inch', Number(e.target.value))}
                        className={`border rounded px-2 py-1 text-xs font-bold text-center ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Labor Costs separated */}
                <div className={`p-4 border rounded-xl space-y-2 col-span-1 sm:col-span-2 ${isDarkMode ? 'bg-slate-850/40 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
                  <span className={`text-[10px] font-bold uppercase block border-b pb-1 ${isDarkMode ? 'text-slate-400 border-slate-800' : 'text-slate-400 border-slate-200'}`}>
                    Labor Cost (CFT for box salary, Sq.Ft for frame salary)
                  </span>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>Plywood Box (/cft):</span>
                        <input
                          type="number"
                          value={project.globalPrices.plywoodBoxLabor}
                          onChange={(e) => handleUpdateGlobalPrice('plywoodBoxLabor', Number(e.target.value))}
                          className={`w-20 border rounded text-right px-2 py-0.5 text-xs font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>Plywood Frame (/sqft):</span>
                        <input
                          type="number"
                          value={project.globalPrices.plywoodFrameLabor}
                          onChange={(e) => handleUpdateGlobalPrice('plywoodFrameLabor', Number(e.target.value))}
                          className={`w-20 border rounded text-right px-2 py-0.5 text-xs font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>MDF Box (/cft):</span>
                        <input
                          type="number"
                          value={project.globalPrices.mdfBoxLabor}
                          onChange={(e) => handleUpdateGlobalPrice('mdfBoxLabor', Number(e.target.value))}
                          className={`w-20 border rounded text-right px-2 py-0.5 text-xs font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>MDF Frame (/sqft):</span>
                        <input
                          type="number"
                          value={project.globalPrices.mdfFrameLabor}
                          onChange={(e) => handleUpdateGlobalPrice('mdfFrameLabor', Number(e.target.value))}
                          className={`w-20 border rounded text-right px-2 py-0.5 text-xs font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className={`flex justify-end pt-3 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  Apply & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Project Switcher & Saved Files Manager Modal */}
      <ProjectManagerModal
        isOpen={showProjectsModal}
        onClose={() => setShowProjectsModal(false)}
        activeProject={project}
        allProjects={allProjects}
        onSelectProject={handleSelectProject}
        onCreateNewProject={handleCreateProject}
        onDuplicateProject={handleDuplicateProject}
        onDeleteProject={handleDeleteProject}
        onImportProject={handleImportProject}
        isDarkMode={isDarkMode}
        currentUser={currentUser}
        onOpenCloudSync={() => {
          setShowProjectsModal(false);
          setIsCloudModalOpen(true);
        }}
      />

      {/* Cloud Sync & Phone QR Modal */}
      <CloudSyncModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        currentUser={currentUser}
        syncStatus={cloudSyncStatus}
        isDarkMode={isDarkMode}
        projectCount={allProjects.length}
      />

      {/* Pristine A4 Printable BOM Section (Hidden on screen, shown on print) */}
      <div id="print-bom-container" className="hidden print:block font-sans text-black bg-white max-w-4xl mx-auto">
        {/* PAGE 1 */}
        <div id="print-bom-page-1" className="p-10 bg-white flex flex-col justify-between" style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}>
          <div>
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
              <div>
                <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">MODULAR CARPENTRY ESTIMATOR</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">CONSOLIDATED BILL OF MATERIALS (BOM) &amp; LABOR ESTIMATE</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-bold">Date: <span className="font-normal">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                <p className="font-bold mt-1">Project Ref: <span className="font-normal">{project.name || 'Untitled Project'}</span></p>
              </div>
            </div>

            {/* Project Meta Metrics Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6 border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <div>
                <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">PROJECT ESTIMATED BUDGET</span>
                <span className="text-base font-black text-slate-950 mt-1 block">
                  {formatCurrency(totals.grandTotal, project.currency)}
                </span>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">MATERIALS BUDGET</span>
                <span className="text-sm font-extrabold text-slate-800 mt-1 block">
                  {formatCurrency(totals.materials, project.currency)}
                </span>
                <span className="text-[9px] font-bold text-indigo-600 block">
                  {Math.round((totals.materials / (totals.grandTotal || 1)) * 100)}% of total
                </span>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">HARDWARE BUDGET</span>
                <span className="text-sm font-extrabold text-slate-800 mt-1 block">
                  {formatCurrency(totals.hardware, project.currency)}
                </span>
                <span className="text-[9px] font-bold text-indigo-600 block">
                  {Math.round((totals.hardware / (totals.grandTotal || 1)) * 100)}% of total
                </span>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">LABOR BUDGET</span>
                <span className="text-sm font-extrabold text-slate-800 mt-1 block">
                  {formatCurrency(totals.labor, project.currency)}
                </span>
                <span className="text-[9px] font-bold text-indigo-600 block">
                  {Math.round((totals.labor / (totals.grandTotal || 1)) * 100)}% of total
                </span>
              </div>
            </div>

            {/* Board summaries */}
            <div className="grid grid-cols-2 gap-4 mb-6 border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <div>
                <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">PLYWOOD SHEETS (TOTAL)</span>
                <span className="text-sm font-extrabold text-slate-800 mt-1 block">
                  {totals.plywoodSheets.toFixed(1)} Sheets
                </span>
                <span className="text-[9px] font-semibold text-slate-500 block">
                  Box: {totals.plywoodBoxSheets.toFixed(1)} sht | Frame: {totals.plywoodFrameSheets.toFixed(1)} sht
                </span>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">MDF SHEETS (TOTAL)</span>
                <span className="text-sm font-extrabold text-slate-800 mt-1 block">
                  {totals.mdfSheets.toFixed(1)} Sheets
                </span>
                <span className="text-[9px] font-semibold text-slate-500 block">
                  Box: {totals.mdfBoxSheets.toFixed(1)} sht | Frame: {totals.mdfFrameSheets.toFixed(1)} sht
                </span>
              </div>
            </div>

            {/* BOM Items Table */}
            <div className="border border-slate-300 rounded-xl overflow-hidden mb-8">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b-2 border-slate-300 bg-slate-100/80 text-[9px] font-bold uppercase text-slate-700">
                    <th className="p-3">Material / Service Description</th>
                    <th className="p-3 text-right">Unit Rate</th>
                    <th className="p-3 text-right">Aggregated Qty</th>
                    <th className="p-3 text-right">Total Subtotal</th>
                    <th className="p-3">Distribution across Spaces</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {groupedMaterials.map((item, idx) => (
                    <tr key={`${item.itemKey}-${item.rate}-${idx}`} className="page-break-inside-avoid">
                      <td className="p-3">
                        <div className="font-extrabold text-slate-900">{item.label}</div>
                        <div className="text-[8px] text-slate-500 font-bold capitalize">Category: {item.category}</div>
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-800">
                        {formatCurrency(item.rate, project.currency)} / {item.unit}
                      </td>
                      <td className="p-3 text-right font-black text-slate-900">
                        {item.quantity.toFixed(1)} <span className="text-[9px] font-normal text-slate-500">{item.unit}</span>
                      </td>
                      <td className="p-3 text-right font-extrabold text-indigo-700">
                        {formatCurrency(item.totalCost, project.currency)}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1 max-w-xs">
                          {item.rooms.map((room, rIdx) => (
                            <div key={rIdx} className="text-[8px] font-bold text-slate-700 border-b border-slate-100 last:border-none pb-0.5 last:pb-0">
                              <span className="text-slate-900 font-black">{room.name}</span>: {room.qty.toFixed(1)} {item.unit} &middot; {formatCurrency(room.cost, project.currency)}
                              {room.details && (
                                <span className="text-[8px] font-medium text-slate-450 block ml-1 italic">
                                  ({room.details})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signature & Authorizations Footer */}
          <div className="mt-auto pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-600">
            <div>
              <p className="italic">Notes &amp; Assumptions:</p>
              <ul className="list-disc pl-4 mt-1 space-y-1 text-[9px]">
                <li>Plywood sheet dimensions calculated at standard 8ft x 4ft (32 sq.ft).</li>
                <li>Estimated values include custom labor rates specified in standard settings.</li>
                <li>Final material requisition may vary up to 10% based on actual site cutting wastage.</li>
              </ul>
            </div>
            <div className="flex flex-col justify-end items-end space-y-8">
              <div className="w-48 border-b border-slate-400 text-center pb-1">
                <span className="text-[9px] text-slate-500">Authorized Signature</span>
              </div>
              <div className="w-48 text-center">
                <span className="text-[9px] text-slate-450">Date: ________________________</span>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 2: Derived Cost Rates (Page break before) */}
        <div id="print-bom-page-2" className="p-10 bg-white flex flex-col justify-between" style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box', breakBefore: 'page', pageBreakBefore: 'always' }}>
          <div>
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
              <div>
                <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">MODULAR CARPENTRY ESTIMATOR</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">DERIVED COST RATES SUMMARY</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-bold">Date: <span className="font-normal">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                <p className="font-bold mt-1">Project Ref: <span className="font-normal">{project.name || 'Untitled Project'}</span></p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Plywood Derived Unit Rates */}
              <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b pb-2 mb-3">Plywood Derived Unit Rates</h3>
                
                <div className="space-y-4">
                  {/* Plywood Box */}
                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Carcass / Box Plywood Rate</span>
                        <span className="text-sm font-extrabold text-slate-900">
                          {formatCurrency(totals.plywoodBoxCFT > 0 ? totals.plywoodBoxTotalValue / totals.plywoodBoxCFT : 0, project.currency)} <span className="text-[10px] font-normal text-slate-400">/ cft</span>
                        </span>
                      </div>
                      <span className="text-[8px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">
                        {totals.plywoodBoxCFT.toFixed(1)} cft
                      </span>
                    </div>
                    <div className="text-[9px] space-y-1 text-slate-600 border-t pt-2">
                      <div className="flex justify-between"><span>Board Cost:</span><span>{formatCurrency(totals.plywoodBoxBoardCost, project.currency)}</span></div>
                      <div className="flex justify-between"><span>Laminates & Louvers:</span><span>{formatCurrency(totals.colorLaminateBoxCost + totals.acrylicLaminateBoxCost + totals.halfWhiteLaminateBoxCost + totals.pBoxLouversCost, project.currency)}</span></div>
                      <div className="flex justify-between"><span>Hardware Cost:</span><span>{formatCurrency(totals.pBoxHingeCost + totals.pBoxTelescopeCost + totals.pBoxHandle6Cost + totals.pBoxHandle9Cost, project.currency)}</span></div>
                      {totals.plywoodBoxOtherHardwareCost > 0 && (
                        <div className="flex justify-between text-amber-700"><span>Other Hardware:</span><span>{formatCurrency(totals.plywoodBoxOtherHardwareCost, project.currency)}</span></div>
                      )}
                      <div className="flex justify-between"><span>Adhesive Cost:</span><span>{formatCurrency(totals.pBoxAdhesiveCost, project.currency)}</span></div>
                      <div className="flex justify-between"><span>Labor Cost:</span><span>{formatCurrency(totals.plywoodBoxLaborCost, project.currency)}</span></div>
                      <div className="flex justify-between border-t pt-1 font-bold text-slate-900"><span>Sum Value:</span><span>{formatCurrency(totals.plywoodBoxTotalValue, project.currency)}</span></div>
                    </div>
                  </div>

                  {/* Plywood Frame */}
                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Shutter / Frame Plywood Rate</span>
                        <span className="text-sm font-extrabold text-slate-900">
                          {formatCurrency(totals.plywoodFrameSqFt > 0 ? totals.plywoodFrameTotalValue / totals.plywoodFrameSqFt : 0, project.currency)} <span className="text-[10px] font-normal text-slate-400">/ sq.ft</span>
                        </span>
                      </div>
                      <span className="text-[8px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">
                        {totals.plywoodFrameSqFt.toFixed(1)} sqft
                      </span>
                    </div>
                    <div className="text-[9px] space-y-1 text-slate-600 border-t pt-2">
                      <div className="flex justify-between"><span>Board Cost:</span><span>{formatCurrency(totals.plywoodFrameBoardCost, project.currency)}</span></div>
                      <div className="flex justify-between"><span>Laminates & Louvers:</span><span>{formatCurrency(totals.colorLaminateFrameCost + totals.acrylicLaminateFrameCost + totals.halfWhiteLaminateFrameCost + totals.pFrameLouversCost, project.currency)}</span></div>
                      <div className="flex justify-between"><span>Hardware Cost:</span><span>{formatCurrency(totals.pFrameHingeCost + totals.pFrameHandle6Cost + totals.pFrameHandle9Cost, project.currency)}</span></div>
                      {totals.plywoodFrameOtherHardwareCost > 0 && (
                        <div className="flex justify-between text-amber-700"><span>Other Hardware:</span><span>{formatCurrency(totals.plywoodFrameOtherHardwareCost, project.currency)}</span></div>
                      )}
                      <div className="flex justify-between"><span>Adhesive Cost:</span><span>{formatCurrency(totals.pFrameAdhesiveCost, project.currency)}</span></div>
                      <div className="flex justify-between"><span>Labor Cost:</span><span>{formatCurrency(totals.plywoodFrameLaborCost, project.currency)}</span></div>
                      <div className="flex justify-between border-t pt-1 font-bold text-slate-900"><span>Sum Value:</span><span>{formatCurrency(totals.plywoodFrameTotalValue, project.currency)}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MDF Derived Unit Rates */}
              <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b pb-2 mb-3">MDF Derived Unit Rates</h3>

                <div className="space-y-4">
                  {/* MDF Box */}
                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Carcass / Box MDF Rate</span>
                        <span className="text-sm font-extrabold text-slate-900">
                          {formatCurrency(totals.mdfBoxCFT > 0 ? totals.mdfBoxTotalValue / totals.mdfBoxCFT : 0, project.currency)} <span className="text-[10px] font-normal text-slate-400">/ cft</span>
                        </span>
                      </div>
                      <span className="text-[8px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">
                        {totals.mdfBoxCFT.toFixed(1)} cft
                      </span>
                    </div>
                    <div className="text-[9px] space-y-1 text-slate-600 border-t pt-2">
                      <div className="flex justify-between"><span>Board Cost:</span><span>{formatCurrency(totals.mdfBoxBoardCost, project.currency)}</span></div>
                      <div className="flex justify-between"><span>Hardware Cost:</span><span>{formatCurrency(totals.mBoxHingeCost + totals.mBoxTelescopeCost + totals.mBoxHandle6Cost + totals.mBoxHandle9Cost, project.currency)}</span></div>
                      {totals.mdfBoxOtherHardwareCost > 0 && (
                        <div className="flex justify-between text-amber-700"><span>Other Hardware:</span><span>{formatCurrency(totals.mdfBoxOtherHardwareCost, project.currency)}</span></div>
                      )}
                      <div className="flex justify-between"><span>Adhesive Cost:</span><span>{formatCurrency(totals.mdfBoxAdhesiveCost, project.currency)}</span></div>
                      <div className="flex justify-between"><span>Labor Cost:</span><span>{formatCurrency(totals.mdfBoxLaborCost, project.currency)}</span></div>
                      <div className="flex justify-between border-t pt-1 font-bold text-slate-900"><span>Sum Value:</span><span>{formatCurrency(totals.mdfBoxTotalValue, project.currency)}</span></div>
                    </div>
                  </div>

                  {/* MDF Frame */}
                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Shutter / Frame MDF Rate</span>
                        <span className="text-sm font-extrabold text-slate-900">
                          {formatCurrency(totals.mdfFrameSqFt > 0 ? totals.mdfFrameTotalValue / totals.mdfFrameSqFt : 0, project.currency)} <span className="text-[10px] font-normal text-slate-400">/ sq.ft</span>
                        </span>
                      </div>
                      <span className="text-[8px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">
                        {totals.mdfFrameSqFt.toFixed(1)} sqft
                      </span>
                    </div>
                    <div className="text-[9px] space-y-1 text-slate-600 border-t pt-2">
                      <div className="flex justify-between"><span>Board Cost:</span><span>{formatCurrency(totals.mdfFrameBoardCost, project.currency)}</span></div>
                      <div className="flex justify-between"><span>Hardware Cost:</span><span>{formatCurrency(totals.mFrameHingeCost + totals.mFrameHandle6Cost + totals.mFrameHandle9Cost, project.currency)}</span></div>
                      {totals.mdfFrameOtherHardwareCost > 0 && (
                        <div className="flex justify-between text-amber-700"><span>Other Hardware:</span><span>{formatCurrency(totals.mdfFrameOtherHardwareCost, project.currency)}</span></div>
                      )}
                      <div className="flex justify-between"><span>Adhesive Cost:</span><span>{formatCurrency(totals.mdfFrameAdhesiveCost, project.currency)}</span></div>
                      <div className="flex justify-between"><span>Labor Cost:</span><span>{formatCurrency(totals.mdfFrameLaborCost, project.currency)}</span></div>
                      <div className="flex justify-between border-t pt-1 font-bold text-slate-900"><span>Sum Value:</span><span>{formatCurrency(totals.mdfFrameTotalValue, project.currency)}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
