import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import logo from "../../assets/img/12.PNG";

function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [cartCount, setCartCount] = useState(3); // Dummy cart count

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);

    const closeAllMenus = () => {
        setIsMenuOpen(false);
        setIsProfileDropdownOpen(false);
    };

    const handleLogout = async () => {
        await logout();
        closeAllMenus();
    };

    const getNavlinkClass = ({ isActive }) =>
        `px-3 py-2 text-base font-medium transition-colors ${
            isActive
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-900 hover:text-red-600'
        }`;
    
    const getMobileNavlinkClass = ({ isActive }) =>
        `block px-3 py-2 text-base font-medium w-full text-left rounded-md ${
            isActive
                ? 'text-red-600 bg-red-50'
                : 'text-gray-900 hover:text-red-600 hover:bg-gray-100'
        }`;

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" onClick={closeAllMenus} className="text-xl font-bold text-gray-900">
                            <img src={logo} className="h-12 w-auto" alt="Logo" />
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <NavLink to="/" className={getNavlinkClass} onClick={closeAllMenus}>Home</NavLink>
                            <NavLink to="/shop" className={getNavlinkClass} onClick={closeAllMenus}>Shop</NavLink>
                            <NavLink to="/lookbook" className={getNavlinkClass} onClick={closeAllMenus}>Lookbook</NavLink>
                            <NavLink to="/about" className={getNavlinkClass} onClick={closeAllMenus}>About</NavLink>
                            <NavLink to="/contact" className={getNavlinkClass} onClick={closeAllMenus}>Contact</NavLink>
                            
                            {/* Kondisi: Tampilkan link Admin jika user adalah admin */}
                            {isAuthenticated && user?.role === 'admin' && (
                                <NavLink to="/admin/dashboard" className={getNavlinkClass} onClick={closeAllMenus}>Admin</NavLink>
                            )}
                        </div>
                    </div>

                    {/* Right side icons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <button className="text-gray-600 hover:text-red-600 p-2 rounded-md transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </button>

                        {/* Kondisi: Tampilkan menu user terautentikasi atau tombol login/register */}
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-6">
                                <div className="flex items-center bg-gradient-to-r from-red-50 to-orange-50 px-4 py-2 rounded-full border border-red-100">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                    <span className="text-sm text-gray-700">
                                        Welcome back, <span className="font-semibold text-red-600">{user?.name || 'User'}</span>
                                    </span>
                                </div>
                                
                              <Link 
  to="/checkout" 
  onClick={closeAllMenus} 
  className="relative flex items-center 
             bg-gradient-to-r from-black to-gray-800 
             text-white px-4 py-2 rounded-lg text-sm font-medium 
             hover:from-gray-900 hover:to-black 
             transition-all duration-200 shadow-md hover:shadow-lg 
             transform hover:scale-105"
                >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13l-1.1 5m0 0h4.4m0 0l1.1-5M7 13h10m-5 8a1 1 0 11-2 0 
                    1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
  Checkout
  {cartCount > 0 && (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-bounce">
      {cartCount}
    </span>
  )}
</Link>

                                
                                <div className="relative">
                                    <button onClick={toggleProfileDropdown} className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                        {/* AVATAR DISPLAY (DESKTOP) */}
                                        <div className="w-9 h-9">
                                            {user?.avatar ? (
                                                <img className="h-full w-full rounded-full object-cover" src={user.avatar} alt={user.name} />
                                            ) : (
                                               <div className="h-full w-full bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white font-semibold text-base">
                                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                    </div>

                                            )}
                                        </div>
                                    </button>
                                    {isProfileDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 animate-fade-in">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <div className="flex items-center space-x-3">
                                                    {/* AVATAR DISPLAY (DROPDOWN) */}
                                                    <div className="w-10 h-10">
                                                        {user?.avatar ? (
                                                            <img className="h-full w-full rounded-full object-cover" src={user.avatar} alt={user.name} />
                                                        ) : (
                                                            <div className="h-full w-full bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                                                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                                                        <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                                                        {user?.role && <span className="text-xs text-red-600 font-medium capitalize">{user.role}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="py-2">
                                                {isAuthenticated && user?.role === 'admin' && (
                                                    <Link to="/admin/dashboard" onClick={closeAllMenus} className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200">
                                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.827 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.827 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.827-2.37-2.37.996.608 2.296.07 2.573-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Admin
                                                    </Link>
                                                )}
                                                <Link to="/profile" onClick={closeAllMenus} className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200">
                                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> Profile Settings
                                                </Link>
                                                <Link to="/my-orders" onClick={closeAllMenus} className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200">
                                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> My Orders <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">2</span>
                                                </Link>
                                                <Link to="/wishlist" onClick={closeAllMenus} className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200">
                                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> Wishlist <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">5</span>
                                                </Link>
                                            </div>
                                            <div className="border-t border-gray-100 pt-2">
                                                <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200">
                                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg> Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Login/Register buttons for non-authenticated users (Desktop)
                            <div className="flex items-center space-x-2">
                                <Link to="/login" onClick={closeAllMenus} className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors">Login</Link>
                                <Link to="/register" onClick={closeAllMenus} className="border border-red-600 text-red-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-50 transition-colors">Register</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button (Hamburger) */}
                    <div className="md:hidden">
                        <button onClick={toggleMenu} className="text-gray-600 hover:text-red-600 p-2 rounded-md transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{isMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}</svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Content (Expands on click) */}
                {isMenuOpen && (
                    <div className="md:hidden animate-fade-in">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
                            {/* General Nav Links for Mobile */}
                            <NavLink to="/" className={getMobileNavlinkClass} onClick={closeAllMenus}>Home</NavLink>
                            <NavLink to="/shop" className={getMobileNavlinkClass} onClick={closeAllMenus}>Shop</NavLink>
                            <NavLink to="/lookbook" className={getMobileNavlinkClass} onClick={closeAllMenus}>Lookbook</NavLink>
                            <NavLink to="/about" className={getMobileNavlinkClass} onClick={closeAllMenus}>About</NavLink>
                            <NavLink to="/contact" className={getMobileNavlinkClass} onClick={closeAllMenus}>Contact</NavLink>
                            
                            {/* Kondisi: Tampilkan link Admin di mobile jika user adalah admin */}
                            {isAuthenticated && user?.role === 'admin' && (
                                <NavLink to="/admin/dashboard" className={getMobileNavlinkClass} onClick={closeAllMenus}>Admin</NavLink>
                            )}

                            {/* Authenticated User Links for Mobile (Conditional Block) */}
                            {isAuthenticated ? (
                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    {/* User Info Mobile */}
                                    <div className="px-3 py-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg mx-3 mb-3 border border-red-100">
                                        <div className="flex items-center">
                                            {/* AVATAR DISPLAY (MOBILE) */}
                                            <div className="w-8 h-8 mr-3">
                                                {user?.avatar ? (
                                                    <img className="h-full w-full rounded-full object-cover" src={user.avatar} alt={user.name} />
                                                ) : (
                                                    <div className="h-full w-full bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                                                <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                                                {user?.role && <span className="text-xs text-red-600 font-medium capitalize">{user.role}</span>}
                                            </div>
                                        </div>
                                    </div>
                                 {/* Checkout Link Mobile */}
<Link
  to="/checkout"
  onClick={closeAllMenus}
  className="relative flex items-center justify-center w-full bg-gradient-to-r from-gray-800 to-gray-600 text-white px-3 py-3 rounded-lg text-sm font-medium hover:from-gray-700 hover:to-gray-700 transition-all duration-200 mx-3 mb-3 shadow-md"
>
  <svg
    className="w-4 h-4 mr-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.1 5h4.4l1.1-5m-4.4 5h12m-7 3a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z"
    />
  </svg>
  Checkout
  {cartCount > 0 && (
    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
      {cartCount}
    </span>
  )}
</Link>

                                    {/* Other User Links Mobile */}
                                    <Link to="/profile" onClick={closeAllMenus} className="flex items-center w-full text-left px-3 py-3 text-base font-medium text-gray-900 hover:text-red-600 hover:bg-red-50 rounded-lg mx-3 mb-1 transition-colors duration-200">
                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> Profile Settings
                                    </Link>
                                    <Link to="/my-orders" onClick={closeAllMenus} className="flex items-center w-full text-left px-3 py-3 text-base font-medium text-gray-900 hover:text-red-600 hover:bg-red-50 rounded-lg mx-3 mb-1 transition-colors duration-200">
                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> My Orders <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">2</span>
                                    </Link>
                                    <Link to="/wishlist" onClick={closeAllMenus} className="flex items-center w-full text-left px-3 py-3 text-base font-medium text-gray-900 hover:text-red-600 hover:bg-red-50 rounded-lg mx-3 mb-3 transition-colors duration-200">
                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> Wishlist <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">5</span>
                                    </Link>
                                    {/* Sign Out Button Mobile */}
                                    <button onClick={handleLogout} className="flex items-center w-full text-left px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg mx-3 transition-colors duration-200">
                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg> Sign Out
                                    </button>
                                </div>
                            ) : (
                                // Login/Register buttons for non-authenticated users (Mobile)
                                <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                                    <Link to="/login" onClick={closeAllMenus} className="block text-center w-full bg-red-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-red-700 transition-colors mx-3">Login</Link>
                                    <Link to="/register" onClick={closeAllMenus} className="block text-center w-full border border-red-600 text-red-600 px-3 py-2 rounded-md text-base font-medium hover:bg-red-50 transition-colors mx-3">Register</Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;