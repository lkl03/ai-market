import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router';
import { useEffect } from 'react'
import useState from 'react-usestateref';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion'
import { useSnapshot } from 'valtio'
import { useUser } from '../context/userContext'
import { signInWithGoogle, signInWithMicrosoft } from '../config/auth';
import { now } from 'moment';

import { IoMdMoon, IoMdSunny } from 'react-icons/io'
import { FaArrowLeft, FaPaypal } from 'react-icons/fa'

import state from '../store'
import { CustomButton, CustomLink, GoogleButton, Navbar, NavbarLog, Footer } from '../components'
import LoginComponent from '../components/LoginComponent'
import {
  headContainerAnimation,
  headContentAnimation,
  headTextAnimation,
  slideAnimation
} from '../config/motion'

import { tile1, tile2, tile3, logowhite, logoblack, productdark, productwhite } from '../assets'

import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, db } from '../firebase';
import { doc, setDoc, collection, getDocs, where, query } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';

import { v4 as uuidv4 } from 'uuid';
import ClipLoader from "react-spinners/ClipLoader";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

import { ProductionProvider, useProduction } from '../context/productionContext';

import isProduction from '../hooks/isProduction';

export default function Sell() {
  const snap = useSnapshot(state)
  const { user, loading } = useUser();
  
  const [userID, setUserID] = useState('')
  
  const [paypalInfo, setPaypalInfo, paypalInfoRef] = useState('')
  const [paypalIsActive, setPaypalIsActive, paypalIsActiveRef] = useState(false)
  const [message, setMessage, messageRef] = useState({});

  const isLiveEnvState = isProduction()
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        setUserID(''); // reset userID state when no user is logged in
      }
    });
  
    // Cleanup the subscription on unmount
    return () => unsubscribe();
  }, []); // Run effect only on mount and unmount
  
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
      setPaypalInfo({
        email: userData.paypalEmail,
        merchantID: userData.paypalMerchantID,
        isLogged: userData.userIsPaypalLogged
      })
      checkPaypalStatus()
    }
  }
  
  const checkPaypalStatus = async () => {
    if (paypalInfoRef.current.email != '' && paypalInfoRef.current.merchantID != '' && paypalInfoRef.current.isLogged != false) {
      setPaypalIsActive(true)
    } else {
      setPaypalIsActive(false)
    }
  }

  const { register: register1, handleSubmit: handleSubmit1, formState: { errors: errors1 } } = useForm();
  const { register: register2, handleSubmit: handleSubmit2, formState: { errors: errors2 } } = useForm();
  const { register: register3, handleSubmit: handleSubmit3, formState: { errors: errors3 } } = useForm();
  const [preview, setPreview] = useState(null);
  const [imageThumbnailPreview, setImageThumbnailPreview] = useState(null);
  const [textThumbnailPreview, setTextThumbnailPreview] = useState(null);
  const [promptThumbnailPreview, setPromptThumbnailPreview] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [termsChecked, setTermsChecked, termsCheckedRef] = useState(false);
  const router = useRouter();

  const [infoLoading, setInfoLoading] = useState(false);
  const [showMessage, setShowMessage, showMessageRef] = useState(false);
  const [error, setError] = useState(null);

  const previewSetters = {
    'image': setImageThumbnailPreview,
    'text': setTextThumbnailPreview,
    'prompt': setPromptThumbnailPreview,
  };

  const [stagedData, setStagedData, stagedDataRef] = useState(null);

  const handleCheckboxChange = (e) => {
    setTermsChecked(e.target.checked);
  };

  const onThumbnailChange = (e, type) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewSetter = previewSetters[type];
      if (previewSetter) {
        previewSetter(reader.result);
      } else {
        console.warn(`No handler found for type "${type}"`);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const onSubmit = async (data, type) => {
    try {
      setPreview(data);
  
      // Check if user is logged in
      if (!auth.currentUser) {
        throw new Error('No user is currently logged in');
      }
  
      const productId = uuidv4();
      const productPublicId = uuidv4();
  
      // Determine paths
      const thumbnailPath = `thumbnails/${type}s/${data.thumbnail[0].name}`;
      const productPath = `products/${type}s/${data.product[0].name}`;

      // Change productPath to accommodate multiple images
      const productBasePath = `products/${type}s/${productId}`; // using productId as folder name for multiple images
  
      const userID = auth.currentUser.uid;
  
      setStagedData({
        userID,
        type,
        data,
        productId,
        productPublicId,
        thumbnailPath,
        productPath,
      });
  
      router.push('/sell');
    } catch (err) {
      setError(err.message);
    } finally {
      setInfoLoading(false);
    }
  
    setFormSubmitted(true);
  };

  const uploadProduct = async () => {
    setInfoLoading(true);
    setError(null);
  
    const storage = getStorage();
    
    try {
      const {
        userID,
        type,
        data,
        productId,
        productPublicId,
        thumbnailPath,
        productPath,
      } = stagedDataRef.current;
  
      // Upload thumbnail
      const thumbnailRef = ref(storage, thumbnailPath);
      const thumbnailUploadTask = uploadBytesResumable(thumbnailRef, data.thumbnail[0]);
      await thumbnailUploadTask; // wait for upload to complete
      let thumbnailURL = await getDownloadURL(thumbnailRef);

      let productURL; // Declare it here
      let productURLs = []; // Declare an array to hold multiple URLs for images
      
      if (stagedDataRef.current.type === 'image') {
        // If the product type is 'image', upload multiple files
        for (let i = 0; i < data.product.length; i++) {
          const individualFile = data.product[i];
          const individualProductPath = `${stagedDataRef.current.productPath}-image${i}`;
          const individualProductRef = ref(storage, individualProductPath);
  
          const individualProductUploadTask = uploadBytesResumable(individualProductRef, individualFile);
          await individualProductUploadTask;
  
          const individualProductURL = await getDownloadURL(individualProductRef);
          productURLs.push(individualProductURL);
        }
        productURL = JSON.stringify(productURLs); // Convert array to a JSON string
      } else {
        // For other types, proceed as before
        const productRef = ref(storage, stagedDataRef.current.productPath);
        const productUploadTask = uploadBytesResumable(productRef, data.product[0]);
        await productUploadTask;
        productURL = await getDownloadURL(productRef); // Directly get the URL
      }
  
      const productData = {
        title: data.title,
        desc: data.desc,
        thumbnailURL,
        productURL,
        price: data.price,
        ai: data.ai,
        terms: termsCheckedRef.current,
        status: 'Approval pending',
        isApproved: false,
        productID: productId,
        publicID: productPublicId,
        publishedDate: now(),
        publisher: userID,
        totalLikes: 0,
        totalPurchases: 0,
        parentCollection: type + 's'
      };
  
      // Save data to Firestore
      const userDoc = doc(db, type + 's', userID, 'submitted', productId);
      await setDoc(userDoc, productData);
  
      // Prepare data for local storage
      const dataForLocalStorage = {
        name: user.displayName,
        email: user.email,
        product: productData.title,
      }
  
      // Save data to local storage
      localStorage.setItem('savedData', JSON.stringify(dataForLocalStorage));
  
      // Clear staged data
      setStagedData(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setInfoLoading(false);
      router.push(isLiveEnvState === true ? `${process.env.NEXT_PUBLIC_PAYPAL_LOGIN_URL_LIVE}` : `${process.env.NEXT_PUBLIC_PAYPAL_LOGIN_URL_SANDBOX}`)
    }
  };

  const uploadProductDirect = async () => {
    setInfoLoading(true);
    setError(null);
  
    const storage = getStorage();
    
    try {
      const {
        userID,
        type,
        data,
        productId,
        productPublicId,
        thumbnailPath,
        productPath,
      } = stagedDataRef.current;
  
      // Upload thumbnail
      const thumbnailRef = ref(storage, thumbnailPath);
      const thumbnailUploadTask = uploadBytesResumable(thumbnailRef, data.thumbnail[0]);
      await thumbnailUploadTask; // wait for upload to complete
      let thumbnailURL = await getDownloadURL(thumbnailRef);
  
      let productURL; // Declare it here
      let productURLs = []; // Declare an array to hold multiple URLs for images

      if (stagedDataRef.current.type === 'image') {
        // If the product type is 'image', upload multiple files
        for (let i = 0; i < data.product.length; i++) {
          const individualFile = data.product[i];
          const individualProductPath = `${stagedDataRef.current.productPath}-image${i}`;
          const individualProductRef = ref(storage, individualProductPath);

          const individualProductUploadTask = uploadBytesResumable(individualProductRef, individualFile);
          await individualProductUploadTask;

          const individualProductURL = await getDownloadURL(individualProductRef);
          productURLs.push(individualProductURL);
        }
        productURL = JSON.stringify(productURLs); // Convert array to a JSON string
      } else {
        // For other types, proceed as before
        const productRef = ref(storage, stagedDataRef.current.productPath);
        const productUploadTask = uploadBytesResumable(productRef, data.product[0]);
        await productUploadTask;
        productURL = await getDownloadURL(productRef); // Directly get the URL
      }
  
      const productData = {
        title: data.title,
        desc: data.desc,
        thumbnailURL,
        productURL,
        price: data.price,
        ai: data.ai,
        terms: termsCheckedRef.current,
        status: 'Approval pending',
        isApproved: false,
        productID: productId,
        publicID: productPublicId,
        publishedDate: now(),
        publisher: userID,
        totalLikes: 0,
        totalPurchases: 0,
        parentCollection: type + 's'
      };
  
      // Save data to Firestore
      const userDoc = doc(db, type + 's', userID, 'submitted', productId);
      await setDoc(userDoc, productData);
  
      const dataForEmail = {
        name: user.displayName,
        email: user.email,
        product: productData.title,
      }
  
      fetch("../api/approval", {
        "method": "POST",
        "headers": { "content-type": "application/json" },
        "body": JSON.stringify(dataForEmail)
      }).then((response) => {
        // Check if the request was successful
        if (!response.ok) {
          throw new Error('Error sending data to API');
        }
      }).catch((error) => {
        setError('Error sending data to API');
      });
  
      setMessage({
        status: 'success',
        text: 'You\'ve just submitted your product! Once it gets approved you will receive a notification in your email, also it will be visible and buyable for all the users on the marketplace.'
      });
  
      // Clear staged data
      setStagedData(null);
    } catch (err) {
      setError(err.message);
      setMessage({
        status: 'error',
        text: 'Something went wrong! Please try again and if the error persists reach out to us for assistance.'
      });
    } finally {
      setShowMessage(true);
      setTimeout(() => {
        router.push(`/marketplace`);
      }, 4000);
    }
  };

  return (
    <AnimatePresence>
      <Head>
        <title>Start Selling | Buy & Sell AI-Generated Products with No-Fees | AITropy</title>
        <meta name="description" content="Start selling now AI-generated texts, images, and prompts. Sell products for and created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY. No additional fees charged on your sales. Join today! | AITropy" />
        <meta name="keywords" content="marketplace, ai-generated products, prompts, images, texts, gpt, dall-e, stable diffusion, midjourney, AI, artificial intelligence, buy, sell, community, no-fees" />
        <meta property="og:title" content="Start Selling | Buy & Sell AI-Generated Products with No-Fees | AITropy" />
        <meta property="og:description" content="Start selling now AI-generated texts, images, and prompts. Sell products for and created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY. No additional fees charged on your sales. Join today! | AITropy" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_AITROPY_URL}/sell`} />
        <meta name="twitter:title" content="Start Selling | Buy & Sell AI-Generated Products with No-Fees | AITropy" />
        <meta name="twitter:description" content="Start selling now AI-generated texts, images, and prompts. Sell products for and created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY. No additional fees charged on your sales. Join today! | AITropy" />
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
            <motion.div className='max-w-[1920px] m-auto'>
              <motion.div className='flex flex-row flex-wrap md:min-h-screen md:w-full lg:justify-around justify-start items-center 2xl:py-8 2xl:px-36 sm:p-8 p-6 max-2xl:gap-7 max-w-[1920px] m-auto'>
                {snap.step1 && (
                  <>
                    <motion.section {...slideAnimation('left')}>
                      <motion.header {...slideAnimation('down')}>
                        <img src={logoblack.src} alt="logo" className='w-24 h-auto object-contain' />
                      </motion.header>
                      <motion.div className='home-content' {...headContainerAnimation}>
                        <motion.div {...headTextAnimation}>
                          <h1 className='2xl:text-[4rem] text-[2rem] font-black text-black'>
                            Earn money from AI
                          </h1>
                          <motion.div {...headContentAnimation} className='flex flex-col gap-5'>
                            <p className='max-w-2xl font-normal text-gray-600 text-base'>
                              With just a few simple steps, you can join our thriving community of AI creators and start monetizing your expertise. <br></br>
                              Embrace the opportunity to make a profit with AITropy, and start making an impact in the AI community today.
                            </p>
                            <motion.div {...headContentAnimation} className='flex flex-row flex-wrap gap-2'>
                              <CustomButton type='filled' title='Sell Something' handleClick={() => (state.step2 = true) && (state.step1 = false)} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold text-sm' />
                            </motion.div>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    </motion.section>
                    <motion.section>
                      <motion.div>
                        <motion.div className="flex lg:flex-col flex-wrap justify-center items-center h-auto gap-4" {...headContentAnimation}>
                          <motion.div className="md:max-w-[450px] lg:h-[auto] lg:w-auto h-[25%] w-[75%]">
                            <img src={productwhite.src} alt="Image 1" className="w-full h-full object-cover shadow-lg" />
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    </motion.section>
                  </>
                )}
                {snap.step2 && (
                  <>
                    {!user && (
                      <>
                        <motion.section {...slideAnimation('left')}>
                          <motion.header {...slideAnimation('down')}>
                            <img src={logoblack.src} alt="logo" className='w-24 h-auto object-contain' />
                          </motion.header>
                          <motion.div className='home-content' {...headContainerAnimation}>
                            <motion.div {...headTextAnimation}>
                              <h1 className='2xl:text-[4rem] text-[2rem] text-center font-black text-black'>
                                Access your account to start selling
                              </h1>
                              <motion.div {...headContentAnimation} className='flex flex-col gap-5'>
                                <p className='w-full font-normal text-gray-600 text-base text-center mt-2 mb-4'>
                                  Log in to your account or create a new one on AITropy to start selling your products.
                                </p>
                              </motion.div>
                              <motion.div {...headContentAnimation} className='flex flex-row flex-wrap gap-2'>
                                <GoogleButton handleClick={() => signInWithGoogle()} text="Continue with Google" />
                              </motion.div>
                            </motion.div>
                          </motion.div>
                        </motion.section>
                      </>
                    )}
                    {user && (
                      <>
                        <FaArrowLeft onClick={() => (state.step1 = true) && (state.step2 = false)} size={30} className='absolute top-[25%] md:left-[25%] md:right-0 right-[5%] cursor-pointer text-black hover:text-[#04E762] transition-all ease-in-out' />
                        <motion.section {...slideAnimation('left')}>
                          <motion.header {...slideAnimation('down')}>
                            <img src={logoblack.src} alt="logo" className='w-24 h-auto object-contain' />
                          </motion.header>
                          <motion.div className='home-content md:mt-0 mt-10' {...headContainerAnimation}>
                            <motion.div>
                              <h1 className='2xl:text-[4rem] text-[2rem] text-center font-black text-black'>
                                What do you want to sell?
                              </h1>
                              <motion.div className='flex flex-col gap-5'>
                                <p className='w-full font-normal text-gray-600 text-base text-center mt-2 mb-4'>
                                  Select one of the options below to start selling.
                                </p>
                              </motion.div>
                              <motion.div className='grid md:grid-cols-3 grid-cols-1 grid-flow-row justify-center items-center gap-8'>
                                <div onClick={() => (state.step3 = true) && (state.step3Image = true) && (state.step2 = false)} className='rounded border border-[#04E762] text-[#04E762] text-center px-10 py-10 hover:font-bold transition-all ease-in-out cursor-pointer'>Images</div>
                                <div onClick={() => (state.step3 = true) && (state.step3Text = true) && (state.step2 = false)} className='rounded border border-[#04E762] text-[#04E762] text-center px-10 py-10 hover:font-bold transition-all ease-in-out cursor-pointer'>Texts</div>
                                {/*<div onClick={() => (state.step3 = true) && (state.step3Service = true) && (state.step2 = false)} className='rounded border border-[#04E762] text-[#04E762] text-center px-10 py-10 hover:font-bold transition-all ease-in-out cursor-pointer'>Services</div>*/}
                                <div onClick={() => (state.step3 = true) && (state.step3Prompt = true) && (state.step2 = false)} className='rounded border border-[#04E762] text-[#04E762] text-center px-10 py-10 hover:font-bold transition-all ease-in-out cursor-pointer'>Prompts</div>
                              </motion.div>
                            </motion.div>
                          </motion.div>
                        </motion.section>
                      </>
                    )}
                  </>
                )}
                {snap.step3 && snap.step3Image && (
                  <>
                  {!user && (
                    ''
                  )}
                  {user && paypalIsActiveRef.current === false && (
                    <>
                        {!formSubmitted ? (
                          <>
                            <FaArrowLeft onClick={() => (state.step2 = true) && (state.step3Image = false) && (state.step3 = false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[20%] md:right-0 right-[5%] cursor-pointer text-black hover:text-[#04E762] transition-all ease-in-out' />
                            <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                              <form onSubmit={handleSubmit1((data) => onSubmit(data, 'image'))} className="space-y-4 mt-10">
                                <label className="block">
                                  <span className="text-black">What's the title of your product?</span>
                                  <input {...register1('title', { required: true })} disabled={infoLoading} placeholder="Pack of six great landscape images with Picasso style" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" maxLength="60" />
                                </label>
                                {errors1.title && <span className='text-red-500 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-black">Write a brief and cool description of your product</span>
                                  <textarea {...register1('desc', { required: true })} disabled={infoLoading} rows={3} placeholder="This pack features six stunning landscape images that have been transformed with a unique Picasso-inspired style, resulting in a vibrant and abstract collection that will add a touch of artistic flair to any setting." className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" maxLength="480" />
                                </label>
                                {errors1.desc && <span className='text-red-500 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-black">Upload a thumbnail to show potential buyers what your product is about <br></br> <span className="text-sm italic text-gray-400">(PNG, JPG, WebP, AVIF, max 5MB)</span></span>
                                  <input {...register1('thumbnail', {
                                    required: true,
                                    validate: file => file && file[0] && file[0].type.includes('image/') && file[0].size <= 5 * 1024 * 1024
                                  })} disabled={infoLoading} type="file" accept=".png,.jpg,.jpeg,.webp,.avif" className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" onChange={(e) => onThumbnailChange(e, 'image')} />
                                </label>
                                {errors1.thumbnail?.type === 'required' && <span className='text-red-500 italic'>File is required</span>}
                                {errors1.thumbnail?.type === 'validate' && <span className='text-red-500 italic'>Invalid file</span>}
                                {imageThumbnailPreview && <img src={imageThumbnailPreview} alt="Thumbnail preview" className='max-w-[200px] h-auto max-h-[200px] border border-[#04E762] rounded' />}

                                <label className="block">
                                  <span className="text-black">
                                    Upload the images your client will receive once they buy your product<br></br>
                                    <span className="text-sm italic text-gray-400">(JPG, PNG, max 50MB total)</span>
                                  </span>
                                  <input
                                    {...register1('product', {
                                      required: true,
                                      validate: files => {
                                        const totalSize = Array.from(files).reduce((acc, file) => acc + file.size, 0);
                                        return files && Array.from(files).every(file => ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) && totalSize <= 50 * 1024 * 1024;
                                      }
                                    })}
                                    disabled={infoLoading}
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp,.avif"
                                    multiple
                                    className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out"
                                  />
                                </label>
                                {errors1.product?.type === 'required' && <span className='text-red-500 italic'>Files are required</span>}
                                {errors1.product?.type === 'validate' && <span className='text-red-500 italic'>Invalid product</span>}

                                <label className="block">
                                  <span className="text-black">Set the price of your product <span className="text-sm italic text-gray-400">(In US Dollars)</span></span>
                                  <input {...register1('price', { required: true })} disabled={infoLoading} type="number" min="0" step="0.01" placeholder="4.99" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" />
                                </label>
                                {errors1.price && <span className='text-red-500 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-black">What AI have you used for this product?</span>
                                  <input {...register1('ai', { required: true })} disabled={infoLoading} placeholder="Midjourney" autoComplete="off" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" />
                                </label>
                                {errors1.ai && <span className='text-red-500 italic'>This field is required</span>}
                                <div className='flex flex-wrap items-center justify-center'>
                                  <button type="submit" disabled={infoLoading} className={`px-4 py-2.5 flex-1 rounded-md border border-[#04E762] bg-[#04E762] text-black md:max-w-[170px] w-fit font-bold text-sm`}>
                                    {infoLoading ? <ClipLoader /> : 'Continue'}
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          </>
                        ) : (
                          <>
                          <FaArrowLeft onClick={() => setFormSubmitted(false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[20%] md:right-0 right-[5%] cursor-pointer text-black hover:text-[#04E762] transition-all ease-in-out' />
                          <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                                <div className='md:max-w-[75%] max-w-[90%] m-auto'>
                                  <h2 className='2xl:text-[4rem] text-[2rem] text-center font-black text-black'>One last step!</h2>
                                  <p className='w-full font-normal text-gray-600 text-base text-center mt-2 mb-4'>
                                    This is how your product will be visible on the marketplace once it gets approved.
                                  </p>
                                  <div className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                                    <div className='relative max-w-full md:max-w-[350px] m-auto'>
                                      <img src={imageThumbnailPreview} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                                      <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                                        <p className="font-semibold uppercase">{preview.ai}</p>
                                      </div>
                                      <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-[#04E762] bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                                        <p className="font-bold text-black">${preview.price}</p>
                                      </div>
                                    </div>
                                    <div className='pt-2 md:pt-4 border rounded-b-md bg-black border-black max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                                      <h3 className='capitalize text-base md:text-lg font-bold text-white truncate'>{preview.title}</h3>
                                      <p className='italic text-white text-xs md:text-sm line-clamp-3'>{preview.desc}</p>
                                    </div>
                                  </div>
                                  <p className='w-full font-normal text-gray-600 text-base text-center mt-2 mb-4'>
                                    Before sending it for approval, you have to integrate your PayPal account using the button below to be able to receive the funds of your sales. <br></br> Once you complete the PayPal login process, your product will be automatically send to review. <br></br> You'll receive an email once your product gets approved or rejected.
                                  </p>
                                  <label className="flex items-center justify-center space-x-2">
                                    <input required disabled={infoLoading} type="checkbox" className="disabled:opacity-25 disabled:grayscale form-checkbox h-5 w-5 text-[#04E762]" onChange={handleCheckboxChange} />
                                    <span className="text-gray-600">I've read and I agree to the <Link target='_blank' href="../terms" className='font-medium'>terms of service</Link> and the <Link target='_blank' href="../privacy-policy" className='font-medium'>privacy policy</Link></span>
                                  </label>
                                </div>
                            <div className='flex flex-wrap items-center justify-center mt-4'>
                              <button disabled={!termsChecked || infoLoading} className='flex flex-wrap items-center justify-center gap-2 rounded-md border border-[#0070BA] bg-[#0070BA] text-white font-semibold px-4 py-2.5 disabled:opacity-50' type='button' onClick={() => uploadProduct()}>{infoLoading ? <ClipLoader /> : <><FaPaypal size={25} className='text-white'/> Continue with PayPal</>}</button>
                            </div>
                          </motion.div>
                          </>
                        )}
                    </>
                  )}
                  {user && paypalIsActiveRef.current === true && (
                    <>
                        {!formSubmitted ? (
                          <>
                            <FaArrowLeft onClick={() => (state.step2 = true) && (state.step3Image = false) && (state.step3 = false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[20%] md:right-0 right-[5%] cursor-pointer text-black hover:text-[#04E762] transition-all ease-in-out' />
                            <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                              <form onSubmit={handleSubmit1((data) => onSubmit(data, 'image'))} className="space-y-4 mt-10">
                                <label className="block">
                                  <span className="text-black">What's the title of your product?</span>
                                  <input {...register1('title', { required: true })} disabled={infoLoading} placeholder="Pack of six great landscape images with Picasso style" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" maxLength="60" />
                                </label>
                                {errors1.title && <span className='text-red-500 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-black">Write a brief and cool description of your product</span>
                                  <textarea {...register1('desc', { required: true })} disabled={infoLoading} rows={3} placeholder="This pack features six stunning landscape images that have been transformed with a unique Picasso-inspired style, resulting in a vibrant and abstract collection that will add a touch of artistic flair to any setting." className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" maxLength="480" />
                                </label>
                                {errors1.desc && <span className='text-red-500 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-black">Upload a thumbnail to show potential buyers what your product is about <br></br> <span className="text-sm italic text-gray-400">(PNG, JPG, WebP, AVIF, max 5MB)</span></span>
                                  <input {...register1('thumbnail', {
                                    required: true,
                                    validate: file => file && file[0] && file[0].type.includes('image/') && file[0].size <= 5 * 1024 * 1024
                                  })} disabled={infoLoading} type="file" accept=".png,.jpg,.jpeg,.webp,.avif" className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" onChange={(e) => onThumbnailChange(e, 'image')} />
                                </label>
                                {errors1.thumbnail?.type === 'required' && <span className='text-red-500 italic'>File is required</span>}
                                {errors1.thumbnail?.type === 'validate' && <span className='text-red-500 italic'>Invalid file</span>}
                                {imageThumbnailPreview && <img src={imageThumbnailPreview} alt="Thumbnail preview" className='max-w-[200px] h-auto max-h-[200px] border border-[#04E762] rounded' />}

                                <label className="block">
                                  <span className="text-black">
                                    Upload the images your client will receive once they buy your product<br></br>
                                    <span className="text-sm italic text-gray-400">(PNG, JPG, WebP, AVIF, max 50MB total)</span>
                                  </span>
                                  <input
                                    {...register1('product', {
                                      required: true,
                                      validate: files => {
                                        const totalSize = Array.from(files).reduce((acc, file) => acc + file.size, 0);
                                        return files && Array.from(files).every(file => ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) && totalSize <= 50 * 1024 * 1024;
                                      }
                                    })}
                                    disabled={infoLoading}
                                    type="file"
                                    accept=".png,.jpg,.jpeg,.webp,.avif"
                                    multiple
                                    className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out"
                                  />
                                </label>
                                {errors1.product?.type === 'required' && <span className='text-red-500 italic'>Files are required</span>}
                                {errors1.product?.type === 'validate' && <span className='text-red-500 italic'>Invalid product</span>}

                                <label className="block">
                                  <span className="text-black">Set the price of your product <span className="text-sm italic text-gray-400">(In US Dollars)</span></span>
                                  <input {...register1('price', { required: true })} disabled={infoLoading} type="number" min="0" step="0.01" placeholder="4.99" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" />
                                </label>
                                {errors1.price && <span className='text-red-500 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-black">What AI have you used for this product?</span>
                                  <input {...register1('ai', { required: true })} disabled={infoLoading} placeholder="Midjourney" autoComplete="off" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" />
                                </label>
                                {errors1.ai && <span className='text-red-500 italic'>This field is required</span>}
                                <div className='flex flex-wrap items-center justify-center'>
                                  <button type="submit" disabled={infoLoading} className={`px-4 py-2.5 flex-1 rounded-md border border-[#04E762] bg-[#04E762] text-black md:max-w-[170px] w-fit font-bold text-sm`}>
                                    {infoLoading ? <ClipLoader /> : 'Continue'}
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          </>
                        ) : (
                          <>
                          <FaArrowLeft onClick={() => setFormSubmitted(false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[20%] md:right-0 right-[5%] cursor-pointer text-black hover:text-[#04E762] transition-all ease-in-out' />
                          <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                                <div className='md:max-w-[75%] max-w-[90%] m-auto'>
                                  <h2 className='2xl:text-[4rem] text-[2rem] text-center font-black text-black'>One last step!</h2>
                                  <p className='w-full font-normal text-gray-600 text-base text-center mt-2 mb-4'>
                                    This is how your product will be visible on the marketplace once it gets approved.
                                  </p>
                                  <div className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                                    <div className='relative max-w-full md:max-w-[350px] m-auto'>
                                      <img src={imageThumbnailPreview} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                                      <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                                        <p className="font-semibold uppercase">{preview.ai}</p>
                                      </div>
                                      <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-[#04E762] bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                                        <p className="font-bold text-black">${preview.price}</p>
                                      </div>
                                    </div>
                                    <div className='pt-2 md:pt-4 border rounded-b-md bg-black border-black max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                                      <h3 className='capitalize text-base md:text-lg font-bold text-white truncate'>{preview.title}</h3>
                                      <p className='italic text-white text-xs md:text-sm line-clamp-3'>{preview.desc}</p>
                                    </div>
                                  </div>
                                  <p className='w-full font-normal text-gray-600 text-base text-center mt-2 mb-4'>
                                    Before sending it for approval, please read and agree to our terms of service. <br></br> You'll receive an email once your product gets approved or rejected.
                                  </p>
                                  <label className="flex items-center justify-center space-x-2">
                                    <input required disabled={infoLoading} type="checkbox" className="disabled:opacity-25 disabled:grayscale form-checkbox h-5 w-5 text-[#04E762]" onChange={handleCheckboxChange} />
                                    <span className="text-gray-600">I've read and I agree to the <Link target='_blank' href="../terms" className='font-medium'>terms of service</Link> and the <Link target='_blank' href="../privacy-policy" className='font-medium'>privacy policy</Link></span>
                                  </label>
                                </div>
                            <div className='flex flex-wrap items-center justify-center mt-4'>
                            <button type="button" 
                              onClick={
                                () => uploadProductDirect()} 
                              disabled={!termsChecked || infoLoading} className={`px-4 py-2.5 flex-1 rounded-md border border-[#04E762] bg-[#04E762] text-black md:max-w-[170px] disabled:opacity-50 w-fit font-bold text-sm`}>
                                {infoLoading ? <ClipLoader /> : 'Continue'}
                              </button>
                            </div>
                          </motion.div>
                          {showMessageRef.current == false ? '' :
                                <motion.div className={`absolute w-1/2 h-auto p-4 rounded-xl z-50 flex flex-col flex-wrap items-center justify-center gap-2 ${messageRef.current.status === 'success' ? 'bg-[#388445]' : 'bg-[#ff5555]'}`}>
                                <h2 className='2xl:text-[3rem] text-[1.5rem] font-black text-white'>{messageRef.current.status === 'success' ? '¡Success!' : '¡Oops!'}</h2>
                                <p className='text-center text-white'>{messageRef.current.text}</p>
                                <CustomLink 
                                    type='filled' 
                                    title={messageRef.current.status === 'success' ? 'Go to the Market' : 'Retry'}
                                    path={messageRef.current.status === 'success' ? `/marketplace` : '/sell'}
                                    customStyles='md:max-w-[170px] px-4 py-2.5 font-bold text-sm' 
                                />
                            </motion.div>
                            }
                          </>
                        )}
                    </>
                  )}
                  </>
                )}
                {snap.step3 && snap.step3Text && (
                  <>
                  {!user && (
                    ''
                  )}
                  {user && paypalIsActiveRef.current === false && (
                    <>
                        {!formSubmitted ? (
                          <>
                            <FaArrowLeft onClick={() => (state.step2 = true) && (state.step3Text = false) && (state.step3 = false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[25%] md:right-0 right-[5%] cursor-pointer text-black hover:text-[#04E762] transition-all ease-in-out' />
                            <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                              <form onSubmit={handleSubmit2((data) => onSubmit(data, 'text'))} className="space-y-4 mt-10">
                                <label className="block">
                                  <span className="text-black">What's the title of your product?</span>
                                  <input {...register2('title', { required: true })} disabled={infoLoading} placeholder="Story of a XXII century robot superhero" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" maxLength="60" />
                                </label>
                                {errors2.title && <span className='text-red-500 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-black">Write a brief and cool description of your product</span>
                                  <textarea {...register2('desc', { required: true })} disabled={infoLoading} rows={3} placeholder="In the 22nd century, a robotic superhero battles for justice and humanity, weaving an epic tale of courage, hope, and technology." className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" maxLength="480" />
                                </label>
                                {errors2.desc && <span className='text-red-500 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-black">Upload a thumbnail to show potential buyers what your product is about <br></br> <span className="text-sm italic text-gray-400">(PNG, JPG, WebP, AVIF, max 5MB)</span></span>
                                  <input {...register2('thumbnail', {
                                    required: true,
                                    validate: file => file && file[0] && file[0].type.includes('image/') && file[0].size <= 5 * 1024 * 1024
                                  })} disabled={infoLoading} type="file" accept=".png,.jpg,.jpeg,.webp,.avif" className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" onChange={(e) => onThumbnailChange(e, 'text')} />
                                </label>
                                {errors2.thumbnail?.type === 'required' && <span className='text-red-500 italic'>File is required</span>}
                                {errors2.thumbnail?.type === 'validate' && <span className='text-red-500 italic'>Invalid file</span>}
                                {textThumbnailPreview && <img src={textThumbnailPreview} alt="Thumbnail preview" className='max-w-[200px] h-auto max-h-[200px] border border-[#04E762] rounded' />}

                                <label className="block">
                                  <span className="text-black">Upload a PDF or a compressed folder with the text your client will receive once they buy your product<br></br> <span className="text-sm italic text-gray-400">(PDF or ZIP, RAR, max 50MB)</span></span>
                                  <input {...register2('product', {
                                    required: true,
                                    validate: file => file && file[0] && (file[0].name.toLowerCase().endsWith('.pdf') || file[0].name.toLowerCase().endsWith('.zip') || file[0].name.toLowerCase().endsWith('.rar')) && file[0].size <= 50 * 1024 * 1024
                                  })} disabled={infoLoading} type="file" accept=".pdf,.zip,.rar" className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" />
                                </label>
                                {errors2.product?.type === 'required' && <span className='text-red-500 italic'>File is required</span>}
                                {errors2.product?.type === 'validate' && <span className='text-red-500 italic'>Invalid product</span>}

                                <label className="block">
                                  <span className="text-black">Set the price of your product <span className="text-sm italic text-gray-400">(In US Dollars)</span></span>
                                  <input {...register2('price', { required: true })} disabled={infoLoading} type="number" min="0" step="0.01" placeholder="4.99" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" />
                                </label>
                                {errors2.price && <span className='text-red-500 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-black">What AI have you used for this product?</span>
                                  <input {...register2('ai', { required: true })} disabled={infoLoading} placeholder="Midjourney" autoComplete="off" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" maxLength="25" />
                                </label>
                                {errors2.ai && <span className='text-red-500 italic'>This field is required</span>}
                                <div className='flex flex-wrap items-center justify-center'>
                                  <button type="submit" disabled={infoLoading} className={`px-4 py-2.5 flex-1 rounded-md border border-[#04E762] bg-[#04E762] text-black md:max-w-[170px] w-fit font-bold text-sm`}>
                                    {infoLoading ? <ClipLoader /> : 'Continue'}
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          </>
                        ) : (
                          <>
                          <FaArrowLeft onClick={() => setFormSubmitted(false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[20%] md:right-0 right-[5%] cursor-pointer text-black hover:text-[#04E762] transition-all ease-in-out' />
                          <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                                <div className='md:max-w-[75%] max-w-[90%] m-auto'>
                                  <h2 className='2xl:text-[4rem] text-[2rem] text-center font-black text-black'>One last step!</h2>
                                  <p className='w-full font-normal text-gray-600 text-base text-center mt-2 mb-4'>
                                    This is how your product will be visible on the marketplace once it gets approved.
                                  </p>
                                  <div className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                                    <div className='relative max-w-full md:max-w-[350px] m-auto'>
                                      <img src={textThumbnailPreview} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                                      <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                                        <p className="font-semibold uppercase">{preview.ai}</p>
                                      </div>
                                      <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-[#04E762] bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                                        <p className="font-bold text-black">${preview.price}</p>
                                      </div>
                                    </div>
                                    <div className='pt-2 md:pt-4 border rounded-b-md bg-black border-black max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                                      <h3 className='capitalize text-base md:text-lg font-bold text-white truncate'>{preview.title}</h3>
                                      <p className='italic text-white text-xs md:text-sm line-clamp-3'>{preview.desc}</p>
                                    </div>
                                  </div>
                                  <p className='w-full font-normal text-gray-600 text-base text-center mt-2 mb-4'>
                                    Before sending it for approval, you have to integrate your PayPal account using the button below to be able to receive the funds of your sales. <br></br> Once you complete the PayPal login process, your product will be automatically send to review. <br></br> You'll receive an email once your product gets approved or rejected.
                                  </p>
                                  <label className="flex items-center justify-center space-x-2">
                                    <input required disabled={infoLoading} type="checkbox" className="disabled:opacity-25 disabled:grayscale form-checkbox h-5 w-5 text-[#04E762]" onChange={handleCheckboxChange} />
                                    <span className="text-gray-600">I've read and I agree to the <Link target='_blank' href="../terms" className='font-medium'>terms of service</Link> and the <Link target='_blank' href="../privacy-policy" className='font-medium'>privacy policy</Link></span>
                                  </label>
                                </div>
                            <div className='flex flex-wrap items-center justify-center mt-4'>
                              <button disabled={!termsChecked || infoLoading} className='flex flex-wrap items-center justify-center gap-2 rounded-md border border-[#0070BA] bg-[#0070BA] text-white font-semibold px-4 py-2.5 disabled:opacity-50' type='button' onClick={() => uploadProduct()}>{infoLoading ? <ClipLoader /> : <><FaPaypal size={25} className='text-white'/> Continue with PayPal</>}</button>
                            </div>
                          </motion.div>
                          </>
                        )}
                    </>
                  )}
                  {user && paypalIsActiveRef.current === true && (
                    <>
                        {!formSubmitted ? (
                          <>
                            <FaArrowLeft onClick={() => (state.step2 = true) && (state.step3Text = false) && (state.step3 = false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[25%] md:right-0 right-[5%] cursor-pointer text-black hover:text-[#04E762] transition-all ease-in-out' />
                            <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                              <form onSubmit={handleSubmit2((data) => onSubmit(data, 'text'))} className="space-y-4 mt-10">
                                <label className="block">
                                  <span className="text-black">What's the title of your product?</span>
                                  <input {...register2('title', { required: true })} disabled={infoLoading} placeholder="Story of a XXII century robot superhero" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" maxLength="60" />
                                </label>
                                {errors2.title && <span className='text-red-500 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-black">Write a brief and cool description of your product</span>
                                  <textarea {...register2('desc', { required: true })} disabled={infoLoading} rows={3} placeholder="In the 22nd century, a robotic superhero battles for justice and humanity, weaving an epic tale of courage, hope, and technology." className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" maxLength="480" />
                                </label>
                                {errors2.desc && <span className='text-red-500 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-black">Upload a thumbnail to show potential buyers what your product is about <br></br> <span className="text-sm italic text-gray-400">(PNG, JPG, WebP, AVIF, max 5MB)</span></span>
                                  <input {...register2('thumbnail', {
                                    required: true,
                                    validate: file => file && file[0] && file[0].type.includes('image/') && file[0].size <= 5 * 1024 * 1024
                                  })} disabled={infoLoading} type="file" accept=".png,.jpg,.jpeg,.webp,.avif" className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" onChange={(e) => onThumbnailChange(e, 'text')} />
                                </label>
                                {errors2.thumbnail?.type === 'required' && <span className='text-red-500 italic'>File is required</span>}
                                {errors2.thumbnail?.type === 'validate' && <span className='text-red-500 italic'>Invalid file</span>}
                                {textThumbnailPreview && <img src={textThumbnailPreview} alt="Thumbnail preview" className='max-w-[200px] h-auto max-h-[200px] border border-[#04E762] rounded' />}

                                <label className="block">
                                  <span className="text-black">Upload a PDF or a compressed folder with the text your client will receive once they buy your product<br></br> <span className="text-sm italic text-gray-400">(PDF or ZIP, RAR, max 50MB)</span></span>
                                  <input {...register2('product', {
                                    required: true,
                                    validate: file => file && file[0] && (file[0].name.toLowerCase().endsWith('.pdf') || file[0].name.toLowerCase().endsWith('.zip') || file[0].name.toLowerCase().endsWith('.rar')) && file[0].size <= 50 * 1024 * 1024
                                  })} disabled={infoLoading} type="file" accept=".pdf,.zip,.rar" className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" />
                                </label>
                                {errors2.product?.type === 'required' && <span className='text-red-500 italic'>File is required</span>}
                                {errors2.product?.type === 'validate' && <span className='text-red-500 italic'>Invalid product</span>}

                                <label className="block">
                                  <span className="text-black">Set the price of your product <span className="text-sm italic text-gray-400">(In US Dollars)</span></span>
                                  <input {...register2('price', { required: true })} disabled={infoLoading} type="number" min="0" step="0.01" placeholder="4.99" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" />
                                </label>
                                {errors2.price && <span className='text-red-500 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-black">What AI have you used for this product?</span>
                                  <input {...register2('ai', { required: true })} disabled={infoLoading} placeholder="Midjourney" autoComplete="off" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" maxLength="25" />
                                </label>
                                {errors2.ai && <span className='text-red-500 italic'>This field is required</span>}
                                <div className='flex flex-wrap items-center justify-center'>
                                  <button type="submit" disabled={infoLoading} className={`px-4 py-2.5 flex-1 rounded-md border border-[#04E762] bg-[#04E762] text-black md:max-w-[170px] w-fit font-bold text-sm`}>
                                    {infoLoading ? <ClipLoader /> : 'Continue'}
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          </>
                        ) : (
                          <>
                          <FaArrowLeft onClick={() => setFormSubmitted(false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[20%] md:right-0 right-[5%] cursor-pointer text-black hover:text-[#04E762] transition-all ease-in-out' />
                          <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                                <div className='md:max-w-[75%] max-w-[90%] m-auto'>
                                  <h2 className='2xl:text-[4rem] text-[2rem] text-center font-black text-black'>One last step!</h2>
                                  <p className='w-full font-normal text-gray-600 text-base text-center mt-2 mb-4'>
                                    This is how your product will be visible on the marketplace once it gets approved.
                                  </p>
                                  <div className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                                    <div className='relative max-w-full md:max-w-[350px] m-auto'>
                                      <img src={textThumbnailPreview} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                                      <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                                        <p className="font-semibold uppercase">{preview.ai}</p>
                                      </div>
                                      <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-[#04E762] bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                                        <p className="font-bold text-black">${preview.price}</p>
                                      </div>
                                    </div>
                                    <div className='pt-2 md:pt-4 border rounded-b-md bg-black border-black max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                                      <h3 className='capitalize text-base md:text-lg font-bold text-white truncate'>{preview.title}</h3>
                                      <p className='italic text-white text-xs md:text-sm line-clamp-3'>{preview.desc}</p>
                                    </div>
                                  </div>
                                  <p className='w-full font-normal text-gray-600 text-base text-center mt-2 mb-4'>
                                    Before sending it for approval, please read and agree to our terms of service. <br></br> You'll receive an email once your product gets approved or rejected.
                                  </p>
                                  <label className="flex items-center justify-center space-x-2">
                                    <input required disabled={infoLoading} type="checkbox" className="disabled:opacity-25 disabled:grayscale form-checkbox h-5 w-5 text-[#04E762]" onChange={handleCheckboxChange} />
                                    <span className="text-gray-600">I've read and I agree to the <Link target='_blank' href="../terms" className='font-medium'>terms of service</Link> and the <Link target='_blank' href="../privacy-policy" className='font-medium'>privacy policy</Link></span>
                                  </label>
                                </div>
                            <div className='flex flex-wrap items-center justify-center mt-4'>
                              <button type="button" 
                              onClick={
                                () => uploadProductDirect()} 
                              disabled={!termsChecked || infoLoading} className={`px-4 py-2.5 flex-1 rounded-md border border-[#04E762] bg-[#04E762] text-black md:max-w-[170px] disabled:opacity-50 w-fit font-bold text-sm`}>
                                {infoLoading ? <ClipLoader /> : 'Continue'}
                              </button>
                            </div>
                          </motion.div>
                          {showMessageRef.current == false ? '' :
                                <motion.div className={`absolute w-1/2 h-auto p-4 rounded-xl z-50 flex flex-col flex-wrap items-center justify-center gap-2 ${messageRef.current.status === 'success' ? 'bg-[#388445]' : 'bg-[#ff5555]'}`}>
                                <h2 className='2xl:text-[3rem] text-[1.5rem] font-black text-white'>{messageRef.current.status === 'success' ? '¡Success!' : '¡Oops!'}</h2>
                                <p className='text-center text-white'>{messageRef.current.text}</p>
                                <CustomLink 
                                    type='filled' 
                                    title={messageRef.current.status === 'success' ? 'Go to the Market' : 'Retry'}
                                    path={messageRef.current.status === 'success' ? `/marketplace` : '/sell'}
                                    customStyles='md:max-w-[170px] px-4 py-2.5 font-bold text-sm' 
                                />
                            </motion.div>
                            }
                          </>
                        )}
                    </>
                  )}
                  </>
                )}
                {snap.step3 && snap.step3Prompt && (
                  <>
                    {!user && (
                      ''
                    )}
                    {user && paypalIsActiveRef.current === false && (
                      <>
                        {!formSubmitted ? (
                          <>
                            <FaArrowLeft onClick={() => (state.step2 = true) && (state.step3Prompt = false) && (state.step3 = false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[25%] md:right-0 right-[5%] cursor-pointer text-black hover:text-[#04E762] transition-all ease-in-out' />
                            <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                              <form onSubmit={handleSubmit3((data) => onSubmit(data, 'prompt'))} className="space-y-4 mt-10">
                                <label className="block">
                                  <span className="text-black">What's the title of your product?</span>
                                  <input {...register3('title', { required: true })} disabled={infoLoading} placeholder="Anime Illustrations" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" maxLength="60" />
                                </label>
                                {errors3.title && <span className='text-red-500 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-black">Write a brief and cool description of your product</span>
                                  <textarea {...register3('desc', { required: true })} disabled={infoLoading} rows={3} placeholder="This prompt will generate an illustration in the style of Anime, which is totally settable!" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" maxLength="480" />
                                </label>
                                {errors3.desc && <span className='text-red-500 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-black">Upload a thumbnail to show potential buyers what your product is about <br></br> <span className="text-sm italic text-gray-400">(PNG, JPG, WebP, AVIF, max 5MB)</span></span>
                                  <input {...register3('thumbnail', {
                                    required: true,
                                    validate: file => file && file[0] && file[0].type.includes('image/') && file[0].size <= 5 * 1024 * 1024
                                  })} disabled={infoLoading} type="file" accept=".png,.jpg,.jpeg,.webp,.avif" className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" onChange={(e) => onThumbnailChange(e, 'prompt')} />
                                </label>
                                {errors3.thumbnail?.type === 'required' && <span className='text-red-500 italic'>File is required</span>}
                                {errors3.thumbnail?.type === 'validate' && <span className='text-red-500 italic'>Invalid file</span>}
                                {promptThumbnailPreview && <img src={promptThumbnailPreview} alt="Thumbnail preview" className='max-w-[200px] h-auto max-h-[200px] border border-[#04E762] rounded' />}

                                <label className="block">
                                  <span className="text-black">Upload a .PDF or .TXT file or a compressed folder with the prompt your client will receive once they buy your product<br></br> <span className="text-sm italic text-gray-400">(PDF, TXT or ZIP, RAR, max 50MB)</span></span>
                                  <input {...register3('product', {
                                    required: true,
                                    validate: file => file && file[0] && (file[0].name.toLowerCase().endsWith('.zip') || file[0].name.toLowerCase().endsWith('.rar') || file[0].name.toLowerCase().endsWith('.txt') || file[0].name.toLowerCase().endsWith('.pdf')) && file[0].size <= 50 * 1024 * 1024
                                  })} disabled={infoLoading} type="file" accept=".zip,.rar,.pdf,.txt" className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" />
                                </label>
                                {errors3.product?.type === 'required' && <span className='text-red-500 italic'>File is required</span>}
                                {errors3.product?.type === 'validate' && <span className='text-red-500 italic'>Invalid product</span>}

                                <label className="block">
                                  <span className="text-black">Set the price of your product <span className="text-sm italic text-gray-400">(In US Dollars)</span></span>
                                  <input {...register3('price', { required: true })} disabled={infoLoading} type="number" min="0" step="0.01" placeholder="4.99" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" />
                                </label>
                                {errors3.price && <span className='text-red-500 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-black">What AI is this product for?</span>
                                  <input {...register3('ai', { required: true })} disabled={infoLoading} placeholder="GPT-4" autoComplete="off" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" maxLength="25" />
                                </label>
                                {errors3.ai && <span className='text-red-500 italic'>This field is required</span>}
                                <div className='flex flex-wrap items-center justify-center'>
                                  <button type="submit" disabled={infoLoading} className={`px-4 py-2.5 flex-1 rounded-md border border-[#04E762] bg-[#04E762] text-black md:max-w-[170px] w-fit font-bold text-sm`}>
                                    {infoLoading ? <ClipLoader /> : 'Continue'}
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          </>
                        ) : (
                          <>
                          <FaArrowLeft onClick={() => setFormSubmitted(false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[20%] md:right-0 right-[5%] cursor-pointer text-black hover:text-[#04E762] transition-all ease-in-out' />
                          <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                          <div className='md:max-w-[75%] max-w-[90%] m-auto'>
                                  <h2 className='2xl:text-[4rem] text-[2rem] text-center font-black text-black'>One last step!</h2>
                                  <p className='w-full font-normal text-gray-600 text-base text-center mt-2 mb-4'>
                                    This is how your product will be visible on the marketplace once it gets approved.
                                  </p>
                                  <div className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                                    <div className='relative max-w-full md:max-w-[350px] m-auto'>
                                      <img src={promptThumbnailPreview} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                                      <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                                        <p className="font-semibold uppercase">{preview.ai}</p>
                                      </div>
                                      <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-[#04E762] bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                                        <p className="font-bold text-black">${preview.price}</p>
                                      </div>
                                    </div>
                                    <div className='pt-2 md:pt-4 border rounded-b-md bg-black border-black max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                                      <h3 className='capitalize text-base md:text-lg font-bold text-white truncate'>{preview.title}</h3>
                                      <p className='italic text-white text-xs md:text-sm line-clamp-3'>{preview.desc}</p>
                                    </div>
                                  </div>
                                  <p className='w-full font-normal text-gray-600 text-base text-center mt-2 mb-4'>
                                    Before sending it for approval, you have to integrate your PayPal account using the button below to be able to receive the funds of your sales. <br></br> Once you complete the PayPal login process, your product will be automatically send to review. <br></br> You'll receive an email once your product gets approved or rejected.
                                  </p>
                                  <label className="flex items-center justify-center space-x-2">
                                    <input required disabled={infoLoading} type="checkbox" className="disabled:opacity-25 disabled:grayscale form-checkbox h-5 w-5 text-[#04E762]" onChange={handleCheckboxChange} />
                                    <span className="text-gray-600">I've read and I agree to the <Link target='_blank' href="../terms" className='font-medium'>terms of service</Link> and the <Link target='_blank' href="../privacy-policy" className='font-medium'>privacy policy</Link></span>
                                  </label>
                                </div>
                            <div className='flex flex-wrap items-center justify-center mt-4'>
                              <button disabled={!termsChecked || infoLoading} className='flex flex-wrap items-center justify-center gap-2 rounded-md border border-[#0070BA] bg-[#0070BA] text-white font-semibold px-4 py-2.5 disabled:opacity-50' type='button' onClick={() => uploadProduct()}>{infoLoading ? <ClipLoader /> : <><FaPaypal size={25} className='text-white'/> Continue with PayPal</>}</button>
                            </div>
                          </motion.div>
                          </>
                        )}
                      </>
                    )}
                    {user && paypalIsActiveRef.current === true && (
                      <>
                        {!formSubmitted ? (
                          <>
                            <FaArrowLeft onClick={() => (state.step2 = true) && (state.step3Prompt = false) && (state.step3 = false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[25%] md:right-0 right-[5%] cursor-pointer text-black hover:text-[#04E762] transition-all ease-in-out' />
                            <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                              <form onSubmit={handleSubmit3((data) => onSubmit(data, 'prompt'))} className="space-y-4 mt-10">
                                <label className="block">
                                  <span className="text-black">What's the title of your product?</span>
                                  <input {...register3('title', { required: true })} disabled={infoLoading} placeholder="Anime Illustrations" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" maxLength="60" />
                                </label>
                                {errors3.title && <span className='text-red-500 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-black">Write a brief and cool description of your product</span>
                                  <textarea {...register3('desc', { required: true })} disabled={infoLoading} rows={3} placeholder="This prompt will generate an illustration in the style of Anime, which is totally settable!" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" maxLength="480" />
                                </label>
                                {errors3.desc && <span className='text-red-500 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-black">Upload a thumbnail to show potential buyers what your product is about <br></br> <span className="text-sm italic text-gray-400">(PNG, JPG, WebP, AVIF, max 5MB)</span></span>
                                  <input {...register3('thumbnail', {
                                    required: true,
                                    validate: file => file && file[0] && file[0].type.includes('image/') && file[0].size <= 5 * 1024 * 1024
                                  })} disabled={infoLoading} type="file" accept=".png,.jpg,.jpeg,.webp,.avif" className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" onChange={(e) => onThumbnailChange(e, 'prompt')} />
                                </label>
                                {errors3.thumbnail?.type === 'required' && <span className='text-red-500 italic'>File is required</span>}
                                {errors3.thumbnail?.type === 'validate' && <span className='text-red-500 italic'>Invalid file</span>}
                                {promptThumbnailPreview && <img src={promptThumbnailPreview} alt="Thumbnail preview" className='max-w-[200px] h-auto max-h-[200px] border border-[#04E762] rounded' />}

                                <label className="block">
                                  <span className="text-black">Upload a .PDF or .TXT file or a compressed folder with the prompt your client will receive once they buy your product<br></br> <span className="text-sm italic text-gray-400">(PDF, TXT or ZIP, RAR, max 50MB)</span></span>
                                  <input {...register3('product', {
                                    required: true,
                                    validate: file => file && file[0] && (file[0].name.toLowerCase().endsWith('.zip') || file[0].name.toLowerCase().endsWith('.rar') || file[0].name.toLowerCase().endsWith('.txt') || file[0].name.toLowerCase().endsWith('.pdf')) && file[0].size <= 50 * 1024 * 1024
                                  })} disabled={infoLoading} type="file" accept=".zip,.rar,.pdf,.txt" className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" />
                                </label>
                                {errors3.product?.type === 'required' && <span className='text-red-500 italic'>File is required</span>}
                                {errors3.product?.type === 'validate' && <span className='text-red-500 italic'>Invalid product</span>}

                                <label className="block">
                                  <span className="text-black">Set the price of your product <span className="text-sm italic text-gray-400">(In US Dollars)</span></span>
                                  <input {...register3('price', { required: true })} disabled={infoLoading} type="number" min="0" step="0.01" placeholder="4.99" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" />
                                </label>
                                {errors3.price && <span className='text-red-500 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-black">What AI is this product for?</span>
                                  <input {...register3('ai', { required: true })} disabled={infoLoading} placeholder="GPT-4" autoComplete="off" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" maxLength="25" />
                                </label>
                                {errors3.ai && <span className='text-red-500 italic'>This field is required</span>}
                                <div className='flex flex-wrap items-center justify-center'>
                                  <button type="submit" disabled={infoLoading} className={`px-4 py-2.5 flex-1 rounded-md border border-[#04E762] bg-[#04E762] text-black md:max-w-[170px] w-fit font-bold text-sm`}>
                                    {infoLoading ? <ClipLoader /> : 'Continue'}
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          </>
                        ) : (
                          <>
                          <FaArrowLeft onClick={() => setFormSubmitted(false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[20%] md:right-0 right-[5%] cursor-pointer text-black hover:text-[#04E762] transition-all ease-in-out' />
                          <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                          <div className='md:max-w-[75%] max-w-[90%] m-auto'>
                                  <h2 className='2xl:text-[4rem] text-[2rem] text-center font-black text-black'>One last step!</h2>
                                  <p className='w-full font-normal text-gray-600 text-base text-center mt-2 mb-4'>
                                    This is how your product will be visible on the marketplace once it gets approved.
                                  </p>
                                  <div className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                                    <div className='relative max-w-full md:max-w-[350px] m-auto'>
                                      <img src={promptThumbnailPreview} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                                      <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                                        <p className="font-semibold uppercase">{preview.ai}</p>
                                      </div>
                                      <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-[#04E762] bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                                        <p className="font-bold text-black">${preview.price}</p>
                                      </div>
                                    </div>
                                    <div className='pt-2 md:pt-4 border rounded-b-md bg-black border-black max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                                      <h3 className='capitalize text-base md:text-lg font-bold text-white truncate'>{preview.title}</h3>
                                      <p className='italic text-white text-xs md:text-sm line-clamp-3'>{preview.desc}</p>
                                    </div>
                                  </div>
                                  <p className='w-full font-normal text-gray-600 text-base text-center mt-2 mb-4'>
                                    Before sending it for approval, please read and agree to our terms of service. <br></br> You'll receive an email once your product gets approved or rejected.
                                  </p>
                                  <label className="flex items-center justify-center space-x-2">
                                    <input required disabled={infoLoading} type="checkbox" className="disabled:opacity-25 disabled:grayscale form-checkbox h-5 w-5 text-[#04E762]" onChange={handleCheckboxChange} />
                                    <span className="text-gray-600">I've read and I agree to the <Link target='_blank' href="../terms" className='font-medium'>terms of service</Link> and the <Link target='_blank' href="../privacy-policy" className='font-medium'>privacy policy</Link></span>
                                  </label>
                                </div>
                            <div className='flex flex-wrap items-center justify-center mt-4'>
                            <button type="button" 
                              onClick={
                                () => uploadProductDirect()} 
                              disabled={!termsChecked || infoLoading} className={`px-4 py-2.5 flex-1 rounded-md border border-[#04E762] bg-[#04E762] text-black md:max-w-[170px] disabled:opacity-50 w-fit font-bold text-sm`}>
                                {infoLoading ? <ClipLoader /> : 'Continue'}
                              </button>
                            </div>
                          </motion.div>
                          {showMessageRef.current == false ? '' :
                                <motion.div className={`absolute w-1/2 h-auto p-4 rounded-xl z-50 flex flex-col flex-wrap items-center justify-center gap-2 ${messageRef.current.status === 'success' ? 'bg-[#388445]' : 'bg-[#ff5555]'}`}>
                                <h2 className='2xl:text-[3rem] text-[1.5rem] font-black text-white'>{messageRef.current.status === 'success' ? '¡Success!' : '¡Oops!'}</h2>
                                <p className='text-center text-white'>{messageRef.current.text}</p>
                                <CustomLink 
                                    type='filled' 
                                    title={messageRef.current.status === 'success' ? 'Go to the Market' : 'Retry'}
                                    path={messageRef.current.status === 'success' ? `/marketplace` : '/sell'}
                                    customStyles='md:max-w-[170px] px-4 py-2.5 font-bold text-sm' 
                                />
                            </motion.div>
                            }
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
                {snap.step4 && snap.step4Image && (
                  <>
                    <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                      <div className='md:max-w-[75%] max-w-[90%] m-auto'>
                        <h2 className='2xl:text-[4rem] text-[2rem] text-center font-black text-black'>Success!</h2>
                        <p className='w-full font-normal text-gray-600 text-base text-center mt-2 mb-4'>
                          You've just submitted your product! <br></br> Once it gets approved you will receive a notification in your email, also it will be visible and buyable for all the users on the marketplace. <br></br><br></br>
                          Check the info of the product you've just submitted:
                        </p>
                        <div className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                          <div className='relative max-w-full md:max-w-[350px] m-auto'>
                            <img src={imageThumbnailPreview} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                            <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                              <p className="font-semibold uppercase">{preview.ai}</p>
                            </div>
                            <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-[#04E762] bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                              <p className="font-bold text-black">${preview.price}</p>
                            </div>
                          </div>
                          <div className='pt-2 md:pt-4 border rounded-b-md bg-black border-black max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                            <h3 className='capitalize text-base md:text-lg font-bold text-white truncate'>{preview.title}</h3>
                            <p className='italic text-white text-xs md:text-sm line-clamp-3'>{preview.desc}</p>
                          </div>
                        </div>
                      </div>
                      <div className='flex flex-wrap items-center justify-center mt-4'>
                        <CustomLink type='filled' title='Go to the Market' path={`/marketplace`} customStyles='md:max-w-[170px] px-4 py-2.5 font-bold text-sm' />
                      </div>
                    </motion.div>
                  </>
                )}
                {snap.step4 && snap.step4Text && (
                  <>
                    <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                      <div className='md:max-w-[75%] max-w-[90%] m-auto'>
                        <h2 className='2xl:text-[4rem] text-[2rem] text-center font-black text-black'>Success!</h2>
                        <p className='w-full font-normal text-gray-600 text-base text-center mt-2 mb-4'>
                          You've just submitted your product! <br></br> Once it gets approved you will receive a notification in your email, also it will be visible and buyable for all the users on the marketplace. <br></br><br></br>
                          Check the info of the product you've just submitted:
                        </p>
                        <div className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                          <div className='relative max-w-full md:max-w-[350px] m-auto'>
                            <img src={textThumbnailPreview} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                            <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                              <p className="font-semibold uppercase">{preview.ai}</p>
                            </div>
                            <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-[#04E762] bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                              <p className="font-bold text-black">${preview.price}</p>
                            </div>
                          </div>
                          <div className='pt-2 md:pt-4 border rounded-b-md bg-black border-black max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                            <h3 className='capitalize text-base md:text-lg font-bold text-white truncate'>{preview.title}</h3>
                            <p className='italic text-white text-xs md:text-sm line-clamp-3'>{preview.desc}</p>
                          </div>
                        </div>
                      </div>
                      <div className='flex flex-wrap items-center justify-center mt-4'>
                        <CustomLink type='filled' title='Go to the Market' path={`/marketplace`} customStyles='md:max-w-[170px] px-4 py-2.5 font-bold text-sm' />
                      </div>
                    </motion.div>
                  </>
                )}
                {snap.step4 && snap.step4Prompt && (
                  <>
                    <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                      <div className='md:max-w-[75%] max-w-[90%] m-auto'>
                        <h2 className='2xl:text-[4rem] text-[2rem] text-center font-black text-black'>Success!</h2>
                        <p className='w-full font-normal text-gray-600 text-base text-center mt-2 mb-4'>
                          You've just submitted your product! <br></br> Once it gets approved you will receive a notification in your email, also it will be visible and buyable for all the users on the marketplace. <br></br><br></br>
                          Check the info of the product you've just submitted:
                        </p>
                        <div className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                          <div className='relative max-w-full md:max-w-[350px] m-auto'>
                            <img src={promptThumbnailPreview} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                            <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                              <p className="font-semibold uppercase">{preview.ai}</p>
                            </div>
                            <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-[#04E762] bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                              <p className="font-bold text-black">${preview.price}</p>
                            </div>
                          </div>
                          <div className='pt-2 md:pt-4 border rounded-b-md bg-black border-black max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                            <h3 className='capitalize text-base md:text-lg font-bold text-white truncate'>{preview.title}</h3>
                            <p className='italic text-white text-xs md:text-sm line-clamp-3'>{preview.desc}</p>
                          </div>
                        </div>
                      </div>
                      <div className='flex flex-wrap items-center justify-center mt-4'>
                        <CustomLink type='filled' title='Go to the Market' path={`/marketplace`} customStyles='md:max-w-[170px] px-4 py-2.5 font-bold text-sm' />
                      </div>
                    </motion.div>
                  </>
                )}
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
            <motion.div className='max-w-[1920px] m-auto'>
              <motion.div className='flex flex-row flex-wrap md:min-h-screen md:w-full lg:justify-around justify-start items-center 2xl:py-8 2xl:px-36 sm:p-8 p-6 max-2xl:gap-7 max-w-[1920px] m-auto'>
                {snap.step1 && (
                  <>
                    <motion.section {...slideAnimation('left')}>
                      <motion.header {...slideAnimation('down')}>
                        <img src={logowhite.src} alt="logo" className='w-24 h-auto object-contain' />
                      </motion.header>
                      <motion.div className='home-content' {...headContainerAnimation}>
                        <motion.div {...headTextAnimation}>
                          <h1 className='2xl:text-[4rem] text-[2rem] font-black text-white'>
                            Earn money from AI
                          </h1>
                          <motion.div {...headContentAnimation} className='flex flex-col gap-5'>
                            <p className='max-w-2xl font-normal text-white text-base'>
                              With just a few simple steps, you can join our thriving community of AI creators and start monetizing your expertise. <br></br>
                              Embrace the opportunity to make a profit with AITropy, and start making an impact in the AI community today.
                            </p>
                            <motion.div {...headContentAnimation} className='flex flex-row flex-wrap gap-2'>
                              <CustomButton type='filled' title='Sell Something' handleClick={() => (state.step2 = true) && (state.step1 = false)} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold text-sm' />
                            </motion.div>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    </motion.section>
                    <motion.section>
                      <motion.div>
                        <motion.div className="flex lg:flex-col flex-wrap justify-center items-center h-auto gap-4" {...headContentAnimation}>
                          <motion.div className="md:max-w-[450px] lg:h-[auto] lg:w-auto h-[25%] w-[75%]">
                            <img src={productdark.src} alt="Image 1" className="w-full h-full object-cover shadow-lg" />
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    </motion.section>
                  </>
                )}
                {snap.step2 && (
                  <>
                    {!user && (
                      <>
                        <motion.section {...slideAnimation('left')}>
                          <motion.header {...slideAnimation('down')}>
                            <img src={logowhite.src} alt="logo" className='w-24 h-auto object-contain' />
                          </motion.header>
                          <motion.div className='home-content' {...headContainerAnimation}>
                            <motion.div {...headTextAnimation}>
                              <h1 className='2xl:text-[4rem] text-[2rem] text-center font-black text-white'>
                                Access your account to start selling
                              </h1>
                              <motion.div {...headContentAnimation} className='flex flex-col gap-5'>
                                <p className='w-full font-normal text-white text-base text-center mt-2 mb-4'>
                                  Log in to your account or create a new one on AITropy to start selling your products.
                                </p>
                              </motion.div>
                              <motion.div {...headContentAnimation} className='flex flex-row flex-wrap gap-2'>
                                <GoogleButton handleClick={() => signInWithGoogle()} text="Continue with Google" />
                              </motion.div>
                            </motion.div>
                          </motion.div>
                        </motion.section>
                      </>
                    )}
                    {user && (
                      <>
                        <FaArrowLeft onClick={() => (state.step1 = true) && (state.step2 = false)} size={30} className='absolute top-[25%] md:left-[25%] md:right-0 right-[5%] cursor-pointer text-white hover:text-[#04E762] transition-all ease-in-out' />
                        <motion.section {...slideAnimation('left')}>
                          <motion.header {...slideAnimation('down')}>
                            <img src={logowhite.src} alt="logo" className='w-24 h-auto object-contain' />
                          </motion.header>
                          <motion.div className='home-content md:mt-0 mt-10' {...headContainerAnimation}>
                            <motion.div>
                              <h1 className='2xl:text-[4rem] text-[2rem] text-center font-black text-white'>
                                What do you want to sell?
                              </h1>
                              <motion.div className='flex flex-col gap-5'>
                                <p className='w-full font-normal text-white text-base text-center mt-2 mb-4'>
                                  Select one of the options below to start selling.
                                </p>
                              </motion.div>
                              <motion.div className='grid md:grid-cols-3 grid-cols-1 grid-flow-row justify-center items-center gap-8'>
                                <div onClick={() => (state.step3 = true) && (state.step3Image = true) && (state.step2 = false)} className='rounded border border-white hover:border-[#04E762] text-[#04E762] text-center px-10 py-10 hover:font-bold transition-all ease-in-out cursor-pointer'>Images</div>
                                <div onClick={() => (state.step3 = true) && (state.step3Text = true) && (state.step2 = false)} className='rounded border border-white hover:border-[#04E762] text-[#04E762] text-center px-10 py-10 hover:font-bold transition-all ease-in-out cursor-pointer'>Texts</div>
                                {/*<div onClick={() => (state.step3 = true) && (state.step3Service = true) && (state.step2 = false)} className='rounded border border-white hover:border-[#04E762] text-[#04E762] text-center px-10 py-10 hover:font-bold transition-all ease-in-out cursor-pointer'>Services</div>*/}
                                <div onClick={() => (state.step3 = true) && (state.step3Prompt = true) && (state.step2 = false)} className='rounded border border-white hover:border-[#04E762] text-[#04E762] text-center px-10 py-10 hover:font-bold transition-all ease-in-out cursor-pointer'>Prompts</div>
                              </motion.div>
                            </motion.div>
                          </motion.div>
                        </motion.section>
                      </>
                    )}
                  </>
                )}
                {snap.step3 && snap.step3Image && (
                  <>
                  {!user && (
                    ''
                  )}
                  {user && paypalIsActiveRef.current === false && (
                    <>
                        {!formSubmitted ? (
                          <>
                          <FaArrowLeft onClick={() => (state.step2 = true) && (state.step3Image = false) && (state.step3 = false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[20%] md:right-0 right-[5%] cursor-pointer text-white hover:text-[#04E762] transition-all ease-in-out' />
                            <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                              <form onSubmit={handleSubmit1((data) => onSubmit(data, 'image'))} className="space-y-4 mt-10">
                                <label className="block">
                                  <span className="text-white">What's the title of your product?</span>
                                  <input {...register1('title', { required: true })} disabled={infoLoading} placeholder="Pack of six great landscape images with Picasso style" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" maxLength="60" />
                                </label>
                                {errors1.title && <span className='text-yellow-300 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-white">Write a brief and cool description of your product</span>
                                  <textarea {...register1('desc', { required: true })} disabled={infoLoading} rows={3} placeholder="This pack features six stunning landscape images that have been transformed with a unique Picasso-inspired style, resulting in a vibrant and abstract collection that will add a touch of artistic flair to any setting." className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" maxLength="480" />
                                </label>
                                {errors1.desc && <span className='text-yellow-300 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-white">Upload a thumbnail to show potential buyers what your product is about <br></br> <span className="text-sm italic text-gray-400">(PNG, JPG, WebP, AVIF, max 5MB)</span></span>
                                  <input {...register1('thumbnail', {
                                    required: true,
                                    validate: file => file && file[0] && file[0].type.includes('image/') && file[0].size <= 5 * 1024 * 1024
                                  })} disabled={infoLoading} type="file" accept=".png,.jpg,.jpeg,.webp,.avif" className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" onChange={(e) => onThumbnailChange(e, 'image')} />
                                </label>
                                {errors1.thumbnail?.type === 'required' && <span className='text-yellow-300 italic'>File is required</span>}
                                {errors1.thumbnail?.type === 'validate' && <span className='text-yellow-300 italic'>Invalid file</span>}
                                {imageThumbnailPreview && <img src={imageThumbnailPreview} alt="Thumbnail preview" className='max-w-[200px] h-auto max-h-[200px] border border-white rounded' />}

                                <label className="block">
                                  <span className="text-white">
                                    Upload the images your client will receive once they buy your product<br></br>
                                    <span className="text-sm italic text-gray-400">(PNG, JPG, WebP, AVIF, max 50MB total)</span>
                                  </span>
                                  <input
                                    {...register1('product', {
                                      required: true,
                                      validate: files => {
                                        const totalSize = Array.from(files).reduce((acc, file) => acc + file.size, 0);
                                        return files && Array.from(files).every(file => ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) && totalSize <= 50 * 1024 * 1024;
                                      }
                                    })}
                                    disabled={infoLoading}
                                    type="file"
                                    accept=".png,.jpg,.jpeg,.webp,.avif"
                                    multiple
                                    className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out"
                                  />
                                </label>
                                {errors1.product?.type === 'required' && <span className='text-yellow-300 italic'>Files are required</span>}
                                {errors1.product?.type === 'validate' && <span className='text-yellow-300 italic'>Invalid product</span>}

                                <label className="block">
                                  <span className="text-white">Set the price of your product <span className="text-sm italic text-gray-400">(In US Dollars)</span></span>
                                  <input {...register1('price', { required: true })} disabled={infoLoading} type="number" min="0" step="0.01" placeholder="4.99" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" />
                                </label>
                                {errors1.price && <span className='text-yellow-300 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-white">What AI have you used for this product?</span>
                                  <input {...register1('ai', { required: true })} disabled={infoLoading} placeholder="Midjourney" autoComplete="off" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" maxLength="25" />
                                </label>
                                {errors1.ai && <span className='text-yellow-300 italic'>This field is required</span>}
                                <div className='flex flex-wrap items-center justify-center'>
                                  <button type="submit" disabled={infoLoading} className={`px-4 py-2.5 flex-1 rounded-md border border-[#04E762] bg-transparent text-[#04E762] md:max-w-[170px] w-fit font-bold text-sm`}>
                                    {infoLoading ? <ClipLoader /> : 'Continue'}
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          </>
                        ) : (
                          <>
                          <FaArrowLeft onClick={() => setFormSubmitted(false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[20%] md:right-0 right-[5%] cursor-pointer text-white hover:text-[#04E762] transition-all ease-in-out' />
                              <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                                <div className='md:max-w-[75%] max-w-[90%] m-auto'>
                                  <h2 className='2xl:text-[4rem] text-[2rem] text-center font-black text-white'>One last step!</h2>
                                  <p className='w-full font-normal text-gray-300 text-base text-center mt-2 mb-4'>
                                    This is how your product will be visible on the marketplace once it gets approved.
                                  </p>
                                  <div className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                                    <div className='relative max-w-full md:max-w-[350px] m-auto'>
                                      <img src={imageThumbnailPreview} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                                      <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                                        <p className="font-semibold uppercase">{preview.ai}</p>
                                      </div>
                                      <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                                        <p className="font-bold text-white">${preview.price}</p>
                                      </div>
                                    </div>
                                    <div className='pt-2 md:pt-4 border rounded-b-md bg-[#04E762] border-[#04E762] max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                                      <h3 className='capitalize text-base md:text-lg font-bold text-black truncate'>{preview.title}</h3>
                                      <p className='italic text-black text-xs md:text-sm line-clamp-3'>{preview.desc}</p>
                                    </div>
                                  </div>
                                  <p className='w-full font-normal text-gray-300 text-base text-center mt-2 mb-4'>
                                    Before sending it for approval, you have to integrate your PayPal account using the button below to be able to receive the funds of your sales. <br></br> Once you complete the PayPal login process, your product will be automatically send to review. <br></br> You'll receive an email once your product gets approved or rejected.
                                  </p>
                                  <label className="flex items-center justify-center space-x-2">
                                    <input required disabled={infoLoading} type="checkbox" className="disabled:opacity-25 disabled:grayscale form-checkbox h-5 w-5 text-[#04E762]" onChange={handleCheckboxChange} />
                                    <span className="text-white">I've read and I agree to the <Link target='_blank' href="../terms" className='font-medium'>terms of service</Link> and the <Link target='_blank' href="../privacy-policy" className='font-medium'>privacy policy</Link></span>
                                  </label>
                                </div>
                                <div className='flex flex-wrap items-center justify-center mt-4'>
                                  <button disabled={!termsChecked || infoLoading} className='flex flex-wrap items-center justify-center gap-2 rounded-md border border-[#EEEEEE] bg-[#EEEEEE] font-semibold px-4 py-2.5 disabled:opacity-50' type='button' onClick={() => uploadProduct()}>{infoLoading ? <ClipLoader /> : <><FaPaypal size={25} className='text-[#0070BA]'/> Continue with PayPal</>}</button>
                                </div>
                              </motion.div>
                          </>
                        )}
                    </>
                  )}
                  {user && paypalIsActiveRef.current === true && (
                    <>
                        {!formSubmitted ? (
                          <>
                          <FaArrowLeft onClick={() => (state.step2 = true) && (state.step3Image = false) && (state.step3 = false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[20%] md:right-0 right-[5%] cursor-pointer text-white hover:text-[#04E762] transition-all ease-in-out' />
                            <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                              <form onSubmit={handleSubmit1((data) => onSubmit(data, 'image'))} className="space-y-4 mt-10">
                                <label className="block">
                                  <span className="text-white">What's the title of your product?</span>
                                  <input {...register1('title', { required: true })} disabled={infoLoading} placeholder="Pack of six great landscape images with Picasso style" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" maxLength="60" />
                                </label>
                                {errors1.title && <span className='text-yellow-300 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-white">Write a brief and cool description of your product</span>
                                  <textarea {...register1('desc', { required: true })} disabled={infoLoading} rows={3} placeholder="This pack features six stunning landscape images that have been transformed with a unique Picasso-inspired style, resulting in a vibrant and abstract collection that will add a touch of artistic flair to any setting." className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" maxLength="480" />
                                </label>
                                {errors1.desc && <span className='text-yellow-300 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-white">Upload a thumbnail to show potential buyers what your product is about <br></br> <span className="text-sm italic text-gray-400">(PNG, JPG, WebP, AVIF, max 5MB)</span></span>
                                  <input {...register1('thumbnail', {
                                    required: true,
                                    validate: file => file && file[0] && file[0].type.includes('image/') && file[0].size <= 5 * 1024 * 1024
                                  })} disabled={infoLoading} type="file" accept=".png,.jpg,.jpeg,.webp,.avif" className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" onChange={(e) => onThumbnailChange(e, 'image')} />
                                </label>
                                {errors1.thumbnail?.type === 'required' && <span className='text-yellow-300 italic'>File is required</span>}
                                {errors1.thumbnail?.type === 'validate' && <span className='text-yellow-300 italic'>Invalid file</span>}
                                {imageThumbnailPreview && <img src={imageThumbnailPreview} alt="Thumbnail preview" className='max-w-[200px] h-auto max-h-[200px] border border-white rounded' />}

                                <label className="block">
                                  <span className="text-white">
                                    Upload the images your client will receive once they buy your product<br></br>
                                    <span className="text-sm italic text-gray-400">(PNG, JPG, WebP, AVIF, max 50MB total)</span>
                                  </span>
                                  <input
                                    {...register1('product', {
                                      required: true,
                                      validate: files => {
                                        const totalSize = Array.from(files).reduce((acc, file) => acc + file.size, 0);
                                        return files && Array.from(files).every(file => ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) && totalSize <= 50 * 1024 * 1024;
                                      }
                                    })}
                                    disabled={infoLoading}
                                    type="file"
                                    accept=".png,.jpg,.jpeg,.webp,.avif"
                                    multiple
                                    className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out"
                                  />
                                </label>
                                {errors1.product?.type === 'required' && <span className='text-yellow-300 italic'>Files are required</span>}
                                {errors1.product?.type === 'validate' && <span className='text-yellow-300 italic'>Invalid product</span>}

                                <label className="block">
                                  <span className="text-white">Set the price of your product <span className="text-sm italic text-gray-400">(In US Dollars)</span></span>
                                  <input {...register1('price', { required: true })} disabled={infoLoading} type="number" min="0" step="0.01" placeholder="4.99" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" />
                                </label>
                                {errors1.price && <span className='text-yellow-300 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-white">What AI have you used for this product?</span>
                                  <input {...register1('ai', { required: true })} disabled={infoLoading} placeholder="Midjourney" autoComplete="off" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" maxLength="25" />
                                </label>
                                {errors1.ai && <span className='text-yellow-300 italic'>This field is required</span>}
                                <div className='flex flex-wrap items-center justify-center'>
                                  <button type="submit" disabled={infoLoading} className={`px-4 py-2.5 flex-1 rounded-md border border-[#04E762] bg-transparent text-[#04E762] md:max-w-[170px] w-fit font-bold text-sm`}>
                                    {infoLoading ? <ClipLoader /> : 'Continue'}
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          </>
                        ) : (
                          <>
                          <FaArrowLeft onClick={() => setFormSubmitted(false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[20%] md:right-0 right-[5%] cursor-pointer text-white hover:text-[#04E762] transition-all ease-in-out' />
                              <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                                <div className='md:max-w-[75%] max-w-[90%] m-auto'>
                                  <h2 className='2xl:text-[4rem] text-[2rem] text-center font-black text-white'>One last step!</h2>
                                  <p className='w-full font-normal text-gray-300 text-base text-center mt-2 mb-4'>
                                    This is how your product will be visible on the marketplace once it gets approved.
                                  </p>
                                  <div className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                                    <div className='relative max-w-full md:max-w-[350px] m-auto'>
                                      <img src={imageThumbnailPreview} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                                      <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                                        <p className="font-semibold uppercase">{preview.ai}</p>
                                      </div>
                                      <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                                        <p className="font-bold text-white">${preview.price}</p>
                                      </div>
                                    </div>
                                    <div className='pt-2 md:pt-4 border rounded-b-md bg-[#04E762] border-[#04E762] max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                                      <h3 className='capitalize text-base md:text-lg font-bold text-black truncate'>{preview.title}</h3>
                                      <p className='italic text-black text-xs md:text-sm line-clamp-3'>{preview.desc}</p>
                                    </div>
                                  </div>
                                  <p className='w-full font-normal text-gray-300 text-base text-center mt-2 mb-4'>
                                    Before sending it for approval, please read and agree to our terms of service. <br></br> You'll receive an email once your product gets approved or rejected.
                                  </p>
                                  <label className="flex items-center justify-center space-x-2">
                                    <input required disabled={infoLoading} type="checkbox" className="disabled:opacity-25 disabled:grayscale form-checkbox h-5 w-5 text-[#04E762]" onChange={handleCheckboxChange} />
                                    <span className="text-white">I've read and I agree to the <Link target='_blank' href="../terms" className='font-medium'>terms of service</Link> and the <Link target='_blank' href="../privacy-policy" className='font-medium'>privacy policy</Link></span>
                                  </label>
                                </div>
                                <div className='flex flex-wrap items-center justify-center mt-4'>
                                  <button type="button"
                                    onClick={
                                      () => uploadProductDirect()}
                                    disabled={!termsChecked || infoLoading} className={`px-4 py-2.5 flex-1 rounded-md border border-[#04E762] bg-transparent text-[#04E762] md:max-w-[170px] disabled:opacity-20 w-fit font-bold text-sm`}>
                                    {infoLoading ? <ClipLoader /> : 'Continue'}
                                  </button>
                                </div>
                              </motion.div>
                              {showMessageRef.current == false ? '' :
                                <motion.div className={`absolute w-1/2 h-auto p-4 rounded-xl z-50 flex flex-col flex-wrap items-center justify-center gap-2 ${messageRef.current.status === 'success' ? 'bg-[#388445]' : 'bg-[#ff5555]'}`}>
                                  <h2 className='2xl:text-[3rem] text-[1.5rem] font-black text-white'>{messageRef.current.status === 'success' ? '¡Success!' : '¡Oops!'}</h2>
                                  <p className='text-center text-white'>{messageRef.current.text}</p>
                                  <CustomLink
                                    type='filled'
                                    title={messageRef.current.status === 'success' ? 'Go to the Market' : 'Retry'}
                                    path={messageRef.current.status === 'success' ? `/marketplace` : '/sell'}
                                    customStyles='md:max-w-[170px] px-4 py-2.5 font-bold text-sm'
                                  />
                                </motion.div>
                              }
                          </>
                        )}
                    </>
                  )}
                  </>
                )}
                {snap.step3 && snap.step3Text && (
                  <>
                  {!user && (
                    ''
                  )}
                  {user && paypalIsActiveRef.current === false && (
                    <>
                        {!formSubmitted ? (
                          <>
                            <FaArrowLeft onClick={() => (state.step2 = true) && (state.step3Text = false) && (state.step3 = false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[25%] md:right-0 right-[5%] cursor-pointer text-white hover:text-[#04E762] transition-all ease-in-out' />
                            <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                              <form onSubmit={handleSubmit2((data) => onSubmit(data, 'text'))} className="space-y-4 mt-10">
                                <label className="block">
                                  <span className="text-white">What's the title of your product?</span>
                                  <input {...register2('title', { required: true })} disabled={infoLoading} placeholder="Story of a XXII century robot superhero" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" maxLength="60" />
                                </label>
                                {errors2.title && <span className='text-yellow-300 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-white">Write a brief and cool description of your product</span>
                                  <textarea {...register2('desc', { required: true })} disabled={infoLoading} rows={3} placeholder="In the 22nd century, a robotic superhero battles for justice and humanity, weaving an epic tale of courage, hope, and technology." className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" maxLength="480" />
                                </label>
                                {errors2.desc && <span className='text-yellow-300 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-white">Upload a thumbnail to show potential buyers what your product is about <br></br> <span className="text-sm italic text-gray-400">(PNG, JPG, WebP, AVIF, max 5MB)</span></span>
                                  <input {...register2('thumbnail', {
                                    required: true,
                                    validate: file => file && file[0] && file[0].type.includes('image/') && file[0].size <= 5 * 1024 * 1024
                                  })} disabled={infoLoading} type="file" accept=".png,.jpg,.jpeg,.webp,.avif" className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" onChange={(e) => onThumbnailChange(e, 'text')} />
                                </label>
                                {errors2.thumbnail?.type === 'required' && <span className='text-yellow-300 italic'>File is required</span>}
                                {errors2.thumbnail?.type === 'validate' && <span className='text-yellow-300 italic'>Invalid file</span>}
                                {textThumbnailPreview && <img src={textThumbnailPreview} alt="Thumbnail preview" className='max-w-[200px] h-auto max-h-[200px] border border-white rounded' />}

                                <label className="block">
                                  <span className="text-white">Upload a PDF or a compressed folder with the text your client will receive once they buy your product<br></br> <span className="text-sm italic text-gray-400">(PDF or ZIP, RAR, max 50MB)</span></span>
                                  <input {...register2('product', {
                                    required: true,
                                    validate: file => file && file[0] && (file[0].name.toLowerCase().endsWith('.pdf') || file[0].name.toLowerCase().endsWith('.zip') || file[0].name.toLowerCase().endsWith('.rar')) && file[0].size <= 50 * 1024 * 1024
                                  })} disabled={infoLoading} type="file" accept=".pdf,.zip,.rar" className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" />
                                </label>
                                {errors2.product?.type === 'required' && <span className='text-yellow-300 italic'>File is required</span>}
                                {errors2.product?.type === 'validate' && <span className='text-yellow-300 italic'>Invalid product</span>}

                                <label className="block">
                                  <span className="text-white">Set the price of your product <span className="text-sm italic text-gray-400">(In US Dollars)</span></span>
                                  <input {...register2('price', { required: true })} disabled={infoLoading} type="number" min="0" step="0.01" placeholder="4.99" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" />
                                </label>
                                {errors2.price && <span className='text-yellow-300 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-white">What AI have you used for this product?</span>
                                  <input {...register2('ai', { required: true })} disabled={infoLoading} placeholder="Midjourney" autoComplete="off" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" maxLength="25" />
                                </label>
                                {errors2.ai && <span className='text-yellow-300 italic'>This field is required</span>}
                                <div className='flex flex-wrap items-center justify-center'>
                                  <button type="submit" disabled={infoLoading} className={`px-4 py-2.5 flex-1 rounded-md border border-[#04E762] bg-transparent text-[#04E762] md:max-w-[170px] w-fit font-bold text-sm`}>
                                    {infoLoading ? <ClipLoader /> : 'Continue'}
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          </>
                        ) : (
                          <>
                          <FaArrowLeft onClick={() => setFormSubmitted(false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[20%] md:right-0 right-[5%] cursor-pointer text-white hover:text-[#04E762] transition-all ease-in-out' />
                              <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                                <div className='md:max-w-[75%] max-w-[90%] m-auto'>
                                  <h2 className='2xl:text-[4rem] text-[2rem] text-center font-black text-white'>One last step!</h2>
                                  <p className='w-full font-normal text-gray-300 text-base text-center mt-2 mb-4'>
                                    This is how your product will be visible on the marketplace once it gets approved.
                                  </p>
                                  <div className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                                    <div className='relative max-w-full md:max-w-[350px] m-auto'>
                                      <img src={textThumbnailPreview} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                                      <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                                        <p className="font-semibold uppercase">{preview.ai}</p>
                                      </div>
                                      <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                                        <p className="font-bold text-white">${preview.price}</p>
                                      </div>
                                    </div>
                                    <div className='pt-2 md:pt-4 border rounded-b-md bg-[#04E762] border-[#04E762] max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                                      <h3 className='capitalize text-base md:text-lg font-bold text-black truncate'>{preview.title}</h3>
                                      <p className='italic text-black text-xs md:text-sm line-clamp-3'>{preview.desc}</p>
                                    </div>
                                  </div>
                                  <p className='w-full font-normal text-gray-300 text-base text-center mt-2 mb-4'>
                                    Before sending it for approval, you have to integrate your PayPal account using the button below to be able to receive the funds of your sales. <br></br> Once you complete the PayPal login process, your product will be automatically send to review. <br></br> You'll receive an email once your product gets approved or rejected.
                                  </p>
                                  <label className="flex items-center justify-center space-x-2">
                                    <input required disabled={infoLoading} type="checkbox" className="disabled:opacity-25 disabled:grayscale form-checkbox h-5 w-5 text-[#04E762]" onChange={handleCheckboxChange} />
                                    <span className="text-white">I've read and I agree to the <Link target='_blank' href="../terms" className='font-medium'>terms of service</Link> and the <Link target='_blank' href="../privacy-policy" className='font-medium'>privacy policy</Link></span>
                                  </label>
                                </div>
                                <div className='flex flex-wrap items-center justify-center mt-4'>
                                  <button disabled={!termsChecked || infoLoading} className='flex flex-wrap items-center justify-center gap-2 rounded-md border border-[#EEEEEE] bg-[#EEEEEE] font-semibold px-4 py-2.5 disabled:opacity-50' type='button' onClick={() => window.location.href = isLiveEnvState === true ? `${process.env.NEXT_PUBLIC_PAYPAL_LOGIN_URL_LIVE}` : `${process.env.NEXT_PUBLIC_PAYPAL_LOGIN_URL_SANDBOX}` }>{infoLoading ? <ClipLoader /> : <><FaPaypal size={25} className='text-[#0070BA]'/> Continue with PayPal</>}</button>
                                </div>
                              </motion.div>
                          </>
                        )}
                    </>
                  )}
                  {user && paypalIsActiveRef.current === true && (
                    <>
                        {!formSubmitted ? (
                          <>
                            <FaArrowLeft onClick={() => (state.step2 = true) && (state.step3Text = false) && (state.step3 = false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[25%] md:right-0 right-[5%] cursor-pointer text-white hover:text-[#04E762] transition-all ease-in-out' />
                            <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                              <form onSubmit={handleSubmit2((data) => onSubmit(data, 'text'))} className="space-y-4 mt-10">
                                <label className="block">
                                  <span className="text-white">What's the title of your product?</span>
                                  <input {...register2('title', { required: true })} disabled={infoLoading} placeholder="Story of a XXII century robot superhero" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" maxLength="60" />
                                </label>
                                {errors2.title && <span className='text-yellow-300 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-white">Write a brief and cool description of your product</span>
                                  <textarea {...register2('desc', { required: true })} disabled={infoLoading} rows={3} placeholder="In the 22nd century, a robotic superhero battles for justice and humanity, weaving an epic tale of courage, hope, and technology." className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" maxLength="480" />
                                </label>
                                {errors2.desc && <span className='text-yellow-300 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-white">Upload a thumbnail to show potential buyers what your product is about <br></br> <span className="text-sm italic text-gray-400">(PNG, JPG, WebP, AVIF, max 5MB)</span></span>
                                  <input {...register2('thumbnail', {
                                    required: true,
                                    validate: file => file && file[0] && file[0].type.includes('image/') && file[0].size <= 5 * 1024 * 1024
                                  })} disabled={infoLoading} type="file" accept=".png,.jpg,.jpeg,.webp,.avif" className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" onChange={(e) => onThumbnailChange(e, 'text')} />
                                </label>
                                {errors2.thumbnail?.type === 'required' && <span className='text-yellow-300 italic'>File is required</span>}
                                {errors2.thumbnail?.type === 'validate' && <span className='text-yellow-300 italic'>Invalid file</span>}
                                {textThumbnailPreview && <img src={textThumbnailPreview} alt="Thumbnail preview" className='max-w-[200px] h-auto max-h-[200px] border border-white rounded' />}

                                <label className="block">
                                  <span className="text-white">Upload a PDF or a compressed folder with the text your client will receive once they buy your product<br></br> <span className="text-sm italic text-gray-400">(PDF or ZIP, RAR, max 50MB)</span></span>
                                  <input {...register2('product', {
                                    required: true,
                                    validate: file => file && file[0] && (file[0].name.toLowerCase().endsWith('.pdf') || file[0].name.toLowerCase().endsWith('.zip') || file[0].name.toLowerCase().endsWith('.rar')) && file[0].size <= 50 * 1024 * 1024
                                  })} disabled={infoLoading} type="file" accept=".pdf,.zip,.rar" className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" />
                                </label>
                                {errors2.product?.type === 'required' && <span className='text-yellow-300 italic'>File is required</span>}
                                {errors2.product?.type === 'validate' && <span className='text-yellow-300 italic'>Invalid product</span>}

                                <label className="block">
                                  <span className="text-white">Set the price of your product <span className="text-sm italic text-gray-400">(In US Dollars)</span></span>
                                  <input {...register2('price', { required: true })} disabled={infoLoading} type="number" min="0" step="0.01" placeholder="4.99" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" />
                                </label>
                                {errors2.price && <span className='text-yellow-300 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-white">What AI have you used for this product?</span>
                                  <input {...register2('ai', { required: true })} disabled={infoLoading} placeholder="Midjourney" autoComplete="off" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" maxLength="25" />
                                </label>
                                {errors2.ai && <span className='text-yellow-300 italic'>This field is required</span>}
                                <div className='flex flex-wrap items-center justify-center'>
                                  <button type="submit" disabled={infoLoading} className={`px-4 py-2.5 flex-1 rounded-md border border-[#04E762] bg-transparent text-[#04E762] md:max-w-[170px] w-fit font-bold text-sm`}>
                                    {infoLoading ? <ClipLoader /> : 'Continue'}
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          </>
                        ) : (
                          <>
                          <FaArrowLeft onClick={() => setFormSubmitted(false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[20%] md:right-0 right-[5%] cursor-pointer text-white hover:text-[#04E762] transition-all ease-in-out' />
                              <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                                <div className='md:max-w-[75%] max-w-[90%] m-auto'>
                                  <h2 className='2xl:text-[4rem] text-[2rem] text-center font-black text-white'>One last step!</h2>
                                  <p className='w-full font-normal text-gray-300 text-base text-center mt-2 mb-4'>
                                    This is how your product will be visible on the marketplace once it gets approved.
                                  </p>
                                  <div className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                                    <div className='relative max-w-full md:max-w-[350px] m-auto'>
                                      <img src={textThumbnailPreview} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                                      <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                                        <p className="font-semibold uppercase">{preview.ai}</p>
                                      </div>
                                      <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                                        <p className="font-bold text-white">${preview.price}</p>
                                      </div>
                                    </div>
                                    <div className='pt-2 md:pt-4 border rounded-b-md bg-[#04E762] border-[#04E762] max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                                      <h3 className='capitalize text-base md:text-lg font-bold text-black truncate'>{preview.title}</h3>
                                      <p className='italic text-black text-xs md:text-sm line-clamp-3'>{preview.desc}</p>
                                    </div>
                                  </div>
                                  <p className='w-full font-normal text-gray-300 text-base text-center mt-2 mb-4'>
                                    Before sending it for approval, please read and agree to our terms of service. <br></br> You'll receive an email once your product gets approved or rejected.
                                  </p>
                                  <label className="flex items-center justify-center space-x-2">
                                    <input required disabled={infoLoading} type="checkbox" className="disabled:opacity-25 disabled:grayscale form-checkbox h-5 w-5 text-[#04E762]" onChange={handleCheckboxChange} />
                                    <span className="text-white">I've read and I agree to the <Link target='_blank' href="../terms" className='font-medium'>terms of service</Link> and the <Link target='_blank' href="../privacy-policy" className='font-medium'>privacy policy</Link></span>
                                  </label>
                                </div>
                                <div className='flex flex-wrap items-center justify-center mt-4'>
                                  <button type="button"
                                    onClick={
                                      () => uploadProductDirect()}
                                    disabled={!termsChecked || infoLoading} className={`px-4 py-2.5 flex-1 rounded-md border border-[#04E762] bg-transparent text-[#04E762] md:max-w-[170px] disabled:opacity-20 w-fit font-bold text-sm`}>
                                    {infoLoading ? <ClipLoader /> : 'Continue'}
                                  </button>
                                </div>
                              </motion.div>
                              {showMessageRef.current == false ? '' :
                                <motion.div className={`absolute w-1/2 h-auto p-4 rounded-xl z-50 flex flex-col flex-wrap items-center justify-center gap-2 ${messageRef.current.status === 'success' ? 'bg-[#388445]' : 'bg-[#ff5555]'}`}>
                                  <h2 className='2xl:text-[3rem] text-[1.5rem] font-black text-white'>{messageRef.current.status === 'success' ? '¡Success!' : '¡Oops!'}</h2>
                                  <p className='text-center text-white'>{messageRef.current.text}</p>
                                  <CustomLink
                                    type='filled'
                                    title={messageRef.current.status === 'success' ? 'Go to the Market' : 'Retry'}
                                    path={messageRef.current.status === 'success' ? `/marketplace` : '/sell'}
                                    customStyles='md:max-w-[170px] px-4 py-2.5 font-bold text-sm'
                                  />
                                </motion.div>
                              }
                          </>
                        )}
                    </>
                  )}
                  </>
                )}
                {snap.step3 && snap.step3Prompt && (
                  <>
                    {!user && (
                      ''
                    )}
                    {user && paypalIsActiveRef.current === false && (
                      <>
                        {!formSubmitted ? (
                          <>
                          <FaArrowLeft onClick={() => (state.step2 = true) && (state.step3Prompt = false) && (state.step3 = false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[25%] md:right-0 right-[5%] cursor-pointer text-white hover:text-[#04E762] transition-all ease-in-out' />
                            <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                              <form onSubmit={handleSubmit3((data) => onSubmit(data, 'prompt'))} className="space-y-4 mt-10">
                                <label className="block">
                                  <span className="text-white">What's the title of your product?</span>
                                  <input {...register3('title', { required: true })} disabled={infoLoading} placeholder="Anime Illustrations" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" maxLength="60" />
                                </label>
                                {errors3.title && <span className='text-yellow-300 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-white">Write a brief and cool description of your product</span>
                                  <textarea {...register3('desc', { required: true })} disabled={infoLoading} rows={3} placeholder="This prompt will generate an illustration in the style of Anime, which is totally settable!" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" maxLength="480" />
                                </label>
                                {errors3.desc && <span className='text-yellow-300 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-white">Upload a thumbnail to show potential buyers what your product is about <br></br> <span className="text-sm italic text-gray-400">(PNG, JPG, WebP, AVIF, max 5MB)</span></span>
                                  <input {...register3('thumbnail', {
                                    required: true,
                                    validate: file => file && file[0] && file[0].type.includes('image/') && file[0].size <= 5 * 1024 * 1024
                                  })} disabled={infoLoading} type="file" accept=".png,.jpg,.jpeg,.webp,.avif" className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" onChange={(e) => onThumbnailChange(e, 'prompt')} />
                                </label>
                                {errors3.thumbnail?.type === 'required' && <span className='text-yellow-300 italic'>File is required</span>}
                                {errors3.thumbnail?.type === 'validate' && <span className='text-yellow-300 italic'>Invalid file</span>}
                                {promptThumbnailPreview && <img src={promptThumbnailPreview} alt="Thumbnail preview" className='max-w-[200px] h-auto max-h-[200px] border border-[#04E762] rounded' />}

                                <label className="block">
                                  <span className="text-white">Upload a .PDF or .TXT file or a compressed folder with the prompt your client will receive once they buy your product<br></br> <span className="text-sm italic text-gray-400">(PDF, TXT or ZIP, RAR, max 50MB)</span></span>
                                  <input {...register3('product', {
                                    required: true,
                                    validate: file => file && file[0] && (file[0].name.toLowerCase().endsWith('.zip') || file[0].name.toLowerCase().endsWith('.rar') || file[0].name.toLowerCase().endsWith('.txt') || file[0].name.toLowerCase().endsWith('.pdf')) && file[0].size <= 50 * 1024 * 1024
                                  })} disabled={infoLoading} type="file" accept=".zip,.rar,.pdf,.txt" className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" />
                                </label>
                                {errors3.product?.type === 'required' && <span className='text-yellow-300 italic'>File is required</span>}
                                {errors3.product?.type === 'validate' && <span className='text-yellow-300 italic'>Invalid product</span>}

                                <label className="block">
                                  <span className="text-white">Set the price of your product <span className="text-sm italic text-gray-400">(In US Dollars)</span></span>
                                  <input {...register3('price', { required: true })} disabled={infoLoading} type="number" min="0" step="0.01" placeholder="4.99" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" />
                                </label>
                                {errors3.price && <span className='text-yellow-300 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-white">What AI is this product for?</span>
                                  <input {...register3('ai', { required: true })} disabled={infoLoading} placeholder="GPT-4" autoComplete="off" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" maxLength="25" />
                                </label>
                                {errors3.ai && <span className='text-yellow-300 italic'>This field is required</span>}
                                <div className='flex flex-wrap items-center justify-center'>
                                  <button type="submit" disabled={infoLoading} className={`px-4 py-2.5 flex-1 rounded-md border border-[#04E762] bg-transparent text-[#04E762] md:max-w-[170px] w-fit font-bold text-sm`}>
                                    {infoLoading ? <ClipLoader /> : 'Continue'}
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          </>
                        ) : (
                          <>
                          <FaArrowLeft onClick={() => setFormSubmitted(false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[20%] md:right-0 right-[5%] cursor-pointer text-white hover:text-[#04E762] transition-all ease-in-out' />
                              <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                                <div className='md:max-w-[75%] max-w-[90%] m-auto'>
                                  <h2 className='2xl:text-[4rem] text-[2rem] text-center font-black text-white'>One last step!</h2>
                                  <p className='w-full font-normal text-gray-300 text-base text-center mt-2 mb-4'>
                                    This is how your product will be visible on the marketplace once it gets approved.
                                  </p>
                                  <div className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                                    <div className='relative max-w-full md:max-w-[350px] m-auto'>
                                      <img src={promptThumbnailPreview} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                                      <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                                        <p className="font-semibold uppercase">{preview.ai}</p>
                                      </div>
                                      <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                                        <p className="font-bold text-white">${preview.price}</p>
                                      </div>
                                    </div>
                                    <div className='pt-2 md:pt-4 border rounded-b-md bg-[#04E762] border-[#04E762] max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                                      <h3 className='capitalize text-base md:text-lg font-bold text-black truncate'>{preview.title}</h3>
                                      <p className='italic text-black text-xs md:text-sm line-clamp-3'>{preview.desc}</p>
                                    </div>
                                  </div>
                                  <p className='w-full font-normal text-gray-300 text-base text-center mt-2 mb-4'>
                                    Before sending it for approval, you have to integrate your PayPal account using the button below to be able to receive the funds of your sales. <br></br> Once you complete the PayPal login process, your product will be automatically send to review. <br></br> You'll receive an email once your product gets approved or rejected.
                                  </p>
                                  <label className="flex items-center justify-center space-x-2">
                                    <input required disabled={infoLoading} type="checkbox" className="disabled:opacity-25 disabled:grayscale form-checkbox h-5 w-5 text-[#04E762]" onChange={handleCheckboxChange} />
                                    <span className="text-white">I've read and I agree to the <Link target='_blank' href="../terms" className='font-medium'>terms of service</Link> and the <Link target='_blank' href="../privacy-policy" className='font-medium'>privacy policy</Link></span>
                                  </label>
                                </div>
                                <div className='flex flex-wrap items-center justify-center mt-4'>
                                  <button disabled={!termsChecked || infoLoading} className='flex flex-wrap items-center justify-center gap-2 rounded-md border border-[#EEEEEE] bg-[#EEEEEE] font-semibold px-4 py-2.5 disabled:opacity-50' type='button' onClick={() => uploadProduct()}>{infoLoading ? <ClipLoader /> : <><FaPaypal size={25} className='text-[#0070BA]'/> Continue with PayPal</>}</button>
                                </div>
                              </motion.div>
                          </>
                        )}
                      </>
                    )}
                    {user && paypalIsActiveRef.current === true && (
                      <>
                        {!formSubmitted ? (
                          <>
                          <FaArrowLeft onClick={() => (state.step2 = true) && (state.step3Prompt = false) && (state.step3 = false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[25%] md:right-0 right-[5%] cursor-pointer text-white hover:text-[#04E762] transition-all ease-in-out' />
                            <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                              <form onSubmit={handleSubmit3((data) => onSubmit(data, 'prompt'))} className="space-y-4 mt-10">
                                <label className="block">
                                  <span className="text-white">What's the title of your product?</span>
                                  <input {...register3('title', { required: true })} disabled={infoLoading} placeholder="Anime Illustrations" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" maxLength="60" />
                                </label>
                                {errors3.title && <span className='text-yellow-300 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-white">Write a brief and cool description of your product</span>
                                  <textarea {...register3('desc', { required: true })} disabled={infoLoading} rows={3} placeholder="This prompt will generate an illustration in the style of Anime, which is totally settable!" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" maxLength="480" />
                                </label>
                                {errors3.desc && <span className='text-yellow-300 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-white">Upload a thumbnail to show potential buyers what your product is about <br></br> <span className="text-sm italic text-gray-400">(PNG, JPG, WebP, AVIF, max 5MB)</span></span>
                                  <input {...register3('thumbnail', {
                                    required: true,
                                    validate: file => file && file[0] && file[0].type.includes('image/') && file[0].size <= 5 * 1024 * 1024
                                  })} disabled={infoLoading} type="file" accept=".png,.jpg,.jpeg,.webp,.avif" className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" onChange={(e) => onThumbnailChange(e, 'prompt')} />
                                </label>
                                {errors3.thumbnail?.type === 'required' && <span className='text-yellow-300 italic'>File is required</span>}
                                {errors3.thumbnail?.type === 'validate' && <span className='text-yellow-300 italic'>Invalid file</span>}
                                {promptThumbnailPreview && <img src={promptThumbnailPreview} alt="Thumbnail preview" className='max-w-[200px] h-auto max-h-[200px] border border-[#04E762] rounded' />}

                                <label className="block">
                                  <span className="text-white">Upload a .PDF or .TXT file or a compressed folder with the prompt your client will receive once they buy your product<br></br> <span className="text-sm italic text-gray-400">(PDF, TXT or ZIP, RAR, max 50MB)</span></span>
                                  <input {...register3('product', {
                                    required: true,
                                    validate: file => file && file[0] && (file[0].name.toLowerCase().endsWith('.zip') || file[0].name.toLowerCase().endsWith('.rar') || file[0].name.toLowerCase().endsWith('.txt') || file[0].name.toLowerCase().endsWith('.pdf')) && file[0].size <= 50 * 1024 * 1024
                                  })} disabled={infoLoading} type="file" accept=".zip,.rar,.pdf,.txt" className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" />
                                </label>
                                {errors3.product?.type === 'required' && <span className='text-yellow-300 italic'>File is required</span>}
                                {errors3.product?.type === 'validate' && <span className='text-yellow-300 italic'>Invalid product</span>}

                                <label className="block">
                                  <span className="text-white">Set the price of your product <span className="text-sm italic text-gray-400">(In US Dollars)</span></span>
                                  <input {...register3('price', { required: true })} disabled={infoLoading} type="number" min="0" step="0.01" placeholder="4.99" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" />
                                </label>
                                {errors3.price && <span className='text-yellow-300 italic'>This field is required</span>}

                                <label className="block">
                                  <span className="text-white">What AI is this product for?</span>
                                  <input {...register3('ai', { required: true })} disabled={infoLoading} placeholder="GPT-4" autoComplete="off" className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" maxLength="25" />
                                </label>
                                {errors3.ai && <span className='text-yellow-300 italic'>This field is required</span>}
                                <div className='flex flex-wrap items-center justify-center'>
                                  <button type="submit" disabled={infoLoading} className={`px-4 py-2.5 flex-1 rounded-md border border-[#04E762] bg-transparent text-[#04E762] md:max-w-[170px] w-fit font-bold text-sm`}>
                                    {infoLoading ? <ClipLoader /> : 'Continue'}
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          </>
                        ) : (
                          <>
                          <FaArrowLeft onClick={() => setFormSubmitted(false)} size={30} className='absolute md:top-[18%] top-[25%] md:left-[20%] md:right-0 right-[5%] cursor-pointer text-white hover:text-[#04E762] transition-all ease-in-out' />
                              <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                                <div className='md:max-w-[75%] max-w-[90%] m-auto'>
                                  <h2 className='2xl:text-[4rem] text-[2rem] text-center font-black text-white'>One last step!</h2>
                                  <p className='w-full font-normal text-gray-300 text-base text-center mt-2 mb-4'>
                                    This is how your product will be visible on the marketplace once it gets approved.
                                  </p>
                                  <div className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                                    <div className='relative max-w-full md:max-w-[350px] m-auto'>
                                      <img src={promptThumbnailPreview} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                                      <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                                        <p className="font-semibold uppercase">{preview.ai}</p>
                                      </div>
                                      <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                                        <p className="font-bold text-white">${preview.price}</p>
                                      </div>
                                    </div>
                                    <div className='pt-2 md:pt-4 border rounded-b-md bg-[#04E762] border-[#04E762] max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                                      <h3 className='capitalize text-base md:text-lg font-bold text-black truncate'>{preview.title}</h3>
                                      <p className='italic text-black text-xs md:text-sm line-clamp-3'>{preview.desc}</p>
                                    </div>
                                  </div>
                                  <p className='w-full font-normal text-gray-300 text-base text-center mt-2 mb-4'>
                                    Before sending it for approval, please read and agree to our terms of service. <br></br> You'll receive an email once your product gets approved or rejected.
                                  </p>
                                  <label className="flex items-center justify-center space-x-2">
                                    <input required disabled={infoLoading} type="checkbox" className="disabled:opacity-25 disabled:grayscale form-checkbox h-5 w-5 text-[#04E762]" onChange={handleCheckboxChange} />
                                    <span className="text-white">I've read and I agree to the <Link target='_blank' href="../terms" className='font-medium'>terms of service</Link> and the <Link target='_blank' href="../privacy-policy" className='font-medium'>privacy policy</Link></span>
                                  </label>
                                </div>
                                <div className='flex flex-wrap items-center justify-center mt-4'>
                                  <button type="button"
                                    onClick={
                                      () => uploadProductDirect()}
                                    disabled={!termsChecked || infoLoading} className={`px-4 py-2.5 flex-1 rounded-md border border-[#04E762] bg-transparent text-[#04E762] md:max-w-[170px] disabled:opacity-20 w-fit font-bold text-sm`}>
                                    {infoLoading ? <ClipLoader /> : 'Continue'}
                                  </button>
                                </div>
                              </motion.div>
                              {showMessageRef.current == false ? '' :
                                <motion.div className={`absolute w-1/2 h-auto p-4 rounded-xl z-50 flex flex-col flex-wrap items-center justify-center gap-2 ${messageRef.current.status === 'success' ? 'bg-[#388445]' : 'bg-[#ff5555]'}`}>
                                  <h2 className='2xl:text-[3rem] text-[1.5rem] font-black text-white'>{messageRef.current.status === 'success' ? '¡Success!' : '¡Oops!'}</h2>
                                  <p className='text-center text-white'>{messageRef.current.text}</p>
                                  <CustomLink
                                    type='filled'
                                    title={messageRef.current.status === 'success' ? 'Go to the Market' : 'Retry'}
                                    path={messageRef.current.status === 'success' ? `/marketplace` : '/sell'}
                                    customStyles='md:max-w-[170px] px-4 py-2.5 font-bold text-sm'
                                  />
                                </motion.div>
                              }
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
                {snap.step4 && snap.step4Image && (
                  <>
                    <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                      <div className='md:max-w-[75%] max-w-[90%] m-auto'>
                        <h2 className='2xl:text-[4rem] text-[2rem] text-center font-black text-white'>Success!</h2>
                        <p className='w-full font-normal text-gray-200 text-base text-center mt-2 mb-4'>
                          You've just submitted your product! <br></br> Once it gets approved you will receive a notification in your email, also it will be visible and buyable for all the users on the marketplace. <br></br><br></br>
                          Check the info of the product you've just submitted:
                        </p>
                        <div className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                          <div className='relative max-w-full md:max-w-[350px] m-auto'>
                            <img src={imageThumbnailPreview} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                            <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                              <p className="font-semibold uppercase">{preview.ai}</p>
                            </div>
                            <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                              <p className="font-bold text-white">${preview.price}</p>
                            </div>
                          </div>
                          <div className='pt-2 md:pt-4 border rounded-b-md bg-[#04E762] border-[#04E762] max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                            <h3 className='capitalize text-base md:text-lg font-bold text-black truncate'>{preview.title}</h3>
                            <p className='italic text-black text-xs md:text-sm line-clamp-3'>{preview.desc}</p>
                          </div>
                        </div>
                      </div>
                      <div className='flex flex-wrap items-center justify-center mt-4'>
                        <CustomLink type='outline' title='Go to the Market' path={`/marketplace`} customStyles='md:max-w-[170px] px-4 py-2.5 font-bold text-sm' />
                      </div>
                    </motion.div>
                  </>
                )}
                {snap.step4 && snap.step4Text && (
                  <>
                    <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                      <div className='md:max-w-[75%] max-w-[90%] m-auto'>
                        <h2 className='2xl:text-[4rem] text-[2rem] text-center font-black text-white'>Success!</h2>
                        <p className='w-full font-normal text-gray-200 text-base text-center mt-2 mb-4'>
                          You've just submitted your product! <br></br> Once it gets approved you will receive a notification in your email, also it will be visible and buyable for all the users on the marketplace. <br></br><br></br>
                          Check the info of the product you've just submitted:
                        </p>
                        <div className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                          <div className='relative max-w-full md:max-w-[350px] m-auto'>
                            <img src={textThumbnailPreview} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                            <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                              <p className="font-semibold uppercase">{preview.ai}</p>
                            </div>
                            <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                              <p className="font-bold text-white">${preview.price}</p>
                            </div>
                          </div>
                          <div className='pt-2 md:pt-4 border rounded-b-md bg-[#04E762] border-[#04E762] max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                            <h3 className='capitalize text-base md:text-lg font-bold text-black truncate'>{preview.title}</h3>
                            <p className='italic text-black text-xs md:text-sm line-clamp-3'>{preview.desc}</p>
                          </div>
                        </div>
                      </div>
                      <div className='flex flex-wrap items-center justify-center mt-4'>
                        <CustomLink type='outline' title='Go to the Market' path={`/marketplace`} customStyles='md:max-w-[170px] px-4 py-2.5 font-bold text-sm' />
                      </div>
                    </motion.div>
                  </>
                )}
                {snap.step4 && snap.step4Prompt && (
                  <>
                    <motion.div className='md:mt-0 mt-10' {...headContainerAnimation}>
                      <div className='md:max-w-[75%] max-w-[90%] m-auto'>
                        <h2 className='2xl:text-[4rem] text-[2rem] text-center font-black text-white'>Success!</h2>
                        <p className='w-full font-normal text-gray-200 text-base text-center mt-2 mb-4'>
                          You've just submitted your product! <br></br> Once it gets approved you will receive a notification in your email, also it will be visible and buyable for all the users on the marketplace. <br></br><br></br>
                          Check the info of the product you've just submitted:
                        </p>
                        <div className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                          <div className='relative max-w-full md:max-w-[350px] m-auto'>
                            <img src={promptThumbnailPreview} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                            <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                              <p className="font-semibold uppercase">{preview.ai}</p>
                            </div>
                            <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                              <p className="font-bold text-white">${preview.price}</p>
                            </div>
                          </div>
                          <div className='pt-2 md:pt-4 border rounded-b-md bg-[#04E762] border-[#04E762] max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                            <h3 className='capitalize text-base md:text-lg font-bold text-black truncate'>{preview.title}</h3>
                            <p className='italic text-black text-xs md:text-sm line-clamp-3'>{preview.desc}</p>
                          </div>
                        </div>
                      </div>
                      <div className='flex flex-wrap items-center justify-center mt-4'>
                        <CustomLink type='outline' title='Go to the Market' path={`/marketplace`} customStyles='md:max-w-[170px] px-4 py-2.5 font-bold text-sm' />
                      </div>
                    </motion.div>
                  </>
                )}
              </motion.div>
            </motion.div>
            <motion.div className='max-w-[3840px] m-auto mt-20'>
              <Footer />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}