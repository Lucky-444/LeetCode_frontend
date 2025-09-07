import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useState, useEffect, useCallback } from "react"; // Added useCallback
import axiosClient from "../utils/axiosClient.js";

const SolvedProblems = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [solvedProblems, setSolvedProblems] = useState([]); // This will hold the paginated solved problems
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProblemsCount, setTotalProblemsCount] = useState(0); // Total count of solved problems
  const problemsPerPage = 10; // Match backend limit

  // Filter state
  const [filters, setFilters] = useState({
    difficulty: "all",
    tags: "all",
    // We'll add a 'search' filter if you need text search later
  });
  // You might still need all problems to dynamically populate tag filters
  const [allPossibleTags, setAllPossibleTags] = useState(new Set());


  // Function to fetch user's solved problems from the backend
  // Memoize with useCallback to prevent unnecessary re-renders and issues with useEffect dependencies
  const fetchUserSolvedProblems = useCallback(async (page = 1) => {
    if (!user) {
      setError("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosClient.get("/problem/problemSolvedByUser", {
        params: {
          page: page,
          limit: problemsPerPage,
          // You could pass filters to the backend here if you implement server-side filtering
          // difficulty: filters.difficulty === 'all' ? undefined : filters.difficulty,
          // tags: filters.tags === 'all' ? undefined : filters.tags,
        },
      });

      setSolvedProblems(response.data.problemSolved);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
      setTotalProblemsCount(response.data.totalProblems); // Set the total count

      // Also fetch ALL problems (or a filtered list of all problems) to get all possible tags
      // This is a separate call to avoid issues with pagination
      const allProblemsResponse = await axiosClient.get("/problem/getAllProblems");
      const tags = new Set(allProblemsResponse.data.problems.flatMap(p => p.tags || []));
      setAllPossibleTags(tags);

    } catch (err) {
      console.error("Error fetching solved problems:", err);
      setError(err.response?.data?.message || "Failed to fetch solved problems.");
    } finally {
      setLoading(false);
    }
  }, [user, problemsPerPage]); // Dependencies for useCallback

  useEffect(() => {
    fetchUserSolvedProblems(currentPage);
  }, [fetchUserSolvedProblems, currentPage]); // Re-fetch when page or the fetch function (due to user) changes

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
    // When filters change, reset to the first page (optional, but good UX)
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewProblem = (problem) => {
    navigate(`/problem/${problem._id}`);
  };

  // Client-side filtering on the currently fetched page of solved problems
  const filteredSolvedProblems = (solvedProblems || []).filter((problem) => {
    if (filters.difficulty !== "all" && problem.difficulty !== filters.difficulty) {
      return false;
    }
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
        backgroundImage:
          "url('/ChatGPT Image Aug 29, 2025, 02_32_26 AM.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      <div className="p-8 relative z-10 flex-grow container mx-auto">
      <button
        className="px-6 py-2 mb-4 rounded-2xl bg-blue-950/80 text-white font-medium shadow-md hover:bg-blue-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300"
        onClick={() => navigate('/')}
      >
        Back to Dashboard
      </button>

        <h1 className="text-5xl font-extrabold text-white mb-8 animate-fade-in-left justify-center flex">
          Your <span className="text-primary-content">Solved</span> Problems 🏆
        </h1>

        <div className="mt-8 p-6 bg-base-1200/40 backdrop-blur-md rounded-box shadow-xl animate-fade-in-up delay-100">
          <div className="flex flex-wrap gap-4 mb-6">
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

            <select
              name="tags"
              value={filters.tags}
              onChange={handleFilterChange}
              className="select select-bordered w-full max-w-xs bg-base-200/80 text-base-content"
            >
              <option value="all">All Tags</option>
              {[...allPossibleTags] // Use the state for dynamic tags
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
                {filteredSolvedProblems.length > 0 ? (
                  filteredSolvedProblems.map((problem) => (
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
                      No solved problems found matching your filters for this page.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-6">
            <button
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-900 mx-2"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-white text-lg flex items-center">
              Page {currentPage} of {totalPages} (Total: {totalProblemsCount})
            </span>
            <button
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-900 mx-2"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
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

export default SolvedProblems;