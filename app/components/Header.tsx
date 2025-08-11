import { Link } from "react-router";
import React, { useEffect, useRef, useState } from "react";
import HamburgerBtn from "./MobileNav"


type HeaderParams = {
    type: string;
}

function Header(props: HeaderParams) {
    const [hidden, setHidden] = useState(true);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleClick = () => {
        setHidden(!hidden)
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setHidden(true);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (props.type === 'home') {
        return(
            <div className="flex justify-center items-center">
                <div className="absolute top-2 shadow-xl/15 rounded-full backdrop-blur-3xl flex justify-between items-center h-20 w-8/9 items-center z-1000">
                    <div className="flex items-center text-gray-100">
                        <div className="flex items-center h-10 mr-2 absolute left-8 text-center text-xl font-bold">
                            <Link to='/'>Jan Peter</Link>
                        </div>
                        <div className="absolute right-6 font-bold hidden md:block">
                            <ul className="flex gap-5">
                                <li className="relative inline-block cursor-pointer group">
                                    <span className="w-full absolute left-0 bottom-0 h-[3px] bg-sky-500 w-0 transition-all duration-300"></span>
                                    <Link to='/'>Home</Link>
                                </li>
                                <li className="relative inline-block cursor-pointer group">
                                    <span className="group-hover:w-full absolute left-0 bottom-0 h-[3px] bg-sky-500 w-0 transition-all duration-300"></span>
                                    <Link to='/about'>About</Link>
                                </li>
                                <li className="relative inline-block cursor-pointer group">
                                    <span className="group-hover:w-full absolute left-0 bottom-0 h-[3px] bg-sky-500 w-0 transition-all duration-300"></span>
                                    <Link to='/projects'>Projects</Link>
                                </li>
                                <li className="relative inline-block cursor-pointer group">
                                    <span className="group-hover:w-full absolute left-0 bottom-0 h-[3px] bg-sky-500 w-0 transition-all duration-300"></span>
                                    <Link to='/contact'>Contact</Link>
                                </li>
                            </ul>
                        </div>
                        <div className="absolute top-8 right-2 flex flex-col font-bold block md:hidden" ref={menuRef}>
                            <HamburgerBtn navType="home" />
                        </div>
                    </div>
                </div>
            </div>
        )
    } else if (props.type === 'about') {
        return (
            <div className="flex justify-center items-center">
                <div className="absolute top-2 shadow-xl/15 rounded-full backdrop-blur-3xl flex justify-between items-center h-20 w-8/9 z-1000">
                    <div className="flex items-center text-gray-100">
                        <div className="flex items-center h-10 mr-2 absolute left-8 text-center text-xl font-bold">
                            <Link to='/'>Jan Peter</Link>
                        </div>
                        <div className="absolute right-6 font-bold hidden md:block">
                            <ul className="flex gap-5">
                                <li className="relative inline-block cursor-pointer group">
                                    <span className="group-hover:w-full absolute left-0 bottom-0 h-[3px] bg-sky-500 w-0 transition-all duration-300"></span>
                                    <Link to='/'>Home</Link>
                                </li>
                                <li className="relative inline-block cursor-pointer group">
                                    <span className="w-full absolute left-0 bottom-0 h-[3px] bg-sky-500 w-0 transition-all duration-300"></span>
                                    <Link to='/about'>About</Link>
                                </li>
                                <li className="relative inline-block cursor-pointer group">
                                    <span className="group-hover:w-full absolute left-0 bottom-0 h-[3px] bg-sky-500 w-0 transition-all duration-300"></span>
                                    <Link to='/projects'>Projects</Link>
                                </li>
                                <li className="relative inline-block cursor-pointer group">
                                    <span className="group-hover:w-full absolute left-0 bottom-0 h-[3px] bg-sky-500 w-0 transition-all duration-300"></span>
                                    <Link to='/contact'>Contact</Link>
                                </li>
                            </ul>
                        </div>
                        <div className="absolute top-8 right-2 flex flex-col font-bold block md:hidden" ref={menuRef}>
                            <HamburgerBtn navType="about" />
                        </div>
                    </div>
                </div>
            </div>
        )
    } else if (props.type === 'projects') {
        return (
            <div className="flex justify-center items-center">
                <div className="absolute top-2 shadow-xl/15 rounded-full backdrop-blur-3xl flex justify-between items-center h-20 w-8/9 z-1000">
                    <div className="flex items-center text-gray-100">
                        <div className="flex items-center h-10 mr-2 absolute left-8 text-center text-xl font-bold">
                            <Link to='/'>Jan Peter</Link>
                        </div>
                        <div className="absolute right-6 font-bold hidden md:block">
                            <ul className="flex gap-5">
                                <li className="relative inline-block cursor-pointer group">
                                    <span className="group-hover:w-full absolute left-0 bottom-0 h-[3px] bg-sky-500 w-0 transition-all duration-300"></span>
                                    <Link to='/'>Home</Link>
                                </li>
                                <li className="relative inline-block cursor-pointer group">
                                    <span className="group-hover:w-full absolute left-0 bottom-0 h-[3px] bg-sky-500 w-0 transition-all duration-300"></span>
                                    <Link to='/about'>About</Link>
                                </li>
                                <li className="relative inline-block cursor-pointer group">
                                    <span className="w-full absolute left-0 bottom-0 h-[3px] bg-sky-500 w-0 transition-all duration-300"></span>
                                    <Link to='/projects'>Projects</Link>
                                </li>
                                <li className="relative inline-block cursor-pointer group">
                                    <span className="group-hover:w-full absolute left-0 bottom-0 h-[3px] bg-sky-500 w-0 transition-all duration-300"></span>
                                    <Link to='/contact'>Contact</Link>
                                </li>
                            </ul>
                        </div>
                        <div className="absolute top-8 right-2 flex flex-col font-bold block md:hidden" ref={menuRef}>
                            <HamburgerBtn navType="projects" />
                        </div>
                    </div>
                </div>
            </div>
        )
    } else if (props.type === 'contact') {
        return (
            <div className="flex justify-center items-center">
                <div className="absolute top-2 shadow-xl/15 rounded-full backdrop-blur-3xl flex justify-between items-center h-20 w-8/9 z-1000">
                    <div className="flex items-center text-gray-100">
                        <div className="flex items-center h-10 mr-2 absolute left-8 text-center text-xl font-bold">
                            <Link to='/'>Jan Peter</Link>
                        </div>
                        <div className="absolute right-6 font-bold hidden md:block">
                            <ul className="flex gap-5">
                                <li className="relative inline-block cursor-pointer group">
                                    <span className="group-hover:w-full absolute left-0 bottom-0 h-[3px] bg-sky-500 w-0 transition-all duration-300"></span>
                                    <Link to='/'>Home</Link>
                                </li>
                                <li className="relative inline-block cursor-pointer group">
                                    <span className="group-hover:w-full absolute left-0 bottom-0 h-[3px] bg-sky-500 w-0 transition-all duration-300"></span>
                                    <Link to='/about'>About</Link>
                                </li>
                                <li className="relative inline-block cursor-pointer group">
                                    <span className="group-hover:w-full absolute left-0 bottom-0 h-[3px] bg-sky-500 w-0 transition-all duration-300"></span>
                                    <Link to='/projects'>Projects</Link>
                                </li>
                                <li className="relative inline-block cursor-pointer group">
                                    <span className="w-full absolute left-0 bottom-0 h-[3px] bg-sky-500 w-0 transition-all duration-300"></span>
                                    <Link to='/contact'>Contact</Link>
                                </li>
                            </ul>
                        </div>
                        <div className="absolute top-8 right-2 flex flex-col font-bold block md:hidden" ref={menuRef}>
                            <HamburgerBtn navType="contact" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Header;