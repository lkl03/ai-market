import { useEffect, useRef } from 'react';
import useState from 'react-usestateref';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion'
import { useSnapshot } from 'valtio'
import { useUser } from '../../context/userContext';
import Head from 'next/head';
import ClipLoader from "react-spinners/ClipLoader";
import { useForm } from 'react-hook-form';

import { IoMdMoon, IoMdSunny, IoMdWarning } from 'react-icons/io'
import { FaArrowLeft, FaImage, FaRobot, FaTrash, FaDownload, FaPaypal } from 'react-icons/fa'
import { FiFileText } from 'react-icons/fi'
import Moment from 'react-moment';

import state from '../../store'

// Firebase libraries and your db configuration
import { doc, getDoc, getDocs, updateDoc, deleteDoc, collection, collectionGroup, query, where } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll } from "firebase/storage";
import { updateProfile, updateEmail, updatePassword, deleteUser, reauthenticateWithPopup, GoogleAuthProvider } from "firebase/auth";

import { db, auth } from '../../firebase';

import { CustomButton, CustomLink, GoogleButton, Navbar, NavbarLog, Footer } from '../../components'
import {
    headContainerAnimation,
    headContentAnimation,
    headTextAnimation,
    slideAnimation
  } from '../../config/motion'

import { saveAs } from 'file-saver';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

import { ProductionProvider, useProduction } from '../../context/productionContext';

const Dashboard = (props) => {
  const snap = useSnapshot(state)
  const { user, loading } = useUser();

  const router = useRouter();

  const [activeTab, setActiveTab] = useState('edit-profile');
  // Add the following useState hooks at the beginning of your Dashboard function:
  const [userData, setUserData] = useState();
  const [previewImage, setPreviewImage] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef();
  const { register, handleSubmit } = useForm();

  const [submittedProducts, setSubmittedProducts] = useState(false);
  const [approvedProducts, setApprovedProducts] = useState(false);


  const [showSubmittedModal, setShowSubmittedModal] = useState(false);
  const [submittedProductToDelete, setSubmittedProductToDelete] = useState(null);
  const [showApprovedModal, setShowApprovedModal] = useState(false);
  const [approvedProductToDelete, setApprovedProductToDelete] = useState(null);

  const [isLiveEnvState, setIsLiveEnvState, isLiveEnvStateRef] = useState(false)

  // Redirects if necessary
  useEffect(() => {
    if (!loading && user) {
      if (user.uid !== props.user.id) {
        router.push(`/marketplace`);
      } else {
        const fetchUserData = async () => {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        }
        fetchUserData();
      }
    }
  }, [user, loading, props.user, router]);

    // Fetch products on component mount
    useEffect(() => {

      const fetchProducts = async () => {
        const submittedProductsRef = collectionGroup(db, 'submitted');
        const q = query(submittedProductsRef, where('status', '==', 'Approval pending'));
        const subQuerySnapshot = await getDocs(q);
        const approvedProductsRef = collectionGroup(db, 'approved');
        const appQuerySnapshot = await getDocs(approvedProductsRef);
  
        const fetchedSubmittedData = subQuerySnapshot.docs
          .filter(doc => doc.data().publisher === props.user.uid)
          .map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));

          const fetchedApprovedData = appQuerySnapshot.docs
          .filter(doc => doc.data().publisher === props.user.uid)
          .map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
  
        setSubmittedProducts(fetchedSubmittedData);
        setApprovedProducts(fetchedApprovedData)
        setIsLoading(false)
      }
  
      fetchProducts();
    }, []);

    const fetchProducts = async () => {
      const submittedProductsRef = collectionGroup(db, 'submitted');
      const q = query(submittedProductsRef, where('status', '==', 'Approval pending'));
      const subQuerySnapshot = await getDocs(q);
      const approvedProductsRef = collectionGroup(db, 'approved');
      const appQuerySnapshot = await getDocs(approvedProductsRef);

      const fetchedSubmittedData = subQuerySnapshot.docs
        .filter(doc => doc.data().publisher === props.user.uid)
        .map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        const fetchedApprovedData = appQuerySnapshot.docs
        .filter(doc => doc.data().publisher === props.user.uid)
        .map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

      setSubmittedProducts(fetchedSubmittedData);
      setApprovedProducts(fetchedApprovedData)
      setIsLoading(false)
    }
  

    const [description, setDescription] = useState(props.user.description);
    const [email, setEmail] = useState(props.user.email);
    const [paypalEmail, setPaypalEmail] = useState(props.user.paypalEmail)
    const [name, setName] = useState(props.user.name);
    const [username, setUsername] = useState(props.user.username);
    const [profileBg, setProfileBg] = useState(props.user.profileBg);
    const [profilePic, setProfilePic] = useState(props.user.profilePic);
    const [profileBgPreview, setProfileBgPreview] = useState(profileBg);
    const [profilePicPreview, setProfilePicPreview] = useState(profilePic);
    const [URLs, setURLs] = useState({
      websiteURL: props.user.websiteURL || '',
      instagramURL: props.user.instagramURL || '',
      facebookURL: props.user.facebookURL || '',
      twitterURL: props.user.twitterURL || '',
      linkedinURL: props.user.linkedinURL || '',
      tumblrURL: props.user.tumblrURL || '',
      pinterestURL: props.user.pinterestURL || '',
      githubURL: props.user.githubURL || '',
      dribbbleURL: props.user.dribbbleURL || '',
      behanceURL: props.user.behanceURL || ''
    });
  
    const handleDescriptionChange = (event) => setDescription(event.target.value);
    const handleEmailChange = (event) => setEmail(event.target.value);
    const handleNameChange = (event) => setName(event.target.value);
    const handleUsernameChange = (event) => setUsername(event.target.value);
  
    const handleURLChange = (event) => {
      setURLs({
        ...URLs,
        [event.target.name]: event.target.value
      });
    };
  
    if (loading || !user || user.uid !== props.user.id) {
      return <div className='m-auto w-[100px] min-h-screen flex  items-center justify-center mt-20 mb-20'><ClipLoader size={50} color={'#04E762'} /></div>;
    }
  
    const handleTabClick = (tab) => {
      setActiveTab(tab);
    };
  
    const handleProfilePicChange = async (event) => {
      let selectedFile = event.target.files[0];
  
      if (selectedFile) {
        if (selectedFile.type === 'image/png' || selectedFile.type === 'image/jpeg') {
          if (selectedFile.size <= 5000000) { // 5 MB in bytes
            const storage = getStorage();
            const storageRef = ref(storage, `users/${user.uid}/profile-pics/profilepic`);
            const uploadTask = uploadBytesResumable(storageRef, selectedFile);
  
            uploadTask.on('state_changed', 
              (snapshot) => {}, 
              (error) => {}, 
              () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                  setProfilePic(downloadURL);
                  setProfilePicPreview(downloadURL);
                });
              }
            );
          } 
        } 
      }
    };
  
    const handleProfileBgChange = async (event) => {
      let selectedFile = event.target.files[0];
  
      if (selectedFile) {
        if (selectedFile.type === 'image/png' || selectedFile.type === 'image/jpeg') {
          if (selectedFile.size <= 5000000) { // 5 MB in bytes
            const storage = getStorage();
            const storageRef = ref(storage, `users/${user.uid}/backgrounds/profilebg`);
            const uploadTask = uploadBytesResumable(storageRef, selectedFile);
  
            uploadTask.on('state_changed', 
              (snapshot) => {}, 
              (error) => {}, 
              () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                  setProfileBg(downloadURL);
                  setProfileBgPreview(downloadURL);
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
        ...URLs,
        profileBg,
        profilePic,
      };
    
      setIsLoading(true);
    
      if (auth.currentUser && data.email !== auth.currentUser.email) {
        await updateEmail(auth.currentUser, data.email).catch(() => {});
      }
    
      await updateDoc(doc(db, 'users', user.uid), data).catch(() => {});
    
      await updateProfile(auth.currentUser, {
          displayName: data.name,
          photoURL: data.profilePic,
      })
      .then(() => {
        router.reload();
      })
      .catch(() => {});
    
      setIsLoading(false);
    };

    const deleteSubmittedProduct = async () => {
      if (!submittedProductToDelete) return;
    
      let submittedProductRef;
    
      switch(submittedProductToDelete.parentCollection) {
        case 'images':
          submittedProductRef = doc(db, 'images', props.user.uid, 'submitted', submittedProductToDelete.id);
          break;
        case 'texts':
          submittedProductRef = doc(db, 'texts', props.user.uid, 'submitted', submittedProductToDelete.id);
          break;
        case 'prompts':
          submittedProductRef = doc(db, 'prompts', props.user.uid, 'submitted', submittedProductToDelete.id);
          break;
        default:
          return;
      }
    
      await deleteDoc(submittedProductRef).catch(() => {});
    
      const searchIndexRef = doc(db, 'search_index', `${props.user.uid}_${submittedProductToDelete.id}`);
      await deleteDoc(searchIndexRef).catch(() => {});
    
      fetchProducts();
    
      setShowSubmittedModal(false);
      setSubmittedProductToDelete(null);
    };

    const deleteApprovedProduct = async () => {
      if (!approvedProductToDelete) return;
    
      let approvedProductRef;
    
      switch(approvedProductToDelete.parentCollection) {
        case 'images':
          approvedProductRef = doc(db, 'images', props.user.uid, 'approved', approvedProductToDelete.id);
          break;
        case 'texts':
          approvedProductRef = doc(db, 'texts', props.user.uid, 'approved', approvedProductToDelete.id);
          break;
        case 'prompts':
          approvedProductRef = doc(db, 'prompts', props.user.uid, 'approved', approvedProductToDelete.id);
          break;
        default:
          return;
      }
    
      await deleteDoc(approvedProductRef).catch(() => {});
    
      const searchIndexRef = doc(db, 'search_index', `${props.user.uid}_${approvedProductToDelete.id}`);
      await deleteDoc(searchIndexRef).catch(() => {});
    
      fetchProducts();
    
      setShowApprovedModal(false);
      setApprovedProductToDelete(null);
    };
    
    const handleSubmittedDeleteClick = (product) => {
      setSubmittedProductToDelete(product);
      setShowSubmittedModal(true);
    };
    
    const handleApprovedDeleteClick = (product) => {
      setApprovedProductToDelete(product);
      setShowApprovedModal(true);
    };
    
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
        .catch(() => {});
    };

    const deleteUserData = async (userId) => {
      const storage = getStorage();
    
      const mainCollections = ['images', 'prompts', 'texts'];
      const subcollections = ['approved', 'rejected', 'submitted', 'purchases', 'sales'];
    
      try {
        const provider = new GoogleAuthProvider();
        const reauthResult = await reauthenticateWithPopup(auth.currentUser, provider);
        
        if(reauthResult.user) {
          for (let coll of mainCollections) {
            for (let subcoll of subcollections) {
              const q = query(collection(db, `${coll}/${userId}/${subcoll}`));
              const querySnapshot = await getDocs(q);
              querySnapshot.forEach((docu) => {
                let docReference = doc(db, `${coll}/${userId}/${subcoll}`, docu.id)
                deleteDoc(docReference);
              });
            }
            let mainDocReference = doc(db, `${coll}/${userId}`)
            await deleteDoc(mainDocReference);
          }
    
          for (let subcoll of ['purchases', 'sales']) {
            const q = query(collection(db, `users/${userId}/${subcoll}`));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((docu) => {
              let docReference = doc(db, `users/${userId}/${subcoll}`, docu.id)
              deleteDoc(docReference);
            });
          }
    
          await deleteDoc(doc(db, 'users', userId));
    
          const user = auth.currentUser;
          if (user) {
            await deleteUser(user);
          }
    
          const folders = ['backgrounds', 'profile-pics'];
          for (let folder of folders) {
            try {
              const listRef = ref(storage, `users/${userId}/${folder}`);
              const res = await listAll(listRef);
              res.items.forEach((itemRef) => {
                deleteObject(itemRef);
              });
            } catch (error) {}
          }
    
          router.push('/');
        }
      } catch (error) {}
  };
  
  const handleDeleteAccount = () => {
    const confirmDelete = window.confirm('Are you sure you want to delete your account? This action is irreversible.');
    
    if (confirmDelete) {
      const userId = props.user.uid;
    
      deleteUserData(userId);
    }
  }

  return (
    <AnimatePresence>
      <Head>
        <title>My Dashboard | AITropy</title>
        <meta name="description" content="Explore the world of AI-generated texts, images, and prompts with AITropy. Buy, sell, and discover a lot of products for and created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY tools. Start today! | AITropy" />
        <meta name="keywords" content="marketplace, ai-generated products, prompts, images, texts, gpt, dall-e, stable diffusion, midjourney, AI, artificial intelligence, buy, sell, community, no-fees" />
        <meta property="og:title" content="My Dashboard | AITropy" />
        <meta property="og:description" content="Explore the world of AI-generated texts, images, and prompts with AITropy. Buy, sell, and discover a lot of products for and created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY tools. Start today! | AITropy" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_AITROPY_URL}`} />
        <meta name="twitter:title" content="My Dashboard | AITropy" />
        <meta name="twitter:description" content="Explore the world of AI-generated texts, images, and prompts with AITropy. Buy, sell, and discover a lot of products for and created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY tools. Start today! | AITropy" />
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
                <motion.div className='flex flex-row flex-wrap md:h-auto md:w-full lg:justify-around justify-start items-center max-2xl:gap-7 max-w-[1920px] m-auto'>
                    <motion.div className='container mx-auto flex flex-wrap md:flex-row flex-col' {...headContainerAnimation}>
                        {/* Sidebar for larger screens */}
                        <div className="hidden sm:block border-r-2 border-[#04E762] text-black w-64 px-4 py-5 h-screen">
                            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
                            <ul>
                            <li onClick={() => handleTabClick('edit-profile')} className={`mb-2 cursor-pointer text-lg ${activeTab === 'edit-profile' ? 'text-[#04E762] font-semibold' : ''}`}>Edit Profile</li>
                            <li onClick={() => handleTabClick('manage-products')} className={`mb-2 cursor-pointer text-lg ${activeTab === 'manage-products' ? 'text-[#04E762] font-semibold' : ''}`}>Manage Products</li>
                            <li onClick={() => handleTabClick('purchases')} className={`cursor-pointer text-lg ${activeTab === 'purchases' ? 'text-[#04E762] font-semibold' : ''}`}>Purchases</li>
                            </ul>
                        </div>
                        {/* Sidebar for smaller screens, displayed as a navbar below the main navbar */}
                        <div className="sm:hidden border-b-2 border-[#04E762] text-black w-full px-4 py-2">
                            <ul className="flex justify-between">
                            <li onClick={() => handleTabClick('edit-profile')} className={`cursor-pointer ${activeTab === 'edit-profile' ? 'text-[#04E762] font-bold' : ''}`}>Edit Profile</li>
                            <li onClick={() => handleTabClick('manage-products')} className={`cursor-pointer ${activeTab === 'manage-products' ? 'text-[#04E762] font-bold' : ''}`}>Manage Products</li>
                            <li onClick={() => handleTabClick('purchases')} className={`cursor-pointer ${activeTab === 'purchases' ? 'text-[#04E762] font-bold' : ''}`}>Purchases</li>
                            </ul>
                        </div>
                        {/* Content */}
                        {activeTab == 'edit-profile' ? 
                        <div className="flex-1 p-4 md:p-8 overflow-auto">
                          <h3 className="2xl:text-2xl text-xl font-black text-black text-center capitalize transition-colors ease-in-out">Edit My Profile</h3>
                          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4 mt-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <label className="block">
                                <span className="text-black">Your name</span>
                                <input
                                  type="text"
                                  {...register("name")}
                                  value={name}
                                  onChange={handleNameChange}
                                  placeholder="Name"
                                  className="placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out"
                                />
                              </label>
                              <label className="block">
                                <span className="text-black">Your username</span>
                                <input
                                  type="text"
                                  {...register("username")}
                                  value={username}
                                  onChange={handleUsernameChange}
                                  placeholder="Username"
                                  className="placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out"
                                />
                              </label>
                            </div>

                            <label className="block">
                              <span className="text-black">The email for your <span className='font-medium'>AITropy</span> account</span>
                              <input
                                type="email"
                                {...register("email")}
                                value={email}
                                /*onChange={handleEmailChange}*/
                                disabled
                                placeholder="Email"
                                readOnly
                                className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out"
                              />
                              <input 
                                type="hidden"
                                {...register("email")}
                                value={email} 
                              />
                              </label>

                            <label className="block">
                              <span className="text-black">Description that will be shown on your profile</span>
                              <textarea
                                {...register("description")}
                                value={description}
                                onChange={handleDescriptionChange}
                                placeholder="Write something cool about you!"
                                className="placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out"
                              />
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                              <label className="block">
                                <span className="text-black">The background you'll shown on your profile</span>
                                <img src={profileBgPreview} alt="Profile background preview" className="rounded w-[200px] h-auto max-h-[200px] my-2" />
                                <input type="file" onChange={handleProfileBgChange} className="mt-2" />
                              </label>
                              <label className="block">
                                <span className="text-black">Your profile picture</span>
                                <img src={profilePicPreview} alt="Profile picture preview" className="rounded-full w-[175px] h-[175px] my-2" />
                                <input type="file" onChange={handleProfilePicChange} className="mt-2" />
                              </label>
                            </div>

                            <h3 className="text-black text-lg mt-5">Social Links</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {Object.keys(URLs).map((urlKey) => (
                                <label className="block" key={urlKey}>
                                  <span className="text-black capitalize">{`${urlKey.replace('URL', '')}`}</span>
                                  <input
                                    type="text"
                                    {...register(urlKey)}
                                    value={URLs[urlKey]}
                                    onChange={handleURLChange}
                                    placeholder={`https://your-${urlKey.replace('URL', '')}.com`}
                                    className="placeholder:text-sm mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out"
                                  />
                                </label>
                              ))}
                            </div>
                            
                              <div className='flex flex-wrap items-center justify-center'>
                              <button type="submit" disabled={isLoading} className={`px-4 py-2.5 flex-1 rounded-md border border-[#04E762] bg-[#04E762] text-black md:max-w-[170px] w-fit font-bold text-sm`}>
                                {isLoading ? <ClipLoader /> : 'Update Profile'}
                              </button>
                              </div>
                          </form>
                          <h3 className="2xl:text-2xl text-xl font-black text-black text-center capitalize transition-colors ease-in-out mt-8">Connected Payment Accounts</h3>
                          <p className='text-center'>Check the accounts you've vinculated with your account to receive payments of your products.</p>
                          <div className='flex flex-wrap items-end justify-center gap-4'>
                          <label className="block md:w-[35%] w-full">
                                <span className="text-black">Paypal Email</span>
                                <input
                                  type="text"
                                  value={paypalEmail}
                                  disabled
                                  placeholder="Not account integrated yet"
                                  className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out"
                                />
                          </label>
                          <div className='flex flex-wrap flex-col items-center justify-center mt-4'>
                            Change Account
                            <button className='flex flex-wrap items-center justify-center gap-2 rounded-md border border-[#0070BA] bg-[#0070BA] text-white font-semibold px-4 py-2.5' type='button' onClick={() => window.location.href= isLiveEnvStateRef.current === true ? `${process.env.NEXT_PUBLIC_PAYPAL_LOGIN_EDIT_URL_LIVE}` : `${process.env.NEXT_PUBLIC_PAYPAL_LOGIN_EDIT_URL_SANDBOX}`}><FaPaypal size={25} className='text-[#fff]'/>Continue with PayPal</button>
                          </div>
                          </div>
                          <h3 className="2xl:text-2xl text-xl font-black text-black text-center capitalize transition-colors ease-in-out mt-8">Delete My Account</h3>
                          <div className='flex flex-col flex-wrap items-center justify-center gap-2 bg-gray-900 mt-4 py-4 rounded'>
                            <p className='text-lg text-white flex flex-wrap items-center justify-center gap-1 max-w-[85%] lg:max-w-full mx-auto text-center'><span className='text-2xl text-yellow-400'><IoMdWarning /></span>Please consider this action is irreversible: you will lose access to all your purchases, products and info storaged in your account.</p>
                            <button onClick={handleDeleteAccount} className={`px-4 py-2.5 mt-2 flex-1 rounded-md border border-red-500 bg-red-500 text-white md:max-w-[170px] w-fit font-bold text-sm`}>Delete My Account</button>
                          </div>
                        </div>
                        : ''}
                        {activeTab == 'manage-products' ? 
                        <div className="flex-1 p-4 md:p-8 overflow-auto">
                        <h3 className="2xl:text-2xl text-xl font-black text-black text-center capitalize transition-colors ease-in-out">Submitted Products</h3>
                        <div className='flex flex-wrap items-center justify-center gap-4'>
                            {submittedProducts.map((product, index) => (
                            <>
                            <div className='flex flex-col flex-wrap items-center justify-center'>
                            <Link key={product.id} className='md:w-auto w-full mb-4' href={`/product/${product.publicID}`} target='_blank'>
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
                            <button onClick={() => handleSubmittedDeleteClick(product)} className='flex flex-wrap gap-2 items-center justify-center hover:text-red-500 transition-colors ease-in-out'><FaTrash /> Delete Product</button>
                            </div>
                            </>
                            ))}
                        </div>
                        {showSubmittedModal && (
                          <div className='flex flex-col flex-wrap items-center justify-center bg-black text-white mt-4 rounded w-full md:w-[50%] mx-auto'>
                            <p className='text-center mt-2'>Are you sure you want to delete this product? <br></br> <span className='text-sm italic font-medium'>This action is irreversible.</span></p>
                            <div className='flex flex-wrap items-center justify-center gap-4'>
                            <button className='py-2 px-4 capitalize bg-white text-black hover:bg-red-500 hover:text-white transition-colors ease-in-out my-2 rounded font-bold' onClick={deleteSubmittedProduct}>Yes, delete</button>
                            <button className='py-2 px-4 capitalize bg-white text-black hover:bg-[#04E762] transition-colors ease-in-out my-2 rounded font-bold' onClick={() => setShowSubmittedModal(false)}>No, go back</button>
                            </div>
                          </div>
                        )}
                        <h3 className="mt-10 2xl:text-2xl text-xl font-black text-black text-center capitalize transition-colors ease-in-out">Approved Products</h3>
                        <div className='flex flex-wrap items-center justify-center gap-4'>
                            {approvedProducts.map((product, index) => (
                            <>
                            <div className='flex flex-col flex-wrap items-center justify-center'>
                            <Link key={product.id} className='md:w-auto w-full mb-4' href={`/product/${product.publicID}`} target='_blank'>
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
                            <button onClick={() => handleApprovedDeleteClick(product)} className='flex flex-wrap gap-2 items-center justify-center hover:text-red-500 transition-colors ease-in-out'><FaTrash /> Delete Product</button>
                            </div>
                            </>
                            ))}
                        </div>
                        {showApprovedModal && (
                          <div className='flex flex-col flex-wrap items-center justify-center bg-black text-white mt-4 rounded w-full md:w-[50%] mx-auto'>
                            <p className='text-center mt-2'>Are you sure you want to delete this product? <br></br> <span className='text-sm italic font-medium'>This action is irreversible.</span></p>
                            <div className='flex flex-wrap items-center justify-center gap-4'>
                            <button className='py-2 px-4 capitalize bg-white text-black hover:bg-red-500 hover:text-white transition-colors ease-in-out my-2 rounded font-bold' onClick={deleteApprovedProduct}>Yes, delete</button>
                            <button className='py-2 px-4 capitalize bg-white text-black hover:bg-[#04E762] transition-colors ease-in-out my-2 rounded font-bold' onClick={() => setShowApprovedModal(false)}>No, go back</button>
                            </div>
                          </div>
                        )}
                        </div>
                        : ''}
                        {activeTab == 'purchases' ?
                        <div className="flex-1 p-4 md:p-8 overflow-auto">
                        <h3 className="2xl:text-2xl text-xl font-black text-black text-center capitalize transition-colors ease-in-out">My Purchases</h3>
                        <div className='flex flex-wrap items-center justify-center gap-4'>
                            {props.purchases.map((product, index) => (
                            <>
                            <div className='flex flex-col flex-wrap items-center justify-center'>
                            <Link key={product.id} className='md:w-auto w-full mb-4' href={`/product/${product.publicID}`} target='_blank'>
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
                            <div className='flex flex-wrap items-center justify-center'>
                              <CustomButton type='filled' title={`Download Product`} handleClick={() => downloadProduct(product)} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold text-sm' />
                            </div>
                            </div>
                            </>
                            ))}
                        </div>
                        </div>
                        : ''}
                    </motion.div>
                </motion.div>
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
                <motion.div className='flex flex-row flex-wrap md:h-auto md:w-full lg:justify-around justify-start items-center max-2xl:gap-7 max-w-[1920px] m-auto'>
                    <motion.div className='container mx-auto flex flex-wrap md:flex-row flex-col' {...headContainerAnimation}>
                        {/* Sidebar for larger screens */}
                        <div className="hidden sm:block border-r-2 border-[#04E762] text-white w-64 px-4 py-5 h-screen">
                            <h1 className="text-2xl mb-4 font-bold">Dashboard</h1>
                            <ul>
                            <li onClick={() => handleTabClick('edit-profile')} className={`mb-2 cursor-pointer text-lg ${activeTab === 'edit-profile' ? 'text-[#04E762] font-semibold' : ''}`}>Edit Profile</li>
                            <li onClick={() => handleTabClick('manage-products')} className={`mb-2 cursor-pointer text-lg ${activeTab === 'manage-products' ? 'text-[#04E762] font-semibold' : ''}`}>Manage Products</li>
                            <li onClick={() => handleTabClick('purchases')} className={`cursor-pointer text-lg ${activeTab === 'purchases' ? 'text-[#04E762] font-semibold' : ''}`}>Purchases</li>
                            </ul>
                        </div>
                        {/* Sidebar for smaller screens, displayed as a navbar below the main navbar */}
                        <div className="sm:hidden border-b-2 border-[#04E762] text-white w-full px-4 py-2">
                            <ul className="flex justify-between">
                            <li onClick={() => handleTabClick('edit-profile')} className={`cursor-pointer ${activeTab === 'edit-profile' ? 'text-[#04E762] font-bold' : ''}`}>Edit Profile</li>
                            <li onClick={() => handleTabClick('manage-products')} className={`cursor-pointer ${activeTab === 'manage-products' ? 'text-[#04E762] font-bold' : ''}`}>Manage Products</li>
                            <li onClick={() => handleTabClick('purchases')} className={`cursor-pointer ${activeTab === 'purchases' ? 'text-[#04E762] font-bold' : ''}`}>Purchases</li>
                            </ul>
                        </div>
                        {/* Content */}
                        {activeTab == 'edit-profile' ? 
                        <div className="flex-1 p-4 md:p-8 overflow-auto">
                          <h3 className="2xl:text-2xl text-xl font-black text-white text-center capitalize transition-colors ease-in-out">Edit My Profile</h3>
                          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4 mt-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <label className="block">
                                <span className="text-white">Your name</span>
                                <input
                                  type="text"
                                  {...register("name")}
                                  value={name}
                                  onChange={handleNameChange}
                                  placeholder="Name"
                                  className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out"
                                />
                              </label>
                              <label className="block">
                                <span className="text-white">Your username</span>
                                <input
                                  type="text"
                                  {...register("username")}
                                  value={username}
                                  onChange={handleUsernameChange}
                                  placeholder="Username"
                                  className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out"
                                />
                              </label>
                            </div>

                            <label className="block">
                              <span className="text-white">The email for your <span className='font-medium'>AITropy</span> account</span>
                              <input
                                type="email"
                                {...register("email")}
                                value={email}
                                /*onChange={handleEmailChange}*/
                                disabled
                                placeholder="Email"
                                readOnly
                                className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out"
                              />
                              <input 
                                type="hidden"
                                {...register("email")}
                                value={email} 
                              />
                              </label>

                            <label className="block">
                              <span className="text-white">Description that will be shown on your profile</span>
                              <textarea
                                {...register("description")}
                                value={description}
                                onChange={handleDescriptionChange}
                                placeholder="Write something cool about you!"
                                className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out"
                              />
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                              <label className="block">
                                <span className="text-white">The background you'll shown on your profile</span>
                                <img src={profileBgPreview} alt="Profile background preview" className="rounded w-[200px] h-auto max-h-[200px] my-2" />
                                <input type="file" onChange={handleProfileBgChange} className="mt-2 text-white" />
                              </label>
                              <label className="block">
                                <span className="text-white">Your profile picture</span>
                                <img src={profilePicPreview} alt="Profile picture preview" className="rounded-full w-[175px] h-[175px] my-2" />
                                <input type="file" onChange={handleProfilePicChange} className="mt-2 text-white" />
                              </label>
                            </div>

                            <h3 className="text-white text-lg mt-5">Social Links</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {Object.keys(URLs).map((urlKey) => (
                                <label className="block" key={urlKey}>
                                  <span className="text-white capitalize">{`${urlKey.replace('URL', '')}`}</span>
                                  <input
                                    type="text"
                                    {...register(urlKey)}
                                    value={URLs[urlKey]}
                                    onChange={handleURLChange}
                                    placeholder={`https://your-${urlKey.replace('URL', '')}.com`}
                                    className="disabled:opacity-25 disabled:grayscale placeholder:text-sm mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out"
                                  />
                                </label>
                              ))}
                            </div>
                            
                              <div className='flex flex-wrap items-center justify-center'>
                              <button type="submit" disabled={isLoading} className={`px-4 py-2.5 flex-1 rounded-md border border-[#04E762] bg-[#04E762] text-black md:max-w-[170px] w-fit font-bold text-sm`}>
                                {isLoading ? <ClipLoader /> : 'Update Profile'}
                              </button>
                              </div>
                          </form>
                          <h3 className="2xl:text-2xl text-xl font-black text-white text-center capitalize transition-colors ease-in-out mt-8">Connected Payment Accounts</h3>
                          <p className='text-center text-white'>Check the accounts you've vinculated with your account to receive payments of your products.</p>
                          <div className='flex flex-wrap items-end justify-center gap-4'>
                          <label className="block md:w-[35%] w-full">
                                <span className="text-white">Paypal Email</span>
                                <input
                                  type="text"
                                  value={paypalEmail}
                                  disabled
                                  placeholder="Not account integrated yet"
                                  className="disabled:opacity-25 disabled:grayscale mt-1 block w-full p-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out"
                                />
                          </label>
                          <div className='flex flex-wrap flex-col items-center justify-center mt-4'>
                            <p className='text-white'>Change Account</p>
                            <button className='flex flex-wrap items-center justify-center gap-2 rounded-md border border-[#EEEEEE] bg-[#EEEEEE] font-semibold px-4 py-2.5 disabled:opacity-50' type='button' onClick={() => window.location.href= isLiveEnvStateRef.current === true ? `${process.env.NEXT_PUBLIC_PAYPAL_LOGIN_EDIT_URL_LIVE}` : `${process.env.NEXT_PUBLIC_PAYPAL_LOGIN_EDIT_URL_SANDBOX}`}><FaPaypal size={25} className='text-[#0070BA]'/>Continue with PayPal</button>
                          </div>
                          </div>
                          <h3 className="2xl:text-2xl text-xl font-black text-white text-center capitalize transition-colors ease-in-out mt-8">Delete My Account</h3>
                          <div className='flex flex-col flex-wrap items-center justify-center gap-2 bg-white mt-4 py-4 rounded'>
                            <p className='text-lg flex flex-wrap items-center justify-center gap-1 max-w-[85%] lg:max-w-full mx-auto text-center'><span className='text-2xl text-yellow-400'><IoMdWarning /></span>Please consider this action is irreversible: you will lose access to all your purchases, products and info storaged in your account.</p>
                            <button onClick={handleDeleteAccount} className={`px-4 py-2.5 mt-2 flex-1 rounded-md border border-red-500 bg-red-500 text-white md:max-w-[170px] w-fit font-bold text-sm`}>Delete My Account</button>
                          </div>
                        </div>
                        : ''}
                        {activeTab == 'manage-products' ? 
                        <div className="flex-1 p-4 md:p-8 overflow-auto">
                        <h3 className="2xl:text-2xl text-xl font-black text-white text-center capitalize transition-colors ease-in-out">Submitted Products</h3>
                        <div className='flex flex-wrap items-center justify-center gap-4'>
                            {submittedProducts.map((product, index) => (
                              <>
                              <div className='flex flex-col flex-wrap items-center justify-center'>
                              <Link key={product.id} className='md:w-auto w-full mb-4' href={`/product/${product.publicID}`} target='_blank'>
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
                              <button onClick={() => handleSubmittedDeleteClick(product)} className='flex flex-wrap gap-2 items-center justify-center text-white hover:text-red-500 transition-colors ease-in-out'><FaTrash /> Delete Product</button>
                              </div>
                              </>
                            ))}
                        </div>
                        {showSubmittedModal && (
                          <div className='flex flex-col flex-wrap items-center justify-center bg-[#04E762] mt-4 rounded w-full md:w-[50%] mx-auto'>
                            <p className='text-center mt-2'>Are you sure you want to delete this product? <br></br> <span className='text-sm italic font-medium'>This action is irreversible.</span></p>
                            <div className='flex flex-wrap items-center justify-center gap-4'>
                            <button className='py-2 px-4 capitalize bg-white hover:bg-red-500 hover:text-white transition-colors ease-in-out my-2 rounded font-bold' onClick={deleteSubmittedProduct}>Yes, delete</button>
                            <button className='py-2 px-4 capitalize bg-white hover:bg-black hover:text-white transition-colors ease-in-out my-2 rounded font-bold' onClick={() => setShowSubmittedModal(false)}>No, go back</button>
                            </div>
                          </div>
                        )}
                        <h3 className="mt-10 2xl:text-2xl text-xl font-black text-white text-center capitalize transition-colors ease-in-out">Approved Products</h3>
                        <div className='flex flex-wrap items-center justify-center gap-4'>
                            {approvedProducts.map((product, index) => (
                              <>
                              <div className='flex flex-col flex-wrap items-center justify-center'>
                              <Link key={product.id} className='md:w-auto w-full mb-4' href={`/product/${product.publicID}`} target='_blank'>
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
                              <button onClick={() => handleApprovedDeleteClick(product)} className='flex flex-wrap gap-2 items-center justify-center text-white hover:text-red-500 transition-colors ease-in-out'><FaTrash /> Delete Product</button>
                              </div>
                              </>
                            ))}
                        </div>
                        {showApprovedModal && (
                          <div className='flex flex-col flex-wrap items-center justify-center bg-[#04E762] mt-4 rounded w-full md:w-[50%] mx-auto'>
                            <p className='text-center mt-2'>Are you sure you want to delete this product? <br></br> <span className='text-sm italic font-medium'>This action is irreversible.</span></p>
                            <div className='flex flex-wrap items-center justify-center gap-4'>
                            <button className='py-2 px-4 capitalize bg-white hover:bg-red-500 hover:text-white transition-colors ease-in-out my-2 rounded font-bold' onClick={deleteApprovedProduct}>Yes, delete</button>
                            <button className='py-2 px-4 capitalize bg-white hover:bg-black hover:text-white transition-colors ease-in-out my-2 rounded font-bold' onClick={() => setShowApprovedModal(false)}>No, go back</button>
                            </div>
                          </div>
                        )}
                        </div>      
                        : ''}
                        {activeTab == 'purchases' ?
                        <div className="flex-1 p-4 md:p-8 overflow-auto">
                        <h3 className="2xl:text-2xl text-xl font-black text-white text-center capitalize transition-colors ease-in-out">My Purchases</h3>
                        <div className='flex flex-wrap items-center justify-center gap-4'>
                            {props.purchases.map((product, index) => (
                              <>
                              <div className='flex flex-col flex-wrap items-center justify-center'>
                              <div key={product.id} className='md:w-auto w-full mb-4'>
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
                              </div>
                              <div className='flex flex-wrap items-center justify-center'>
                                <CustomButton type='filled' title={`Download Product`} handleClick={() => downloadProduct(product)} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold text-sm' />
                              </div>                              
                              </div>
                              </>
                            ))}
                        </div>
                        </div>
                        : ''}
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export async function getServerSideProps(context) {
  const { id } = context.query;

  // Query 'users' collection and find the document matching the publicID
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('publicID', '==', id));

  const querySnapshot = await getDocs(q);

  // If the user exists, pass the user data as a prop, else throw an error or handle it appropriately
  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0]; // should be only one document
    const user = {
      id: userDoc.id,
      ...userDoc.data(),
    };

    // Query 'submitted' collections for products associated with the user
    const submittedRef = collectionGroup(db, 'submitted');
    const productsQuery = query(submittedRef, where('publisher', '==', user.uid));
    const productsQuerySnapshot = await getDocs(productsQuery);

    // Query 'approved' collections for products associated with the user
    const approvedRef = collectionGroup(db, 'approved');
    const approvedProductsQuery = query(approvedRef, where('publisher', '==', user.uid));
    const approvedProductsQuerySnapshot = await getDocs(approvedProductsQuery);

    // Query 'purchases' subcollection for purchases associated with the user
    const purchasesRef = collection(db, 'users', user.uid, 'purchases');
    const purchasesQuerySnapshot = await getDocs(purchasesRef);

    const products = productsQuerySnapshot.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data(),
      }
    });

    const approvedProducts = approvedProductsQuerySnapshot.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data(),
      }
    });

    const purchases = purchasesQuerySnapshot.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data(),
      }
    });

    return {
      props: {
        user, // Pass the user data as a prop to your component
        products, // Pass the submitted products data as a prop to your component
        approvedProducts, // Pass the approved products data as a prop to your component
        purchases, // Pass the purchases data as a prop to your component
      },
    };

  } 
  // If the user does not exist, return 404 page
  else {
    return {
      notFound: true,
    };
  }
}

export default Dashboard;