import Head from 'next/head'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useSnapshot } from 'valtio'

import { IoMdMoon, IoMdSunny } from 'react-icons/io'

import state from '../store'
import { CustomButton, CustomLink, Navbar, Footer } from '../components'
import {
    headContainerAnimation,
    headContentAnimation,
    headTextAnimation,
    slideAnimation
} from '../config/motion'

import { tile1, tile2, tile3, logoblack, logowhite, selldark, sellwhite, buydark, buywhite } from '../assets'

export default function Home() {
    const snap = useSnapshot(state)
    return (
        <AnimatePresence>
            <Head>
            <title>Buy & Sell AI-Generated Products with No-Fees | AITropy</title>
            <meta name="description" content="Explore the world of AI-generated texts, images, and prompts with AITropy. Buy, sell, and discover a lot of products for and created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY tools. Start today! | AITropy" />
            <meta name="keywords" content="marketplace, ai-generated products, prompts, images, texts, gpt, dall-e, stable diffusion, midjourney, AI, artificial intelligence, buy, sell, community, no-fees" />
            <meta property="og:title" content="Buy & Sell AI-Generated Products with No-Fees | AITropy" />
            <meta property="og:description" content="Explore the world of AI-generated texts, images, and prompts with AITropy. Buy, sell, and discover a lot of products for and created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY tools. Start today! | AITropy" />
            <meta property="og:url" content={`${process.env.NEXT_PUBLIC_AITROPY_URL}`} />
            <meta name="twitter:title" content="Buy & Sell AI-Generated Products with No-Fees | AITropy" />
            <meta name="twitter:description" content="Explore the world of AI-generated texts, images, and prompts with AITropy. Buy, sell, and discover a lot of products for and created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY tools. Start today! | AITropy" />
            <link rel="icon" href="/favicon.png" />
            </Head>
            <motion.div className='flex flex-wrap fixed z-[10000] gap-1 bottom-4 right-4 bg-[#04E762]  text-white font-bold py-2 px-4 rounded-full'>
                <a onClick={() => (state.themeDark = true) && (state.themeLight = false)} className='cursor-pointer hover:text-gray-500 transition-all ease-in-out'><IoMdMoon size={25} /></a>
                <a onClick={() => (state.themeLight = true) && (state.themeDark = false)} className='cursor-pointer hover:text-gray-500 transition-all ease-in-out'><IoMdSunny size={25} /></a>
            </motion.div>
            {snap.intro && snap.themeLight && (
                <motion.div className='flex flex-wrap h-screen xl:items-center max-2xl:gap-7 max-w-[3840px] m-auto'>
                    <motion.div className='flex flex-row flex-wrap md:h-screen md:w-full 2xl:justify-between lg:justify-around justify-start items-center 2xl:py-8 2xl:px-36 sm:p-8 p-6 max-2xl:gap-7 absolute z-10 max-w-[1920px] m-auto'>
                        <motion.section {...slideAnimation('left')}>
                            <motion.header {...slideAnimation('down')}>
                                <img src={logoblack.src} alt="logo" className='w-32 h-auto object-contain' />
                            </motion.header>
                            <motion.div className='home-content' {...headContainerAnimation}>
                                <motion.div {...headTextAnimation}>
                                <h1 className='head-text text-black'>
                                        Buy & Sell <br></br>
                                        AI-Generated <br></br>
                                        Products
                                    </h1>
                                    <motion.div {...headContentAnimation} className='flex flex-col gap-5'>
                                        <p className='max-w-md font-normal text-gray-600 text-base'>
                                            Discover some of the best AI-generated products from the community. Start selling yours and monetize your skills. No fees. Instantly account setup.
                                        </p>
                                        <motion.div {...headContentAnimation} className='flex flex-row flex-wrap gap-2'>
                                            <CustomButton type='outline' title='Learn More' handleClick={() => state.intro = false} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold text-sm' />
                                            <CustomLink type='filled' title='Go to the Market' path={"/marketplace"} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold text-sm' />
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        </motion.section>
                        <motion.section>
                            <motion.div>
                                <motion.div className='tile max-w-[450px] shadow-lg 3xl:block hidden' {...headContentAnimation}><img src={tile1.src} /></motion.div>
                                <motion.div className='tile max-w-[350px] absolute top-[52%] right-[25%] z-20 shadow-lg 3xl:block hidden' {...headContentAnimation}><img src={tile2.src} /></motion.div>
                                <motion.div className='tile max-w-[350px] absolute top-[10%] right-[5%] z-[-1] shadow-lg 3xl:block hidden' {...headContentAnimation}><img src={tile3.src} /></motion.div>
                                <motion.div className="3xl:hidden flex flex-col flex-wrap justify-center items-center h-auto gap-4 2xl:max-w-[300px] md:max-w-[200px]" {...headContentAnimation}>
                                    <motion.div className="md:hidden h-1/2 flex flex-row justify-between gap-4 w-full">
                                        <motion.div className="w-full h-auto">
                                            <img src={tile1.src} alt="Image 1" className="w-full h-full object-cover shadow-lg" />
                                        </motion.div>
                                        <motion.div className="w-full h-auto">
                                            <img src={tile2.src} alt="Image 2" className="w-full h-full object-cover shadow-lg" />
                                        </motion.div>
                                        <motion.div className="w-full h-auto">
                                            <img src={tile3.src} alt="Image 3" className="w-full h-full object-cover shadow-lg" />
                                        </motion.div>
                                    </motion.div>
                                    <motion.div className="hidden md:flex h-full">
                                        <img src={tile1.src} alt="Image 1" className="w-full h-full object-cover shadow-lg" />
                                    </motion.div>
                                    <motion.div className="hidden md:flex flex-col h-1/2 justify-between gap-4 items-center">
                                        <motion.div className="h-auto">
                                            <img src={tile2.src} alt="Image 2" className="w-full h-full object-cover shadow-lg" />
                                        </motion.div>
                                        <motion.div className="h-auto">
                                            <img src={tile3.src} alt="Image 3" className="w-full h-full object-cover shadow-lg" />
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        </motion.section>
                    </motion.div>
                </motion.div>
            )}
            {snap.intro && snap.themeDark && (
                <motion.div className='flex flex-wrap h-screen xl:items-center max-2xl:gap-7 max-w-[3840px] m-auto bg-gray-900'>
                    <motion.div className='flex flex-row flex-wrap md:h-screen md:w-full 2xl:justify-between lg:justify-around justify-start items-center 2xl:py-8 2xl:px-36 sm:p-8 p-6 max-2xl:gap-7 absolute z-10 max-w-[1920px] m-auto bg-gray-900'>
                        <motion.section {...slideAnimation('left')}>
                            <motion.header {...slideAnimation('down')}>
                                <img src={logowhite.src} alt="logo" className='w-32 h-auto object-contain' />
                            </motion.header>
                            <motion.div className='home-content' {...headContainerAnimation}>
                                <motion.div {...headTextAnimation}>
                                    <h1 className='head-text text-white'>
                                        Buy & Sell <br></br>
                                        AI-Generated <br></br>
                                        Products
                                    </h1>
                                    <motion.div {...headContentAnimation} className='flex flex-col gap-5'>
                                        <p className='max-w-md font-normal text-white text-base'>
                                            Discover some of the best AI-generated products from the community. Start selling yours and monetize your skills. No fees. Instantly account setup.
                                        </p>
                                        <motion.div {...headContentAnimation} className='flex flex-row flex-wrap gap-2'>
                                            <CustomButton type='outline' title='Learn More' handleClick={() => state.intro = false} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold text-sm' />
                                            <CustomLink type='filled' title='Go to the Market' path={"/marketplace"} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold text-sm' />
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        </motion.section>
                        <motion.section>
                        <motion.div>
                                <motion.div className='tile max-w-[450px] shadow-lg 3xl:block hidden' {...headContentAnimation}><img src={tile1.src} /></motion.div>
                                <motion.div className='tile max-w-[350px] absolute top-[52%] right-[25%] z-20 shadow-lg 3xl:block hidden' {...headContentAnimation}><img src={tile2.src} /></motion.div>
                                <motion.div className='tile max-w-[350px] absolute top-[10%] right-[5%] z-[-1] shadow-lg 3xl:block hidden' {...headContentAnimation}><img src={tile3.src} /></motion.div>
                                <motion.div className="3xl:hidden flex flex-col flex-wrap justify-center items-center h-auto gap-4 2xl:max-w-[300px] md:max-w-[200px]" {...headContentAnimation}>
                                    <motion.div className="md:hidden h-1/2 flex flex-row justify-between gap-4 w-full">
                                        <motion.div className="w-full h-auto">
                                            <img src={tile1.src} alt="Image 1" className="w-full h-full object-cover shadow-lg" />
                                        </motion.div>
                                        <motion.div className="w-full h-auto">
                                            <img src={tile2.src} alt="Image 2" className="w-full h-full object-cover shadow-lg" />
                                        </motion.div>
                                        <motion.div className="w-full h-auto">
                                            <img src={tile3.src} alt="Image 3" className="w-full h-full object-cover shadow-lg" />
                                        </motion.div>
                                    </motion.div>
                                    <motion.div className="hidden md:flex h-full">
                                        <img src={tile1.src} alt="Image 1" className="w-full h-full object-cover shadow-lg" />
                                    </motion.div>
                                    <motion.div className="hidden md:flex flex-col h-1/2 justify-between gap-4 items-center">
                                        <motion.div className="h-auto">
                                            <img src={tile2.src} alt="Image 2" className="w-full h-full object-cover shadow-lg" />
                                        </motion.div>
                                        <motion.div className="h-auto">
                                            <img src={tile3.src} alt="Image 3" className="w-full h-full object-cover shadow-lg" />
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        </motion.section>
                    </motion.div>
                </motion.div>
            )}
            {!snap.intro && snap.themeLight && (
                <>
                    <motion.div className='max-w-[3840px] m-auto'>
                        <motion.div className='max-w-[3840px] m-auto'>
                            <Navbar />
                        </motion.div>
                        <motion.div className='max-w-[1920px] m-auto'>
                            <motion.div {...headTextAnimation} className='mt-8'>
                                <h2 className='2xl:text-[2rem] text-[1.5rem] 2xl:leading-[4rem] leading-[2.5rem] font-black text-black text-center'>What is AITropy?</h2>
                                <motion.div {...headContentAnimation} className='flex flex-col gap-5 mt-4'>
                                    <p className='md:max-w-[62.5%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>
                                        Welcome to AITropy! We're an online marketplace built with the mission to allow AI enthusiasts, creators, and businesses come together <br></br> to buy and sell a diverse range of AI-generated products and services, including images, texts, prompts, and comprehensive AI solutions. <br></br>
                                        We ignite a vibrant community, providing endless opportunities for everyone who wants <br></br> to unleash the potential of their AI-driven creations and turn them into profit. <br></br> <br></br>
                                        We recognize the significance of high-quality AI content, from powerful prompts for models <br></br> like DALL·E, Midjourney, and GPT, to captivating images and engaging texts. <br></br>
                                        We're committed to providing a seamless and secure experience that allows prompt engineers and other AI creators <br></br> to showcase their expertise and profit from their innovations. <br></br><br></br>
                                        At AITropy we aim to be more than just a platform; we want to be a dynamic and user-friendly hub <br></br> connecting AI talents with those seeking top-notch AI-generated content. <br></br>
                                        Interested in learning how our buy and sell features work? Read on to discover the benefits and simplicity of our marketplace.
                                    </p>
                                </motion.div>
                            </motion.div>
                            <motion.div {...headTextAnimation} className='mt-8 flex md:flex-row flex-col flex-wrap items-center justify-between'>
                                <div className='md:max-w-[65%] max-w-[90%] m-auto'>
                                <h2 className='2xl:text-[2rem] text-[1.5rem] 2xl:leading-[4rem] leading-[2.5rem] font-black text-black text-start md:max-w-[60%] max-w-[100%] m-auto'>Discover the buying experience</h2>
                                <motion.div {...headContentAnimation} className='flex flex-col gap-5 mt-4'>
                                    <p className='md:max-w-[60%] max-w-[100%] text-start m-auto font-normal text-gray-600 text-base'>
                                    Embrace the future with our streamlined and secure buying experience, designed to connect you with the finest AI-generated products and services. Get access to an extensive selection of AI creations from reputable and verified users while enjoying a hassle-free purchasing process.
                                    </p>
                                    <div className='md:max-w-[60%] max-w-[100%] w-full m-auto flex items-start justify-start'>
                                        <CustomLink type='outline' title='Go to the Market' path={"/marketplace"} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold text-sm' />
                                    </div>
                                </motion.div>
                                </div>
                                <div className='md:max-w-[35%] max-w-[100%] md:mt-0 mt-4 flex items-start justify-start'>
                                <motion.div className='md:max-w-[50%] max-w-[90%] md:m-[inherit] m-auto h-auto tile shadow-lg' {...slideAnimation('down')}><img src={buywhite.src} /></motion.div>
                                </div>
                            </motion.div>
                            <motion.div {...headTextAnimation} className='mt-8 flex flex-row-reverse flex-wrap items-center justify-between'>
                                <div className='md:max-w-[65%] max-w-[90%] m-auto'>
                                <h2 className='2xl:text-[2rem] text-[1.5rem] 2xl:leading-[4rem] leading-[2.5rem] font-black text-black sm:text-end text-start md:max-w-[60%] max-w-[100%] m-auto'>Monetize your skills</h2>
                                <motion.div {...headContentAnimation} className='flex flex-col gap-5 mt-4'>
                                    <p className='md:max-w-[60%] max-w-[100%] sm:text-end text-start m-auto font-normal text-gray-600 text-base'>
                                    With just a few simple steps, you can join our thriving community of AI creators and start monetizing your expertise. showcase your AI-generated products and services to a vast audience of enthusiasts and businesses eager to explore the ever-growing world of AI technology. Fully enjoy the profits from your creations as we won't charge you any fee for using our platform.
                                    </p>
                                    <div className='md:max-w-[60%] max-w-[100%] w-full m-auto flex items-center justify-end'>
                                        <CustomLink type='outline' title='Start Selling' path={"/sell"} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold text-sm' />
                                    </div>
                                </motion.div>
                                </div>
                                <div className='md:max-w-[35%] max-w-[100%] md:mt-0 mt-4 flex items-center justify-end'>
                                <motion.div className='md:max-w-[50%] max-w-[90%] md:m-[inherit] m-auto h-auto tile shadow-lg' {...slideAnimation('up')}><img src={sellwhite.src} /></motion.div>
                                </div>
                            </motion.div>
                        </motion.div>
                        <motion.div className='max-w-[3840px] m-auto mt-10'>
                            <Footer />
                        </motion.div>
                    </motion.div>
                </>
            )}
            {!snap.intro && snap.themeDark && (
                <>
                    <motion.div className='max-w-[3840px] m-auto bg-gray-900'>
                        <motion.div className='max-w-[3840px] m-auto'>
                            <Navbar />
                        </motion.div>
                        <motion.div className='max-w-[1920px] m-auto'>
                            <motion.div {...headTextAnimation} className='mt-8'>
                                <h2 className='2xl:text-[2rem] text-[1.5rem] 2xl:leading-[4rem] leading-[2.5rem] font-black text-white text-center'>What is AITropy?</h2>
                                <motion.div {...headContentAnimation} className='flex flex-col gap-5 mt-4'>
                                    <p className='md:max-w-[62.5%] max-w-[90%] text-center m-auto font-normal text-white text-base'>
                                        Welcome to AITropy! We're an online marketplace built with the mission to allow AI enthusiasts, creators, and businesses come together <br></br> to buy and sell a diverse range of AI-generated products and services, including images, texts, prompts, and comprehensive AI solutions. <br></br>
                                        We ignite a vibrant community, providing endless opportunities for everyone who wants <br></br> to unleash the potential of their AI-driven creations and turn them into profit. <br></br> <br></br>
                                        We recognize the significance of high-quality AI content, from powerful prompts for models <br></br> like DALL·E, Midjourney, and GPT, to captivating images and engaging texts. <br></br>
                                        We're committed to providing a seamless and secure experience that allows prompt engineers and other AI creators <br></br> to showcase their expertise and profit from their innovations. <br></br><br></br>
                                        At AITropy we aim to be more than just a platform; we want to be a dynamic and user-friendly hub <br></br> connecting AI talents with those seeking top-notch AI-generated content. <br></br>
                                        Interested in learning how our buy and sell features work? Read on to discover the benefits and simplicity of our marketplace.
                                    </p>
                                </motion.div>
                            </motion.div>
                            <motion.div {...headTextAnimation} className='mt-8 flex md:flex-row flex-col flex-wrap items-center justify-between'>
                                <div className='md:max-w-[65%] max-w-[90%] m-auto'>
                                <h2 className='2xl:text-[2rem] text-[1.5rem] 2xl:leading-[4rem] leading-[2.5rem] font-black text-white text-start md:max-w-[60%] max-w-[100%] m-auto'>Discover the buying experience</h2>
                                <motion.div {...headContentAnimation} className='flex flex-col gap-5 mt-4'>
                                    <p className='md:max-w-[60%] max-w-[100%] text-start m-auto font-normal text-white text-base'>
                                    Embrace the future with our streamlined and secure buying experience, designed to connect you with the finest AI-generated products and services. Get access to an extensive selection of AI creations from reputable and verified users while enjoying a hassle-free purchasing process.
                                    </p>
                                    <div className='md:max-w-[60%] max-w-[100%] w-full m-auto flex items-start justify-start'>
                                        <CustomLink type='outline' title='Go to the Market' path={"/marketplace"} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold text-sm' />
                                    </div>
                                </motion.div>
                                </div>
                                <div className='md:max-w-[35%] max-w-[100%] md:mt-0 mt-4 flex items-start justify-start'>
                                <motion.div className='md:max-w-[50%] max-w-[90%] md:m-[inherit] m-auto h-auto tile shadow-lg' {...slideAnimation('down')}><img src={buydark.src} /></motion.div>
                                </div>
                            </motion.div>
                            <motion.div {...headTextAnimation} className='mt-8 flex flex-row-reverse flex-wrap items-center justify-between'>
                                <div className='md:max-w-[65%] max-w-[90%] m-auto'>
                                <h2 className='2xl:text-[2rem] text-[1.5rem] 2xl:leading-[4rem] leading-[2.5rem] font-black text-white sm:text-end text-start md:max-w-[60%] max-w-[100%] m-auto'>Monetize your skills</h2>
                                <motion.div {...headContentAnimation} className='flex flex-col gap-5 mt-4'>
                                    <p className='md:max-w-[60%] max-w-[100%] sm:text-end text-start m-auto font-normal text-white text-base'>
                                    With just a few simple steps, you can join our thriving community of AI creators and start monetizing your expertise. showcase your AI-generated products and services to a vast audience of enthusiasts and businesses eager to explore the ever-growing world of AI technology. Fully enjoy the profits from your creations as we won't charge you any fee for using our platform.
                                    </p>
                                    <div className='md:max-w-[60%] max-w-[100%] w-full m-auto flex items-center justify-end'>
                                        <CustomLink type='outline' title='Start Selling' path={"/sell"} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold text-sm' />
                                    </div>
                                </motion.div>
                                </div>
                                <div className='md:max-w-[35%] max-w-[100%] md:mt-0 mt-4 flex items-center justify-end'>
                                <motion.div className='md:max-w-[50%] max-w-[90%] md:m-[inherit] m-auto h-auto tile shadow-lg' {...slideAnimation('up')}><img src={selldark.src} /></motion.div>
                                </div>
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