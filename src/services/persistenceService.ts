import { db, auth } from "../lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { AnalysisReport } from "../types";
import { handleFirestoreError } from "../lib/firestoreUtils";

export interface StoredReport extends AnalysisReport {
  id?: string;
  userId: string;
  createdAt: any;
  sourceType: 'raw' | 'web' | 'surveillance';
  sourceUrl?: string;
  title: string;
}

export interface MonitoredTarget {
  id?: string;
  userId: string;
  url: string;
  isActive: boolean;
  createdAt: any;
  lastAnalyzed?: any;
}

export const persistenceService = {
  async saveReport(report: AnalysisReport, sourceType: 'raw' | 'web' | 'surveillance', sourceUrl?: string) {
    if (!auth.currentUser) return;

    const reportData = {
      ...report,
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
      sourceType,
      sourceUrl: sourceUrl || "",
      title: report.chartTitle || (sourceType === 'web' ? sourceUrl : 'Data Analysis') || 'New Report'
    };

    try {
      const docRef = await addDoc(collection(db, "reports"), reportData);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, 'create', 'reports');
    }
  },

  subscribeToReports(callback: (reports: StoredReport[]) => void) {
    if (!auth.currentUser) return () => {};

    const q = query(
      collection(db, "reports"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const reports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StoredReport[];
      callback(reports);
    }, (error) => {
      console.error("Reports subscription error:", error);
      // onSnapshot error callback doesn't support throwing traditionally but we can log processed error
      try {
        handleFirestoreError(error, 'list', 'reports');
      } catch (processedError) {
        console.error(processedError);
      }
    });
  },

  async toggleMonitoring(url: string, isActive: boolean) {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "monitoredTargets"),
      where("userId", "==", auth.currentUser.uid),
      where("url", "==", url)
    );

    try {
      const snapshot = await persistenceService.getRecentSnapshot(q);
      if (!snapshot.empty) {
        const docRef = doc(db, "monitoredTargets", snapshot.docs[0].id);
        await updateDoc(docRef, { 
          isActive, 
          lastAnalyzed: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return docRef.id;
      } else {
        const targetData = {
          userId: auth.currentUser.uid,
          url,
          isActive,
          createdAt: serverTimestamp(),
          lastAnalyzed: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, "monitoredTargets"), targetData);
        return docRef.id;
      }
    } catch (error) {
      handleFirestoreError(error, 'update', 'monitoredTargets');
    }
  },

  async updateLastAnalyzed(url: string) {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "monitoredTargets"),
      where("userId", "==", auth.currentUser.uid),
      where("url", "==", url)
    );
    try {
      const snapshot = await persistenceService.getRecentSnapshot(q);
      if (!snapshot.empty) {
        const docRef = doc(db, "monitoredTargets", snapshot.docs[0].id);
        await updateDoc(docRef, { 
          lastAnalyzed: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, 'update', 'monitoredTargets');
    }
  },

  // Helper for internal use
  async getRecentSnapshot(q: any) {
    const { getDocs } = await import("firebase/firestore");
    try {
      return await getDocs(q);
    } catch (error) {
      handleFirestoreError(error, 'list');
    }
  },

  subscribeToMonitoring(callback: (targets: MonitoredTarget[]) => void) {
    if (!auth.currentUser) return () => {};

    const q = query(
      collection(db, "monitoredTargets"),
      where("userId", "==", auth.currentUser.uid)
    );

    return onSnapshot(q, (snapshot) => {
      const targets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MonitoredTarget[];
      callback(targets);
    }, (error) => {
      console.error("Monitoring subscription error:", error);
      try {
        handleFirestoreError(error, 'list', 'monitoredTargets');
      } catch (processedError) {
        console.error(processedError);
      }
    });
  }
};
