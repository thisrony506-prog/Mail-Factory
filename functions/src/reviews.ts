import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const onReviewStatusChanged = functions.firestore
  .document("reviews/{userId}")
  .onWrite(async (change, context) => {
    // Only proceed if status changes to or from 'approved'
    const before = change.before.exists ? change.before.data() : null;
    const after = change.after.exists ? change.after.data() : null;

    const wasApproved = before?.status === "approved";
    const isApproved = after?.status === "approved";

    if (wasApproved === isApproved) {
      // Status didn't change regarding 'approved', or both null
      // But wait, if rating changed while approved, we should recalculate.
      if (wasApproved && isApproved && before?.rating === after?.rating) {
        return null; 
      }
    }

    // Recalculate average
    const reviewsRef = db.collection("reviews");
    const snapshot = await reviewsRef.where("status", "==", "approved").get();

    let totalRating = 0;
    let totalCount = snapshot.size;
    let starDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    snapshot.forEach(doc => {
      const data = doc.data();
      const r = data.rating || 0;
      if (r >= 1 && r <= 5) {
        totalRating += r;
        starDist[r] = (starDist[r] || 0) + 1;
      }
    });

    const avgRating = totalCount > 0 ? totalRating / totalCount : 5.0;

    await db.collection("system").doc("reviewStats").set({
      avgRating,
      totalCount,
      starDist,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return null;
  });
