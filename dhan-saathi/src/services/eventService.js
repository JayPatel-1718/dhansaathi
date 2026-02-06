import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export function logUserEvent(uid, type, data = {}) {
  if (!uid) return Promise.resolve();
  return addDoc(collection(db, "users", uid, "events"), {
    type,
    data,
    createdAt: serverTimestamp(),
  }).catch(console.error);
}