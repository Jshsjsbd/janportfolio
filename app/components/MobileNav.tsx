import { Link } from "react-router";
import "../app.css";
import React, { useState, createContext, useContext, useEffect, useRef } from "react";

type NavigationContextType = {
    isVisible: boolean;
    toggleVisibility: () => void;
    closeMenu: () => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
    const [isVisible, setIsVisible] = useState(false);
    
    return (
        <NavigationContext.Provider 
            value={{
                isVisible,
                toggleVisibility: () => setIsVisible(!isVisible),
                closeMenu: () => setIsVisible(false)
            }}
        >
            {children}
        </NavigationContext.Provider>
    );
}

function useNavigation() {
    const context = useContext(NavigationContext);
    if (context === undefined) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
}

type navParams = {
    navType: string;
};

const MobileNav = React.forwardRef<HTMLDivElement, navParams>((props, ref) => {
    const { isVisible } = useNavigation();
    
    const menuStyles = `
        flex flex-col justify-center items-center 
        mt-10 relative right-5 p-7 rounded-xl 
        backdrop-blur-3xl custom-styles1 
        transform transition-all duration-500 ease-in-out
        ${isVisible ? 'translate-y-0 opacity-100 visible z-1000' : '-translate-y-5 opacity-0 invisible pointer-events-none z-0'}
    `;

    if (props.navType === 'home') {
        return(
            <div ref={ref} className={menuStyles}>
                <div>
                    <ul className="flex flex-col gap-5">
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
            </div>
        )
    } else if (props.navType === 'about') {
        return(
            <div ref={ref} className={menuStyles}>
                <div>
                    <ul className="flex flex-col gap-5">
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
            </div>
        )
    } else if (props.navType === 'projects') {
        return(
            <div ref={ref} className={menuStyles}>
                <div>
                    <ul className="flex flex-col gap-5">
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
            </div>
        )
    } else if (props.navType === 'contact') {
        return(
            <div ref={ref} className={menuStyles}>
                <div>
                    <ul className="flex flex-col gap-5">
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
            </div>
        )
    }
    return null;
});

function NavigationWrapper({ children }: { children: React.ReactNode }) {
    const { isVisible, closeMenu } = useNavigation();
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isVisible && 
                menuRef.current && 
                buttonRef.current && 
                !menuRef.current.contains(event.target as Node) && 
                !buttonRef.current.contains(event.target as Node)) {
                closeMenu();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isVisible, closeMenu]);

    return (
        <div>
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    if (child.type === MobileNav) {
                        // Ensure the child is typed correctly for cloneElement
                        return React.cloneElement(child as React.ReactElement<navParams & React.RefAttributes<HTMLDivElement>>, { ref: menuRef });
                    }
                    if (child.type === 'button') {
                        return React.cloneElement(child as React.ReactElement<any>, { ref: buttonRef });
                    }
                }
                return child;
            })}
        </div>
    );
}

function HamburgerBtn(props: navParams) {
    const { toggleVisibility, isVisible } = useNavigation();

    return(
        <NavigationWrapper>
            <button 
                className="flex flex-col gap-1 absolute right-5 rounded-full z-1000" 
                onClick={toggleVisibility}
            >
                <div className={`border w-7 h-1 bg-white transition-all duration-300 ${
                    isVisible
                    ? 'rotate-45 translate-y-2'
                    : ''
                }`}></div>
                <div className={`border w-7 h-1 bg-white transition-all duration-300 ${
                    isVisible 
                    ? 'opacity-0'
                    : 'opacity-100'
                }`}></div>
                <div className={`border w-7 h-1 bg-white transition-all duration-300 ${
                    isVisible 
                    ? '-rotate-45 -translate-y-2'
                    : ''
                }`}></div>
            </button>
            <MobileNav navType={props.navType} />
        </NavigationWrapper>
    );
}

MobileNav.displayName = 'MobileNav';

export default HamburgerBtn;