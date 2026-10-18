import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  SEED_USERS,
  SEED_DEPARTMENTS,
  SEED_DOCTORS,
  SEED_APPOINTMENTS,
  SEED_QUEUE,
  SEED_PATIENT_RECORDS,
  SEED_NOTIFICATIONS,
  SEED_TRIAGE_RULES,
  SEED_FAQ_RESPONSES
} from '../seeds/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

class DatabaseStore {
  constructor() {
    this.data = null;
    this.isSaving = false;
    this.pendingSave = false;
  }

  init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(STORE_FILE)) {
      try {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        console.log('✅ Loaded existing persistent database store from disk');
        return;
      } catch (err) {
        console.error('⚠️ Could not parse store.json, re-seeding default database:', err.message);
      }
    }

    // Seed defaults
    this.data = {
      users: [...SEED_USERS],
      departments: [...SEED_DEPARTMENTS],
      doctors: [...SEED_DOCTORS],
      appointments: [...SEED_APPOINTMENTS],
      queue: [...SEED_QUEUE],
      records: { ...SEED_PATIENT_RECORDS },
      notifications: [...SEED_NOTIFICATIONS],
      triageRules: [...SEED_TRIAGE_RULES],
      faqs: [...SEED_FAQ_RESPONSES]
    };

    this.saveSync();
    console.log('✨ Seeded fresh MediFlow hospital database store with initial records');
  }

  saveSync() {
    try {
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('❌ Failed to save database sync:', e);
    }
  }

  async save() {
    if (this.isSaving) {
      this.pendingSave = true;
      return;
    }
    this.isSaving = true;
    try {
      await fs.promises.writeFile(STORE_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('❌ Failed to persist store to disk:', err);
    } finally {
      this.isSaving = false;
      if (this.pendingSave) {
        this.pendingSave = false;
        this.save();
      }
    }
  }

  get(collection) {
    return this.data[collection] || [];
  }

  find(collection, filterFn) {
    const list = this.get(collection);
    return filterFn ? list.filter(filterFn) : list;
  }

  findOne(collection, filterFn) {
    const list = this.get(collection);
    return list.find(filterFn) || null;
  }

  insert(collection, item) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    this.data[collection].push(item);
    this.save();
    return item;
  }

  update(collection, filterFn, updater) {
    const list = this.get(collection);
    let updatedCount = 0;
    this.data[collection] = list.map(item => {
      if (filterFn(item)) {
        updatedCount++;
        return typeof updater === 'function' ? updater(item) : { ...item, ...updater };
      }
      return item;
    });
    if (updatedCount > 0) {
      this.save();
    }
    return updatedCount;
  }

  delete(collection, filterFn) {
    const list = this.get(collection);
    const initialLen = list.length;
    this.data[collection] = list.filter(item => !filterFn(item));
    const deletedCount = initialLen - this.data[collection].length;
    if (deletedCount > 0) {
      this.save();
    }
    return deletedCount;
  }

  // Helper for records dictionary
  getRecord(patientId) {
    return this.data.records?.[patientId] || null;
  }

  updateRecord(patientId, updater) {
    if (!this.data.records) this.data.records = {};
    const current = this.data.records[patientId] || { patientId, vitalsHistory: [], allergies: [], chronicConditions: [], activeMedications: [], labReports: [] };
    const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
    this.data.records[patientId] = updated;
    this.save();
    return updated;
  }
}

export const db = new DatabaseStore();
db.init();
