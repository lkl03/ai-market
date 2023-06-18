import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSnapshot } from 'valtio'
import { useUser } from '../../context/userContext';

import { IoMdMoon, IoMdSunny } from 'react-icons/io'
import Moment from 'react-moment';

import state from '../../store'

import { CustomButton, CustomLink, GoogleButton, Navbar, NavbarLog, Footer } from '../../components'
import {
  headContainerAnimation,
  headContentAnimation,
  headTextAnimation,
  slideAnimation
} from '../../config/motion'


import { auth, db } from '../../firebase';
import { doc, getDoc, getDocs, setDoc, updateDoc, collectionGroup, query, where, increment } from "firebase/firestore";
import { GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import ClipLoader from "react-spinners/ClipLoader";

import { saveAs } from 'file-saver';

import { profilebg } from '../../assets';

import { v4 as uuidv4 } from 'uuid';


const Product = (props) => {
  const snap = useSnapshot(state)
  const { user, loading } = useUser();

  const router = useRouter();

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (props.product) setLoaded(true);
  }, [props.product]);

  const [otherProducts, setOtherProducts] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [productIsBought, setProductIsBought] = useState(false)

  const [productToBuy, setProductToBuy] = useState(null);

  // Fetch products on component mount
  useEffect(() => {

    const fetchOtherProducts = async () => {
      const approvedRef = collectionGroup(db, 'approved');
      const querySnapshot = await getDocs(approvedRef);

      const fetchedData = querySnapshot.docs
        .filter(doc => doc.data().publisher === props.user.uid && doc.data().publicID != props.product.publicID)
        .map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

      setOtherProducts(fetchedData);
      console.log(fetchedData); // Log fetchedData directly as products state update may not have occurred yet
    }

    const relatedProducts = async () => {
      const approvedRef = collectionGroup(db, 'approved');
      const querySnapshot = await getDocs(approvedRef);

      const fetchedData = querySnapshot.docs
        .filter(doc => doc.data().publisher != props.user.uid && doc.data().parentCollection === props.product.parentCollection)
        .map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

      setRelatedProducts(fetchedData);
      console.log(fetchedData); // Log fetchedData directly as products state update may not have occurred yet
    }

    fetchOtherProducts();
  }, []);

  
  // Watch for changes in auth status and productToBuy
  useEffect(() => {
    const user = auth.currentUser;
    if (user && productToBuy) {
      buyProduct(productToBuy);
      setProductToBuy(null); // reset the product to buy
    }
  }, [auth.currentUser, productToBuy]);

  const checkIfProductIsBought = async () => {
    // only check if user is logged in
    if (!loading && auth.currentUser) {
      const userDoc = doc(db, 'users', auth.currentUser.uid, 'purchases', props.product.productID);
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        setProductIsBought(true);
        console.log('USER BOUGHT THIS PRODUCT!')
      } else {
        console.log('USER NOT BOUGHT THIS PRODUCT!')
      }
    } else if (!auth.currentUser) {
      setProductIsBought(false); // If user is not logged in, they have not bought the product
      console.log('USER NOT LOGGED IN!')
    }
  }

  useEffect(() => {
    checkIfProductIsBought();
  }, [auth.currentUser]);

  const signInWithGoogle = async () => {
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

  const buyProduct = async (product) => {
    const user = auth.currentUser;
    if (user) {
      const getDocRef = doc(db, product.parentCollection, props.user.uid, 'approved', product.productID);
      try {
        await updateDoc(getDocRef, {
            totalPurchases: increment(1),
        });
  
        const productData = {
          title: product.title,
          desc: product.desc,
          thumbnailURL: product.thumbnailURL,
          productURL: product.productURL,
          price: product.price,
          ai: product.ai,
          terms: product.terms,
          status: product.status,
          isApproved: product.isApproved,
          productID: product.productID,
          publicID: product.publicID,
          publishedDate: product.publishedDate,
          publisher: product.publisher,
          totalLikes: product.totalLikes,
          totalPurchases: product.totalPurchases,
          parentCollection: product.parentCollection
        };
  
        console.log(productData)
  
        //Save data to Firestore
        const saveDoc = doc(db, 'users', user.uid, 'purchases', product.productID);
        await setDoc(saveDoc, productData);
        
  
        console.log('purchased');
        // Check if product is bought after successful purchase
        checkIfProductIsBought();

      } catch (error) {
        console.error("Error buying product", error);
      }
    } else {
      // If the user is not signed in, start the sign-in process
      setProductToBuy(product); // Save the product user wants to buy
      await signInWithGoogle();
    }
  }

  const downloadProduct = async (product) => {
    const storage = getStorage();
    const productRef = ref(storage, product.productURL);
  
    getDownloadURL(productRef)
      .then((url) => {
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = (event) => {
          const blob = xhr.response;
          saveAs(blob, product.title); // where 'product.title' is the name you want to give to the downloaded file
        };
        xhr.open('GET', url);
        xhr.send();
      })
      .catch((error) => {
          console.error("Error downloading the file: ", error);
      });
  };

  return (
    <AnimatePresence>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <motion.div className='flex flex-wrap fixed z-[10000] gap-1 bottom-4 right-4 bg-[#04E762]  text-white font-bold py-2 px-4 rounded-full'>
        <a onClick={() => (state.themeDark = true) && (state.themeLight = false)} className='cursor-pointer hover:text-gray-500 transition-all ease-in-out'><IoMdMoon size={25} /></a>
        <a onClick={() => (state.themeLight = true) && (state.themeDark = false)} className='cursor-pointer hover:text-gray-500 transition-all ease-in-out'><IoMdSunny size={25} /></a>
      </motion.div>
      {snap.themeLight && (
        <>
          <motion.div className='max-w-[3840px] m-auto'>
            <motion.div className='max-w-[3840px] m-auto'>
              <NavbarLog />
            </motion.div>
            <motion.div className='max-w-[1920px] min-h-screen m-auto'>
              <motion.div className='flex flex-row flex-wrap md:h-auto md:w-full lg:justify-around justify-start items-center 2xl:py-8 2xl:px-36 sm:p-8 p-6 max-2xl:gap-7 max-w-[1920px] m-auto'>
                <motion.div className='container mt-10 mx-auto px-4' {...headContainerAnimation}>
                  <div className="flex flex-col md:flex-row justify-center items-center h-full py-4">
                    {!loaded && (
                      <div className='m-auto w-[100px] min-h-screen flex  items-center justify-center mt-20 mb-20'><ClipLoader size={50} color={snap.color} /></div>
                    )}
                    {loaded && (
                      <>
                        <div className="w-full md:w-1/2 p-4">
                          <img src={props.product.thumbnailURL} className="w-full h-auto object-cover rounded" alt={props.product.title} />
                        </div>
                        <div className="w-full md:w-1/2 p-4">
                          <h2 className="2xl:text-[3rem] text-[1.5rem] font-black text-black md:text-start text-center capitalize">{props.product.title}</h2>
                          <div className='flex flex-wrap gap-2 md:justify-start justify-center items-center my-4 border-t border-b border-[#04E762]'>
                            <Link href={`../profile/${props.user.publicID}`} className='flex flex-wrap gap-2 md:justify-start justify-center items-center md:border-r md:border-[#04E762]'>
                              <img className='rounded-full w-12 my-2' src={props.user?.profilePic} alt='user-profile-pic' />
                              <p className='text-black hover:text-[#04E762] font-medium transition-colors ease-in-out md:pr-2'>@{props.user.username} </p>
                            </Link>
                            <p className='text-black font-medium italic'>Updated <Moment fromNow>{props.product.publishedDate}</Moment></p>
                          </div>
                          <div className="max-w-full">
                            <p className="text-lg mb-4 text-black md:text-start text-center max-w-full line-clamp-[20] whitespace-pre-wrap">{props.product.desc}</p>
                          </div>
                          <div className="bg-black text-white bg-opacity-85 rounded py-1 px-1 md:px-2 m-auto md:m-[inherit] min-w-[100px] w-auto max-w-[180px]">
                            <p className="font-semibold text-center text-sm uppercase">{props.product.ai}</p>
                          </div>
                          <div className='flex flex-wrap md:gap-4 gap-2 justify-start items-end mt-4 mb-2'>
                            <p className="lg:text-2xl text-xl font-bold text-[#04E762]">${props.product.price}</p>
                            {!productIsBought
                            ? <CustomButton type='filled' title='Buy this product' handleClick={() => buyProduct(props.product)} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold' />
                            : <CustomButton type='filled' title={`Download Product`} handleClick={() => downloadProduct(props.product)} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold text-sm' />
                            }
                          </div>
                          <p className="text-xs text-black md:text-start text-center opacity-75 italic">After purchasing, you will gain access to the product file. <br></br> By purchasing this product, you agree to our terms of service.</p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className='mt-40'>
                    <h3 className="2xl:text-2xl text-xl font-black text-black text-center capitalize transition-colors ease-in-out">Other products from <Link href={`../profile/${props.user.publicID}`} className='text-black hover:text-[#04E762] lowercase transition-colors ease-in-out'>@{props.user.username}</Link></h3>
                    <div className='flex flex-wrap items-center justify-center gap-4'>
                    {otherProducts.map((product, index) => (
                      <Link className='md:w-auto w-full' href={`/product/${product.publicID}`} target='_blank'>
                        <div key={index} className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                          <div className='relative max-w-full md:max-w-[350px] m-auto'>
                            <img src={product.thumbnailURL} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                            <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                              <p className="font-semibold">{product.ai}</p>
                            </div>
                            <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-[#04E762] bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                              <p className="font-bold text-black">${product.price}</p>
                            </div>
                          </div>
                          <div className='pt-2 md:pt-4 border rounded-b-md bg-black border-black max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                            <h3 className='capitalize text-base md:text-lg font-bold text-white truncate'>{product.title}</h3>
                            <p className='italic text-white text-xs md:text-sm line-clamp-3'>{product.desc}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                    </div>
                  </div>
                  <div className='mt-20'>
                    <h3 className="2xl:text-2xl text-xl font-black text-black text-center capitalize">Related {props.product.parentCollection} You Would Like</h3>
                    <div className='flex flex-wrap items-center justify-center gap-4'>
                    {relatedProducts.map((product, index) => (
                      <Link className='md:w-auto w-full' href={`/product/${product.publicID}`} target='_blank'>
                        <div key={index} className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                          <div className='relative max-w-full md:max-w-[350px] m-auto'>
                            <img src={product.thumbnailURL} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                            <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                              <p className="font-semibold">{product.ai}</p>
                            </div>
                            <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-[#04E762] bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                              <p className="font-bold text-black">${product.price}</p>
                            </div>
                          </div>
                          <div className='pt-2 md:pt-4 border rounded-b-md bg-black border-black max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                            <h3 className='capitalize text-base md:text-lg font-bold text-white truncate'>{product.title}</h3>
                            <p className='italic text-white text-xs md:text-sm line-clamp-3'>{product.desc}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                    </div>
                  </div>
                  <div className='mt-20 mx-auto flex items-center justify-center'>
                    <CustomLink type='outline' title='Go to the Market' path={"/marketplace"} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold' />
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div className='max-w-[3840px] m-auto mt-10'>
              <Footer />
            </motion.div>
          </motion.div>
        </>
    )}
    {snap.themeDark && (
      <>
      <motion.div className='max-w-[3840px] m-auto bg-gray-900'>
        <motion.div className='max-w-[3840px] m-auto'>
          <NavbarLog />
        </motion.div>
        <motion.div className='max-w-[1920px] min-h-screen m-auto'>
          <motion.div className='flex flex-row flex-wrap md:h-auto md:w-full lg:justify-around justify-start items-center 2xl:py-8 2xl:px-36 sm:p-8 p-6 max-2xl:gap-7 max-w-[1920px] m-auto'>
            <motion.div className='container mt-10 mx-auto px-4' {...headContainerAnimation}>
              <div className="flex flex-col md:flex-row justify-center items-center h-full py-4">
                {!loaded && (
                  <div className='m-auto w-[100px] min-h-screen flex  items-center justify-center mt-20 mb-20'><ClipLoader size={50} color={snap.color} /></div>
                )}
                {loaded && (
                  <>
                    <div className="w-full md:w-1/2 p-4">
                      <img src={props.product.thumbnailURL} className="w-full h-auto object-cover rounded" alt={props.product.title} />
                    </div>
                    <div className="w-full md:w-1/2 p-4">
                      <h2 className="2xl:text-[3rem] text-[1.5rem] font-black text-white md:text-start text-center capitalize">{props.product.title}</h2>
                      <div className='flex flex-wrap gap-2 md:justify-start justify-center items-center my-4 border-t border-b border-white'>
                        <Link href={`../profile/${props.user.publicID}`} className='flex flex-wrap gap-2 md:justify-start justify-center items-center md:border-r md:border-white'>
                          <img className='rounded-full w-12 my-2' src={props.user?.profilePic} alt='user-profile-pic' />
                          <p className='text-white hover:text-[#04E762] font-medium transition-colors ease-in-out md:pr-2'>@{props.user.username} </p>
                        </Link>
                        <p className='text-white font-medium italic'>Updated <Moment fromNow>{props.product.publishedDate}</Moment></p>
                      </div>
                      <div className="max-w-full">
                          <p className="text-lg mb-4 text-white md:text-start text-center max-w-full line-clamp-[20] whitespace-pre-wrap">{props.product.desc}</p>
                      </div>
                      <div className="bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 m-auto md:m-[inherit] min-w-[100px] w-auto max-w-[180px]">
                        <p className="font-semibold text-center text-sm uppercase">{props.product.ai}</p>
                      </div>
                      <div className='flex flex-wrap md:gap-4 gap-2 justify-start items-end mt-4 mb-2'>
                        <p className="lg:text-2xl text-xl font-bold text-[#04E762]">${props.product.price}</p>
                        {!productIsBought
                          ? <CustomButton type='filled' title='Buy this product' handleClick={() => buyProduct(props.product)} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold' />
                          : <CustomButton type='filled' title={`Download Product`} handleClick={() => downloadProduct(props.product)} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold text-sm' />
                        }
                      </div>
                      <p className="text-xs text-white md:text-start text-center opacity-75 italic">After purchasing, you will gain access to the product file. <br></br> By purchasing this product, you agree to our terms of service.</p>
                    </div>
                  </>
                )}
              </div>
              <div className='mt-40'>
                <h3 className="2xl:text-2xl text-xl font-black text-white text-center capitalize transition-colors ease-in-out">Other products from <Link href={`../profile/${props.user.publicID}`} className='text-white hover:text-[#04E762] lowercase transition-colors ease-in-out'>@{props.user.username}</Link></h3>
                  <div className='flex flex-wrap items-center justify-center gap-4'>
                    {otherProducts.map((product, index) => (
                      <Link className='w-full' href={`/product/${product.publicID}`} target='_blank'>
                        <div key={index} className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                          <div className='relative max-w-full md:max-w-[350px] m-auto'>
                            <img src={product.thumbnailURL} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                            <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                              <p className="font-semibold">{product.ai}</p>
                            </div>
                            <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                              <p className="font-bold text-white">${product.price}</p>
                            </div>
                          </div>
                          <div className='pt-2 md:pt-4 border rounded-b-md bg-[#04E762] border-[#04E762] max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                            <h3 className='capitalize text-base md:text-lg font-bold text-black truncate'>{product.title}</h3>
                            <p className='italic text-black text-xs md:text-sm line-clamp-3'>{product.desc}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
              </div>
              <div className='mt-20'>
                <h3 className="2xl:text-2xl text-xl font-black text-white text-center capitalize">Related {props.product.parentCollection} You Would Like</h3>
                  <div className='flex flex-wrap items-center justify-center gap-4'>
                    {relatedProducts.map((product, index) => (
                      <Link className='w-full' href={`/product/${product.publicID}`} target='_blank'>
                        <div key={index} className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                          <div className='relative max-w-full md:max-w-[350px] m-auto'>
                            <img src={product.thumbnailURL} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                            <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                              <p className="font-semibold">{product.ai}</p>
                            </div>
                            <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                              <p className="font-bold text-white">${product.price}</p>
                            </div>
                          </div>
                          <div className='pt-2 md:pt-4 border rounded-b-md bg-[#04E762] border-[#04E762] max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                            <h3 className='capitalize text-base md:text-lg font-bold text-black truncate'>{product.title}</h3>
                            <p className='italic text-black text-xs md:text-sm line-clamp-3'>{product.desc}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
              </div>
              <div className='mt-20 mx-auto flex items-center justify-center'>
                <CustomLink type='outline' title='Go to the Market' path={"/marketplace"} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold' />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
        <motion.div className='max-w-[3840px] m-auto mt-10'>
          <Footer />
        </motion.div>
      </motion.div>
      </>
    )}

    </AnimatePresence>
  );
};

export async function getServerSideProps(context) {
  const { id } = context.query;

  // Query across all 'approved' collections and find the document matching the publicID
  const approvedRef = collectionGroup(db, 'approved');
  const q = query(approvedRef, where('publicID', '==', id));
  
  const querySnapshot = await getDocs(q);

  // If the product exists, use the data to pre-render the page
  if (!querySnapshot.empty) {
    const productDoc = querySnapshot.docs[0]; // should be only one document
    const product = {
      id: productDoc.id,
      ...productDoc.data(),
    };

    // Get the publisher user data
    const userDocRef = doc(db, 'users', product.publisher);
    const userDocSnap = await getDoc(userDocRef);

    // If the user exists, add user data to the props, else throw an error or handle it appropriately
    if (userDocSnap.exists()) {
      const user = {
        id: userDocSnap.id,
        ...userDocSnap.data(),
      };
    
      return {
        props: {
          product,
          user, // Pass the user data as a prop to your component
        },
      };
    } else {
      throw new Error('User not found');
    }
    
  } 
  // If the product does not exist, return 404 page
  else {
    return {
      notFound: true,
    };
  }
}

export default Product;