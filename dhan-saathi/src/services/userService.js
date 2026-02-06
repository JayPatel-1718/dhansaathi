// src/services/userService.js
import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function upsertUser(uid, data) {
  const ref = doc(db, "users", uid);

  await setDoc(
    ref,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}