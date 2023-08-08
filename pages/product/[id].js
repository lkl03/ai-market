import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router';
import { useEffect } from 'react'
import useState from 'react-usestateref';
import { motion, AnimatePresence } from 'framer-motion'
import { useSnapshot } from 'valtio'
import { useUser } from '../../context/userContext';

import { IoMdMoon, IoMdSunny, IoMdWarning } from 'react-icons/io'
import Moment from 'react-moment';
import { now } from 'moment';

import state from '../../store'

import { CustomButton, CustomLink, GoogleButton, Navbar, NavbarLog, Footer } from '../../components'
import {
  headContainerAnimation,
  headContentAnimation,
  headTextAnimation,
  slideAnimation
} from '../../config/motion'

import { signInWithGoogle } from '../../config/auth';


import { auth, db } from '../../firebase';
import { doc, getDoc, getDocs, setDoc, updateDoc, collectionGroup, query, where, increment, addDoc } from "firebase/firestore";
import { GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import ClipLoader from "react-spinners/ClipLoader";

import { saveAs } from 'file-saver';

import { profilebg } from '../../assets';

import { v4 as uuidv4 } from 'uuid';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

import { ProductionProvider, useProduction } from '../../context/productionContext';


const Product = (props) => {
  const snap = useSnapshot(state)
  const { user, loading } = useUser();

  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [error, setError] = useState('')
  const [onClickError, setOnClickError] = useState('')

  useEffect(() => {
    if (props.product) setLoaded(true);
  }, [props.product]);

  const [otherProducts, setOtherProducts] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [productIsBought, setProductIsBought] = useState(false)
  const [productToBuy, setProductToBuy] = useState(props.product);
  const [orderID, setOrderID, orderIDRef] = useState('');
  
  const [isLiveEnvState, setIsLiveEnvState, isLiveEnvStateRef] = useState(false)

  const PayPalProviderWithProduction = ({ children }) => {
    const { isLive } = useProduction();

    if (isLive === true) {
      setIsLiveEnvState(true)
    }
    
    return (
      <PayPalScriptProvider options={{
        "client-id": isLive ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_LIVE : process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_SANDBOX,
        "merchant-id": props.user.paypalMerchantID
      }}>
        {children}
      </PayPalScriptProvider>
    );
  }

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
    }

    fetchOtherProducts();
  }, []);

  const createOrder = (data, actions) => {
    return fetch(process.env.NEXT_PUBLIC_CREATE_ORDER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: props.product.price,
        title: props.product.title,
        desc: props.product.desc,
        merchantId: props.user.paypalMerchantID,
        emailAddress: props.user.paypalEmail,
        isLiveEnv: isLiveEnvStateRef.current
    })
    })
      .then(response => response.json())
      .then(data => {
        return data.id;
      })
      .catch((error) => {
        throw error;
      });
  };

  const updateDatabase = async () => {
    const getDocRef = doc(db, productToBuy.parentCollection, props.user.uid, 'approved', productToBuy.productID);
    const getBuyerDocRef = doc(db, 'users', user.uid);

    await updateDoc(getDocRef, {
      totalPurchases: increment(1),
    });
    await updateDoc(getBuyerDocRef, {
      totalSales: increment(1),
    });

    // Destructure productToBuy
    const { title, desc, thumbnailURL, productURL, price, ai, terms, status, isApproved, productID, publicID, publishedDate, publisher, totalLikes, totalPurchases, parentCollection } = productToBuy;

    const productData = {
      title,
      desc,
      thumbnailURL,
      productURL,
      price,
      ai,
      terms,
      status,
      isApproved,
      productID,
      publicID,
      publishedDate,
      publisher,
      totalLikes,
      totalPurchases,
      parentCollection,
      purchaseDate: now()
    };

    const saleData = {
      saleDate: now(),
      productSold: title,
      priceOfSale: price,
      productSoldID: productID,
      productSoldPublicID: publicID,
      buyerID: user.uid,
      paypalOrderID: (orderIDRef.current == '' ? 'undefined' : orderIDRef.current)
    }

    //Save data to Firestore
    const saveDoc = doc(db, 'users', user.uid, 'purchases', productID);
    await setDoc(saveDoc, productData);

    //Generate random ID for sale
    const saleID = uuidv4();

    const saveSaleInfo = doc(db, 'users', props.user.uid, 'sales', saleID);
    await setDoc(saveSaleInfo, saleData);

    // Check if product is bought after successful purchase
    checkIfProductIsBought();
  }

  const getUsername = async () => {
    const getBuyerDocRef = doc(db, 'users', user.uid);
    const buyerDocSnap = await getDoc(getBuyerDocRef);
    return buyerDocSnap.data().username;
  }

  const getPublicID = async () => {
    const getPublicIDDocRef = doc(db, 'users', user.uid);
    const publicIDDocSnap = await getDoc(getPublicIDDocRef);
    return buyerDocSnap.data().publicID;
  }

  const calculateSellerAmount = (price) => {
    // Calculate 10% of the price
    const discount = price * 0.1;

    // Subtract the discount from the original price
    const finalPrice = price - discount;

    // Return the final price rounded to two decimal places
    return parseFloat(finalPrice.toFixed(2));
  }

  const sendEmails = (buyerUsername, buyerPublicID) => {
    const buyerDataEmail = {
      email: user.email,
      name: user.displayName,
      product: productToBuy.title,
      dashboard: `${process.env.NEXT_PUBLIC_AITROPY_URL}/dashboard/${buyerPublicID}`
    };

    const finalPrice = calculateSellerAmount(productToBuy.price)

    const sellerDataEmail = {
      email: props.user.email,
      name: props.user.displayName,
      buyer: buyerUsername,
      price: finalPrice,
      product: productToBuy.title
    };

    fetch("../api/seller", {
      "method": "POST",
      "headers": { "content-type": "application/json" },
      "body": JSON.stringify(sellerDataEmail)
    })

    fetch("../api/buyer", {
      "method": "POST",
      "headers": { "content-type": "application/json" },
      "body": JSON.stringify(buyerDataEmail)
    })
  }

  const onApprove = (data, actions) => {
    return actions.order.capture().then(async function (details) {
      const response = await fetch(process.env.NEXT_PUBLIC_CAPTURE_ORDER_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          orderID: data.orderID,
          isLiveEnv: isLiveEnvStateRef.current
        })
      })
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseData = await response.json();
  
      try {
        setOrderID(data.orderID)
        await new Promise(resolve => setTimeout(resolve, 2000)); // wait for 1 second
        await updateDatabase();
        const buyerUsername = await getUsername();
        const buyerPublicID = await getPublicID();
        sendEmails(buyerUsername, buyerPublicID);
      } catch (error) {
      }
    })
      .catch(error => {
      });
  }
  
  const onClick = (data, actions) => {
    if (productIsBought) {
      setOnClickError(
        "You already bought this product. Go to your account dashboard to view your list of purchases."
      );
  
      return actions.reject();
    } else {
      return actions.resolve();
    }
  }
  
  const onError = async (err) => {
    setError(err.message);
  };
  
  const checkIfProductIsBought = async () => {
    setUserLoading(true); 
    if (!userLoading && auth.currentUser) {
      const userDoc = doc(db, 'users', auth.currentUser.uid, 'purchases', props.product.productID);
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        setProductIsBought(true);
      } else {
      }
    } else if (!auth.currentUser) {
      setProductIsBought(false); 
    }
    setUserLoading(false);
  }
  
  useEffect(() => {
    checkIfProductIsBought();
  }, [auth.currentUser]);
  
  useEffect(() => {
    checkIfProductIsBought();
  }, [auth.currentUser]);
  
  const downloadProduct = async (product) => {
    const storage = getStorage();
    const productRef = ref(storage, product.productURL);
  
    getDownloadURL(productRef)
      .then((url) => {
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = (event) => {
          const blob = xhr.response;
          saveAs(blob, product.title); 
        };
        xhr.open('GET', url);
        xhr.send();
      })
      .catch((error) => {
      });
  };

  function UserButton() {
    if (userLoading) return <ClipLoader />;
    if (!user) {
      return (
        <div className='flex flex-col flex-wrap'>
          <p className='md:text-sm text-xs md:text-start text-center text-[#04E762] opacity-75 italic mb-[-0.75rem]'>You must be signed in to buy this product.</p>
          <GoogleButton handleClick={() => signInWithGoogle()} text="Continue with Google" />
        </div>
      )
    }
    if (productIsBought || user.uid === props.user.uid) {
      return <CustomButton type='filled' title={`Download Product`} handleClick={() => downloadProduct(props.product)} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold text-sm' />;
    }
    return (
      <div className='md:min-w-[300px] max-w-full'>
        <PayPalButtons
          style={{
            color: "gold",
            shape: "rect",
            height: 35
          }}
          createOrder={createOrder}
          onApprove={onApprove}
          onClick={onClick}
          onError={onError}
        />
      </div>
    );
  }

  return (
    <ProductionProvider>
      <PayPalProviderWithProduction>
        <AnimatePresence>
          <Head>
            <title>{props.product.title} | AITropy</title>
            <meta name="description" content={`${props.product.title} on AITropy: Explore AI-generated texts, images, prompts, and more. Join the community and discover products created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY. | AITropy`} />
            <meta name="keywords" content="profile, AI, ai-generated products, prompts, images, texts, gpt, dall-e, stable diffusion, midjourney, artificial intelligence, community" />
            <meta property="og:title" content={`${props.product.title} | AITropy`} />
            <meta property="og:description" content={`${props.product.title} on AITropy: Explore AI-generated texts, images, prompts, and more. Join the community and discover products created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY. | AITropy`} />
            <meta property="og:url" content={`${process.env.NEXT_PUBLIC_AITROPY_URL}/profile/${props.product.publicID}`} />
            <meta name="twitter:title" content={`${props.product.title} | AITropy`} />
            <meta name="twitter:description" content={`${props.product.title} on AITropy: Explore AI-generated texts, images, prompts, and more. Join the community and discover products created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY. | AITropy`} />
            <link rel="icon" href="/favicon.png" />
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
                              {error ? <div className='p-2 bg-red-600 text-white rounded text-center flex flex-wrap gap-1 items-center justify-center'><IoMdWarning />{error}</div> : ''}
                              {onClickError ? <div className='p-2 bg-yellow-400 rounded text-center flex flex-wrap gap-1 items-center justify-center'><IoMdWarning />{onClickError}</div> : ''}
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
                              <div className='flex flex-wrap md:gap-4 gap-2 md:justify-start justify-center items-end mt-4 mb-2'>
                                <p className="lg:text-2xl text-xl font-bold text-[#04E762]">${props.product.price}</p>
                                <UserButton />
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
                            <Link className='md:!w-auto w-full' href={`/product/${product.publicID}`} target='_blank'>
                              <div key={index} className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                                <div className='relative max-w-full md:max-w-[350px] m-auto'>
                                  <img src={product.thumbnailURL} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                                  <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                                    <p className="font-semibold uppercase">{product.ai}</p>
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
                                    <p className="font-semibold uppercase">{product.ai}</p>
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
                              {error ? <div className='p-2 bg-red-600 text-white rounded text-center flex flex-wrap gap-1 items-center justify-center'><IoMdWarning />{error}</div> : ''}
                              {onClickError ? <div className='p-2 bg-yellow-400 rounded text-center flex flex-wrap gap-1 items-center justify-center'><IoMdWarning />{onClickError}</div> : ''}
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
                                <UserButton />
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
                                    <p className="font-semibold uppercase">{product.ai}</p>
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
                                    <p className="font-semibold uppercase">{product.ai}</p>
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
      </PayPalProviderWithProduction>
    </ProductionProvider>
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