import { useDispatch, useSelector } from "react-redux";
import { logout } from "../authSlice";
import { useNavigate } from "react-router";

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth); 
  // assume user contains { firstName, email, image }

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div 
      className="min-h-screen bg-base-200 relative flex flex-col"
      style={{ 
        backgroundImage: "url('/ChatGPT Image Aug 29, 2025, 02_32_26 AM.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      {/* overlay to dim background */}
      <div className="absolute inset-0 bg-base-200/80"></div>

      {/* 🔹 Navbar */}
      <div className="navbar bg-base-100 shadow-md px-6 relative z-10">
        {/* Left side - Brand */}
        <div className="flex-1">
          <span className="text-2xl font-bold text-primary cursor-pointer">SpidyLeet</span>
        </div>

        {/* Right side - User */}
        <div className="flex-none gap-2">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img src={user?.image || "https://robohash.org/default.png"} alt="User Avatar" />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <span className="justify-between font-semibold">
                  {user?.firstName || "Guest"}
                </span>
              </li>
              <li><a onClick={() => navigate("/profile")}>Profile</a></li>
              <li><a onClick={handleLogout}>Logout</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* 🔹 Main content */}
      <div className="p-6 relative z-10">
        <h1 className="text-3xl font-bold text-white">
          Welcome, {user?.firstName || "User"} 👋
        </h1>
        <p className="mt-2 text-white">This is your dashboard. You can add your features here.</p>
      </div>
    </div>
  );
};

export default HomePage;
