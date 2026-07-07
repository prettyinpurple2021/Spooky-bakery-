import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import firebaseConfig from '../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const rawRecaptchaKey = (import.meta as any).env.VITE_RECAPTCHA_SITE_KEY;
const isKeyValid = typeof rawRecaptchaKey === 'string' && 
  rawRecaptchaKey.trim() !== '' && 
  rawRecaptchaKey !== 'undefined' && 
  rawRecaptchaKey !== 'null' && 
  !rawRecaptchaKey.includes('YOUR_');

if (typeof window !== 'undefined' && isKeyValid) {
  // Enable debug token in development mode so developers can register their browser environment
  if ((import.meta as any).env.DEV) {
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(rawRecaptchaKey),
      isTokenAutoRefreshEnabled: true
    });
  } catch (err) {
    console.warn("Failed to initialize Firebase App Check:", err);
  }
}
