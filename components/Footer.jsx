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

const Footer = () => {
    const snap = useSnapshot(state)
    return (
        <AnimatePresence>
            {snap.themeLight && (
                <footer className="bg-[#F6FAF0] py-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
                        <div className="flex items-center">
                            {/*<img src="/logo.svg" alt="Logo" className="h-8 w-8 mr-2" />*/}
                            <span className="text-black font-bold text-xl">AI Market</span>
                        </div>
                        <div className="flex items-center mt-4 sm:mt-0">
                            <a href="/" className="text-black hover:text-[#04E762] px-3 py-2 rounded-md text-sm font-medium">Link 1</a>
                            <a href="/" className="text-black hover:text-[#04E762] px-3 py-2 rounded-md text-sm font-medium">Link 2</a>
                            <a href="/" className="text-black hover:text-[#04E762] px-3 py-2 rounded-md text-sm font-medium">Link 3</a>
                            <a href="/" className="text-black hover:text-[#04E762] px-3 py-2 rounded-md text-sm font-medium">Link 4</a>
                        </div>
                        <div className="flex mt-4 sm:mt-0">
                            <a href="/" className="text-black hover:text-[#04E762] px-2"><FaInstagram size={20} /></a>
                            <a href="/" className="text-black hover:text-[#04E762] px-2"><FaTwitter size={20} /></a>
                        </div>
                    </div>
                </footer>
            )}
            {snap.themeDark && (
                <footer className="bg-gray-900 py-10 border-t border-[#F6FAF0]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
                        <div className="flex items-center">
                            {/*<img src="/logo.svg" alt="Logo" className="h-8 w-8 mr-2" />*/}
                            <span className="text-white font-bold text-xl">AI Market</span>
                        </div>
                        <div className="flex items-center mt-4 sm:mt-0">
                            <a href="/" className="text-white hover:text-[#04E762] px-3 py-2 rounded-md text-sm font-medium">Link 1</a>
                            <a href="/" className="text-white hover:text-[#04E762] px-3 py-2 rounded-md text-sm font-medium">Link 2</a>
                            <a href="/" className="text-white hover:text-[#04E762] px-3 py-2 rounded-md text-sm font-medium">Link 3</a>
                            <a href="/" className="text-white hover:text-[#04E762] px-3 py-2 rounded-md text-sm font-medium">Link 4</a>
                        </div>
                        <div className="flex mt-4 sm:mt-0">
                            <a href="/" className="text-white hover:text-[#04E762] px-2"><FaInstagram size={20} /></a>
                            <a href="/" className="text-white hover:text-[#04E762] px-2"><FaTwitter size={20} /></a>
                        </div>
                    </div>
                </footer>
            )}
        </AnimatePresence>
    );
};

export default Footer;