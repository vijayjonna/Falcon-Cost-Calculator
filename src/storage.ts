import { ProjectData, RoomData, PriceItemKey } from './types';

export const FALCON_PROJECTS_KEY = 'falcon_projects_v1';
export const FALCON_ACTIVE_ID_KEY = 'falcon_active_project_id_v1';
export const FALCON_THEME_KEY = 'falcon_theme';

export const DEFAULT_ROOM = (id: string = 'room-1', name: string = 'Estimation Area 1'): RoomData => ({
  id,
  name,
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
  plywoodBoxOtherHardwareCost: 0,
  plywoodFrameOtherHardwareCost: 0,
  mdfBoxOtherHardwareCost: 0,
  mdfFrameOtherHardwareCost: 0,
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

export const DEFAULT_GLOBAL_PRICES: Record<PriceItemKey, number> = {
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
};

export function createDefaultProject(name: string = 'New Project'): ProjectData {
  const timestamp = Date.now();
  return {
    id: `proj-${timestamp}-${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim() || 'New Project',
    clientName: '',
    currency: '₹',
    globalPrices: { ...DEFAULT_GLOBAL_PRICES },
    rooms: [DEFAULT_ROOM(`room-${timestamp}-1`, 'Estimation Area 1')],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/**
 * Safely normalizes and validates loaded project data against the expected schema
 */
export function sanitizeProject(raw: any, fallbackName: string = 'Untitled Project'): ProjectData {
  const timestamp = Date.now();
  const id = typeof raw?.id === 'string' && raw.id ? raw.id : `proj-${timestamp}-${Math.random().toString(36).substring(2, 7)}`;
  const name = typeof raw?.name === 'string' && raw.name.trim() ? raw.name.trim() : fallbackName;
  const clientName = typeof raw?.clientName === 'string' ? raw.clientName : '';
  const currency = typeof raw?.currency === 'string' && raw.currency ? raw.currency : '₹';
  
  const globalPrices: Record<PriceItemKey, number> = {
    ...DEFAULT_GLOBAL_PRICES,
    ...(typeof raw?.globalPrices === 'object' && raw.globalPrices ? raw.globalPrices : {}),
  };

  const rooms: RoomData[] = Array.isArray(raw?.rooms) && raw.rooms.length > 0
    ? raw.rooms.map((r: any, idx: number) => {
        const roomId = typeof r?.id === 'string' && r.id ? r.id : `room-${timestamp}-${idx + 1}`;
        const roomName = typeof r?.name === 'string' && r.name ? r.name : `Estimation Area ${idx + 1}`;
        const base = DEFAULT_ROOM(roomId, roomName);
        return {
          ...base,
          ...r,
          id: roomId,
          name: roomName,
          priceOverrides: {
            ...base.priceOverrides,
            ...(typeof r?.priceOverrides === 'object' && r.priceOverrides ? r.priceOverrides : {}),
          },
        };
      })
    : [DEFAULT_ROOM(`room-${timestamp}-1`, 'Estimation Area 1')];

  return {
    id,
    name,
    clientName,
    currency,
    globalPrices,
    rooms,
    createdAt: typeof raw?.createdAt === 'number' ? raw.createdAt : timestamp,
    updatedAt: typeof raw?.updatedAt === 'number' ? raw.updatedAt : timestamp,
  };
}

/**
 * Load all saved projects from localStorage
 */
export function loadAllProjects(): ProjectData[] {
  try {
    const raw = localStorage.getItem(FALCON_PROJECTS_KEY);
    if (!raw) {
      const defaultProj = createDefaultProject('New Project');
      saveAllProjects([defaultProj]);
      localStorage.setItem(FALCON_ACTIVE_ID_KEY, defaultProj.id!);
      return [defaultProj];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const defaultProj = createDefaultProject('New Project');
      saveAllProjects([defaultProj]);
      localStorage.setItem(FALCON_ACTIVE_ID_KEY, defaultProj.id!);
      return [defaultProj];
    }

    const sanitized = parsed.map((p, idx) => sanitizeProject(p, `Project ${idx + 1}`));
    return sanitized.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  } catch (err) {
    console.error('Failed to load projects from storage:', err);
    const defaultProj = createDefaultProject('New Project');
    saveAllProjects([defaultProj]);
    return [defaultProj];
  }
}

/**
 * Save the entire list of projects to localStorage
 */
export function saveAllProjects(projects: ProjectData[]): void {
  try {
    localStorage.setItem(FALCON_PROJECTS_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to write projects to localStorage:', err);
  }
}

/**
 * Load active project and complete projects list
 */
export function loadActiveProject(): { project: ProjectData; allProjects: ProjectData[] } {
  const allProjects = loadAllProjects();
  const activeId = localStorage.getItem(FALCON_ACTIVE_ID_KEY);

  let active = allProjects.find((p) => p.id === activeId);
  if (!active && allProjects.length > 0) {
    active = allProjects[0];
  }
  if (!active) {
    active = createDefaultProject('New Project');
    allProjects.push(active);
    saveAllProjects(allProjects);
  }

  localStorage.setItem(FALCON_ACTIVE_ID_KEY, active.id!);
  return { project: active, allProjects };
}

/**
 * Saves current active project into localStorage list
 */
export function saveActiveProject(project: ProjectData): ProjectData[] {
  const allProjects = loadAllProjects();
  const now = Date.now();
  const projectToSave: ProjectData = {
    ...project,
    id: project.id || `proj-${now}-${Math.random().toString(36).substring(2, 7)}`,
    updatedAt: now,
  };

  const existingIdx = allProjects.findIndex((p) => p.id === projectToSave.id);
  let updatedProjects: ProjectData[];

  if (existingIdx >= 0) {
    updatedProjects = [
      ...allProjects.slice(0, existingIdx),
      projectToSave,
      ...allProjects.slice(existingIdx + 1),
    ];
  } else {
    updatedProjects = [projectToSave, ...allProjects];
  }

  // Keep sorted by last updated
  updatedProjects.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  saveAllProjects(updatedProjects);
  localStorage.setItem(FALCON_ACTIVE_ID_KEY, projectToSave.id!);
  return updatedProjects;
}

/**
 * Creates a brand new project and persists it
 */
export function createNewProjectInStorage(name: string = 'New Project'): {
  newProject: ProjectData;
  allProjects: ProjectData[];
} {
  const allProjects = loadAllProjects();
  const newProject = createDefaultProject(name);
  const updatedProjects = [newProject, ...allProjects];
  saveAllProjects(updatedProjects);
  localStorage.setItem(FALCON_ACTIVE_ID_KEY, newProject.id!);
  return { newProject, allProjects: updatedProjects };
}

/**
 * Duplicates an existing project
 */
export function duplicateProjectInStorage(source: ProjectData): {
  duplicatedProject: ProjectData;
  allProjects: ProjectData[];
} {
  const allProjects = loadAllProjects();
  const now = Date.now();
  const duplicatedProject: ProjectData = {
    ...JSON.parse(JSON.stringify(source)),
    id: `proj-${now}-${Math.random().toString(36).substring(2, 7)}`,
    name: `${source.name || 'Project'} (Copy)`,
    createdAt: now,
    updatedAt: now,
    rooms: source.rooms.map((r, idx) => ({
      ...JSON.parse(JSON.stringify(r)),
      id: `room-${now}-${idx + 1}`,
    })),
  };

  const updatedProjects = [duplicatedProject, ...allProjects];
  saveAllProjects(updatedProjects);
  localStorage.setItem(FALCON_ACTIVE_ID_KEY, duplicatedProject.id!);
  return { duplicatedProject, allProjects: updatedProjects };
}

/**
 * Deletes a project by ID
 */
export function deleteProjectFromStorage(projectId: string): {
  nextProject: ProjectData;
  allProjects: ProjectData[];
} {
  const allProjects = loadAllProjects();
  const filtered = allProjects.filter((p) => p.id !== projectId);

  let nextProject: ProjectData;
  let finalProjects: ProjectData[];

  if (filtered.length === 0) {
    nextProject = createDefaultProject('New Project');
    finalProjects = [nextProject];
  } else {
    finalProjects = filtered;
    nextProject = finalProjects[0];
  }

  saveAllProjects(finalProjects);
  localStorage.setItem(FALCON_ACTIVE_ID_KEY, nextProject.id!);
  return { nextProject, allProjects: finalProjects };
}

/**
 * Downloads a project as a JSON backup file
 */
export function exportProjectFile(project: ProjectData): void {
  const fileName = `${(project.name || 'falcon_project').toLowerCase().replace(/[^a-z0-9]/g, '_')}_data.json`;
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Reads and imports a project JSON file
 */
export async function importProjectFile(file: File): Promise<ProjectData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        const timestamp = Date.now();
        const sanitized = sanitizeProject(parsed, file.name.replace(/\.[^/.]+$/, ''));
        // Assign new ID to prevent colliding with existing project
        sanitized.id = `proj-${timestamp}-${Math.random().toString(36).substring(2, 7)}`;
        sanitized.updatedAt = timestamp;
        sanitized.createdAt = timestamp;
        
        saveActiveProject(sanitized);
        resolve(sanitized);
      } catch (err) {
        reject(new Error('Invalid project JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
