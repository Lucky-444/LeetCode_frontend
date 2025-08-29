import { useDispatch, useSelector } from "react-redux";
import { logout } from "../authSlice";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import axiosClient from "../utils/axiosClient.js"; // Assuming this is for future API calls

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: "all",
    status: "all",
    tags: "all",
  });

  // Get user information from Redux store
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      // Optional: If you have a backend logout endpoint to invalidate tokens
      // await axiosClient.post("/api/auth/logout");
      // console.log("Backend logout successful (if implemented).");
    } catch (error) {
      console.error("Error during backend logout:", error);
    } finally {
      await dispatch(logout());
      setSolvedProblems([]);
      navigate("/login");
    }
  };
  useEffect(() => {
    // // Simulate fetching problems with more diverse tags
    // const dummyProblems = [
    //   { id: 1, title: "Two Sum", difficulty: "Easy", status: "Solved", tags: ["Array", "Hash Table"] },
    //   { id: 2, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", status: "Attempted", tags: ["String", "Sliding Window"] },
    //   { id: 3, title: "Median of Two Sorted Arrays", difficulty: "Hard", status: "Unsolved", tags: ["Array", "Divide and Conquer"] },
    //   { id: 4, title: "Container With Most Water", difficulty: "Medium", status: "Solved", tags: ["Array", "Two Pointers"] },
    //   { id: 5, title: "Valid Parentheses", difficulty: "Easy", status: "Unsolved", tags: ["String", "Stack"] },
    //   { id: 6, title: "Merge Two Sorted Lists", difficulty: "Easy", status: "Solved", tags: ["Linked List", "Recursion"] },
    //   { id: 7, title: "Longest Palindromic Substring", difficulty: "Medium", status: "Unsolved", tags: ["String", "Dynamic Programming"] },
    //   { id: 8, title: "Two Sum II - Input Array Is Sorted", difficulty: "Easy", status: "Solved", tags: ["Array", "Two Pointers"] },
    // ];
    const fetchProblems = async () => {
      try {
        const {data} = await axiosClient.get("/problem/getAllProblems");
        setProblems(data.problems);
        setSolvedProblems(data?.problems.filter(p => p.status === "Solved"));
        console.log(setSolvedProblems);
      } catch (error) {
        console.error("Error fetching problems:", error);
      }
    };
    const fetchSolvedProblems = async () => {
      try {
        const {data} = await axiosClient.get("/problem/problemSolvedByUser");
        setSolvedProblems(data.problemSolved);
      } catch (error) {
        console.error("Error fetching solved problems:", error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  // --- Filtering Logic ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const filteredProblems = (problems || []).filter(problem => {
    // Filter by difficulty
    if (filters.difficulty !== "all" && problem.difficulty !== filters.difficulty) {
      return false;
    }
    // Filter by status
    if (filters.status !== "all" && problem.status !== filters.status) {
      return false;
    }
    // Filter by tags (simplified for demo, checks if ANY tag matches)
    if (filters.tags !== "all" && !problem.tags.includes(filters.tags)) {
      return false;
    }
    return true;
  });
  // --- End Filtering Logic ---

  console.log(solvedProblems);
  // console.log(filteredProblems);

  return (
    <div
      className="min-h-screen bg-base-200 relative flex flex-col font-sans"
      style={{
        backgroundImage:
          "url('/Generated Image August 29, 2025 - 4_41PM.jpeg')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Spider-like SVG Overlay for the background */}
      <div className="absolute inset-0 z-0 opacity-20" style={{ pointerEvents: 'none' }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="spiderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" /> {/* Purple */}
              <stop offset="100%" stopColor="#EC4899" /> {/* Pink */}
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Larger central spider-like element */}
          <path
            d="M500 100 C 650 150, 750 300, 700 450 C 750 500, 750 600, 700 700 C 650 850, 500 900, 300 850 C 250 700, 250 600, 300 450 C 250 300, 350 150, 500 100 Z"
            stroke="url(#spiderGradient)"
            strokeWidth="5"
            strokeLinejoin="round"
            strokeLinecap="round"
            filter="url(#glow)"
          />

          {/* Legs radiating outwards */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45) * Math.PI / 180; // 8 legs, 45 degrees apart
            const startX = 500 + Math.cos(angle) * 100;
            const startY = 500 + Math.sin(angle) * 100;
            const control1X = 500 + Math.cos(angle) * 250;
            const control1Y = 500 + Math.sin(angle) * 250;
            const endX = 500 + Math.cos(angle) * 450;
            const endY = 500 + Math.sin(angle) * 450;
            return (
              <path
                key={i}
                d={`M${startX} ${startY} Q${control1X} ${control1Y} ${endX} ${endY}`}
                stroke="url(#spiderGradient)"
                strokeWidth="3"
                strokeDasharray="10 10"
                strokeLinecap="round"
                filter="url(#glow)"
              />
            );
          })}

          {/* Web-like connecting lines (simplified for example) */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle1 = (i * 30) * Math.PI / 180;
            const angle2 = ((i + 1) * 30) * Math.PI / 180;
            const x1 = 500 + Math.cos(angle1) * 200;
            const y1 = 500 + Math.sin(angle1) * 200;
            const x2 = 500 + Math.cos(angle2) * 200;
            const y2 = 500 + Math.sin(angle2) * 200;

            const x3 = 500 + Math.cos(angle1) * 350;
            const y3 = 500 + Math.sin(angle1) * 350;
            const x4 = 500 + Math.cos(angle2) * 350;
            const y4 = 500 + Math.sin(angle2) * 350;
            return (
              <g key={`web-${i}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#spiderGradient)" strokeWidth="1" opacity="0.6" />
                <line x1={x3} y1={y3} x2={x4} y2={y4} stroke="url(#spiderGradient)" strokeWidth="1" opacity="0.4" />
              </g>
            );
          })}
        </svg>
      </div>

          
      <div className="absolute inset-0 bg-gradient-to-br from-base-300/80 to-base-900/90 backdrop-blur-sm"></div>

      <div className="navbar bg-base-100 shadow-xl px-6 relative z-20 animate-fade-in-down">
        <div className="flex-1 pl-4">
          <span className="text-3xl font-extrabold text-primary cursor-pointer transition-all duration-300 hover:scale-105 hover:text-secondary tracking-wide">
            SpidyLeet
          </span>
        </div>

        <div className="flex-none gap-2 pr-4">
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="btn btn-ghost btn-circle avatar transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:bg-base-200 tooltip tooltip-left"
              data-tip={user?.firstName || "Guest"}
            >
              <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src={user?.image || "https://robohash.org/default.png?set=set4"}
                  alt="User Avatar"
                  className="object-cover"
                />
              </div>
            </label>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 p-2 shadow-lg bg-base-100 rounded-box w-52 border border-primary/20 animate-fade-in-up"
            >
              <li>
                <span className="justify-between font-semibold text-lg text-primary-content">
                  {user?.firstName || "Guest"}
                  <span className="badge badge-primary badge-outline text-xs">Pro</span>
                </span>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/profile");
                  }}
                  className="hover:bg-primary/20 rounded-md py-2 transition-colors duration-200"
                >
                  <i className="fas fa-user mr-2"></i> Profile
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                  className="hover:bg-error/20 text-error rounded-md py-2 transition-colors duration-200"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i> Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="p-8 relative z-10 flex-grow container mx-auto">
        <h1 className="text-5xl font-extrabold text-white mb-4 animate-fade-in-left">
          Welcome, <span className="text-primary-content">{user?.firstName || "User"}</span>! 👋
        </h1>
        <p className="mt-2 text-xl text-white/90 max-w-2xl animate-fade-in-right">
          Your personalized dashboard for conquering coding challenges. Let's solve some problems!
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="card shadow-xl bg-gradient-to-br from-primary to-secondary text-primary-content animate-pop-in">
            <div className="card-body">
              <h2 className="card-title text-3xl font-bold">Solved Problems</h2>
              <p className="text-6xl font-extrabold mt-4">{solvedProblems.length}</p>
              <div className="card-actions justify-end mt-4">
                <button
                  className="btn btn-primary text-primary-content shadow-lg hover:shadow-xl transition-shadow duration-300"
                  onClick={() => navigate('/problems?status=solved')}
                >
                  View All
                </button>
              </div>
            </div>
          </div>

          <div className="card shadow-xl bg-base-100 text-base-content animate-pop-in delay-100">
            <div className="card-body">
              <h2 className="card-title text-3xl font-bold">Total Problems</h2>
              <p className="text-6xl font-extrabold mt-4">{problems?.length}</p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary btn-outline">Explore</button>
              </div>
            </div>
          </div>

          <div className="card shadow-xl bg-base-100 text-base-content animate-pop-in delay-200">
            <div className="card-body">
              <h2 className="card-title text-3xl font-bold">Daily Challenge</h2>
              <p className="text-xl mt-4">"Implement an LRU Cache"</p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-accent btn-outline">Start Now</button>
              </div>
            </div>
          </div>
        </div>

        {/* --- Filtered Problems List --- */}
        <div className="mt-12 p-6 bg-base-100/80 backdrop-blur-md rounded-box shadow-xl animate-fade-in-up delay-300">
          {/* Filters Row */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Difficulty Filter */}
            <select
              name="difficulty"
              value={filters.difficulty}
              onChange={handleFilterChange}
              className="select select-bordered w-full max-w-xs bg-base-200 text-base-content"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {/* Status Filter */}
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="select select-bordered w-full max-w-xs bg-base-200 text-base-content"
            >
              <option value="all">All Statuses</option>
              <option value="Solved">Solved</option>
              <option value="Attempted">Attempted</option>
              <option value="Unsolved">Unsolved</option>
            </select>

            {/* Tags Filter (using dummy tags for now) */}
            <select
              name="tags"
              value={filters.tags}
              onChange={handleFilterChange}
              className="select select-bordered w-full max-w-xs bg-base-200 text-base-content"
            >
              <option value="all">All Tags</option>
              <option value="Array">Array</option>
              <option value="String">String</option>
              <option value="Hash Table">Hash Table</option>
              <option value="Linked List">Linked List</option>
              <option value="Two Pointers">Two Pointers</option>
              <option value="Dynamic Programming">Dynamic Programming</option>
              <option value="Sliding Window">Sliding Window</option>
              <option value="Stack">Stack</option>
              <option value="Recursion">Recursion</option>
              {/* Add more tags as needed */}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full text-base-content">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                  <th>Tags</th> {/* Added Tags column */}
                  <th>Action</th>
                </tr>

              </thead>
              <tbody>
                {filteredProblems.length > 0 ? (
                  filteredProblems.map(problem => (
                    <tr key={problem._id || problem.id || index} className="hover:bg-base-200 transition-colors duration-200">
                      <td className="font-medium">{problem.title}</td>
                      <td><span className={`badge ${problem.difficulty === "easy" ? "badge-success" : problem.difficulty === "medium" ? "badge-warning" : "badge-error"}`}>{problem.difficulty}</span></td>
                        <td>
                          <span
                            className={`badge ${
                              solvedProblems?.some(p => p._id === problem._id)
                                ? "badge-info"
                                : "badge-ghost"
                            }`}
                          >
                            {solvedProblems?.some(p => p._id === problem._id)
                              ? "Solved"
                              : "Unsolved"}
                          </span>
                        </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {problem.tags && problem.tags.map(tag => (
                            <span key={tag} className="badge badge-outline badge-sm">{tag}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm btn-primary">View</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-xl text-info">
                      No problems found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* --- End Filtered Problems List --- */}
      </div>

      <footer className="footer footer-center p-4 bg-base-300 text-base-content relative z-10 mt-12 animate-fade-in-up">
        <aside>
          <p>Copyright © 2024 - All right reserved by SpidyLeet</p>
        </aside>
      </footer>

      <style>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-left {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pop-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.6s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        .animate-fade-in-left { animation: fade-in-left 0.6s ease-out forwards; }
        .animate-fade-in-right { animation: fade-in-right 0.6s ease-out forwards; }
        .animate-pop-in { animation: pop-in 0.5s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
};

export default HomePage;