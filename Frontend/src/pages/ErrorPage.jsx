import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaExclamationCircle, FaHome, FaRedo } from 'react-icons/fa';

const ErrorPage = () => {
  const [errorMessage, setErrorMessage] = useState('Something went wrong');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get error message from location state if available
    if (location.state && location.state.errorMessage) {
      setErrorMessage(location.state.errorMessage);
    }
  }, [location]);

  const handleRetry = () => {
    // If we have a previous path, go back there
    if (location.state && location.state.from) {
      navigate(location.state.from);
    } else {
      // Otherwise refresh the page
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="text-red-500 mb-6">
            <FaExclamationCircle size={80} className="mx-auto" />
          </div>
          
          <h1 className="text-3xl font-bold mb-6">Oops! Something Went Wrong</h1>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <p className="text-gray-600 mb-4">
              We encountered an error while processing your request.
            </p>
            <p className="text-red-600 font-medium">
              {errorMessage}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/" className="btn btn-primary flex items-center justify-center">
              <FaHome className="mr-2" />
              Go to Home
            </Link>
            <button 
              onClick={handleRetry} 
              className="btn btn-outline flex items-center justify-center"
            >
              <FaRedo className="mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage; 