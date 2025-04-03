import { Link } from 'react-router-dom';
import { FaCalendarCheck, FaClock, FaMoneyBillWave, FaUserFriends, } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <FaCalendarCheck className="text-4xl text-primary mb-4" />,
      title: 'Easy Booking',
      description: 'Book your futsal slot in seconds with our intuitive booking system.',
    },
    {
      icon: <FaClock className="text-4xl text-primary mb-4" />,
      title: 'Real-time Availability',
      description: 'See available slots in real-time and book instantly.',
    },
    {
      icon: <FaUserFriends className="text-4xl text-primary mb-4" />,
      title: 'User-friendly',
      description: 'Simple and intuitive interface for the best user experience.',
    },
    {
      icon: <FaMoneyBillWave className="text-4xl text-primary mb-4" />,
      title: 'Pay at Location',
      description: 'Pay for your booking when you arrive at the Futsal.',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Book Your Futsal Court Online</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            The easiest way to book futsal courts. No more phone calls or waiting in line.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/booking" className="btn btn-accent text-lg px-8 py-3">
              Book Now
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="btn bg-white text-primary hover:bg-gray-100 text-lg px-8 py-3">
                Register
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Choose a Date</h3>
              <p className="text-gray-600">
                Select your preferred date from our calendar.
              </p>
            </div>
            <div className="card text-center">
              <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Select a Time Slot</h3>
              <p className="text-gray-600">
                Browse available time slots and choose the one that works for you.
              </p>
            </div>
            <div className="card text-center">
              <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Confirm and Play</h3>
              <p className="text-gray-600">
                Confirm your booking and you're all set to play!
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link to="/booking" className="btn btn-primary text-lg px-8 py-3">
              Book Your Slot Now
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Book Your Futsal Court?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join hundreds of players who book their futsal courts online with us.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/booking" className="btn bg-white text-accent hover:bg-gray-100 text-lg px-8 py-3">
              Book Now
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="btn bg-primary text-white hover:bg-primary/90 text-lg px-8 py-3">
                Register
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 