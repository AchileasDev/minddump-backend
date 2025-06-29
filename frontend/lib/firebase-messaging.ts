import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AZasSyDzs_MRtj6Bmx7M4rgDjIDX-b9sX5dDrSA",
  authDomain: "minddump-v1.firebaseapp.com",
  projectId: "minddump-v1",
  storageBucket: "minddump-v1.appspot.com",
  messagingSenderId: "1042730464745",
  appId: "1:1042730464745:web:86606dbbbfcdf18ac0778",
  measurementId: "G-ZH4XEMJQ1G"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestPermission = async (): Promise<string | undefined> => {
  console.log("Requesting notification permission...");
  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    console.log("Notification permission granted.");
    const token = await getToken(messaging, {
      vapidKey: "BImUOcJ1F4kTYW7bh3IpQyMQBQbH63Rj1nGlTygGMIhO8EctAikvmtgcIwRpoXcbnWy5-Tm2WVD_OMbeMdvxi_w"
    });

    if (token) {
      console.log("FCM Token:", token);
      // You can send this token to your backend to send push notifications
      return token;
    } else {
      console.log("No registration token available.");
      return undefined;
    }
  } else {
    console.log("Notification permission not granted.");
    return undefined;
  }
};

onMessage(messaging, (payload) => {
  console.log("Message received in foreground: ", payload);
}); 