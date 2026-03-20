import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

/**
 * 1. Auto Currency Conversion / Dynamic Pricing trigger (Dummy implementation)
 * Could listen to an exchange rate API and update a config document.
 */
export const updateExchangeRates = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    // Fetch rates from API and update Firestore
    const dummyRates = { USD: 1, INR: 83.5, EUR: 0.92 };
    await db.collection('config').doc('exchangeRates').set(dummyRates);
    console.log('Exchange rates updated');
  });

/**
 * 2. Order Confirmation Email & Push Notification trigger
 * Triggered when a new order is created in Firestore.
 */
export const onOrderCreated = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const userId = order.userId;

    // Send Push Notification (FCM)
    const userDoc = await db.collection('users').doc(userId).get();
    const user = userDoc.data();
    
    if (user?.fcmToken) {
      const payload = {
        notification: {
          title: 'Order Confirmed! 🍫',
          body: `Your order #${context.params.orderId} is processing.`,
        },
      };
      await admin.messaging().sendToDevice(user.fcmToken, payload);
    }

    // Example logic to send Email would be here via SendGrid/Mailgun or Firebase Extension
    return null;
  });

/**
 * 3. Shipping Fee Calculation Endpoint
 * Called from frontend to calculate shipping based on country and total amount.
 */
export const calculateShipping = functions.https.onCall((data, context) => {
  const { country, cartTotal } = data;
  let shippingFee = 20; // Default flat rate USD

  if (country === 'US' || country === 'IN') {
    shippingFee = 10;
  }
  if (cartTotal > 150) {
    shippingFee = 0; // Free shipping over $150
  }

  return { shippingFee, currency: 'USD' };
});

/**
 * 4. Fraud Detection (Basic Logic / Velocity checks)
 * Triggered on order creation to flag suspicious transactions.
 */
export const basicFraudDetection = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    if (order.totalAmount > 5000) {
      // Flag for manual review
      await snap.ref.update({ isFlagged: true, orderStatus: 'ManualReview' });
      // Notify Admin
      await db.collection('adminNotifications').add({
        title: 'High Value Order Flagged',
        orderId: context.params.orderId,
        amount: order.totalAmount,
      });
    }
  });
