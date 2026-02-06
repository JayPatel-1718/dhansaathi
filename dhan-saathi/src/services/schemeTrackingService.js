import { db } from "../firebase";
import {
  doc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { logUserEvent } from "./eventService";

export async function trackSchemeView(uid, scheme) {
  if (!uid) return;

  // increment counter
  await updateDoc(doc(db, "users", uid), {
    "stats.schemesViewed": increment(1),
    updatedAt: serverTimestamp(),
  });

  // store/update recent scheme (by schemeId)
  await setDoc(
    doc(db, "users", uid, "recentSchemes", scheme.id),
    {
      schemeId: scheme.id,
      title: scheme.title,
      tag: scheme.tag,
      type: scheme.type,
      lastViewedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // log event
  await logUserEvent(uid, "scheme_view_details", {
    schemeId: scheme.id,
    title: scheme.title,
  });
}

export async function trackSchemeListen(uid, scheme) {
  if (!uid) return;

  await updateDoc(doc(db, "users", uid), {
    "stats.schemesListened": increment(1),
    updatedAt: serverTimestamp(),
  });

  await logUserEvent(uid, "scheme_listen", {
    schemeId: scheme.id,
    title: scheme.title,
  });
}