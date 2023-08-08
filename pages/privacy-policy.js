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
            <title>Privacy Policy | AITropy</title>
            <meta name="description" content="Explore the world of AI-generated texts, images, and prompts with AITropy. Buy, sell, and discover a lot of products for and created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY tools. Start today! | AITropy" />
            <meta name="keywords" content="marketplace, ai-generated products, prompts, images, texts, gpt, dall-e, stable diffusion, midjourney, AI, artificial intelligence, buy, sell, community, no-fees" />
            <meta property="og:title" content="Privacy Policy | AITropy" />
            <meta property="og:description" content="Explore the world of AI-generated texts, images, and prompts with AITropy. Buy, sell, and discover a lot of products for and created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY tools. Start today! | AITropy" />
            <meta property="og:url" content={`${process.env.NEXT_PUBLIC_AITROPY_URL}`} />
            <meta name="twitter:title" content="Privacy Policy | AITropy" />
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
                            <motion.div {...headTextAnimation} className='mt-8'>
                                <h2 className='2xl:text-[3rem] text-[1.5rem] font-black text-black text-center'>Privacy Policy</h2>
                                <motion.div {...headContentAnimation} className='flex flex-col gap-5 mt-4'>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>Effective Date: August 2nd, 2023</p>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>AITropy ("we", "us", "our") is committed to protecting the privacy of our users ("you", "your"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website aitropy.vercel.app (the "Website"). Please read this Privacy Policy carefully. By using the Website, you consent to the data practices described in this policy.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-black text-center'>Information We Collect</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>We collect information that you provide to us, such as your email address, when you sign up for our newsletter or register an account on our Website. We also collect information automatically when you visit our Website, such as your IP address and data about your usage, through the use of cookies and other tracking technologies like Google Analytics.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-black text-center'>Use of Your Information</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>We use your email address to send you notifications and to alert you of new product features. We may occasionally use your IP address to ensure the safety and security of our Website and users. We use Google Analytics to analyze and improve our Website's performance and user experience.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-black text-center'>Third-Party Service Providers</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>We partner with PayPal, a third-party payment processor, to process payments made through our Website. When you make a purchase, you may be redirected to PayPal's website to complete the transaction. PayPal may collect your payment information, such as your credit card number, in accordance with their privacy policy. We do not store your payment information on our systems.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-black text-center'>Sharing of Your Information</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>We do not sell, trade, or otherwise transfer your personally identifiable information to third parties for marketing purposes. We may share your information with third-party service providers, such as Google Analytics and PayPal, to provide services on our behalf and to improve our Website's functionality. We may also disclose your information as required by law, such as to comply with a subpoena, or when we believe that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, or respond to a government request.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-black text-center'>Changes to This Privacy Policy</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-black text-center'>Contact Us</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>If you have any questions about this Privacy Policy, please contact us at <a className='font-medium' href="mailto:aitropy.io@gmail.com">aitropy.io@gmail.com</a>.</p>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                        <motion.div className='max-w-[3840px] m-auto mt-10'>
                            <Footer />
                        </motion.div>
                </motion.div>
            )}
            {snap.themeDark && (
                <motion.div className='max-w-[3840px] m-auto bg-gray-900'>
                    <motion.div className='max-w-[3840px] m-auto'>
                        <Navbar />
                    </motion.div>
                    <motion.div className='max-w-[1920px] m-auto'>
                        <motion.div {...headTextAnimation} className='mt-8'>
                            <h2 className='2xl:text-[3rem] text-[1.5rem] font-black text-white text-center'>Privacy Policy</h2>
                            <motion.div {...headContentAnimation} className='flex flex-col gap-5 mt-4'>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>Effective Date: August 2nd, 2023</p>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>AITropy ("we", "us", "our") is committed to protecting the privacy of our users ("you", "your"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website aitropy.vercel.app (the "Website"). Please read this Privacy Policy carefully. By using the Website, you consent to the data practices described in this policy.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-white text-center'>Information We Collect</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>We collect information that you provide to us, such as your email address, when you sign up for our newsletter or register an account on our Website. We also collect information automatically when you visit our Website, such as your IP address and data about your usage, through the use of cookies and other tracking technologies like Google Analytics.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-white text-center'>Use of Your Information</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>We use your email address to send you notifications and to alert you of new product features. We may occasionally use your IP address to ensure the safety and security of our Website and users. We use Google Analytics to analyze and improve our Website's performance and user experience.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-white text-center'>Third-Party Service Providers</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>We partner with PayPal, a third-party payment processor, to process payments made through our Website. When you make a purchase, you may be redirected to PayPal's website to complete the transaction. PayPal may collect your payment information, such as your credit card number, in accordance with their privacy policy. We do not store your payment information on our systems.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-white text-center'>Sharing of Your Information</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>We do not sell, trade, or otherwise transfer your personally identifiable information to third parties for marketing purposes. We may share your information with third-party service providers, such as Google Analytics and PayPal, to provide services on our behalf and to improve our Website's functionality. We may also disclose your information as required by law, such as to comply with a subpoena, or when we believe that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, or respond to a government request.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-white text-center'>Changes to This Privacy Policy</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-white text-center'>Contact Us</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>If you have any questions about this Privacy Policy, please contact us at <a className='font-medium' href="mailto:aitropy.io@gmail.com">aitropy.io@gmail.com</a>.</p>
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