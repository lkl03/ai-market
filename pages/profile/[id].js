import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSnapshot } from 'valtio'
import { useUser } from '../../context/userContext';

import { IoMdMoon, IoMdSunny } from 'react-icons/io'
import { FaArrowLeft, FaImage, FaRobot, FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa';
import { AiFillBehanceSquare, AiFillDribbbleSquare } from 'react-icons/ai';
import { ImPinterest } from 'react-icons/im';
import { SiTumblr } from 'react-icons/si';
import { FiFileText } from 'react-icons/fi'
import Moment from 'react-moment';

import state from '../../store'

import { CustomButton, CustomLink, GoogleButton, Navbar, NavbarLog, Footer } from '../../components'
import Tab from '../../components/Tab';
import {
  headContainerAnimation,
  headContentAnimation,
  headTextAnimation,
  slideAnimation
} from '../../config/motion'


import { auth, db } from '../../firebase';
import { doc, getDoc, getDocs, collection, collectionGroup, query, where } from "firebase/firestore";

import ClipLoader from "react-spinners/ClipLoader";


const Profile = (props) => {
  const snap = useSnapshot(state)
  const { user, loading } = useUser();

  const router = useRouter();

  const [loaded, setLoaded] = useState(false);

  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    if(user && props.user.uid === user?.uid) {
        setIsOwnProfile(true)
    }
  }, [user])

  useEffect(() => {
    if (props.product) setLoaded(true);
  }, [props.product]);

  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [texts, setTexts] = useState([]);
  const [prompts, setPrompts] = useState([]);
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

  const activeBtnStyles = `px-2 py-1.5 flex-1 rounded-md bg-[#04E762] text-black font-bold w-20 outline-none`
  const notActiveBtnStyles = 'px-2 py-1.5 flex-1 rounded-md bg-primary mr-4 text-black font-bold w-20 outline-none'

  const [text, setText] = useState('Created')
  const [activeBtn, setActiveBtn] = useState('created')

  // Fetch products on component mount
  useEffect(() => {

    const fetchProducts = async () => {
      const approvedRef = collectionGroup(db, 'approved');
      const querySnapshot = await getDocs(approvedRef);

      const fetchedData = querySnapshot.docs
        .filter(doc => doc.data().publisher === props.user.uid)
        .map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

      setProducts(fetchedData);
      setLoaded(true)
      console.log(fetchedData); // Log fetchedData directly as products state update may not have occurred yet
    }

    fetchProducts();
  }, []);

  const fetchImages = async () => {
    setLoaded(false)
    
    const fetchedData = products
      .filter(product => product.parentCollection === 'images')
      .map((product) => ({
        ...product,
      }));
  
    setImages(fetchedData);
    setLoaded(true)
    console.log(fetchedData); // Log fetchedData directly as products state update may not have occurred yet
  }
  
  const fetchTexts = async () => {
    setLoaded(false)
  
    const fetchedData = products
      .filter(product => product.parentCollection === 'texts')
      .map((product) => ({
        ...product,
      }));
  
    setTexts(fetchedData);
    setLoaded(true)
    console.log(fetchedData); // Log fetchedData directly as products state update may not have occurred yet
  }
  
  const fetchPrompts = async () => {
    setLoaded(false)
  
    const fetchedData = products
      .filter(product => product.parentCollection === 'prompts')
      .map((product) => ({
        ...product,
      }));
  
    setPrompts(fetchedData);
    setLoaded(true)
    console.log(fetchedData); // Log fetchedData directly as products state update may not have occurred yet
  }

  return (
    <AnimatePresence>
      <Head>
        <title>@{props.user.username}'s Profile | AITropy</title>
        <meta name="description" content={`@${props.user.username} on AITropy: Explore AI-generated texts, images, prompts, and more. Join the community and discover products created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY. | AITropy`} />
        <meta name="keywords" content="profile, AI, ai-generated products, prompts, images, texts, gpt, dall-e, stable diffusion, midjourney, artificial intelligence, community" />
        <meta property="og:title" content={`@${props.user.username}'s Profile | AITropy`} />
        <meta property="og:description" content={`@${props.user.username} on AITropy: Explore AI-generated texts, images, prompts, and more. Join the community and discover products created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY. | AITropy`} />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_AITROPY_URL}/profile/${props.user.publicID}`} />
        <meta name="twitter:title" content={`@${props.user.username}'s Profile | AITropy`} />
        <meta name="twitter:description" content={`@${props.user.username} on AITropy: Explore AI-generated texts, images, prompts, and more. Join the community and discover products created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY. | AITropy`} />
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
                        <div className='relative pb-2 h-full justify-center items-center'>
                            <div className='flex flex-col pb-5'>
                                <div className='relative flex flex-col mb-7'>
                                    <div className='flex flex-col justify-center items-center'>
                                        <img
                                        src={props.user.profileBg}
                                        className='w-screen h-[260px] 2xl:h-[480px] shadow-lg object-cover'
                                        alt="banner-pic"
                                        />
                                        <img
                                        src={props.user.profilePic}
                                        className='rounded-full w-20 h-20 -mt-10 shadow-xl object-cover'
                                        alt="user-pic"
                                        />
                                        <h1 className='font-bold text-3xl text-center mt-3'>@{props.user.username}</h1>
                                        <p className='my-4 max-w-xl mx-auto'>{props.user.description !== '' ? `${props.user.description}` : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat, dignissimos eum cupiditate tenetur facilis maxime nihil porro! Animi dolorum, incidunt temporibus assumenda commodi, obcaecati quasi sequi aspernatur libero voluptatum possimus!'}</p>
                                        <div className='flex flex-wrap gap-2 items-center justify-center'>
                                          <div className='flex flex-wrap gap-2 items-center'>
                                          {Object.entries(URLs).map(([name, url]) => {
                                            if (!url) return null;  // If URL is empty, don't render anything

                                            const Icon = ({ name }) => {
                                              switch (name) {
                                                case "websiteURL": return <FaGlobe />;
                                                case "facebookURL": return <FaFacebook />;
                                                case "instagramURL": return <FaInstagram />;
                                                case "twitterURL": return <FaTwitter />;
                                                case "linkedinURL": return <FaLinkedin />;
                                                case "githubURL": return <FaGithub />;
                                                case "tumblrURL": return <SiTumblr />;
                                                case "pinterestURL": return <ImPinterest />;
                                                case "dribbbleURL": return <AiFillDribbbleSquare />;
                                                case "behanceURL": return <AiFillBehanceSquare />;
                                                default: return null;
                                              }
                                            }

                                            return (
                                              <a href={url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`}
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="mx-2 text-black md:text-xl text-lg hover:text-[#04E762] transition-colors ease-in-out">
                                                  <Icon name={name} className="w-5 h-5 inline" />
                                              </a>
                                            );
                                          })}
                                          </div>
                                        <div className='md:border-l border-[#04E762]'>
                                            <p className='md:ml-4'>Joined on <Moment format="MMMM DD, YYYY">{props.user.createdAt}</Moment></p>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className='mt-4'>
                  {snap.allProducts && (
                    <>
                    <h3 className="2xl:text-2xl text-xl font-black text-black text-center capitalize transition-colors ease-in-out">User Products</h3>
                    <div className='flex flex-wrap items-center justify-center gap-4'>
                        {products.map((product, index) => (
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
                    </>
                    )}
                    {snap.showJustImages && (
                        <>
                    <h3 className="2xl:text-2xl text-xl font-black text-black text-center capitalize transition-colors ease-in-out">User Images</h3>
                    <div className='flex flex-wrap items-center justify-center gap-4'>
                        {images.map((product, index) => (
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
                    </>
                    )}
                    {snap.showJustTexts && (
                        <>
                    <h3 className="2xl:text-2xl text-xl font-black text-black text-center capitalize transition-colors ease-in-out">User Texts</h3>
                    <div className='flex flex-wrap items-center justify-center gap-4'>
                        {texts.map((product, index) => (
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
                    </>
                    )}
                    {snap.showJustPrompts && (
                        <>
                    <h3 className="2xl:text-2xl text-xl font-black text-black text-center capitalize transition-colors ease-in-out">User Prompts</h3>
                    <div className='flex flex-wrap items-center justify-center gap-4'>
                        {prompts.map((product, index) => (
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
                    </>
                    )}
                    <div className='text-center my-4'>
                                        <div className='flex items-center'>
                                        <div className="othertabs-container tabs">
                                            <Tab
                                            key={'imagepicker'}
                                            tab={{ name: 'imagepicker', icon: <FaImage size={30} /> }}
                                            handleClick={() => {
                                                if (state.activeTab === "imagepicker") {
                                                state.showJustImages = false;
                                                state.allProducts = true;
                                                state.activeTab = null;
                                                } else {
                                                state.showJustImages = true;
                                                state.allProducts = false;
                                                state.showJustTexts = false;
                                                state.showJustPrompts = false;
                                                state.activeTab = "imagepicker";
                                                fetchImages();
                                                }
                                            }}
                                            />
                                            <Tab
                                            key={'textpicker'}
                                            tab={{ name: 'textpicker', icon: <FiFileText size={30} /> }}
                                            handleClick={() => {
                                                if (state.activeTab === "textpicker") {
                                                state.showJustTexts = false;
                                                state.allProducts = true;
                                                state.activeTab = null;
                                                } else {
                                                state.showJustTexts = true;
                                                state.allProducts = false;
                                                state.showJustImages = false;
                                                state.showJustPrompts = false;
                                                state.activeTab = "textpicker";
                                                fetchTexts();
                                                }
                                            }}
                                            />
                                            <Tab
                                            key={'promptpicker'}
                                            tab={{ name: 'promptpicker', icon: <FaRobot size={30} /> }}
                                            handleClick={() => {
                                                if (state.activeTab === "promptpicker") {
                                                state.showJustPrompts = false;
                                                state.allProducts = true;
                                                state.activeTab = null;
                                                } else {
                                                state.showJustPrompts = true;
                                                state.allProducts = false;
                                                state.showJustTexts = false;
                                                state.showJustImages = false;
                                                state.activeTab = "promptpicker";
                                                fetchPrompts();
                                                }
                                            }}
                                            />
                                        </div>
                                        </div>
                                    </div>
                  </div>
                  <div className='mt-20 mx-auto flex items-center justify-center gap-2'>
                    <CustomLink type='outline' title='Go to the Market' path={"/marketplace"} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold' />
                    {isOwnProfile ? <CustomLink type='filled' title='Edit Profile' path={`/dashboard/${props.user.publicID}`} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold' /> : ''}
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
                        <div className='relative pb-2 h-full justify-center items-center'>
                            <div className='flex flex-col pb-5'>
                                <div className='relative flex flex-col mb-7'>
                                    <div className='flex flex-col justify-center items-center'>
                                        <img
                                        src={props.user.profileBg}
                                        className='w-screen h-[260px] 2xl:h-[480px] shadow-lg object-cover'
                                        alt="banner-pic"
                                        />
                                        <img
                                        src={props.user.profilePic}
                                        className='rounded-full w-20 h-20 -mt-10 shadow-xl object-cover'
                                        alt="user-pic"
                                        />
                                        <h1 className='font-bold text-3xl text-center mt-3 text-white'>@{props.user.username}</h1>
                                        <p className='my-4 max-w-xl mx-auto text-white'>{props.user.description !== '' ? `${props.user.description}` : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat, dignissimos eum cupiditate tenetur facilis maxime nihil porro! Animi dolorum, incidunt temporibus assumenda commodi, obcaecati quasi sequi aspernatur libero voluptatum possimus!'}</p>
                                        <div className='flex flex-wrap gap-2 items-center justify-center'>
                                          <div className='flex flex-wrap gap-2 items-center'>
                                          {Object.entries(URLs).map(([name, url]) => {
                                            if (!url) return null;  // If URL is empty, don't render anything

                                            const Icon = ({ name }) => {
                                              switch (name) {
                                                case "websiteURL": return <FaGlobe />;
                                                case "facebookURL": return <FaFacebook />;
                                                case "instagramURL": return <FaInstagram />;
                                                case "twitterURL": return <FaTwitter />;
                                                case "linkedinURL": return <FaLinkedin />;
                                                case "githubURL": return <FaGithub />;
                                                case "tumblrURL": return <SiTumblr />;
                                                case "pinterestURL": return <ImPinterest />;
                                                case "dribbbleURL": return <AiFillDribbbleSquare />;
                                                case "behanceURL": return <AiFillBehanceSquare />;
                                                default: return null;
                                              }
                                            }

                                            return (
                                              <a href={url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`}
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="mx-2 text-[#04E762] md:text-xl text-lg hover:text-white transition-colors ease-in-out">
                                                  <Icon name={name} className="w-5 h-5 inline" />
                                              </a>
                                            );
                                          })}
                                          </div>
                                          <div className='md:border-l border-[#fff]'>
                                            <p className='md:ml-4 text-white'>Joined on <Moment format="MMMM DD, YYYY">{props.user.createdAt}</Moment></p>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                      </>
                )}
              </div>
              <div className='mt-4'>
              {snap.allProducts && (
                <>
                <h3 className="2xl:text-2xl text-xl font-black text-white text-center capitalize transition-colors ease-in-out">User Products</h3>
                <div className='flex flex-wrap items-center justify-center gap-4'>
                    {products.map((product, index) => (
                      <Link className='md:w-auto w-full' href={`/product/${product.publicID}`} target='_blank'>
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
                </>
              )}
              {snap.showJustImages && (
                <>
                <h3 className="2xl:text-2xl text-xl font-black text-white text-center capitalize transition-colors ease-in-out">User Images</h3>
                <div className='flex flex-wrap items-center justify-center gap-4'>
                    {images.map((product, index) => (
                      <Link className='md:w-auto w-full' href={`/product/${product.publicID}`} target='_blank'>
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
                </>
              )}
              {snap.showJustTexts && (
                <>
                <h3 className="2xl:text-2xl text-xl font-black text-white text-center capitalize transition-colors ease-in-out">User Texts</h3>
                <div className='flex flex-wrap items-center justify-center gap-4'>
                    {texts.map((product, index) => (
                      <Link className='md:w-auto w-full' href={`/product/${product.publicID}`} target='_blank'>
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
                </>
              )}
              {snap.showJustPrompts && (
                <>
                <h3 className="2xl:text-2xl text-xl font-black text-white text-center capitalize transition-colors ease-in-out">User Prompts</h3>
                <div className='flex flex-wrap items-center justify-center gap-4'>
                    {prompts.map((product, index) => (
                      <Link className='md:w-auto w-full' href={`/product/${product.publicID}`} target='_blank'>
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
                </>
              )}
                <div className='text-center my-4'>
                                        <div className='flex items-center'>
                                        <div className="othertabs-container tabs glassmorphism-black">
                                            <Tab
                                            key={'imagepicker'}
                                            tab={{ name: 'imagepicker', icon: <FaImage size={30} /> }}
                                            handleClick={() => {
                                                if (state.activeTab === "imagepicker") {
                                                state.showJustImages = false;
                                                state.allProducts = true;
                                                state.activeTab = null;
                                                } else {
                                                state.showJustImages = true;
                                                state.allProducts = false;
                                                state.showJustTexts = false;
                                                state.showJustPrompts = false;
                                                state.activeTab = "imagepicker";
                                                fetchImages();
                                                }
                                            }}
                                            />
                                            <Tab
                                            key={'textpicker'}
                                            tab={{ name: 'textpicker', icon: <FiFileText size={30} /> }}
                                            handleClick={() => {
                                                if (state.activeTab === "textpicker") {
                                                state.showJustTexts = false;
                                                state.allProducts = true;
                                                state.activeTab = null;
                                                } else {
                                                state.showJustTexts = true;
                                                state.allProducts = false;
                                                state.showJustImages = false;
                                                state.showJustPrompts = false;
                                                state.activeTab = "textpicker";
                                                fetchTexts();
                                                }
                                            }}
                                            />
                                            <Tab
                                            key={'promptpicker'}
                                            tab={{ name: 'promptpicker', icon: <FaRobot size={30} /> }}
                                            handleClick={() => {
                                                if (state.activeTab === "promptpicker") {
                                                state.showJustPrompts = false;
                                                state.allProducts = true;
                                                state.activeTab = null;
                                                } else {
                                                state.showJustPrompts = true;
                                                state.allProducts = false;
                                                state.showJustTexts = false;
                                                state.showJustImages = false;
                                                state.activeTab = "promptpicker";
                                                fetchPrompts();
                                                }
                                            }}
                                            />
                                        </div>
                                        </div>
                                    </div>
              </div>
              <div className='mt-20 mx-auto flex items-center justify-center gap-2'>
                <CustomLink type='outline' title='Go to the Market' path={"/marketplace"} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold' />
                {isOwnProfile ? <CustomLink type='filled' title='Edit Profile' path={`/dashboard/${props.user.publicID}`} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold' /> : ''}
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
  
      // Query 'approved' collections for products associated with the user
      const approvedRef = collectionGroup(db, 'approved');
      const productsQuery = query(approvedRef, where('publisher', '==', user.uid));
      const productsQuerySnapshot = await getDocs(productsQuery);
  
      const products = productsQuerySnapshot.docs.map(doc => {
        return {
          id: doc.id,
          ...doc.data(),
        }
      });
  
      return {
        props: {
          user, // Pass the user data as a prop to your component
          products, // Pass the products data as a prop to your component
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
  
  export default Profile;