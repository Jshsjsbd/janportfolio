import { Link } from "react-router";
import "../app.css";


type navParams = {
    navType: string;
}

function MobileNav(props: navParams) {
    if (props.navType === 'home') {
        return(
            <div className="flex flex-col justify-center items-center mt-10 relative right-5 p-7 rounded-xl backdrop-blur-3xl custom-styles1">
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
            <div className="flex flex-col justify-center items-center mt-10 relative right-5 p-7 rounded-xl backdrop-blur-3xl custom-styles1">
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
            <div className="flex flex-col justify-center items-center mt-10 relative right-5 p-7 rounded-xl backdrop-blur-3xl custom-styles1">
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
            <div className="flex flex-col justify-center items-center mt-10 relative right-5 p-7 rounded-xl backdrop-blur-3xl custom-styles1">
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
}

export default MobileNav;