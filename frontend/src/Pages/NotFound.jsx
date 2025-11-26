import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
      <h1 className="text-6xl font-bold text-[#2F5EAC]">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
      <p className="text-gray-600 mt-2">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-8 flex space-x-4">
        <Link
          to="/"
          className="px-5 py-2.5 bg-[#2F5EAC] text-white font-semibold rounded-lg hover:bg-[#244b90] transition-colors"
        >
          Go to Homepage
        </Link>
        <Link
          to="/dashboard"
          className="px-5 py-2.5 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;