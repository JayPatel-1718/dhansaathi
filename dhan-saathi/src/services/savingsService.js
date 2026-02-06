import { db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

function pad(n) {
  return String(n).padStart(2, "0");
}

export function getMonthKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; // e.g. 2026-02
}

export function getDateKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; // e.g. 2026-02-06
}

/**
 * Stores a daily savings entry.
 * Collection path: users/{uid}/savingsEntries
 */
export async function addSavingsEntry(uid, amount, date = new Date()) {
  const monthKey = getMonthKey(date);
  const dateKey = getDateKey(date);

  return addDoc(collection(db, "users", uid, "savingsEntries"), {
    amount: Number(amount || 0),
    monthKey,
    dateKey,
    createdAt: serverTimestamp(),
  });
}