import { collection, getDocs, doc, setDoc, getDoc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db, COLLECTIONS } from './firebase';
// import { getMember } from './members';

export interface Payment {
  id: string;
  invoiceNumber: string;
  memberId: string;
  memberName: string;
  membershipId: string;
  transactionDate: string;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
  totalFee: number;
  discount: number;
  amountPaid: number;
  balanceDue: number;
  status: 'Paid' | 'Partial' | 'Due';
  createdAt: any;
}

// Helper to generate Invoice Number (e.g., INV-1001)
const generateInvoiceNumber = () => `INV-${Math.floor(1000 + Math.random() * 9000)}`;

export async function getPayments(): Promise<Payment[]> {
  const paymentsRef = collection(db, COLLECTIONS.PAYMENTS);
  const q = query(paymentsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Payment[];
}

export async function getPayment(id: string): Promise<Payment | null> {
  const docRef = doc(db, COLLECTIONS.PAYMENTS, id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) return { id: snapshot.id, ...snapshot.data() } as Payment;
  return null;
}

export async function recordPayment(data: Omit<Payment, 'id' | 'invoiceNumber' | 'status' | 'createdAt'>): Promise<string> {
  const invoiceNumber = generateInvoiceNumber();
  let status: 'Paid' | 'Partial' | 'Due' = 'Due';
  
  if (data.balanceDue === 0 && data.amountPaid > 0) status = 'Paid';
  else if (data.amountPaid > 0 && data.balanceDue > 0) status = 'Partial';

  const newDocRef = doc(collection(db, COLLECTIONS.PAYMENTS));
  const paymentPayload = { ...data, invoiceNumber, status, createdAt: Timestamp.now() };
  
  await setDoc(newDocRef, paymentPayload);

  // Update the member's outstanding balance in the members collection
  if (data.memberId) {
    const memberRef = doc(db, COLLECTIONS.MEMBERS, data.memberId);
    await updateDoc(memberRef, { balanceDue: data.balanceDue });
  }

  return newDocRef.id; // Return ID so we can navigate to the invoice
}

export async function updatePayment(id: string, data: Partial<Payment>): Promise<void> {
  let status: 'Paid' | 'Partial' | 'Due' = 'Due';
  if (data.balanceDue === 0 && (data.amountPaid || 0) > 0) status = 'Paid';
  else if ((data.amountPaid || 0) > 0 && (data.balanceDue || 0) > 0) status = 'Partial';

  const docRef = doc(db, COLLECTIONS.PAYMENTS, id);
  await updateDoc(docRef, { ...data, status });

  // Update member balance
  if (data.memberId && data.balanceDue !== undefined) {
    const memberRef = doc(db, COLLECTIONS.MEMBERS, data.memberId);
    await updateDoc(memberRef, { balanceDue: data.balanceDue });
  }
}

export async function deletePayment(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.PAYMENTS, id);
  await deleteDoc(docRef);
}

export const getPaymentWhatsAppLink = (payment: Payment, phone: string) => {
  const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
  const message = `Hello ${payment.memberName},\n\nYour payment of ₹${payment.amountPaid} has been recorded successfully.\n\n*Invoice:* ${payment.invoiceNumber}\n*Date:* ${payment.transactionDate}\n*Mode:* ${payment.paymentMode}\n*Balance Due:* ₹${payment.balanceDue}\n\nThank you for choosing MR GYM.`;
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};