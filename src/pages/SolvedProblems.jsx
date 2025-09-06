import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import axiosClient from "../utils/axiosClient.js"; // Assuming this is for future API calls

const SolvedProblems = () => {
  const navigate = useNavigate();

  // Get user information from Redux store
  const { user } = useSelector((state) => state.auth);

  const [allProblems, setAllProblems] = useState([]); // All problems from the backend
  const [userSolvedProblemIds, setUserSolvedProblemIds] = useState(new Set()); // Set of _id's for quick lookup
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    difficulty: "all",
    tags: "all",
  });

  useEffect(() => {
    const fetchAllProblemsAndSolvedStatus = async () => {
      if (!user) {
        setError("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch ALL problems (as we need full problem objects for filtering, not just solved IDs)
        const problemsResponse = await axiosClient.get("/problem/getAllProblems");
        setAllProblems(problemsResponse.data.problems);

        // Fetch user's solved problem IDs
        const solvedResponse = await axiosClient.get("/problem/problemSolvedByUser");
        const solvedIds = new Set(solvedResponse.data.problemSolved.map(p => p._id));
        setUserSolvedProblemIds(solvedIds);

      } catch (err) {
        console.error("Error fetching problems:", err);
        setError(err.response?.data?.message || "Failed to fetch problems.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllProblemsAndSolvedStatus();
  }, [user]); // Re-run if user changes (e.g., after login/logout)

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleViewProblem = (problem) => {
    // Navigate to the problem detail page
    navigate(`/problem/${problem._id}`);
  };

  // Filter problems to only show solved ones, then apply difficulty/tag filters
  const filteredAndSolvedProblems = (allProblems || [])
    .filter((problem) => userSolvedProblemIds.has(problem._id)) // Only show problems the user has solved
    .filter((problem) => {
      // Filter by difficulty
      if (
        filters.difficulty !== "all" &&
        problem.difficulty !== filters.difficulty
      ) {
        return false;
      }
      // Filter by tags (checks if ANY tag matches)
      if (filters.tags !== "all" && !problem.tags?.includes(filters.tags)) {
        return false;
      }
      return true;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-base-200 text-primary-content">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="ml-2">Loading your solved problems...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 bg-base-200 min-h-screen text-primary-content">
        <div className="alert alert-error shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Error: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-base-200 relative flex flex-col font-sans"
      style={{
        // Re-using the background from HomePage for consistency
        backgroundImage:
          "url('/ChatGPT Image Aug 29, 2025, 02_32_26 AM.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

        {/* Add a dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>  
  
      {/* Navbar (Optional, you might use a shared Layout component) */}
      {/* I'm omitting the full Navbar here to keep the example focused, 
          but you could include it or use a RootLayout. */}

      <div className="p-8 relative z-10 flex-grow container mx-auto">
        <h1 className="text-5xl font-extrabold text-white mb-8 animate-fade-in-left">
          Your <span className="text-primary-content">Solved</span> Problems 🏆
        </h1>

        {/* Filters Row */}
        <div className="mt-8 p-6 bg-base-100/40 backdrop-blur-md rounded-box shadow-xl animate-fade-in-up delay-100">
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Difficulty Filter */}
            <select
              name="difficulty"
              value={filters.difficulty}
              onChange={handleFilterChange}
              className="select select-bordered w-full max-w-xs bg-base-200 text-base-content"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {/* Tags Filter (using dummy tags for now, ideally fetch unique tags from `allProblems`) */}
            <select
              name="tags"
              value={filters.tags}
              onChange={handleFilterChange}
              className="select select-bordered w-full max-w-xs bg-base-200/80 text-base-content"
            >
              <option value="all">All Tags</option>
              {/* Dynamically generate tag options from your `allProblems` or a predefined list */}
              {[...new Set(allProblems.flatMap(p => p.tags || []))]
                .sort()
                .map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full text-base-content">
              <thead>
                <tr>
                  <th className="text-blue-400">Title</th>
                  <th className="text-blue-400">Difficulty</th>
                  <th className="text-blue-400">Tags</th>
                  <th className="text-blue-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSolvedProblems.length > 0 ? (
                  filteredAndSolvedProblems.map((problem) => (
                    <tr
                      key={problem._id}
                      className="hover:bg-base-200 transition-colors duration-200"
                    >
                      <td className="font-medium">{problem.title}</td>
                      <td>
                        <span
                          className={`badge ${
                            problem.difficulty === "easy"
                              ? "badge-success"
                              : problem.difficulty === "medium"
                              ? "badge-warning"
                              : "badge-error"
                          }`}
                        >
                          {problem.difficulty}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {problem.tags && problem.tags.length > 0 ? (
                            problem.tags.map((tag) => (
                              <span
                                key={tag}
                                className="badge badge-outline badge-sm"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-xs">No tags</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm btn-primary"
                          onClick={() => handleViewProblem(problem)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-4 text-xl text-info"
                    >
                      No solved problems found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <footer className="footer footer-center p-4 bg-base-300 text-base-content relative z-10 mt-12 animate-fade-in-up">
        <aside>
          <p>Copyright © 2024 - All right reserved by SpidyLeet</p>
        </aside>
      </footer>

      {/* Re-using the same animation styles as HomePage */}
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

export default SolvedProblems;