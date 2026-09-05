import { collection, doc, getDoc, setDoc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

// --- INTERFACES ---
export interface GymInfo {
  gymName: string;
  address: string;
  mobileNumber: string;
  email: string;
  whatsappNumber: string;
  logoUrl: string | null;
}

export interface InvoiceSettings {
  prefix: string;
  footerText: string;
  adminEmail: string;
}

export interface Plan {
  id: string;
  name: string;
  duration: string;
  price: number;
}

const SETTINGS_DOC = 'global_settings';

// --- GLOBAL SETTINGS (GYM INFO & INVOICES) ---

export async function getGlobalSettings() {
  const docRef = doc(db, 'settings', SETTINGS_DOC);
  const snapshot = await getDoc(docRef);
  
  if (snapshot.exists()) {
    return snapshot.data() as { gymInfo: GymInfo; invoiceSettings: InvoiceSettings };
  }
  
  // Return default values if it's the very first time loading
  return {
    gymInfo: { gymName: 'MR GYM', address: '', mobileNumber: '', email: '', whatsappNumber: '', logoUrl: null },
    invoiceSettings: { prefix: 'INV-', footerText: 'Thank you for your business!', adminEmail: '' }
  };
}

export async function saveGymInfo(data: GymInfo, logoFile: File | null) {
  let logoUrl = data.logoUrl;
  
  // If a new logo was uploaded, save it to Firebase Storage first
  if (logoFile) {
    const fileExtension = logoFile.name.split('.').pop();
    const logoRef = ref(storage, `settings/gym_logo_${Date.now()}.${fileExtension}`);
    await uploadBytes(logoRef, logoFile);
    logoUrl = await getDownloadURL(logoRef);
  }

  const docRef = doc(db, 'settings', SETTINGS_DOC);
  await setDoc(docRef, { gymInfo: { ...data, logoUrl } }, { merge: true });
  
  return logoUrl;
}

export async function saveInvoiceSettings(data: InvoiceSettings) {
  const docRef = doc(db, 'settings', SETTINGS_DOC);
  await setDoc(docRef, { invoiceSettings: data }, { merge: true });
}


// --- MEMBERSHIP PLANS (CRUD) ---

export async function getPlans(): Promise<Plan[]> {
  const plansRef = collection(db, 'membership_plans');
  const snapshot = await getDocs(plansRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Plan[];
}

export async function addPlan(data: Omit<Plan, 'id'>): Promise<void> {
  await addDoc(collection(db, 'membership_plans'), data);
}

export async function updatePlan(id: string, data: Partial<Plan>): Promise<void> {
  const docRef = doc(db, 'membership_plans', id);
  await updateDoc(docRef, data);
}

export async function deletePlan(id: string): Promise<void> {
  const docRef = doc(db, 'membership_plans', id);
  await deleteDoc(docRef);
}