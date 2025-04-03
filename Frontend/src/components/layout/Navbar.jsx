import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaCalendarAlt, FaUsers, FaCog } from 'react-icons/fa';
import { HiMenu, HiX } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownTimeoutRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const handleDropdownEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setShowDropdown(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 100); // 100 milliseconds delay
  };

  // Make sure dropdown is hidden when component mounts or when auth state changes
  useEffect(() => {
    setShowDropdown(false);
  }, [isAuthenticated, isAdmin]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold flex items-center">
            <FaCalendarAlt className="mr-2" />
            Futsal Booking
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-accent transition-colors">Home</Link>
            <Link to="/booking" className="hover:text-accent transition-colors">Book Now</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/my-bookings" className="hover:text-accent transition-colors">My Bookings</Link>
                
                {isAdmin && (
                  <Link to="/admin" className="hover:text-accent transition-colors">Admin</Link>
                )}
                
                <div 
                  className="relative" 
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button className="flex items-center hover:text-accent transition-colors">
                    <FaUserCircle className="mr-1" />
                    {user?.name?.split(' ')[0]}
                  </button>
                  
                  <div className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ${showDropdown ? 'block' : 'hidden'}`}>
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-text hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-text hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-accent transition-colors">Login</Link>
                <Link to="/register" className="btn btn-accent">Register</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="hover:text-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/booking" 
                className="hover:text-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Book Now
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/my-bookings" 
                    className="hover:text-accent transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                  
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="hover:text-accent transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  
                  <Link 
                    to="/profile" 
                    className="hover:text-accent transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUserCircle className="inline mr-1" />
                    Profile
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="flex items-center hover:text-accent transition-colors"
                  >
                    <FaSignOutAlt className="inline mr-1" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="hover:text-accent transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn btn-accent inline-block text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 