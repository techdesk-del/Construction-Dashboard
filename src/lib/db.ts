import mongoose from 'mongoose';
import { Activity, MaterialItem, User } from '@/types';
import { INITIAL_ACTIVITIES, INITIAL_MATERIALS } from './initialData';

const MONGODB_URI = process.env.MONGODB_URI || '';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (!MONGODB_URI) {
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2500,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    }).catch((err) => {
      console.warn('MongoDB connection error, falling back to local store:', err.message);
      cached.promise = null;
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    return null;
  }

  return cached.conn;
}

// In-memory fallback repository to ensure high-performance immediate reactivity
class MemoryStore {
  private activities: Activity[] = JSON.parse(JSON.stringify(INITIAL_ACTIVITIES));
  private materials: MaterialItem[] = JSON.parse(JSON.stringify(INITIAL_MATERIALS));

  getActivities(): Activity[] {
    return this.activities;
  }

  setActivities(acts: Activity[]) {
    this.activities = acts;
  }

  getActivityById(id: number): Activity | undefined {
    return this.activities.find(a => a.id === id);
  }

  createActivity(activity: Omit<Activity, 'id'>): Activity {
    const newId = this.activities.length ? Math.max(...this.activities.map(a => a.id)) + 1 : 1;
    const newActivity: Activity = { ...activity, id: newId };
    this.activities.push(newActivity);
    return newActivity;
  }

  updateActivity(id: number, updates: Partial<Activity>): Activity | null {
    const idx = this.activities.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.activities[idx] = { ...this.activities[idx], ...updates };
    return this.activities[idx];
  }

  deleteActivity(id: number): boolean {
    const initialLen = this.activities.length;
    this.activities = this.activities.filter(a => a.id !== id);
    return this.activities.length < initialLen;
  }

  getMaterials(): MaterialItem[] {
    return this.materials;
  }

  setMaterials(mats: MaterialItem[]) {
    this.materials = mats;
  }

  createMaterial(material: Omit<MaterialItem, 'id'>): MaterialItem {
    const newId = this.materials.length ? Math.max(...this.materials.map(m => m.id)) + 1 : 1;
    const newMat: MaterialItem = { ...material, id: newId };
    this.materials.push(newMat);
    return newMat;
  }

  updateMaterial(id: number, updates: Partial<MaterialItem>): MaterialItem | null {
    const idx = this.materials.findIndex(m => m.id === id);
    if (idx === -1) return null;
    this.materials[idx] = { ...this.materials[idx], ...updates };
    return this.materials[idx];
  }

  deleteMaterial(id: number): boolean {
    const initialLen = this.materials.length;
    this.materials = this.materials.filter(m => m.id !== id);
    return this.materials.length < initialLen;
  }

  renamePhase(oldPhase: string, newPhase: string): { activitiesUpdated: number; materialsUpdated: number } {
    let activitiesUpdated = 0;
    let materialsUpdated = 0;
    this.activities = this.activities.map(a => {
      if (a.phase === oldPhase) {
        activitiesUpdated++;
        return { ...a, phase: newPhase };
      }
      return a;
    });
    this.materials = this.materials.map(m => {
      if (m.phase === oldPhase) {
        materialsUpdated++;
        return { ...m, phase: newPhase };
      }
      return m;
    });
    return { activitiesUpdated, materialsUpdated };
  }

  private users: (User & { password?: string })[] = [
    {
      id: 'usr-ceo-01',
      name: 'Executive CEO',
      email: 'ceo@chakramsar.com',
      role: 'CEO / Executive',
      avatar: '👔',
    },
    {
      id: 'usr-eng-01',
      name: 'Lead Site Engineer',
      email: 'engineer@chakramsar.com',
      role: 'Site Engineer',
      avatar: '👷‍♂️',
    },
  ];

  findUserByEmail(email: string) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: Omit<User, 'id'> & { password?: string }) {
    const newUser = {
      ...user,
      id: 'usr-' + Date.now(),
    };
    this.users.push(newUser);
    return newUser;
  }

  resetToInitial() {
    this.activities = JSON.parse(JSON.stringify(INITIAL_ACTIVITIES));
    this.materials = JSON.parse(JSON.stringify(INITIAL_MATERIALS));
  }
}

const globalStoreKey = Symbol.for('construction_memory_store');
if (!(global as any)[globalStoreKey] || typeof (global as any)[globalStoreKey].renamePhase !== 'function') {
  const existingActivities = (global as any)[globalStoreKey]?.getActivities?.();
  const existingMaterials = (global as any)[globalStoreKey]?.getMaterials?.();
  const newStore = new MemoryStore();
  if (existingActivities && existingActivities.length > 0) newStore.setActivities(existingActivities);
  if (existingMaterials && existingMaterials.length > 0) newStore.setMaterials(existingMaterials);
  (global as any)[globalStoreKey] = newStore;
}

export const memoryStore: MemoryStore = (global as any)[globalStoreKey];
