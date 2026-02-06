import { db } from "../firebase";
import {
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

function newId() {
  return (crypto?.randomUUID?.() || `chat_${Date.now()}`);
}

export async function ensureChatSession(uid, sessionId) {
  const sid = sessionId || newId();
  await setDoc(
    doc(db, "users", uid, "aiChats", sid),
    { createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
    { merge: true }
  );
  return sid;
}

export async function addChatMessage(uid, sessionId, role, text, meta = {}) {
  await addDoc(collection(db, "users", uid, "aiChats", sessionId, "messages"), {
    role, // "user" | "assistant"
    text,
    meta,
    createdAt: serverTimestamp(),
  });

  await setDoc(
    doc(db, "users", uid, "aiChats", sessionId),
    { updatedAt: serverTimestamp() },
    { merge: true }
  );
}