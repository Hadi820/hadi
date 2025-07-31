import React from 'react';
import { ViewType } from '../types';

interface HeaderProps {
    pageTitle: ViewType;
    toggleSidebar: () => void;
}

const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="12" x2="20" y2="12"></line>
        <line x1="4" y1="6" x2="20" y2="6"></line>
        <line x1="4" y1="18" x2="20" y2="18"></line>
    </svg>
);


const Header: React.FC<HeaderProps> = ({ pageTitle, toggleSidebar }) => {
    return (
        <header id="app-header" className="md:hidden flex items-center justify-between h-16 bg-white border-b border-slate-200 px-4 flex-shrink-0">
            <button
                onClick={toggleSidebar}
                className="text-slate-600 p-2 -ml-2 rounded-md hover:bg-slate-100 hover:text-slate-900"
                aria-label="Toggle sidebar"
            >
                <MenuIcon className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-semibold text-slate-800">
                {pageTitle}
            </h2>
            {/* Placeholder for potential actions like search or profile icon */}
            <div className="w-6"></div>
        </header>
    );
};

export default Header;
