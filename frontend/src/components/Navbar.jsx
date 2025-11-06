import { Bell, Calendar, Home, LogOut, Users } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { to: "/dashboard", icon: Home, label: "Dashboard" },
    { to: "/calendar", icon: Calendar, label: "My Events" },
    { to: "/marketplace", icon: Users, label: "Marketplace" },
    { to: "/notifications", icon: Bell, label: "Requests" },
  ];

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-blue-600">SlotSwapper</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`${
                    location.pathname === to
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-gray-700 text-sm mr-4">
                Welcome, {user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
