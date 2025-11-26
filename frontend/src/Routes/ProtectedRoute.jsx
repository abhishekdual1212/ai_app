import { Navigate, Outlet } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";

const ProtectedRoute = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  if (loading) return <div>Loading...</div>; 

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
