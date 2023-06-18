import { auth, db } from '../firebase';
import { GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import { profilebg } from '../assets';

import { v4 as uuidv4 } from 'uuid';

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    // Check if user exists in Firestore, if not add them
    const userDoc = doc(db, 'users', result.user.uid);
    const docSnap = await getDoc(userDoc);
    if (!docSnap.exists()) {
      //Generate random ID for public
      const userPublicId = uuidv4();

      // Upload background image
      const storage = getStorage();
      let bgURL;
      const bgRef = ref(storage, `users/${result.user.uid}/backgrounds/profilebg`);

      // Here we fetch the image as a Blob
      const response = await fetch(profilebg.src);
      const blob = await response.blob();

      const bgUploadTask = uploadBytesResumable(bgRef, blob);
      await bgUploadTask; // wait for upload to complete
      bgURL = await getDownloadURL(bgRef);

      await setDoc(userDoc, {
        uid: result.user.uid,
        publicID: userPublicId,
        email: result.user.email,
        name: result.user.displayName,
        username: result.user.displayName?.split(/\s+/).join('').toLowerCase(),
        profilePic: result.user.photoURL,
        profileBg: bgURL,
        description: '',
        totalSales: '',
        lastSale: '',
        valoration: '',
        createdAt: result.user.metadata.creationTime,
        websiteURL: '',
        instagramURL: '',
        facebookURL: '',
        twitterURL: '',
        linkedinURL: '',
        tumblrURL: '',
        pinterestURL: '',
        githubURL: '',
        dribbbleURL: '',
        behanceURL: '',
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