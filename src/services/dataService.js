import { collection, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { db, firebaseEnabled } from "../lib/firebase";

const localKey = (name) => "ofc_" + name;

export async function loadCollection(name, fallback = []) {
  if (!firebaseEnabled) {
    try { return JSON.parse(localStorage.getItem(localKey(name))) || fallback; } catch { return fallback; }
  }
  const snap = await getDocs(collection(db, name));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveCollection(name, rows) {
  if (!firebaseEnabled) {
    localStorage.setItem(localKey(name), JSON.stringify(rows));
    return;
  }
  const existing = await getDocs(collection(db, name));
  const keep = new Set(rows.map(r => String(r.id)));
  await Promise.all(existing.docs.filter(d => !keep.has(d.id)).map(d => deleteDoc(d.ref)));
  await Promise.all(rows.map(row => setDoc(doc(db, name, String(row.id)), row, { merge: true })));
}
