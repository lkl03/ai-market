import { createContext, useContext, useEffect } from 'react';
import useState from 'react-usestateref';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, where, query } from "firebase/firestore";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userID, setUserID, userIDRef] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserData(currentUser.uid);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
  
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]; // should be only one document
      const userData = {
        id: userDoc.id,
        ...userDoc.data(),
      };
      setUserID(userData.publicID);
      console.log(userIDRef.current)
    }
  }

  return (
    <UserContext.Provider value={{ user, loading, userIDRef }}>
      {children}
    </UserContext.Provider>
  );
};