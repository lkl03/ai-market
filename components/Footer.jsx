import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion'
import { useSnapshot } from 'valtio'

import { FaInstagram, FaTwitter } from 'react-icons/fa';

import { CustomButton } from '.'
import {
    headContainerAnimation,
    headContentAnimation,
    headTextAnimation,
    slideAnimation
} from '../config/motion'

import state from '../store'

import { logowhite, logoblack } from '../assets'

const Footer = () => {
    const snap = useSnapshot(state)
    return (
        <AnimatePresence>
            {snap.themeLight && (
                <footer className="bg-[#F6FAF0] py-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
                        <div className="flex items-center">
                            <Link href='/'>
                            <img className='cursor-pointer w-40 h-auto md:m-[inherit] m-auto' src={logoblack.src} alt='AITropy' />
                            </Link>
                        </div>
                        <div>
                        <div className="flex items-center mt-4 sm:mt-0">
                            <Link href='/faq'><p className="text-black hover:text-[#04E762] transition-all duration-300 ease-in-out px-3 py-2 rounded-md text-sm font-medium">FAQ</p></Link>
                            {/*<Link href='/'><p className="text-black hover:text-[#04E762] transition-all duration-300 ease-in-out px-3 py-2 rounded-md text-sm font-medium">Link 1</p></Link>*/}
                            <Link href='/privacy-policy'><p className="text-black hover:text-[#04E762] transition-all duration-300 ease-in-out px-3 py-2 rounded-md text-sm font-medium">Privacy Policy</p></Link>
                            <Link href='/terms'><p className="text-black hover:text-[#04E762] transition-all duration-300 ease-in-out px-3 py-2 rounded-md text-sm font-medium">Terms & Conditions</p></Link>
                        </div>
                        <div className="flex items-center justify-center mt-4 sm:mt-0">
                            <p className="text-black italic px-3 py-2 rounded-md text-sm font-medium">© AITropy 2023 - V1.0</p>
                        </div>
                        </div>
                        <div className="flex mt-4 sm:mt-0">
                            <Link href="https://twitter.com/AITropy" target='_blank' className="text-black hover:text-[#04E762] transition-all duration-300 ease-in-out px-2"><FaTwitter size={20} /></Link>
                        </div>
                    </div>
                </footer>
            )}
            {snap.themeDark && (
                <footer className="bg-gray-900 py-10 border-t border-[#04E762]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
                        <div className="flex items-center">
                            <Link href='/'>
                            <img className='cursor-pointer w-40 h-auto md:m-[inherit] m-auto' src={logowhite.src} alt='AITropy' />
                            </Link>
                        </div>
                        <div>
                        <div className="flex items-center mt-4 sm:mt-0">
                            <Link href='/faq'><p className="text-white hover:text-[#04E762] transition-all duration-300 ease-in-out px-3 py-2 rounded-md text-sm font-medium">FAQ</p></Link>
                            {/*<Link href='/'><p className="text-black hover:text-[#04E762] transition-all duration-300 ease-in-out px-3 py-2 rounded-md text-sm font-medium">Link 1</p></Link>*/}
                            <Link href='/privacy-policy'><p className="text-white hover:text-[#04E762] transition-all duration-300 ease-in-out px-3 py-2 rounded-md text-sm font-medium">Privacy Policy</p></Link>
                            <Link href='/terms'><p className="text-white hover:text-[#04E762] transition-all duration-300 ease-in-out px-3 py-2 rounded-md text-sm font-medium">Terms & Conditions</p></Link>
                        </div>
                        <div className="flex items-center justify-center mt-4 sm:mt-0">
                            <p className="text-white italic px-3 py-2 rounded-md text-sm font-medium">© AITropy 2023 - V1.0</p>
                        </div>
                        </div>
                        <div className="flex mt-4 sm:mt-0">
                            <Link href="https://twitter.com/AITropy" target='_blank' className="text-white hover:text-[#04E762] transition-all duration-300 ease-in-out px-2"><FaTwitter size={20} /></Link>
                        </div>
                    </div>
                </footer>
            )}
        </AnimatePresence>
    );
};

export default Footer;