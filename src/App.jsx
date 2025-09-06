import { Routes, Route, Navigate, useNavigate } from "react-router";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import Signup from "./pages/Signup";
import { checkAuth } from "./authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import AdminPage from "./pages/AdminPage";
import ProblemPage from "./pages/ProblemPage";
import SolvedProblems from "./pages/SolvedProblems";

function App() {
  // code for the user is authenticated
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);

  console.log("isAuthenticated:", isAuthenticated);
  console.log("user:", user);
  const isAdmin = user?.role === "admin";

  console.log("isAdmin:", isAdmin);

  useEffect(() => {
    // User is authenticated, you can dispatch any actions or perform any logic here
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          {/* Spinner */}
          <svg
            className="animate-spin h-12 w-12 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>

          {/* Fancy text */}
          <p className="text-gray-600 font-medium text-lg animate-pulse">
            Loading, please wait...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <HomePage /> : <Navigate to="/signup" />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" /> : <Signup />}
        />
        <Route
          path="/admin"
          element={
            isAuthenticated && isAdmin ? <AdminPage /> : <Navigate to="/" />
          }
        />
        <Route
          path="/problem/:id"
          element={isAuthenticated ? <ProblemPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/SolvedProblems"
          element={isAuthenticated ? <SolvedProblems /> : <Navigate to="/login" />}
        />

      </Routes>
    </>
  );
}

export default App;
