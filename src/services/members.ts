import { collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, COLLECTIONS } from './firebase';

export interface Member {
  id: string; 
  membershipId: string;
  fullName: string;
  profilePicUrl: string | null;
  mobileNumber: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  planType: string;
  accessShift: string;
  startDate: string;
  expiryDate: string;
  status: 'Active' | 'Expiring' | 'Expired' | 'Frozen' | 'Cancelled';
  totalFee: number;
  discount: number;
  amountPaid: number;
  balanceDue: number;
  createdAt: any;
}

// Fetch all members
export async function getMembers(): Promise<Member[]> {
  const membersRef = collection(db, COLLECTIONS.MEMBERS);
  const q = query(membersRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Member[];
}

// Fetch single member by ID
export async function getMember(id: string): Promise<Member | null> {
  const docRef = doc(db, COLLECTIONS.MEMBERS, id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) return { id: snapshot.id, ...snapshot.data() } as Member;
  return null;
}

// Upload Profile Image
export async function uploadProfilePicture(file: File, membershipId: string): Promise<string> {
  const fileExtension = file.name.split('.').pop();
  const storageRef = ref(storage, `profile_pictures/${membershipId}.${fileExtension}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// Create new member
export async function addMember(memberData: Omit<Member, 'id' | 'createdAt'>, profilePicFile: File | null): Promise<void> {
  let profilePicUrl = null;
  if (profilePicFile) profilePicUrl = await uploadProfilePicture(profilePicFile, memberData.membershipId);

  const newDocRef = doc(collection(db, COLLECTIONS.MEMBERS));
  await setDoc(newDocRef, { ...memberData, profilePicUrl, createdAt: Timestamp.now() });
}

// Update existing member
export async function updateMember(id: string, memberData: Partial<Member>, profilePicFile: File | null): Promise<void> {
  const updatePayload: any = { ...memberData };
  if (profilePicFile && memberData.membershipId) {
    updatePayload.profilePicUrl = await uploadProfilePicture(profilePicFile, memberData.membershipId);
  }
  const docRef = doc(db, COLLECTIONS.MEMBERS, id);
  await updateDoc(docRef, updatePayload);
}

// Delete member
export async function deleteMember(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.MEMBERS, id);
  await deleteDoc(docRef);
}

// Helper: Generate Professional WhatsApp Message Link
export const getWhatsAppLink = (member: Member) => {
  const phone = member.mobileNumber.length === 10 ? `91${member.mobileNumber}` : member.mobileNumber;
  const message = `Hello ${member.fullName},\n\nWelcome to MR GYM! Here are your membership details:\n\n*ID:* ${member.membershipId}\n*Plan:* ${member.planType}\n*Shift:* ${member.accessShift}\n*Expiry Date:* ${member.expiryDate}\n*Balance Due:* ₹${member.balanceDue}\n\nThank you for choosing MR GYM!`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};