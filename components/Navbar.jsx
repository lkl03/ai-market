import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion'
import { useSnapshot } from 'valtio'
import { useUser } from '../context/userContext';
import { logout, signInWithGoogle } from '../config/auth';
import {GoogleButton} from '.';

import { CustomButton, CustomLink } from '.'
import {
    headContainerAnimation,
    headContentAnimation,
    headTextAnimation,
    slideAnimation
} from '../config/motion'

import { FaChevronDown, FaChevronUp, FaBars, FaTimes } from 'react-icons/fa';

import state from '../store'

import { logowhite, logoblack } from '../assets'

const NavbarLog = () => {
    const snap = useSnapshot(state)
    const { user, loading, userIDRef } = useUser();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isMobileOpen, setMobileOpen] = useState(false);

    if (loading) {
        return <div>Loading...</div>;
    }

    
    return (
        <AnimatePresence>
            {snap.themeLight && (
                <div className='sm:px-60 px-4 flex justify-between items-center bg-[#f6faf0] border-b border-[#04E762]'>
                    <nav className='w-full md:flex md:flex-row hidden py-6 justify-between md:items-center bg-transparent md:gap-y-0 gap-y-4'>
                        <Link href='/'>
                        <img className='cursor-pointer w-40 h-auto md:m-[inherit] m-auto' src={logoblack.src} alt='AITropy' />
                        </Link>
                        <ul className='list-none sm:flex hidden justify-center items-center flex-1'>
                            <Link href='/marketplace'>
                            <li className='text-black hover:text-[#04E762] transition-all duration-300 ease-in-out font-normal cursor-pointer text-lg mr-10'>
                                Marketplace
                            </li>
                            </Link>
                            <Link href='/sell'>
                            <li className='text-black hover:text-[#04E762] transition-all duration-300 ease-in-out font-normal cursor-pointer text-lg mr-10'>
                                Start Selling
                            </li>
                            </Link>
                        </ul>
                        {user ? (
                            <>
                                <div className='flex flex-wrap gap-2 items-center justify-center'>
                                    <img src={user.photoURL} className='rounded-full w-12 h-12' alt='user-profile-pic' />
                                    <div onClick={() => setDropdownOpen(!isDropdownOpen)} className='cursor-pointer'>
                                    {isDropdownOpen ?
                                        <FaChevronUp size={20} className='text-black hover:text-[#04E762] transition-all duration-300 ease-in-out' /> :
                                        <FaChevronDown size={20} className='text-black hover:text-[#04E762] transition-all duration-300 ease-in-out' />
                                    }
                                    </div>
                                    {isDropdownOpen && 
                                        <ul className='bg-[#f6faf0] shadow-lg py-2 absolute top-20'>
                                            <Link href={`../profile/${userIDRef.current}`}>
                                            <li className='px-3 py-2 text-black hover:text-[#04E762] cursor-pointer transition-all duration-300 ease-in-out'>My Profile</li>
                                            </Link>
                                            <Link href={`../dashboard/${userIDRef.current}`}>
                                            <li className='px-3 py-2 text-black hover:text-[#04E762] cursor-pointer transition-all duration-300 ease-in-out'>My Dashboard</li>
                                            </Link>
                                            <li onClick={() => logout()} className='px-3 py-2 text-red-500 hover:text-red-600 cursor-pointer transition-all duration-300 ease-in-out'>Logout</li>
                                        </ul>
                                    }
                                </div>
                            </>
                        ) : 
                            <>
                            <motion.div {...slideAnimation('right')} className='flex flex-row flex-wrap gap-2'>
                                <GoogleButton handleClick={() => signInWithGoogle()} text="Login / Sign Up" />
                            </motion.div>
                            </>
                        }
                    </nav>
                    <nav className='w-full md:hidden flex-row flex py-6 justify-between md:items-center bg-transparent md:gap-y-0 gap-y-4 z-10'>
                        <Link href='/'>
                            <img className='cursor-pointer w-32 h-auto md:m-[inherit] m-auto' src={logoblack.src} alt='AITropy' />
                        </Link>
                        <div onClick={() => setMobileOpen(!isMobileOpen)} className='cursor-pointer'>
                            {isMobileOpen ?
                                <FaTimes size={32} className='text-black hover:text-[#04E762] transition-all duration-300 ease-in-out' /> :
                                <FaBars size={32} className='text-black hover:text-[#04E762] transition-all duration-300 ease-in-out' />
                            }
                        </div>
                        {isMobileOpen && 
                            <ul className='bg-[#F6FAF0] shadow-lg pt-2 pb-8 px-4 absolute top-20 right-0 border-b border-l border-[#04E762]'>
                                <Link href='/marketplace'>
                                    <li className='px-3 py-3 text-black hover:text-[#04E762] transition-all duration-300 ease-in-out font-normal cursor-pointer'>
                                        Marketplace
                                    </li>
                                </Link>
                                <Link href='/sell'>
                                    <li className='px-3 py-3 text-black hover:text-[#04E762] transition-all duration-300 ease-in-out font-normal cursor-pointer'>
                                        Start Selling
                                    </li>
                                </Link>
                                {user ?
                                    <>
                                        <Link href={`../profile/${userIDRef.current}`}>
                                            <li className='px-3 py-3 text-black hover:text-[#04E762] cursor-pointer transition-all duration-300 ease-in-out'>My Profile</li>
                                        </Link>
                                        <Link href={`../dashboard/${userIDRef.current}`}>
                                            <li className='px-3 py-3 text-black hover:text-[#04E762] cursor-pointer transition-all duration-300 ease-in-out'>My Dashboard</li>
                                        </Link>
                                        <li onClick={() => logout()} className='px-3 py-3 text-red-500 hover:text-red-600 cursor-pointer transition-all duration-300 ease-in-out'>Logout</li>
                                    </>
                                    :
                                    <div className='flex flex-row flex-wrap gap-2'>
                                        <GoogleButton handleClick={() => signInWithGoogle()} text="Login / Sign Up" />
                                    </div>
                                }
                            </ul>
                        }
                    </nav>
                </div>
            )}
            {snap.themeDark && (
                <div className='sm:px-60 px-4 flex justify-between items-center bg-gray-900 border-b border-[#04E762]'>
                    <nav className='w-full md:flex md:flex-row hidden py-6 justify-between md:items-center bg-transparent md:gap-y-0 gap-y-4'>
                        <Link href='/'>
                        <img className='cursor-pointer w-40 h-auto md:m-[inherit] m-auto' src={logowhite.src} alt='AITropy' />
                        </Link>
                        <ul className='list-none sm:flex hidden justify-center items-center flex-1'>
                            <Link href='/marketplace'>
                            <li className='text-white hover:text-[#04E762] transition-all duration-300 ease-in-out font-normal cursor-pointer text-lg mr-10'>
                                Marketplace
                            </li>
                            </Link>
                            <Link href='/sell'>
                            <li className='text-white hover:text-[#04E762] transition-all duration-300 ease-in-out font-normal cursor-pointer text-lg mr-10'>
                                Start Selling
                            </li>
                            </Link>
                        </ul>
                        {user ? (
                            <>
                                <div className='flex flex-wrap gap-2 items-center justify-center'>
                                    <img src={user.photoURL} className='rounded-full w-12 h-12' alt='user-profile-pic' />
                                    <div onClick={() => setDropdownOpen(!isDropdownOpen)} className='cursor-pointer'>
                                    {isDropdownOpen ?
                                        <FaChevronUp size={20} className='text-white hover:text-[#04E762] transition-all duration-300 ease-in-out' /> :
                                        <FaChevronDown size={20} className='text-white hover:text-[#04E762] transition-all duration-300 ease-in-out' />
                                    }
                                    </div>
                                    {isDropdownOpen && 
                                        <ul className='bg-gray-900 shadow-lg py-2 absolute top-20'>
                                            <Link href={`../profile/${userIDRef.current}`}>
                                            <li className='px-3 py-2 text-white hover:text-[#04E762] cursor-pointer transition-all duration-300 ease-in-out'>My Profile</li>
                                            </Link>
                                            <Link href={`../dashboard/${userIDRef.current}`}>
                                            <li className='px-3 py-2 text-white hover:text-[#04E762] cursor-pointer transition-all duration-300 ease-in-out'>My Dashboard</li>
                                            </Link>
                                            <li onClick={() => logout()} className='px-3 py-2 text-red-500 hover:text-red-600 cursor-pointer transition-all duration-300 ease-in-out'>Logout</li>
                                        </ul>
                                    }
                                </div>
                            </>
                        ) : 
                            <>
                            <motion.div {...slideAnimation('right')} className='flex flex-row flex-wrap gap-2'>
                                <GoogleButton handleClick={() => signInWithGoogle()} text="Login / Sign Up" />
                            </motion.div>
                            </>
                        }
                    </nav>
                    <nav className='w-full md:hidden flex-row flex py-6 justify-between md:items-center bg-transparent md:gap-y-0 gap-y-4 z-10'>
                        <Link href='/'>
                            <img className='cursor-pointer w-32 h-auto md:m-[inherit] m-auto' src={logowhite.src} alt='AITropy' />
                        </Link>
                        <div onClick={() => setMobileOpen(!isMobileOpen)} className='cursor-pointer'>
                            {isMobileOpen ?
                                <FaTimes size={32} className='text-white hover:text-[#04E762] transition-all duration-300 ease-in-out' /> :
                                <FaBars size={32} className='text-white hover:text-[#04E762] transition-all duration-300 ease-in-out' />
                            }
                        </div>
                        {isMobileOpen && 
                            <ul className='bg-gray-900 shadow-lg pt-2 pb-8 px-4 absolute top-20 right-0 border-b border-l border-[#04E762]'>
                                <Link href='/marketplace'>
                                    <li className='px-3 py-3 text-white hover:text-[#04E762] transition-all duration-300 ease-in-out font-normal cursor-pointer'>
                                        Marketplace
                                    </li>
                                </Link>
                                <Link href='/sell'>
                                    <li className='px-3 py-3 text-white hover:text-[#04E762] transition-all duration-300 ease-in-out font-normal cursor-pointer'>
                                        Start Selling
                                    </li>
                                </Link>
                                {user ?
                                    <>
                                        <Link href={`../profile/${userIDRef.current}`}>
                                            <li className='px-3 py-3 text-white hover:text-[#04E762] cursor-pointer transition-all duration-300 ease-in-out'>My Profile</li>
                                        </Link>
                                        <Link href={`../dashboard/${userIDRef.current}`}>
                                            <li className='px-3 py-3 text-white hover:text-[#04E762] cursor-pointer transition-all duration-300 ease-in-out'>My Dashboard</li>
                                        </Link>
                                        <li onClick={() => logout()} className='px-3 py-3 text-red-500 hover:text-red-600 cursor-pointer transition-all duration-300 ease-in-out'>Logout</li>
                                    </>
                                    :
                                    <div className='flex flex-row flex-wrap gap-2'>
                                        <GoogleButton handleClick={() => signInWithGoogle()} text="Login / Sign Up" />
                                    </div>
                                }
                            </ul>
                        }
                    </nav>
                </div>
            )}
        </AnimatePresence>
    )
}

export default NavbarLog