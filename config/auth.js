import { auth, db } from '../firebase';
import { GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from "firebase/firestore";

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    
    // Check if user exists in Firestore, if not add them
    const userDoc = doc(db, 'users', result.user.uid);
    const docSnap = await getDoc(userDoc);
    if (!docSnap.exists()) {
      await setDoc(userDoc, {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName,
        // add other properties you want to store
      });
    }

    return result;
  } catch (error) {
    console.error(error);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
  }
};