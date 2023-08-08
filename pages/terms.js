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
                <title>Terms of Service | AITropy</title>
                <meta name="description" content="Explore the world of AI-generated texts, images, and prompts with AITropy. Buy, sell, and discover a lot of products for and created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY tools. Start today! | AITropy" />
                <meta name="keywords" content="marketplace, ai-generated products, prompts, images, texts, gpt, dall-e, stable diffusion, midjourney, AI, artificial intelligence, buy, sell, community, no-fees" />
                <meta property="og:title" content="Terms of Service | AITropy" />
                <meta property="og:description" content="Explore the world of AI-generated texts, images, and prompts with AITropy. Buy, sell, and discover a lot of products for and created by GPT, DALL-E, STABLE DIFFUSION, and MIDJOURNEY tools. Start today! | AITropy" />
                <meta property="og:url" content={`${process.env.NEXT_PUBLIC_AITROPY_URL}`} />
                <meta name="twitter:title" content="Terms of Service | AITropy" />
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
                            <h2 className='2xl:text-[3rem] text-[1.5rem] font-black text-black text-center'>Terms of Service</h2>
                            <motion.div {...headContentAnimation} className='flex flex-col gap-5 mt-4'>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-black text-center'>Refund Policy</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>Our goal is to ensure customer satisfaction with the prompts purchased from our marketplace. Refunds will be granted solely in cases where the prompt does not work as described. To be eligible for a refund, you must submit a request within 24 hours of your purchase, providing a clear explanation and evidence demonstrating that the product is not in concordance with what was described. Upon reviewing your request, we will determine, at our sole discretion, whether your claim is valid and, if so, issue a refund. Refunds will be processed within 5-10 business days after receiving your request.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-black text-center'>Intellectual Property</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>All products available on our marketplace are the intellectual property of their respective creators. You acknowledge that you do not acquire any ownership rights to the products by purchasing or using them. You are responsible for ensuring that your use of the products does not infringe upon any third-party copyrights, trademarks, or other intellectual property rights.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-black text-center'>Usage Policy</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>
                                    When you purchase a product from our marketplace, you are granted a non-exclusive, worldwide, and perpetual license to use the prompt for any purpose, with the following exceptions:
                                </p>
                                <ul className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>
                                    <li>You may not use the product for any harmful, illegal, or malicious activities.</li>
                                    <li>You may not directly resell, redistribute, or transfer the product without the written consent of the product's creator.</li>
                                </ul>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>We reserve the right to terminate your license to use a product if you violate these usage restrictions.</p>
                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-black text-center'>Right to Issue Refunds</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>We reserve the right to issue refunds on any payments made through our marketplace at our sole discretion. This may occur in instances where a customer requests a refund in accordance with our Refund Policy, when we detect potentially fraudulent transactions, or in any other situations where we deem it necessary to issue a refund in order to protect our interests and maintain the integrity of our marketplace. By using our services, you acknowledge and agree to our right to issue refunds as described in this clause.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-black text-center'>Liability</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>Our marketplace is provided "as is" and without any warranties, express or implied. In no event shall we be liable for any direct, indirect, incidental, or consequential damages arising from your use of our marketplace or any products purchased through our marketplace. This includes, but is not limited to, any loss of data, profits, or business interruption, even if we have been advised of the possibility of such damages.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-black text-center'>Prohibition of Web Scraping</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>You are strictly prohibited from using any automated tools, including but not limited to web crawlers, scrapers, or bots, to access, scrape, copy, or monitor any portion of our marketplace, its content, or any products available on the site. Unauthorized use of any automated tools on our website may result in legal action, including but not limited to the termination of your access to our services, as well as claims for damages and other remedies under applicable law.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-black text-center'>Privacy Policy</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>Your privacy is important to us. Please review our Privacy Policy, which outlines our practices regarding the collection, use, storage, and protection of your personal information. By using our marketplace, you agree to the terms of our Privacy Policy and consent to the practices described therein.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-black text-center'>User Content and Conduct</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>Users of our marketplace may have the ability to create, upload, or share content, such as reviews, comments, or other materials. By submitting content to our marketplace, you warrant that you have the necessary rights to do so and that your content does not infringe upon any third-party rights. You are solely responsible for the content you submit and the consequences of sharing it. You agree not to engage in any activities on our marketplace that are harmful, harassing, offensive, or otherwise violate the rights of others. We reserve the right to remove any content or suspend or terminate the accounts of users who violate these guidelines, at our sole discretion and without prior notice.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-black text-center'>Disclaimer of Warranties</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>Our marketplace, its content, and the products available for purchase are provided "as is" and without any warranties, either express or implied. We disclaim all warranties, including but not limited to, implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the products will meet your requirements or that their quality, accuracy, or performance will be error-free or uninterrupted.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-black text-center'>Indemnification</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>You agree to indemnify, defend, and hold harmless our marketplace, its owners, affiliates, officers, directors, employees, and agents from and against any and all claims, liabilities, damages, losses, or expenses, including reasonable attorneys' fees and costs, arising out of or in any way connected to your access to or use of our marketplace, your violation of these Terms of Service, or your infringement of any third-party rights.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-black text-center'>Modification of Terms</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>We reserve the right to modify these Terms of Service at any time without prior notice. It is your responsibility to review these Terms periodically to ensure that you are aware of any changes. Your continued use of our marketplace constitutes your acceptance of the modified Terms of Service.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-black text-center'>Governing Law</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-gray-600 text-base'>These Terms of Service shall be governed by and construed in accordance with the laws of the country or state in which your business is registered. Any disputes arising from these Terms shall be resolved through amicable negotiations or, if necessary, by submitting the dispute to the competent courts of the governing jurisdiction.</p>
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
                            <h2 className='2xl:text-[3rem] text-[1.5rem] font-black text-white text-center'>Terms of Service</h2>
                            <motion.div {...headContentAnimation} className='flex flex-col gap-5 mt-4'>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-white text-center'>Refund Policy</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>Our goal is to ensure customer satisfaction with the prompts purchased from our marketplace. Refunds will be granted solely in cases where the prompt does not work as described. To be eligible for a refund, you must submit a request within 24 hours of your purchase, providing a clear explanation and evidence demonstrating that the product is not in concordance with what was described. Upon reviewing your request, we will determine, at our sole discretion, whether your claim is valid and, if so, issue a refund. Refunds will be processed within 5-10 business days after receiving your request.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-white text-center'>Intellectual Property</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>All products available on our marketplace are the intellectual property of their respective creators. You acknowledge that you do not acquire any ownership rights to the products by purchasing or using them. You are responsible for ensuring that your use of the products does not infringe upon any third-party copyrights, trademarks, or other intellectual property rights.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-white text-center'>Usage Policy</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>
                                    When you purchase a product from our marketplace, you are granted a non-exclusive, worldwide, and perpetual license to use the prompt for any purpose, with the following exceptions:
                                </p>
                                <ul className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>
                                    <li>You may not use the product for any harmful, illegal, or malicious activities.</li>
                                    <li>You may not directly resell, redistribute, or transfer the product without the written consent of the product's creator.</li>
                                </ul>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>We reserve the right to terminate your license to use a product if you violate these usage restrictions.</p>
                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-white text-center'>Right to Issue Refunds</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>We reserve the right to issue refunds on any payments made through our marketplace at our sole discretion. This may occur in instances where a customer requests a refund in accordance with our Refund Policy, when we detect potentially fraudulent transactions, or in any other situations where we deem it necessary to issue a refund in order to protect our interests and maintain the integrity of our marketplace. By using our services, you acknowledge and agree to our right to issue refunds as described in this clause.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-white text-center'>Liability</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>Our marketplace is provided "as is" and without any warranties, express or implied. In no event shall we be liable for any direct, indirect, incidental, or consequential damages arising from your use of our marketplace or any products purchased through our marketplace. This includes, but is not limited to, any loss of data, profits, or business interruption, even if we have been advised of the possibility of such damages.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-white text-center'>Prohibition of Web Scraping</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>You are strictly prohibited from using any automated tools, including but not limited to web crawlers, scrapers, or bots, to access, scrape, copy, or monitor any portion of our marketplace, its content, or any products available on the site. Unauthorized use of any automated tools on our website may result in legal action, including but not limited to the termination of your access to our services, as well as claims for damages and other remedies under applicable law.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-white text-center'>Privacy Policy</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>Your privacy is important to us. Please review our Privacy Policy, which outlines our practices regarding the collection, use, storage, and protection of your personal information. By using our marketplace, you agree to the terms of our Privacy Policy and consent to the practices described therein.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-white text-center'>User Content and Conduct</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>Users of our marketplace may have the ability to create, upload, or share content, such as reviews, comments, or other materials. By submitting content to our marketplace, you warrant that you have the necessary rights to do so and that your content does not infringe upon any third-party rights. You are solely responsible for the content you submit and the consequences of sharing it. You agree not to engage in any activities on our marketplace that are harmful, harassing, offensive, or otherwise violate the rights of others. We reserve the right to remove any content or suspend or terminate the accounts of users who violate these guidelines, at our sole discretion and without prior notice.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-white text-center'>Disclaimer of Warranties</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>Our marketplace, its content, and the products available for purchase are provided "as is" and without any warranties, either express or implied. We disclaim all warranties, including but not limited to, implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the products will meet your requirements or that their quality, accuracy, or performance will be error-free or uninterrupted.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-white text-center'>Indemnification</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>You agree to indemnify, defend, and hold harmless our marketplace, its owners, affiliates, officers, directors, employees, and agents from and against any and all claims, liabilities, damages, losses, or expenses, including reasonable attorneys' fees and costs, arising out of or in any way connected to your access to or use of our marketplace, your violation of these Terms of Service, or your infringement of any third-party rights.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-white text-center'>Modification of Terms</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>We reserve the right to modify these Terms of Service at any time without prior notice. It is your responsibility to review these Terms periodically to ensure that you are aware of any changes. Your continued use of our marketplace constitutes your acceptance of the modified Terms of Service.</p>

                                <h2 className='2xl:text-[1.75rem] text-[1.1rem] font-black text-white text-center'>Governing Law</h2>
                                <p className='md:max-w-[80%] max-w-[90%] text-center m-auto font-normal text-white text-base'>These Terms of Service shall be governed by and construed in accordance with the laws of the country or state in which your business is registered. Any disputes arising from these Terms shall be resolved through amicable negotiations or, if necessary, by submitting the dispute to the competent courts of the governing jurisdiction.</p>
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