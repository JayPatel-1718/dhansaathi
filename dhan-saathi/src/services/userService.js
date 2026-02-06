// src/services/userService.js
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

  const defaults = {
    profileComplete: false,
    profile: {
      name: "",
      gender: "", // male | female | other | prefer_not_say
      age: 0,
      occupation: "",
      monthlyIncome: 0,
    },
    profileDraft: {
      name: "",
      gender: "",
      age: 0,
      occupation: "",
      monthlyIncome: 0,
    },
    stats: {
      schemesViewed: 0,
      schemesListened: 0,
    },
  };

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || "",
      email: firebaseUser.email || "",
      photoURL: firebaseUser.photoURL || "",
      provider: firebaseUser.providerData?.[0]?.providerId || "google",
      language: localStorage.getItem("dhan-saathi-language") || "hindi",
      tutorialCompleted: false,

      ...defaults,

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

    // Ensure older user docs also get the new fields
    const d = snap.data() || {};
    await setDoc(
      ref,
      {
        profileComplete: d.profileComplete ?? defaults.profileComplete,

        profile: {
          name: d.profile?.name ?? defaults.profile.name,
          gender: d.profile?.gender ?? defaults.profile.gender,
          age: d.profile?.age ?? defaults.profile.age,
          occupation: d.profile?.occupation ?? defaults.profile.occupation,
          monthlyIncome: d.profile?.monthlyIncome ?? defaults.profile.monthlyIncome,
        },

        profileDraft: {
          name: d.profileDraft?.name ?? defaults.profileDraft.name,
          gender: d.profileDraft?.gender ?? defaults.profileDraft.gender,
          age: d.profileDraft?.age ?? defaults.profileDraft.age,
          occupation: d.profileDraft?.occupation ?? defaults.profileDraft.occupation,
          monthlyIncome: d.profileDraft?.monthlyIncome ?? defaults.profileDraft.monthlyIncome,
        },

        stats: {
          schemesViewed: d.stats?.schemesViewed ?? defaults.stats.schemesViewed,
          schemesListened: d.stats?.schemesListened ?? defaults.stats.schemesListened,
        },

        updatedAt: serverTimestamp(),
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

// ✅ Draft save: includes gender + age
export async function saveUserProfileDraft(uid, draft) {
  const ref = doc(db, "users", uid);
  await setDoc(
    ref,
    {
      profileComplete: false,
      profileDraft: {
        name: draft.name || "",
        gender: draft.gender || "",
        age: Number(draft.age || 0),
        occupation: draft.occupation || "",
        monthlyIncome: Number(draft.monthlyIncome || 0),
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return ref;
}

// ✅ Final save: includes gender + age + clears draft
export async function saveUserProfile(uid, profile) {
  const ref = doc(db, "users", uid);
  await setDoc(
    ref,
    {
      profileComplete: true,
      profile: {
        name: profile.name || "",
        gender: profile.gender || "",
        age: Number(profile.age || 0),
        occupation: profile.occupation || "",
        monthlyIncome: Number(profile.monthlyIncome || 0),
      },
      profileDraft: {
        name: "",
        gender: "",
        age: 0,
        occupation: "",
        monthlyIncome: 0,
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return ref;
}