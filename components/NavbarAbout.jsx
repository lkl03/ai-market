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

const Navbar = () => {
    const snap = useSnapshot(state)
    return (
        <AnimatePresence>
        {snap.themeLight && (
        <div className='sm:px-60 px-12 flex justify-between items-center bg-[#F6FAF0]'>
            <nav className='w-full flex py-6 justify-between items-center bg-transparent'>
                <h3 className='cursor-pointer' onClick={() => state.intro = true}>AI Market</h3>
                <motion.div {...slideAnimation('right')} className='flex flex-row flex-wrap gap-2'>
                    <CustomLink type='filled' title='Go to the Market' path={"/marketplace"} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold text-sm' />
                </motion.div>
            </nav>
        </div>
        )}
        {snap.themeDark && (
        <div className='sm:px-60 px-12 flex justify-between items-center bg-gray-900'>
            <nav className='w-full flex py-6 justify-between items-center bg-transparent'>
                <h3 className='cursor-pointer' onClick={() => state.intro = true}>AI Market</h3>
                <motion.div {...slideAnimation('right')} className='flex flex-row flex-wrap gap-2'>
                    <CustomLink type='filled' title='Go to the Market' path={"/marketplace"} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold text-sm' />
                </motion.div>
            </nav>
        </div>
        )}
        </AnimatePresence>
    )
}

export default Navbar