import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">Futsal Booking</h3>
            <p className="mb-4">
              Book your futsal court online with ease. Play your favorite sport without the hassle of phone calls or in-person bookings.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-accent transition-colors" aria-label="Facebook">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="hover:text-accent transition-colors" aria-label="Twitter">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="hover:text-accent transition-colors" aria-label="Instagram">
                <FaInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-accent transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/booking" className="hover:text-accent transition-colors">Book Now</Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-accent transition-colors">My Bookings</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-accent transition-colors">Login</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-accent transition-colors">Register</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <FaPhone className="mr-2" />
                <span>+977 9876543210</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-2" />
                <span>info@futsalbooking.com</span>
              </li>
              <li className="flex items-center">
                <FaMapMarkerAlt className="mr-2" />
                <span>123 Futsal Street, Kathmandu, Nepal</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 mt-8 pt-6 text-center">
          <p>&copy; {currentYear} Futsal Booking. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 