import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-slate-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="text-xl font-bold">
          Scaler Project
        </Link>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm">
              {user.name} ({user.role})
            </span>
            {user.role === "instructor" && (
              <Link
                to="/create-course"
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
              >
                Create Course
              </Link>
            )}
            <button
              onClick={logout}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
