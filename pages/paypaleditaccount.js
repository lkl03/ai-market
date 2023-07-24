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
import { FaArrowLeft } from 'react-icons/fa'

import state from '../store'
import { CustomButton, CustomLink, GoogleButton, Navbar, NavbarLog, Footer } from '../components'
import LoginComponent from '../components/LoginComponent'
import {
    headContainerAnimation,
    headContentAnimation,
    headTextAnimation,
    slideAnimation
} from '../config/motion'

import { tile1, tile2, tile3 } from '../assets'

import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, db } from '../firebase';
import { doc, setDoc, updateDoc, collection, getDocs, where, query } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';

import { v4 as uuidv4 } from 'uuid';
import ClipLoader from "react-spinners/ClipLoader";

function PayPalUserCheck() {
    const snap = useSnapshot(state)
    const { user, loading } = useUser();
    
    const [userID, setUserID, userIDRef] = useState('');
    const [userPublicID, setUserPublicID, userPublicIDRef] = useState('');
    const [userInfo, setUserInfo, userInfoRef] = useState(null);
    const [message, setMessage] = useState({});
    
    const router = useRouter();
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            if (user) {
                setUserID(user.uid)
                fetchUserData(user.uid);
            } else {
                setUserID('');
            }
        });
    
        return () => unsubscribe();
    }, []); 
    
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get('code');
        
        setMessage(null);
        
        fetch(process.env.NEXT_PUBLIC_GET_PAYPAL_ACCESS_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: authCode })
        }).then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            }).then(data => {
                fetch(process.env.NEXT_PUBLIC_GET_PAYPAL_USER_INFO_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ access_token: data.access_token })
                }).then(response => {
                        if (!response.ok) throw new Error('Network response was not ok');
                        return response.json();
                    }).then(userInfo => {
                        setUserInfo(userInfo);
                        uploadInfoToFirebase()
                    }).catch((error) => {
                        setMessage({
                            status: 'error',
                            text: 'Something went wrong! Please try again and if the error persists reach out to us for assistance.'
                        });
                        setTimeout(() => {
                            router.push('/sell');
                        }, 4000);
                    });
            }).catch((error) => {
                setMessage({
                    status: 'error',
                    text: 'Something went wrong! Please try again and if the error persists reach out to us for assistance.'
                });
                setTimeout(() => {
                    router.push('/sell');
                }, 4000);
            });
    }, []);

    const uploadInfoToFirebase = async () => {
        const userRef = doc(db, 'users', userIDRef.current);
        await updateDoc(userRef, {
            paypalMerchantID: userInfoRef.current.payer_id,
            paypalEmail: userInfoRef.current.email
        }).then(() => {
            setMessage({
                status: 'success',
                text: 'You\'ve succesfully logged in with your PayPal account.'
            });
            setTimeout(() => {
                router.push(`/dashboard/${userPublicIDRef.current}`);
            }, 4000);
        }).catch((error) => {
            setMessage({
                status: 'error',
                text: 'Something went wrong! Please try again and if the error persists reach out to us for assistance.'
            });
            setTimeout(() => {
                router.push('/sell');
            }, 4000);
        });
    }

const fetchUserData = async (uid) => {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('uid', '==', uid));
        const querySnapshot = await getDocs(q);
    
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = {
            id: userDoc.id,
            ...userDoc.data(),
          };
          setUserPublicID(userData.publicID);
        }
    }

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
                    <motion.div className='max-w-[3840px] m-auto pointer-events-none'>
                        <NavbarLog />
                    </motion.div>
                    <motion.div className='max-w-[1920px] m-auto'>
                        <motion.div className='flex flex-row flex-wrap md:min-h-screen md:w-full lg:justify-around justify-start items-center 2xl:py-8 2xl:px-36 sm:p-8 p-6 max-2xl:gap-7 max-w-[1920px] m-auto'>
                        <div className='absolute w-full h-screen bg-black opacity-75 z-50'></div>
                        {snap.step1 && (
                            <>
                            {!message ? 
                            <motion.div className={`absolute w-1/2 h-auto p-4 rounded-xl z-50 flex flex-col flex-wrap items-center justify-center gap-2 bg-[#fff]`}>
                                <ClipLoader />
                            </motion.div> :
                                <motion.div className={`absolute w-1/2 h-auto p-4 rounded-xl z-50 flex flex-col flex-wrap items-center justify-center gap-2 ${message.status === 'success' ? 'bg-[#388445]' : 'bg-[#ff5555]'}`}>
                                <h2 className='2xl:text-[3rem] text-[1.5rem] font-black text-black'>{message.status === 'success' ? '¡Success!' : '¡Oops!'}</h2>
                                <p>{message.text}</p>
                                <CustomLink 
                                    type='filled' 
                                    title={message.status === 'success' ? 'My Dashboard' : 'Retry'}
                                    path={message.status === 'success' ? `/dashboard/${userPublicID}` : '/sell'}
                                    customStyles='md:max-w-[170px] px-4 py-2.5 font-bold text-sm' 
                                />
                            </motion.div>
                            }
                                <motion.section {...slideAnimation('left')} className='pointer-events-none'>
                                    <motion.header {...slideAnimation('down')}>
                                        {/*<img src="./threejs.png" alt="logo" className='w-8 h-8 object-contain' /> */}
                                        AI-Market
                                    </motion.header>
                                    <motion.div className='home-content' {...headContainerAnimation}>
                                        <motion.div {...headTextAnimation}>
                                        <h1 className='2xl:text-[4rem] text-[2rem] font-black text-black'>
                                            Earn money from AI
                                        </h1>
                                        <motion.div {...headContentAnimation} className='flex flex-col gap-5'>
                                            <p className='max-w-2xl font-normal text-gray-600 text-base'>
                                            With just a few simple steps, you can join our thriving community of AI creators and start monetizing your expertise. <br></br>
                                            Once your product gets approved, you'll receive 90% of revenue from every sale. <br></br>
                                            Embrace the opportunity to make a profit with AI Market, and start making an impact in the AI community today.
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
                                            <img src={tile1.src} alt="Image 1" className="w-full h-full object-cover shadow-lg" />
                                        </motion.div>
                                        </motion.div>
                                    </motion.div>
                                </motion.section>
                            </>
                        )}
                        </motion.div>
                    </motion.div>
                    <motion.div className='max-w-[3840px] m-auto mt-10 pointer-events-none'>
                        <Footer />
                    </motion.div>
                </motion.div>
                </>
            )}
            {snap.themeDark && (
                <>
                <motion.div className='max-w-[3840px] m-auto bg-gray-900'>
                    <motion.div className='max-w-[3840px] m-auto pointer-events-none'>
                        <NavbarLog />
                    </motion.div>
                    <motion.div className='max-w-[1920px] m-auto'>
                        <motion.div className='flex flex-row flex-wrap md:min-h-screen md:w-full lg:justify-around justify-start items-center 2xl:py-8 2xl:px-36 sm:p-8 p-6 max-2xl:gap-7 max-w-[1920px] m-auto'>
                            <div className='absolute w-full h-screen bg-black opacity-75 z-50'></div>
                            {snap.step1 && (
                                <>
                            {!message ? 
                            <motion.div className={`absolute w-1/2 h-auto p-4 rounded-xl z-50 flex flex-col flex-wrap items-center justify-center gap-2 bg-[#fff]`}>
                                <ClipLoader />
                            </motion.div> :
                                <motion.div className={`absolute w-1/2 h-auto p-4 rounded-xl z-50 flex flex-col flex-wrap items-center justify-center gap-2 ${message.status === 'success' ? 'bg-[#388445]' : 'bg-[#ff5555]'}`}>
                                <h2 className='2xl:text-[3rem] text-[1.5rem] font-black text-black'>{message.status === 'success' ? '¡Success!' : '¡Oops!'}</h2>
                                <p>{message.text}</p>
                                <CustomLink 
                                    type='filled' 
                                    title={message.status === 'success' ? 'My Dashboard' : 'Retry'}
                                    path={message.status === 'success' ? `/dashboard/${userPublicID}` : '/sell'}
                                    customStyles='md:max-w-[170px] px-4 py-2.5 font-bold text-sm' 
                                />
                            </motion.div>
                            }
                                    <motion.section {...slideAnimation('left')} className='pointer-events-none'>
                                        <motion.header {...slideAnimation('down')}>
                                            {/*<img src="./threejs.png" alt="logo" className='w-8 h-8 object-contain' /> */}
                                            AI-Market
                                        </motion.header>  
                                        <motion.div className='home-content' {...headContainerAnimation}>
                                            <motion.div {...headTextAnimation}>
                                            <h1 className='2xl:text-[4rem] text-[2rem] font-black text-white'>
                                                Earn money from AI
                                            </h1>
                                            <motion.div {...headContentAnimation} className='flex flex-col gap-5'>
                                                <p className='max-w-2xl font-normal text-white text-base'>
                                                With just a few simple steps, you can join our thriving community of AI creators and start monetizing your expertise. <br></br>
                                                Once your product gets approved, you'll receive 90% of revenue from every sale. <br></br>
                                                Embrace the opportunity to make a profit with AI Market, and start making an impact in the AI community today.
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
                                                <img src={tile1.src} alt="Image 1" className="w-full h-full object-cover shadow-lg" />
                                            </motion.div>
                                            </motion.div>
                                        </motion.div>
                                    </motion.section>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                    <motion.div className='max-w-[3840px] m-auto mt-2 pointer-events-none'>
                        <Footer />
                    </motion.div>
                </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default PayPalUserCheck;