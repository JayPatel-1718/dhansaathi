import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

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
  return ref;
}

export async function ensureUserDoc(firebaseUser) {
  const ref = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || "",
      email: firebaseUser.email || "",
      photoURL: firebaseUser.photoURL || "",
      provider: firebaseUser.providerData?.[0]?.providerId || "google",
      language: localStorage.getItem("dhan-saathi-language") || "hindi",

      tutorialCompleted: false,

      profileComplete: false,
      profile: { name: "", occupation: "", monthlyIncome: 0 },
      profileDraft: { name: "", occupation: "", monthlyIncome: 0 },

      stats: { schemesViewed: 0, schemesListened: 0 },

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(ref, {
      displayName: firebaseUser.displayName || "",
      email: firebaseUser.email || "",
      photoURL: firebaseUser.photoURL || "",
      language: localStorage.getItem("dhan-saathi-language") || "hindi",
      updatedAt: serverTimestamp(),
    });

    // Ensure defaults exist for older docs
    await setDoc(
      ref,
      {
        profileComplete: snap.data()?.profileComplete ?? false,
        profile: {
          name: snap.data()?.profile?.name ?? "",
          occupation: snap.data()?.profile?.occupation ?? "",
          monthlyIncome: snap.data()?.profile?.monthlyIncome ?? 0,
        },
        profileDraft: {
          name: snap.data()?.profileDraft?.name ?? "",
          occupation: snap.data()?.profileDraft?.occupation ?? "",
          monthlyIncome: snap.data()?.profileDraft?.monthlyIncome ?? 0,
        },
        stats: {
          schemesViewed: snap.data()?.stats?.schemesViewed ?? 0,
          schemesListened: snap.data()?.stats?.schemesListened ?? 0,
        },
      },
      { merge: true }
    );
  }

  return ref;
}

export async function getUserDoc(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

// ✅ Save partial progress while user is answering
export async function saveUserProfileDraft(uid, draft) {
  const ref = doc(db, "users", uid);
  await setDoc(
    ref,
    {
      profileComplete: false,
      profileDraft: {
        name: draft.name || "",
        occupation: draft.occupation || "",
        monthlyIncome: Number(draft.monthlyIncome || 0),
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return ref;
}

// ✅ Save final profile and clear draft
export async function saveUserProfile(uid, profile) {
  const ref = doc(db, "users", uid);
  await setDoc(
    ref,
    {
      profileComplete: true,
      profile: {
        name: profile.name || "",
        occupation: profile.occupation || "",
        monthlyIncome: Number(profile.monthlyIncome || 0),
      },
      // clear draft after completion
      profileDraft: { name: "", occupation: "", monthlyIncome: 0 },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return ref;
}