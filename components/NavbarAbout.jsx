import { motion, AnimatePresence } from 'framer-motion'
import { useSnapshot } from 'valtio'

import { CustomButton, CustomLink } from '.'
import {
    headContainerAnimation,
    headContentAnimation,
    headTextAnimation,
    slideAnimation
} from '../config/motion'

import state from '../store'

import { logowhite, logoblack } from '../assets'

const Navbar = () => {
    const snap = useSnapshot(state)
    return (
        <AnimatePresence>
        {snap.themeLight && (
        <div className='sm:px-60 px-4 flex justify-between items-center bg-[#F6FAF0]'>
            <nav className='w-full flex md:flex-row flex-col py-6 justify-between md:items-center bg-transparent md:gap-y-0 gap-y-4'>
                <img className='cursor-pointer w-40 h-auto md:m-[inherit] m-auto' onClick={() => state.intro = true} src={logoblack.src} alt='AITropy' />
                <motion.div {...slideAnimation('right')} className='flex flex-row flex-wrap gap-2'>
                    <CustomLink type='outline' title='Start Selling' path={"/sell"} customStyles='md:min-w-[180px] w-full px-4 py-2.5 font-bold text-sm' />
                    <CustomLink type='filled' title='Go to the Market' path={"/marketplace"} customStyles='md:min-w-[180px] w-full px-4 py-2.5 font-bold text-sm' />
                </motion.div>
            </nav>
        </div>
        )}
        {snap.themeDark && (
        <div className='sm:px-60 px-4 flex justify-between items-center bg-gray-900'>
            <nav className='w-full flex md:flex-row flex-col py-6 justify-between md:items-center bg-transparent md:gap-y-0 gap-y-4'>
                <img className='cursor-pointer w-40 h-auto md:m-[inherit] m-auto' onClick={() => state.intro = true} src={logowhite.src} alt='AITropy' />
                <motion.div {...slideAnimation('right')} className='flex flex-row flex-wrap gap-2'>
                    <CustomLink type='outline' title='Start Selling' path={"/sell"} customStyles='md:min-w-[180px] w-full px-4 py-2.5 font-bold text-sm' />
                    <CustomLink type='filled' title='Go to the Market' path={"/marketplace"} customStyles='md:min-w-[180px] w-full px-4 py-2.5 font-bold text-sm' />
                </motion.div>
            </nav>
        </div>
        )}
        </AnimatePresence>
    )
}

export default Navbar