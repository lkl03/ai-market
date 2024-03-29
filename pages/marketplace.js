import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSnapshot } from 'valtio'
import { useUser } from '../context/userContext'

import { IoMdMoon, IoMdSunny } from 'react-icons/io'
import { FaArrowLeft, FaImage, FaRobot } from 'react-icons/fa'
import { FiFileText } from 'react-icons/fi'

import state from '../store'
import { CustomButton, CustomLink, GoogleButton, Navbar, NavbarLog, Footer } from '../components'
import LoginComponent from '../components/LoginComponent'
import Tab from '../components/Tab';
import {
  headContainerAnimation,
  headContentAnimation,
  headTextAnimation,
  slideAnimation
} from '../config/motion'
import { EditorTabs, FilterTabs, DecalTypes } from '../config/constants'

import { tile1, tile2, tile3 } from '../assets'

import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, db } from '../firebase';
import { doc, collection, collectionGroup, getDocs, query } from 'firebase/firestore'

import { v4 as uuidv4 } from 'uuid';
import ClipLoader from "react-spinners/ClipLoader";

import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';

export default function Marketplace() {
  const snap = useSnapshot(state)
  const { user, loading } = useUser();

  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const approvedRef = collectionGroup(db, 'approved');
      const querySnapshot = await getDocs(approvedRef);
      
      const fetchedData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setProducts(fetchedData);
      setProductsLoading(false);
    }

    fetchProducts();
  }, []);

  const [images, setImages] = useState([]);

  const fetchImages = async () => {
    const approvedRef = collectionGroup(db, 'approved');
    const querySnapshot = await getDocs(approvedRef);
    
    const fetchedData = querySnapshot.docs
      .filter(doc => doc.data().parentCollection === 'images')
      .map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

    setImages(fetchedData);
  }

  const [texts, setTexts] = useState([]);

  const fetchTexts = async () => {
    const approvedRef = collectionGroup(db, 'approved');
    const querySnapshot = await getDocs(approvedRef);
    
    const fetchedData = querySnapshot.docs
      .filter(doc => doc.data().parentCollection === 'texts')
      .map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

    setTexts(fetchedData);
  }

  const [prompts, setPrompts] = useState([]);

  const fetchPrompts = async () => {
    const approvedRef = collectionGroup(db, 'approved');
    const querySnapshot = await getDocs(approvedRef);
    
    const fetchedData = querySnapshot.docs
      .filter(doc => doc.data().parentCollection === 'prompts')
      .map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

    setPrompts(fetchedData);
  }

  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredImages = images.filter(image => 
    image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.ai.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTexts = texts.filter(text => 
    text.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    text.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    text.ai.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPrompts = prompts.filter(prompt => 
    prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.ai.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatePresence>
      <Head>
        <title>Marketplace | Buy & Sell AI-Generated Products with No-Fees | AITropy</title>
        <meta name="description" content="AITropy's marketplace is your hub for AI-generated texts, images, and prompts. Buy or sell products for and created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY. Join today! | AITropy" />
        <meta name="keywords" content="marketplace, ai-generated products, prompts, images, texts, gpt, dall-e, stable diffusion, midjourney, AI, artificial intelligence, buy, sell, community, no-fees" />
        <meta property="og:title" content="Marketplace | Buy & Sell AI-Generated Products with No-Fees | AITropy" />
        <meta property="og:description" content="AITropy's marketplace is your hub for AI-generated texts, images, and prompts. Buy or sell products created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY. Join today! | AITropy" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_AITROPY_URL}/marketplace`} />
        <meta name="twitter:title" content="Marketplace | Buy & Sell AI-Generated Products with No-Fees | AITropy" />
        <meta name="twitter:description" content="AITropy's marketplace is your hub for AI-generated texts, images, and prompts. Buy or sell products created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY. Join today! | AITropy" />
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
              <motion.div key='customizer' className='fixed top-0 left-0 z-10' {...slideAnimation('left')}>
                <div className='flex items-center min-h-screen'>
                  <div className="editortabs-container tabs">
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
              </motion.div>
            {productsLoading ? <div className='m-auto w-[100px] min-h-screen flex  items-center justify-center mt-20 mb-20'><ClipLoader size={50} color={snap.color} /></div> :
              <motion.div className='flex flex-row flex-wrap md:h-auto md:w-full lg:justify-around justify-start items-center 2xl:py-8 2xl:px-36 sm:p-8 p-6 max-2xl:gap-7 max-w-[1920px] m-auto'>
                {snap.allProducts && (
                  <>
                    <motion.div className='container mt-10 mx-auto px-4' {...headContainerAnimation}>
                      {/*<div className="my-8">
                      <input 
                        className="w-full px-3 py-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" 
                        type="search" 
                        placeholder="Search Products..." 
                        value={searchTerm}
                        onChange={handleSearch}
                      />
                      </div>*/}
                      <h2 className='2xl:text-[3rem] text-[1.5rem] font-black text-black text-center'>Latest Products</h2>
                      <ResponsiveMasonry
                        columnsCountBreakPoints={{ 350: 1, 750: 2, 1280: 3, 1800: 4 }}
                      >
                        <Masonry gutter='2rem'>
                          {products.map((product, index) => (
                            <Link href={`/product/${product.publicID}`} target='_blank'>
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
                        </Masonry>
                      </ResponsiveMasonry>
                    </motion.div>
                  </>
                )}
                {snap.showJustImages && (
                  <>
                    <motion.div className='container md:mt-0 mt-10 mx-auto px-4' {...headContainerAnimation}>
                      <div className="my-8">
                        <input 
                        className="w-full px-3 py-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" 
                        type="search" 
                        placeholder="Search Images..." 
                        value={searchTerm}
                        onChange={handleSearch}
                        />
                      </div>
                      <h2 className='2xl:text-[3rem] text-[1.5rem] font-black text-black text-center'>Latest Images</h2>
                      <ResponsiveMasonry
                        columnsCountBreakPoints={{ 350: 1, 750: 2, 1280: 3, 1800: 4 }}
                      >
                        <Masonry gutter='2rem'>
                          {filteredImages.map((image, index) => (
                            <Link href={`/product/${image.publicID}`} target='_blank'>
                            <div key={index} className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                              <div className='relative max-w-full md:max-w-[350px] m-auto'>
                                <img src={image.thumbnailURL} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                                <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                                  <p className="font-semibold uppercase">{image.ai}</p>
                                </div>
                                <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-[#04E762] bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                                  <p className="font-bold text-black">${image.price}</p>
                                </div>
                              </div>
                              <div className='pt-2 md:pt-4 border rounded-b-md bg-black border-black max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                                <h3 className='capitalize text-base md:text-lg font-bold text-white truncate'>{image.title}</h3>
                                <p className='italic text-white text-xs md:text-sm line-clamp-3'>{image.desc}</p>
                              </div>
                            </div>
                            </Link>
                          ))}
                        </Masonry>
                      </ResponsiveMasonry>
                    </motion.div>
                  </>
                )}
                {snap.showJustTexts && (
                  <>
                    <motion.div className='container md:mt-0 mt-10 mx-auto px-4' {...headContainerAnimation}>
                      <div className="my-8">
                        <input 
                          className="w-full px-3 py-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" 
                          type="search" 
                          placeholder="Search Texts..." 
                          value={searchTerm}
                          onChange={handleSearch}
                        />
                      </div>
                      <h2 className='2xl:text-[3rem] text-[1.5rem] font-black text-black text-center'>Latest Texts</h2>
                      <ResponsiveMasonry
                        columnsCountBreakPoints={{ 350: 1, 750: 2, 1280: 3, 1800: 4 }}
                      >
                        <Masonry gutter='2rem'>
                          {filteredTexts.map((text, index) => (
                            <Link href={`/product/${text.publicID}`} target='_blank'>
                            <div key={index} className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                              <div className='relative max-w-full md:max-w-[350px] m-auto'>
                                <img src={text.thumbnailURL} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                                <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                                  <p className="font-semibold uppercase">{text.ai}</p>
                                </div>
                                <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-[#04E762] bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                                  <p className="font-bold text-black">${text.price}</p>
                                </div>
                              </div>
                              <div className='pt-2 md:pt-4 border rounded-b-md bg-black border-black max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                                <h3 className='capitalize text-base md:text-lg font-bold text-white truncate'>{text.title}</h3>
                                <p className='italic text-white text-xs md:text-sm line-clamp-3'>{text.desc}</p>
                              </div>
                            </div>
                            </Link>
                          ))}
                        </Masonry>
                      </ResponsiveMasonry>
                    </motion.div>
                  </>
                )}
                {snap.showJustPrompts && (
                  <>
                    <motion.div className='container md:mt-0 mt-10 mx-auto px-4' {...headContainerAnimation}>
                      <div className="my-8">
                        <input 
                          className="w-full px-3 py-2 border border-[#04E762] text-black bg-transparent rounded outline-none focus:border-black hover:border-black transition-all ease-in-out" 
                          type="search" 
                          placeholder="Search Prompts..." 
                          value={searchTerm}
                          onChange={handleSearch}
                        />
                      </div>
                      <h2 className='2xl:text-[3rem] text-[1.5rem] font-black text-black text-center'>Latest Prompts</h2>
                      <ResponsiveMasonry
                        columnsCountBreakPoints={{ 350: 1, 750: 2, 1280: 3, 1800: 4 }}
                      >
                        <Masonry gutter='2rem'>
                          {filteredPrompts.map((prompt, index) => (
                            <Link href={`/product/${prompt.publicID}`} target='_blank'>
                            <div key={index} className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                              <div className='relative max-w-full md:max-w-[350px] m-auto'>
                                <img src={prompt.thumbnailURL} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                                <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                                  <p className="font-semibold uppercase">{prompt.ai}</p>
                                </div>
                                <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-[#04E762] bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                                  <p className="font-bold text-black">${prompt.price}</p>
                                </div>
                              </div>
                              <div className='pt-2 md:pt-4 border rounded-b-md bg-black border-black max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                                <h3 className='capitalize text-base md:text-lg font-bold text-white truncate'>{prompt.title}</h3>
                                <p className='italic text-white text-xs md:text-sm line-clamp-3'>{prompt.desc}</p>
                              </div>
                            </div>
                            </Link>
                          ))}
                        </Masonry>
                      </ResponsiveMasonry>
                    </motion.div>
                  </>
                )}
              </motion.div>
            }
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
              <motion.div key='customizer' className='fixed top-0 left-0 z-10' {...slideAnimation('left')}>
                <div className='flex items-center min-h-screen'>
                  <div className="editortabs-container tabs glassmorphism-black">
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
            </motion.div>
            {productsLoading ? <div className='m-auto w-[100px] min-h-screen flex  items-center justify-center mt-20 mb-20'><ClipLoader size={50} color={snap.color} /></div> :
              <motion.div className='flex flex-row flex-wrap md:h-auto md:w-full lg:justify-around justify-start items-center 2xl:py-8 2xl:px-36 sm:p-8 p-6 max-2xl:gap-7 max-w-[1920px] m-auto'>
              {snap.allProducts && (
                  <>
                    <motion.div className='container mt-10 mx-auto px-4' {...headContainerAnimation}>
                      {/*<div className="my-8">
                        <input className="w-full px-3 py-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out" type="search" placeholder="Search Products..." />
                      </div>*/}
                      <h2 className='2xl:text-[3rem] text-[1.5rem] font-black text-white text-center'>Latest Products</h2>
                      <ResponsiveMasonry
                        columnsCountBreakPoints={{ 350: 1, 750: 2, 1280: 3, 1800: 4 }}
                      >
                        <Masonry gutter='2rem'>
                          {products.map((product, index) => (
                            <Link href={`/product/${product.publicID}`} target='_blank'>
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
                        </Masonry>
                      </ResponsiveMasonry>
                    </motion.div>
                  </>
              )}
              {snap.showJustImages && (
                  <>
                    <motion.div className='container md:mt-0 mt-10 mx-auto px-4' {...headContainerAnimation}>
                      <div className="my-8">
                        <input 
                          className="w-full px-3 py-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out"
                          type="search" 
                          placeholder="Search Images..." 
                          value={searchTerm}
                          onChange={handleSearch}
                        />
                      </div>
                      <h2 className='2xl:text-[3rem] text-[1.5rem] font-black text-white text-center'>Latest Images</h2>
                      <ResponsiveMasonry
                        columnsCountBreakPoints={{ 350: 1, 750: 2, 1280: 3, 1800: 4 }}
                      >
                        <Masonry gutter='2rem'>
                          {filteredImages.map((image, index) => (
                            <Link href={`/product/${image.publicID}`} target='_blank'>
                            <div key={index} className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                              <div className='relative max-w-full md:max-w-[350px] m-auto'>
                                <img src={image.thumbnailURL} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                                <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                                  <p className="font-semibold uppercase">{image.ai}</p>
                                </div>
                                <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                                  <p className="font-bold text-white">${image.price}</p>
                                </div>
                              </div>
                              <div className='pt-2 md:pt-4 border rounded-b-md bg-[#04E762] border-[#04E762] max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                                <h3 className='capitalize text-base md:text-lg font-bold text-black truncate'>{image.title}</h3>
                                <p className='italic text-black text-xs md:text-sm line-clamp-3'>{image.desc}</p>
                              </div>
                            </div>
                            </Link>
                          ))}
                        </Masonry>
                      </ResponsiveMasonry>
                    </motion.div>
                  </>
              )}
              {snap.showJustTexts && (
                  <>
                    <motion.div className='container md:mt-0 mt-10 mx-auto px-4' {...headContainerAnimation}>
                      <div className="my-8">
                      <input 
                          className="w-full px-3 py-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out"
                          type="search" 
                          placeholder="Search Texts..." 
                          value={searchTerm}
                          onChange={handleSearch}
                        />
                      </div>
                      <h2 className='2xl:text-[3rem] text-[1.5rem] font-black text-white text-center'>Latest Texts</h2>
                      <ResponsiveMasonry
                        columnsCountBreakPoints={{ 350: 1, 750: 2, 1280: 3, 1800: 4 }}
                      >
                        <Masonry gutter='2rem'>
                          {filteredTexts.map((text, index) => (
                            <Link href={`/product/${text.publicID}`} target='_blank'>
                            <div key={index} className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                              <div className='relative max-w-full md:max-w-[350px] m-auto'>
                                <img src={text.thumbnailURL} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                                <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                                  <p className="font-semibold uppercase">{text.ai}</p>
                                </div>
                                <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                                  <p className="font-bold text-white">${text.price}</p>
                                </div>
                              </div>
                              <div className='pt-2 md:pt-4 border rounded-b-md bg-[#04E762] border-[#04E762] max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                                <h3 className='capitalize text-base md:text-lg font-bold text-black truncate'>{text.title}</h3>
                                <p className='italic text-black text-xs md:text-sm line-clamp-3'>{text.desc}</p>
                              </div>
                            </div>
                            </Link>
                          ))}
                        </Masonry>
                      </ResponsiveMasonry>
                    </motion.div>
                  </>
              )}
              {snap.showJustPrompts && (
                  <>
                    <motion.div className='container md:mt-0 mt-10 mx-auto px-4' {...headContainerAnimation}>
                      <div className="my-8">
                      <input 
                          className="w-full px-3 py-2 border border-white text-white bg-transparent rounded outline-none focus:border-[#04E762] hover:border-[#04E762] transition-all ease-in-out"
                          type="search" 
                          placeholder="Search Prompts..." 
                          value={searchTerm}
                          onChange={handleSearch}
                        />
                      </div>
                      <h2 className='2xl:text-[3rem] text-[1.5rem] font-black text-white text-center'>Latest Prompts</h2>
                      <ResponsiveMasonry
                        columnsCountBreakPoints={{ 350: 1, 750: 2, 1280: 3, 1800: 4 }}
                      >
                        <Masonry gutter='2rem'>
                          {prompts.map((prompt, index) => (
                            <Link href={`/product/${prompt.publicID}`} target='_blank'>
                            <div key={index} className="max-w-full md:max-w-[350px] m-auto cursor-pointer overflow-hidden">
                              <div className='relative max-w-full md:max-w-[350px] m-auto'>
                                <img src={prompt.thumbnailURL} alt="Thumbnail" className='w-full max-w-full min-w-[350px] object-cover mt-2 h-[200px] md:h-[175px] m-auto rounded-t-md' />
                                <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white bg-opacity-85 rounded py-1 px-1 md:px-2 text-xs md:text-sm">
                                  <p className="font-semibold uppercase">{prompt.ai}</p>
                                </div>
                                <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black bg-opacity-90 rounded py-1 px-1 md:px-2 text-xs md:text-base">
                                  <p className="font-bold text-white">${prompt.price}</p>
                                </div>
                              </div>
                              <div className='pt-2 md:pt-4 border rounded-b-md bg-[#04E762] border-[#04E762] max-w-full md:max-w-[400px] m-auto px-2 md:px-4 py-1.5 md:py-2.5'>
                                <h3 className='capitalize text-base md:text-lg font-bold text-black truncate'>{prompt.title}</h3>
                                <p className='italic text-black text-xs md:text-sm line-clamp-3'>{prompt.desc}</p>
                              </div>
                            </div>
                            </Link>
                          ))}
                        </Masonry>
                      </ResponsiveMasonry>
                    </motion.div>
                  </>
              )}
              </motion.div>
            }
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