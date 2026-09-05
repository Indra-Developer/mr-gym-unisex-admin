// File: src/services/settings.ts
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export interface Plan {
  id: string;
  name: string;
  duration: string;
  price: number;
}

export const getPlans = async (): Promise<Plan[]> => {
  try {
    const plansRef = collection(db, 'plans');
    const q = query(plansRef, orderBy('price', 'asc')); 
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Plan[];
  } catch (error) {
    console.error("Error fetching plans:", error);
    return [];
  }
};

export const addPlan = async (planData: Omit<Plan, 'id'>): Promise<void> => {
  try {
    const plansRef = collection(db, 'plans');
    await addDoc(plansRef, {
      name: planData.name,
      duration: planData.duration,
      price: Number(planData.price)
    });
  } catch (error) {
    console.error("Error adding plan:", error);
    throw error;
  }
};

export const updatePlan = async (id: string, planData: Partial<Plan>): Promise<void> => {
  try {
    const planRef = doc(db, 'plans', id);
    await updateDoc(planRef, {
      ...planData,
      price: planData.price ? Number(planData.price) : undefined
    });
  } catch (error) {
    console.error("Error updating plan:", error);
    throw error;
  }
};

export const deletePlan = async (id: string): Promise<void> => {
  try {
    const planRef = doc(db, 'plans', id);
    await deleteDoc(planRef);
  } catch (error) {
    console.error("Error deleting plan:", error);
    throw error;
  }
};