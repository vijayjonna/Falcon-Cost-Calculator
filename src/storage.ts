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

const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

function toFiniteNumber(val: any, fallback: number = 0): number {
  const num = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(num) ? num : fallback;
}

function toEpochMillis(val: any, fallback: number): number {
  if (typeof val === 'number' && Number.isFinite(val) && val > 0) return val;
  if (val && typeof val.toMillis === 'function') {
    const ms = val.toMillis();
    if (Number.isFinite(ms) && ms > 0) return ms;
  }
  return fallback;
}

/**
 * Safely normalizes and validates loaded project data against the expected schema
 */
export function sanitizeProject(raw: any, fallbackName: string = 'Untitled Project'): ProjectData {
  const timestamp = Date.now();
  const rawId = typeof raw?.id === 'string' ? raw.id.trim() : '';
  const id = SAFE_ID_REGEX.test(rawId)
    ? rawId
    : `proj-${timestamp}-${Math.random().toString(36).substring(2, 7)}`;

  const rawName = typeof raw?.name === 'string' ? raw.name.trim() : '';
  const name = (rawName || fallbackName).slice(0, 200);
  const clientName = (typeof raw?.clientName === 'string' ? raw.clientName : '').slice(0, 200);
  const rawCurrency = typeof raw?.currency === 'string' ? raw.currency.trim() : '';
  const currency = (rawCurrency || '₹').slice(0, 10);

  const globalPrices: Record<PriceItemKey, number> = { ...DEFAULT_GLOBAL_PRICES };
  if (typeof raw?.globalPrices === 'object' && raw.globalPrices) {
    for (const key of Object.keys(DEFAULT_GLOBAL_PRICES) as PriceItemKey[]) {
      if (raw.globalPrices[key] !== undefined && raw.globalPrices[key] !== null) {
        globalPrices[key] = toFiniteNumber(raw.globalPrices[key], 0);
      }
    }
  }

  const rawRooms = Array.isArray(raw?.rooms) && raw.rooms.length > 0 ? raw.rooms.slice(0, 100) : null;
  const rooms: RoomData[] = rawRooms
    ? rawRooms.map((r: any, idx: number) => {
        const rawRoomId = typeof r?.id === 'string' ? r.id.trim() : '';
        const roomId = SAFE_ID_REGEX.test(rawRoomId) ? rawRoomId : `room-${timestamp}-${idx + 1}`;
        const roomName = (typeof r?.name === 'string' && r.name.trim() ? r.name.trim() : `Estimation Area ${idx + 1}`).slice(0, 200);
        const base = DEFAULT_ROOM(roomId, roomName);

        const cleanRoom: any = { ...base };
        for (const key of Object.keys(base) as (keyof RoomData)[]) {
          if (key === 'id' || key === 'name' || key === 'priceOverrides') continue;
          if (r && r[key] !== undefined && r[key] !== null) {
            cleanRoom[key] = toFiniteNumber(r[key], 0);
          }
        }
        cleanRoom.id = roomId;
        cleanRoom.name = roomName;

        const cleanOverrides: Record<PriceItemKey, number | undefined> = { ...base.priceOverrides };
        if (typeof r?.priceOverrides === 'object' && r.priceOverrides) {
          for (const key of Object.keys(base.priceOverrides) as PriceItemKey[]) {
            const ov = r.priceOverrides[key];
            if (ov !== undefined && ov !== null && ov !== '') {
              cleanOverrides[key] = toFiniteNumber(ov, 0);
            } else {
              cleanOverrides[key] = undefined;
            }
          }
        }
        cleanRoom.priceOverrides = cleanOverrides;

        return cleanRoom as RoomData;
      })
    : [DEFAULT_ROOM(`room-${timestamp}-1`, 'Estimation Area 1')];

  const result: ProjectData = {
    id,
    name,
    clientName,
    currency,
    globalPrices,
    rooms,
    createdAt: toEpochMillis(raw?.createdAt, timestamp),
    updatedAt: toEpochMillis(raw?.updatedAt, timestamp),
  };

  if (typeof raw?.userId === 'string' && raw.userId.trim()) {
    result.userId = raw.userId.trim();
  }

  return result;
}

/**
 * Checks if a project is an untouched blank default project
 */
export function isDefaultEmptyProject(project: ProjectData): boolean {
  if (!project) return true;
  if ((project.name || '').trim() !== 'New Project') return false;
  if ((project.clientName || '').trim() !== '') return false;
  if (Object.values(project.globalPrices || {}).some((v) => Number(v) !== 0)) return false;
  if (!project.rooms || project.rooms.length !== 1) return false;
  const r = project.rooms[0];
  if ((r.name || '').trim() !== 'Estimation Area 1') return false;
  for (const [k, v] of Object.entries(r)) {
    if (k === 'id' || k === 'name') continue;
    if (k === 'priceOverrides') {
      if (v && Object.values(v as Record<string, any>).some((ov) => ov !== undefined && ov !== null && Number(ov) !== 0)) {
        return false;
      }
      continue;
    }
    if (v !== undefined && v !== null && Number(v) !== 0) return false;
  }
  return true;
}

/**
 * Deterministic content signature of a project excluding volatile metadata (updatedAt, userId)
 * Used to avoid infinite Firestore read/write loops.
 */
export function getProjectContentSignature(project: ProjectData): string {
  const normalized = sanitizeProject(project);
  return JSON.stringify({
    id: normalized.id,
    name: normalized.name,
    clientName: normalized.clientName,
    currency: normalized.currency,
    globalPrices: normalized.globalPrices,
    rooms: normalized.rooms,
  });
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
 * Clears all stored projects from localStorage and resets to a single blank project
 */
export function clearAllProjectsInStorage(): {
  freshProject: ProjectData;
  allProjects: ProjectData[];
} {
  localStorage.removeItem(FALCON_PROJECTS_KEY);
  localStorage.removeItem(FALCON_ACTIVE_ID_KEY);
  const freshProject = createDefaultProject('New Project');
  const allProjects = [freshProject];
  saveAllProjects(allProjects);
  localStorage.setItem(FALCON_ACTIVE_ID_KEY, freshProject.id!);
  return { freshProject, allProjects };
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
