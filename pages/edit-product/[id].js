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
import { useForm } from 'react-hook-form';

import { saveAs } from 'file-saver';

import { profilebg } from '../../assets';

import { v4 as uuidv4 } from 'uuid';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

import { ProductionProvider, useProduction } from '../../context/productionContext';

import isProduction from '../../hooks/isProduction';

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
    
    const isLiveEnvState = isProduction()

    const { register, handleSubmit } = useForm();

    const [title, setTitle] = useState(props.product.title)
    const [description, setDescription] = useState(props.product.desc);
    const [ai, setAi] = useState(props.product.ai);
    const [price, setPrice] = useState(props.product.price)
    const [thumbnailURL, setThumbnailURL] = useState(props.product.thumbnailURL);
    const [thumbnailPreview, setThumbnailPreview] = useState(thumbnailURL)

    const handleTitleChange = (event) => setTitle(event.target.value);
    const handleDescriptionChange = (event) => setDescription(event.target.value);
    const handleAiChange = (event) => setAi(event.target.value);
    const handlePriceChange = (event) => setPrice(event.target.value);

    const handleThumbnailChange = async (event) => {
        let selectedFile = event.target.files[0];
        
        if (selectedFile) {
          if (selectedFile.type === 'image/png' || selectedFile.type === 'image/jpeg' || selectedFile.type === 'image/avif' || selectedFile.type === 'image/webp') {
            if (selectedFile.size <= 5000000) { // 5 MB in bytes
              const storage = getStorage();
              const storageRef = ref(storage, `thumbnails/${props.product.parentCollection}/${selectedFile.name}`);
              const uploadTask = uploadBytesResumable(storageRef, selectedFile);
        
              uploadTask.on('state_changed', 
                (snapshot) => {}, 
                (error) => {
                }, 
                () => {
                  getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setThumbnailURL(downloadURL);
                    setThumbnailPreview(downloadURL);
                  });
                }
              );
            } 
          } 
        }
    };

    const onSubmit = async (data) => {
        data = {
          ...data,
          thumbnailURL
        };
      
        setLoaded(false);
      
        await updateDoc(doc(db, props.product.parentCollection, props.user.uid, 'submitted', props.product.id), data).catch(() => {}).then(() => {
          router.reload();
        })
        .catch(() => {});
      
        setLoaded(true);
      };

    return (
        <AnimatePresence>
            <Head>
                <title>Edit {props.product.title} | AITropy</title>
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
                                    <p className='text-center'>Edit your product directly by modifying the current values below.</p>
                                    <div className="flex flex-col md:flex-row justify-center items-center h-full py-4">
                                        {!loaded && (
                                            <div className='m-auto w-[100px] min-h-screen flex  items-center justify-center mt-20 mb-20'><ClipLoader size={50} color={snap.color} /></div>
                                        )}
                                        {loaded && (
                                            <>
                                                <form onSubmit={handleSubmit(onSubmit)} className='flex flex-wrap items-center justify-center'>
                                                <div className="w-full md:w-1/2 p-4">
                                                    <img src={thumbnailPreview} className="w-full h-auto object-cover rounded" alt={title} />
                                                    <div className='mt-2 flex flex-wrap justify-center items-end gap-2'>
                                                        <label>Change Thumbnail</label>
                                                        <input type="file" onChange={handleThumbnailChange} className="mt-2" />
                                                    </div>
                                                </div>
                                                <div className="w-full md:w-1/2 p-4">
                                                    <input type="text" {...register("title")} onChange={handleTitleChange} value={title} placeholder={title} className="2xl:text-[3rem] text-[1.5rem] hover:p-2 focus:p-2 font-black text-black md:text-start text-center capitalize border-2 border-white hover:border-[#04E762] focus:border-[#04E762] rounded outline-none transition-all ease-in-out" />
                                                    <div className="max-w-full">
                                                        <input type="text" {...register("desc")} onChange={handleDescriptionChange} value={description} placeholder={description} className='text-lg mb-4 text-black md:text-start text-center max-w-full line-clamp-[20] whitespace-pre-wrap hover:p-2 focus:p-2 border-2 border-white hover:border-[#04E762] focus:border-[#04E762] rounded outline-none transition-all ease-in-out'/>
                                                    </div>
                                                    <div className= "text-white bg-opacity-85 rounded py-1 px-1 md:px-2 m-auto md:m-[inherit] min-w-[100px] w-auto max-w-[180px]">
                                                        <input type="text" {...register("ai")} onChange={handleAiChange} value={ai} placeholder={ai} className='bg-black bg-opacity-85 font-semibold text-center text-sm uppercase hover:p-2 focus:p-2 border-2 border-black hover:border-[#04E762] focus:border-[#04E762] rounded outline-none transition-all ease-in-out' />
                                                    </div>
                                                    <div className='flex flex-wrap md:justify-start justify-center items-center mt-4 mb-2'>
                                                        <p className="lg:text-2xl text-xl font-bold text-[#04E762]">$</p>
                                                        <input type='number' {...register("price")} onChange={handlePriceChange} value={price} min="0" step="0.01" placeholder={price} className='lg:text-2xl text-xl font-bold text-[#04E762] hover:p-2 focus:p-2 border-2 border-white hover:border-[#04E762] focus:border-[#04E762] rounded outline-none transition-all ease-in-out' />
                                                    </div>
                                                </div>
                                                    <div className='flex flex-wrap items-center justify-center'>
                                                        <button type="submit" disabled={!loaded} className={`px-4 py-2.5 flex-1 rounded-md border border-[#04E762] bg-[#04E762] text-black md:max-w-[170px] w-fit font-bold text-sm`}>
                                                            {!loaded ? <ClipLoader /> : 'Update Product'}
                                                        </button>
                                                    </div>
                                                </form>
                                            </>
                                        )}
                                    </div>
                                    <div className='mt-20 mx-auto flex items-center justify-center'>
                                        <CustomLink type='outline' title='Back to Dashboard' path={`../dashboard/${props.user.publicID}`} customStyles='md:max-w-[200px] w-fit px-4 py-2.5 font-bold' />
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
                                    <p className='text-center text-white'>Edit your product directly by modifying the current values below.</p>
                                    <div className="flex flex-col md:flex-row justify-center items-center h-full py-4">
                                        {!loaded && (
                                            <div className='m-auto w-[100px] min-h-screen flex  items-center justify-center mt-20 mb-20'><ClipLoader size={50} color={snap.color} /></div>
                                        )}
                                        {loaded && (
                                            <>
                                                <form onSubmit={handleSubmit(onSubmit)} className='flex flex-wrap items-center justify-center'>
                                                <div className="w-full md:w-1/2 p-4">
                                                    <img src={thumbnailPreview} className="w-full h-auto object-cover rounded" alt={title} />
                                                    <div className='mt-2 flex flex-wrap justify-center items-end gap-2 text-white'>
                                                        <label>Change Thumbnail</label>
                                                        <input type="file" onChange={handleThumbnailChange} className="mt-2" />
                                                    </div>
                                                </div>
                                                <div className="w-full md:w-1/2 p-4">
                                                <input type="text" {...register("title")} onChange={handleTitleChange} value={title} placeholder={title} className="2xl:text-[3rem] text-[1.5rem] hover:p-2 focus:p-2 font-black text-white md:text-start text-center capitalize bg-gray-900 border-2 border-gray-900 hover:border-[#04E762] focus:border-[#04E762] rounded outline-none transition-all ease-in-out" />
                                                    <div className="max-w-full">
                                                        <input type="text" {...register("desc")} onChange={handleDescriptionChange} value={description} placeholder={description} className='text-lg mb-4 text-white md:text-start text-center max-w-full line-clamp-[20] whitespace-pre-wrap hover:p-2 focus:p-2 bg-gray-900 border-2 border-gray-900 hover:border-[#04E762] focus:border-[#04E762] rounded outline-none transition-all ease-in-out'/>
                                                    </div>
                                                    <div className= "text-black bg-opacity-85 rounded py-1 px-1 md:px-2 m-auto md:m-[inherit] min-w-[100px] w-auto max-w-[180px]">
                                                        <input type="text" {...register("ai")} onChange={handleAiChange} value={ai} placeholder={ai} className='bg-white bg-opacity-85 font-semibold text-center text-sm uppercase hover:p-2 focus:p-2 border-2 border-white hover:border-[#04E762] focus:border-[#04E762] rounded outline-none transition-all ease-in-out' />
                                                    </div>
                                                    <div className='flex flex-wrap md:justify-start justify-center items-center mt-4 mb-2'>
                                                        <p className="lg:text-2xl text-xl font-bold text-[#04E762]">$</p>
                                                        <input type='number' {...register("price")} onChange={handlePriceChange} value={price} min="0" step="0.01" placeholder={price} className='lg:text-2xl text-xl font-bold text-[#04E762] hover:p-2 focus:p-2 border-2 bg-gray-900 border-gray-900 hover:border-[#04E762] focus:border-[#04E762] rounded outline-none transition-all ease-in-out' />
                                                    </div>
                                                </div>
                                                    <div className='flex flex-wrap items-center justify-center'>
                                                        <button type="submit" disabled={!loaded} className={`px-4 py-2.5 flex-1 rounded-md border border-[#04E762] bg-[#04E762] text-black md:max-w-[170px] w-fit font-bold text-sm`}>
                                                            {!loaded ? <ClipLoader /> : 'Update Product'}
                                                        </button>
                                                    </div>
                                                </form>
                                            </>
                                        )}
                                    </div>
                                    <div className='mt-20 mx-auto flex items-center justify-center'>
                                        <CustomLink type='outline' title='Back to Dashboard' path={`../dashboard/${props.user.publicID}`} customStyles='md:max-w-[200px] w-fit px-4 py-2.5 font-bold' />
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
    )
}

export async function getServerSideProps(context) {
    const { id } = context.query;

    // Query across all 'approved' collections and find the document matching the publicID
    const submittedRef = collectionGroup(db, 'submitted');
    const q = query(submittedRef, where('publicID', '==', id));

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

export default Product