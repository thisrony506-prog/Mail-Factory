import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.database();

const APP_PASSWORD = (process.env.GMAIL_APP_PASSWORD || "afzl lweh krfl irf").replace(/\s+/g, "");

const getTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mailfactorybd@gmail.com",
      pass: APP_PASSWORD,
    },
  });
};

/**
 * 1. Automatic Admin Custom Claim Assigner
 * Automatically assigns admin custom claim to verified admin emails upon user creation.
 */
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const email = user.email ? user.email.toLowerCase().trim() : null;
  const displayName = user.displayName || "User";

  if (!email) return null;

  // Set Custom Claims for authorized admin accounts
  if (email === "gmrony135@gmail.com" || email === "mailfactorybd@gmail.com") {
    try {
      await admin.auth().setCustomUserClaims(user.uid, { admin: true });
      console.log(`Granted admin custom claims to ${email}`);
    } catch (err) {
      console.error(`Failed to set admin custom claims for ${email}:`, err);
    }
  }

  // Send Welcome Email
  if (APP_PASSWORD) {
    const transporter = getTransporter();
    const mailOptions = {
      from: '"Mail Factory" <mailfactorybd@gmail.com>',
      to: email,
      subject: "Welcome to Mail Factory 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #4F46E5; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px;">Welcome to Mail Factory! 🎉</h1>
          </div>
          <div style="padding: 24px;">
            <p>Hello <strong>${displayName}</strong>,</p>
            <p>Your account has been successfully created with email: <strong>${email}</strong>.</p>
            <p>We are thrilled to welcome you to Bangladesh's #1 Trusted Gmail Exchange Platform. You can now exchange verified accounts and withdraw funds seamlessly.</p>
            
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <h3 style="margin-top: 0; color: #4F46E5; font-size: 16px;">Security Tips:</h3>
              <ul style="margin-bottom: 0; padding-left: 20px; font-size: 14px; color: #475569;">
                <li>Keep your password confidential.</li>
                <li>Mail Factory staff will never ask for your password.</li>
                <li>Track exchange rates live from the platform.</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 28px;">
              <a href="https://www.mailfectory.top/" style="display: inline-block; background-color: #4F46E5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">Go to Dashboard</a>
            </div>
            
            <p style="margin-top: 32px; font-size: 13px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px;">
              © ${new Date().getFullYear()} Mail Factory. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${email}`);
    } catch (error) {
      console.error(`Error sending welcome email to ${email}:`, error);
    }
  }

  return null;
});

/**
 * 2. Withdrawal Status Change Handler
 * Handles Paid confirmation emails, in-app notifications, and safe server-side refunds on rejection.
 */
export const onWithdrawStatusChange = functions.database
  .ref("/withdraw_requests/{requestId}")
  .onUpdate(async (change, context) => {
    const before = change.before.val();
    const after = change.after.val();
    const requestId = context.params.requestId;

    if (!after || !before) return null;

    const userId = after.userId;
    const amount = Number(after.amount) || 0;
    const paymentMethod = after.paymentMethod || after.method || "Account";
    const paymentNumber = after.accountNumber || after.paymentNumber || "N/A";
    const trxId = after.trxId || after.id || requestId;

    // Case A: Status changed to 'paid' or 'approved' or 'completed'
    const isNowPaid = ["paid", "approved", "completed"].includes(after.status);
    const wasPaid = ["paid", "approved", "completed"].includes(before.status);

    if (isNowPaid && !wasPaid && !after.paidEmailSent) {
      // Mark flag first to prevent duplicate email executions
      await change.after.ref.child("paidEmailSent").set(true);

      // In-app Notification
      try {
        await db.ref(`users/${userId}/notifications`).push({
          title: "Payment Received 💰",
          desc: `Your withdrawal of ৳${amount} via ${paymentMethod} (${paymentNumber}) has been completed. TrxID: ${trxId}`,
          type: "success",
          read: false,
          timestamp: Date.now(),
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        });
      } catch (err) {
        console.error("Error pushing withdrawal notification:", err);
      }

      // Email Notification
      if (APP_PASSWORD) {
        try {
          const userRecord = await admin.auth().getUser(userId);
          const email = userRecord.email;
          const displayName = userRecord.displayName || "User";

          if (email) {
            const transporter = getTransporter();
            await transporter.sendMail({
              from: '"Mail Factory" <mailfactorybd@gmail.com>',
              to: email,
              subject: `Payment Processed: ৳${amount} Sent 💰`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                  <div style="background-color: #10B981; padding: 24px; text-align: center; color: #ffffff;">
                    <h2 style="margin: 0;">Payment Successfully Sent! 💰</h2>
                  </div>
                  <div style="padding: 24px;">
                    <p>Hello <strong>${displayName}</strong>,</p>
                    <p>Your withdrawal request has been verified and processed by the admin team.</p>
                    
                    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bbf7d0;">
                      <h1 style="margin: 0; color: #047857; text-align: center; font-size: 32px;">৳${amount.toFixed(2)}</h1>
                      <table style="width: 100%; font-size: 14px; margin-top: 16px; border-collapse: collapse;">
                        <tr><td style="padding: 6px 0; color: #64748b;">Method:</td><td style="text-align: right; font-weight: bold;">${paymentMethod}</td></tr>
                        <tr><td style="padding: 6px 0; color: #64748b;">Account No:</td><td style="text-align: right; font-weight: bold;">${paymentNumber}</td></tr>
                        <tr><td style="padding: 6px 0; color: #64748b;">Transaction ID:</td><td style="text-align: right; font-family: monospace; font-weight: bold;">${trxId}</td></tr>
                        <tr><td style="padding: 6px 0; color: #64748b;">Status:</td><td style="text-align: right; color: #10B981; font-weight: bold;">Paid</td></tr>
                      </table>
                    </div>

                    <p style="font-size: 14px; color: #64748b;">Thank you for trusting Mail Factory!</p>
                  </div>
                </div>
              `,
            });
            console.log(`Payment email sent to ${email}`);
          }
        } catch (err) {
          console.error("Error sending payment success email:", err);
        }
      }
    }

    // Case B: Status changed to 'rejected'
    const isNowRejected = after.status === "rejected";
    const wasRejected = before.status === "rejected";

    if (isNowRejected && !wasRejected && !after.rejectedRefunded) {
      // Mark refunded to prevent duplicate refunds
      await change.after.ref.child("rejectedRefunded").set(true);

      // Safe Server-Side Balance Refund Transaction
      try {
        const userBalRef = db.ref(`users/${userId}/balance`);
        await userBalRef.transaction((currentBalance) => {
          return (Number(currentBalance) || 0) + amount;
        });
        console.log(`Refunded ৳${amount} back to user ${userId}`);
      } catch (err) {
        console.error(`Failed to refund balance to user ${userId}:`, err);
      }

      // In-app Notification
      const reason = after.adminNote || "Details did not match verification criteria.";
      try {
        await db.ref(`users/${userId}/notifications`).push({
          title: "Withdrawal Rejected ❌",
          desc: `Your withdrawal of ৳${amount} was rejected (${reason}). ৳${amount} has been refunded to your main balance.`,
          type: "error",
          read: false,
          timestamp: Date.now(),
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        });
      } catch (err) {
        console.error("Error pushing rejection notification:", err);
      }

      // Email Notification
      if (APP_PASSWORD) {
        try {
          const userRecord = await admin.auth().getUser(userId);
          const email = userRecord.email;
          const displayName = userRecord.displayName || "User";

          if (email) {
            const transporter = getTransporter();
            await transporter.sendMail({
              from: '"Mail Factory" <mailfactorybd@gmail.com>',
              to: email,
              subject: `Withdrawal Request Update (Refunded) ⚠️`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                  <div style="background-color: #EF4444; padding: 24px; text-align: center; color: #ffffff;">
                    <h2 style="margin: 0;">Withdrawal Update</h2>
                  </div>
                  <div style="padding: 24px;">
                    <p>Hello <strong>${displayName}</strong>,</p>
                    <p>Your withdrawal request for <strong>৳${amount}</strong> could not be processed.</p>
                    <p><strong>Reason:</strong> ${reason}</p>
                    <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #fecaca; color: #991b1b;">
                      <strong>Note:</strong> The full amount of ৳${amount} has been safely refunded to your account balance.
                    </div>
                    <p style="font-size: 14px; color: #64748b;">Please verify your payout credentials and submit a new request if needed.</p>
                  </div>
                </div>
              `,
            });
          }
        } catch (err) {
          console.error("Error sending rejection email:", err);
        }
      }
    }

    return null;
  });

/**
 * 3. Submission Status Change Handler
 * Automatically credits user balance and total earnings atomically on server-side when approved.
 */
export const onSubmissionStatusChange = functions.database
  .ref("/submissions/{subId}")
  .onUpdate(async (change, context) => {
    const before = change.before.val();
    const after = change.after.val();

    if (!before || !after) return null;

    const isNowApproved = after.status === "approved";
    const wasApproved = before.status === "approved";
    const isNowRejected = after.status === "rejected";
    const wasRejected = before.status === "rejected";

    if (isNowRejected && !wasRejected) {
      const userId = after.userId;
      const totalAmount = Number(after.totalAmount) || 0;
      const count = Number(after.count) || Number(after.quantity) || 1;

      // If it was previously credited or approved, deduct from balance & totalEarnings
      if (after.balanceCredited || wasApproved) {
        try {
          await db.ref(`users/${userId}`).transaction((user) => {
            if (!user) return user;
            return {
              ...user,
              balance: Math.max(0, (Number(user.balance) || 0) - totalAmount),
              totalEarnings: Math.max(0, (Number(user.totalEarnings) || 0) - totalAmount),
              manual_approved_count: Math.max(0, (Number(user.manual_approved_count) || 0) - count),
            };
          });
          console.log(`Deducted ৳${totalAmount} from user ${userId} for rejected submission`);
        } catch (err) {
          console.error(`Failed to deduct balance for rejected submission for user ${userId}:`, err);
        }
        await change.after.ref.child("balanceCredited").set(false);
      }

      // Push notification
      const reason = after.adminNote || after.rejectReason || "Submission did not meet quality guidelines.";
      try {
        await db.ref(`users/${userId}/notifications`).push({
          title: "Submission Rejected ❌",
          desc: `Your submission for ${count} Gmail(s) was rejected. Reason: ${reason}`,
          type: "error",
          read: false,
          timestamp: Date.now(),
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        });
      } catch (err) {
        console.error("Error pushing submission rejection notification:", err);
      }
    }

    if (isNowApproved && !wasApproved && !after.balanceCredited) {
      // Mark credited immediately
      await change.after.ref.child("balanceCredited").set(true);

      const userId = after.userId;
      const totalAmount = Number(after.totalAmount) || 0;
      const count = Number(after.count) || Number(after.quantity) || 1;

      // Safe Server-Side Balance & Earnings Credit Transaction
      try {
        await db.ref(`users/${userId}`).transaction((user) => {
          if (!user) return user;
          return {
            ...user,
            balance: (Number(user.balance) || 0) + totalAmount,
            totalEarnings: (Number(user.totalEarnings) || 0) + totalAmount,
            manual_approved_count: (Number(user.manual_approved_count) || 0) + count,
          };
        });
        console.log(`Credited ৳${totalAmount} to user ${userId} for approved submission`);
      } catch (err) {
        console.error(`Failed to credit balance for user ${userId}:`, err);
      }

      // Check if user was referred by someone to credit commission based on Admin Settings
      try {
        const userSnap = await db.ref(`users/${userId}`).once("value");
        const userData = userSnap.val();
        if (userData && userData.referredBy) {
          const referrerId = userData.referredBy;
          if (referrerId !== userId) {
            // Fetch dynamic commission percent from settings
            const settingsSnap = await db.ref("settings").once("value");
            const settingsVal = settingsSnap.val() || {};
            const commissionPercent = Number(settingsVal.commission_percent) || 10;

            const commissionAmount = (totalAmount * commissionPercent) / 100;
            if (commissionAmount > 0) {
              await db.ref(`users/${referrerId}`).transaction((refUser) => {
                if (!refUser) return refUser;
                const currentRefEarnings = Number(refUser.referralEarnings) || 0;
                const currentBalance = Number(refUser.balance) || 0;
                return {
                  ...refUser,
                  balance: currentBalance + commissionAmount,
                  referralEarnings: currentRefEarnings + commissionAmount,
                };
              });
              await db.ref(`users/${referrerId}/notifications`).push({
                title: "Referral Commission Earned! 🎁",
                desc: `You received ৳${commissionAmount.toFixed(2)} (${commissionPercent}%) commission from your referred friend's approved submission.`,
                type: "success",
                read: false,
                timestamp: Date.now(),
                time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to credit referral commission:", err);
      }

      // Push notification
      try {
        await db.ref(`users/${userId}/notifications`).push({
          title: "Submission Approved! ✅",
          desc: `Your submission for ${count} Gmail(s) has been approved. ৳${totalAmount.toFixed(2)} added to your balance.`,
          type: "success",
          read: false,
          timestamp: Date.now(),
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        });
      } catch (err) {
        console.error("Error pushing submission approval notification:", err);
      }
    }

    return null;
  });

/**
 * 3. Fraud Detection for Referral Registrations
 * Automatically checks for duplicate IP addresses or device IDs upon referral account creation
 * to flag and prevent potential fraudulent signups before admin review.
 */
export const checkFraudulentSignup = functions.database
  .ref("/users/{uid}")
  .onCreate(async (snapshot, context) => {
    const newUser = snapshot.val();
    const uid = context.params.uid;

    if (!newUser || !newUser.referredBy) {
      return null;
    }

    const deviceId = newUser.deviceId;
    const ipAddress = newUser.ipAddress;

    if (!deviceId && !ipAddress) {
      return null;
    }

    try {
      const usersSnap = await db.ref("users").once("value");
      const allUsers = usersSnap.val() || {};

      let isFraud = false;
      let matchedReason = "";

      for (const [existingUid, existingUser] of Object.entries(allUsers) as [string, any][]) {
        if (existingUid === uid) continue;
        if (!existingUser) continue;

        if (deviceId && existingUser.deviceId && deviceId === existingUser.deviceId) {
          isFraud = true;
          matchedReason = `Duplicate Device ID match with user ${existingUid}`;
          break;
        }

        if (ipAddress && existingUser.ipAddress && ipAddress === existingUser.ipAddress && ipAddress !== "127.0.0.1" && ipAddress !== "localhost") {
          isFraud = true;
          matchedReason = `Duplicate IP Address match (${ipAddress}) with user ${existingUid}`;
          break;
        }
      }

      if (isFraud) {
        await snapshot.ref.update({
          isFraudulent: true,
          fraudReason: matchedReason,
          status: "flagged",
          holdBonus: true,
        });

        await db.ref("admin_notifications").push({
          title: "🚨 Fraudulent Referral Signup Flagged",
          desc: `User ${newUser.username || uid} was flagged due to: ${matchedReason}. Referred by: ${newUser.referredBy}`,
          type: "warning",
          timestamp: Date.now(),
          read: false,
        });
      }
    } catch (err) {
      console.error("Error in checkFraudulentSignup:", err);
    }

    return null;
  });

export * from "./reviews";
