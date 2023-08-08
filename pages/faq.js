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
            <title>FAQ | AITropy</title>
            <meta name="description" content="Explore the world of AI-generated texts, images, and prompts with AITropy. Buy, sell, and discover a lot of products for and created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY tools. Start today! | AITropy" />
            <meta name="keywords" content="marketplace, ai-generated products, prompts, images, texts, gpt, dall-e, stable diffusion, midjourney, AI, artificial intelligence, buy, sell, community, no-fees" />
            <meta property="og:title" content="FAQ | AITropy" />
            <meta property="og:description" content="Explore the world of AI-generated texts, images, and prompts with AITropy. Buy, sell, and discover a lot of products for and created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY tools. Start today! | AITropy" />
            <meta property="og:url" content={`${process.env.NEXT_PUBLIC_AITROPY_URL}`} />
            <meta name="twitter:title" content="FAQ | AITropy" />
            <meta name="twitter:description" content="Explore the world of AI-generated texts, images, and prompts with AITropy. Buy, sell, and discover a lot of products for and created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY tools. Start today! | AITropy" />
            <link rel="icon" href="/favicon.png" />
            </Head>
            <motion.div className='flex flex-wrap fixed z-[10000] gap-1 bottom-4 right-4 bg-[#04E762]  text-white font-bold py-2 px-4 rounded-full'>
                <a onClick={() => (state.themeDark = true) && (state.themeLight = false)} className='cursor-pointer hover:text-gray-500 transition-all ease-in-out'><IoMdMoon size={25} /></a>
                <a onClick={() => (state.themeLight = true) && (state.themeDark = false)} className='cursor-pointer hover:text-gray-500 transition-all ease-in-out'><IoMdSunny size={25} /></a>
            </motion.div>
            {snap.themeLight && (
                <motion.div className='max-w-[3840px] m-auto'>
                        <motion.div className='max-w-[3840px] m-auto'>
                            <Navbar />
                        </motion.div>
                        <motion.div className='max-w-[1920px] m-auto'>
                            <motion.div {...headTextAnimation} className='mt-8 md:min-h-screen'>
                                <h2 className='2xl:text-[3rem] text-[1.5rem] font-black text-black text-center'>FAQ</h2>
                                <motion.div {...headContentAnimation} className='flex flex-col gap-5 mt-4'>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>We're still building this section!</p>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>If you have any inquiries please contact us through email <a className='font-medium' href="mailto:aitropy.io@gmail.com">aitropy.io@gmail.com</a> meanwhile.</p>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                        <motion.div className='max-w-[3840px] m-auto mt-10'>
                            <Footer />
                        </motion.div>
                </motion.div>
            )}
            {snap.themeDark && (
                <motion.div className='max-w-[3840px] m-auto bg-gray-900 md:min-h-screen'>
                        <motion.div className='max-w-[3840px] m-auto'>
                            <Navbar />
                        </motion.div>
                        <motion.div className='max-w-[1920px] m-auto'>
                            <motion.div {...headTextAnimation} className='mt-8'>
                                <h2 className='2xl:text-[3rem] text-[1.5rem] font-black text-white text-center'>FAQ</h2>
                                <motion.div {...headContentAnimation} className='flex flex-col gap-5 mt-4'>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>We're still building this section!</p>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>If you have any inquiries please contact us through email <a className='font-medium' href="mailto:aitropy.io@gmail.com">aitropy.io@gmail.com</a> meanwhile.</p>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                        <motion.div className='max-w-[3840px] m-auto mt-10'>
                            <Footer />
                        </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}