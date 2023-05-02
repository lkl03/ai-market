import { motion, AnimatePresence } from 'framer-motion'
import { useSnapshot } from 'valtio'
import { useUser } from '../context/userContext';
import { logout } from '../config/auth';

import { CustomButton, CustomLink } from '../components'
import {
    headContainerAnimation,
    headContentAnimation,
    headTextAnimation,
    slideAnimation
} from '../config/motion'

import state from '../store'

const NavbarLog = () => {
    const snap = useSnapshot(state)
    const { user, loading } = useUser();

    if (loading) {
        return <div>Loading...</div>;
    }

    
    return (
        <div className='sm:px-60 px-12 flex justify-between items-center bg-[#F6FAF0]'>
            <nav className='w-full flex py-6 justify-between items-center bg-transparent'>
                <h3>AI Market</h3>
                <ul className='list-none sm:flex hidden justify-center items-center flex-1'>
                    <li className='text-black hover:text-orange transition-all duration-300 ease-in-out font-normal cursor-pointer text-lg mr-10'>
                        dfkmfd
                    </li>
                    <li className='text-black hover:text-orange transition-all duration-300 ease-in-out font-normal cursor-pointer text-lg mr-10'>
                        dfkmfd
                    </li>
                    <li className='text-black hover:text-orange transition-all duration-300 ease-in-out font-normal cursor-pointer text-lg mr-10'>
                        dfkmfd
                    </li>
                    <li className='text-black hover:text-orange transition-all duration-300 ease-in-out font-normal cursor-pointer text-lg mr-10'>
                        dfkmfd
                    </li>
                </ul>
                {user ? (
                    <>
                        <p onClick={() => logout()}>Logout</p>
                        <img src={user.photoURL} alt={user.displayName} />
                    </>
                ) : ''}
                <motion.div {...slideAnimation('right')} className='flex flex-row flex-wrap gap-2'>
                    <CustomLink type='filled' title='Go to the Market' path={"/marketplace"} customStyles='md:max-w-[170px] w-fit px-4 py-2.5 font-bold text-sm' />
                </motion.div>
            </nav>
        </div>
    )
}

export default NavbarLog