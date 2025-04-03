import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome, FaArrowLeft } from 'react-icons/fa';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="text-accent mb-6">
            <FaExclamationTriangle size={80} className="mx-auto" />
          </div>
          
          <h1 className="text-5xl font-bold mb-4">404</h1>
          <h2 className="text-2xl font-bold mb-6">Page Not Found</h2>
          
          <p className="text-gray-600 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/" className="btn btn-primary flex items-center justify-center">
              <FaHome className="mr-2" />
              Go to Home
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="btn btn-outline flex items-center justify-center"
            >
              <FaArrowLeft className="mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 