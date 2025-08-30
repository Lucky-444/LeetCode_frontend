import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient.js";
import { useSelector } from "react-redux";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

const ProblemPage = () => {
  const { id } = useParams(); // Get problem ID from URL
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testCases, setTestCases] = useState([]);
  const [activeTab, setActiveTab] = useState("description"); // 'description', 'solution', 'submissions'
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get(`/problem/problemById/${id}`);
        console.log("Fetched problem data:", data);
        setProblem(data.problem);
        // Initialize code with a basic structure or problem starter code
        setCode(
          data.problem.starterCode ||
            `// Write your code here for ${data.problem.title}`
        );
      } catch (err) {
        console.error("Error fetching problem:", err);
        setError("Failed to load problem. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProblem();
    }
  }, [id]);

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handleRunCode = async () => {
    setIsSubmitting(true);
    setOutput("Running code...");
    try {
      // Simulate running code with a dummy API call
      const { data } = await axiosClient.post("/code/run", {
        problemId: problem._id,
        code,
        language: "javascript", // Assuming a default language
      });
      setOutput(data.result);
      // For a real system, you'd get test case results here
      // For demo, let's just show a simple output
      setTestCases([
        {
          input: "[1,2,3], 3",
          expected: "6",
          actual: data.result === "6" ? "6" : "N/A",
          status: data.result === "6" ? "Passed" : "Failed",
        },
      ]);
    } catch (err) {
      console.error("Error running code:", err);
      setOutput(`Error: ${err.response?.data?.message || err.message}`);
      setTestCases([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setOutput("Submitting code...");
    try {
      // Simulate submitting code
      const { data } = await axiosClient.post("/code/submit", {
        problemId: problem._id,
        code,
        language: "javascript", // Assuming a default language
      });
      setOutput(data.message || "Submission successful!");
      // Update solved problems for the user if successful
      if (data.isSolved && user) {
        // This would typically involve dispatching an action to update user's solved problems in Redux
        console.log("Problem marked as solved!");
      }
    } catch (err) {
      console.error("Error submitting code:", err);
      setOutput(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="ml-4 text-xl text-base-content">Loading problem...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 text-error p-8">
        <p className="text-3xl font-bold mb-4">Oops!</p>
        <p className="text-xl">{error}</p>
        <button onClick={() => navigate("/")} className="btn btn-primary mt-6">
          Go Home
        </button>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 text-warning p-8">
        <p className="text-3xl font-bold mb-4">Problem Not Found</p>
        <p className="text-xl">
          The problem you are looking for does not exist.
        </p>
        <button onClick={() => navigate("/")} className="btn btn-primary mt-6">
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 text-base-content p-8 flex flex-col font-sans">
      {/* Navbar (optional, or reuse HomePage's navbar) */}
      <div className="navbar bg-base-100 shadow-xl px-6 mb-8 rounded-box">
        <div className="flex-1">
          <button
            onClick={() => navigate("/")}
            className="btn btn-ghost text-xl text-primary"
          >
            <i className="fas fa-arrow-left mr-2"></i> Back to Problems
          </button>
        </div>
        <div className="flex-none">
          <span className="text-3xl font-extrabold text-primary cursor-pointer tracking-wide">
            SpidyLeet
          </span>
        </div>
      </div>

      <div className="flex gap-8 h-screen flex-col">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={50} minSize={30}>
            {/* Left Panel: Problem Description */}
            <div className="card bg-base-100 shadow-xl p-6 overflow-auto custom-scrollbar h-full">
              <h1 className="text-4xl font-bold mb-4 text-primary-content">
                {problem.title}
              </h1>
              <div className="mb-6 flex gap-2">
                <div
                  className={`badge ${
                    problem.difficulty === "easy"
                      ? "badge-success"
                      : problem.difficulty === "medium"
                      ? "badge-warning"
                      : "badge-error"
                  } text-white p-3 text-lg font-semibold`}
                >
                  {problem.difficulty}
                </div>
                {problem.tags &&
                  problem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="badge badge-outline badge-info p-3 text-lg"
                    >
                      {tag}
                    </span>
                  ))}
              </div>

              <div className="tabs tabs-boxed mb-4 bg-base-200">
                <a
                  className={`tab tab-lg ${
                    activeTab === "description" ? "tab-active text-primary" : ""
                  }`}
                  onClick={() => setActiveTab("description")}
                >
                  Description
                </a>
                <a
                  className={`tab tab-lg ${
                    activeTab === "solution" ? "tab-active text-primary" : ""
                  }`}
                  onClick={() => setActiveTab("solution")}
                >
                  Solution
                </a>
                <a
                  className={`tab tab-lg ${
                    activeTab === "submissions" ? "tab-active text-primary" : ""
                  }`}
                  onClick={() => setActiveTab("submissions")}
                >
                  Submissions
                </a>
              </div>

              <div className="prose lg:prose-lg max-w-none text-base-content leading-relaxed">
                {activeTab === "description" && (
                  <>
                    <h2 className="text-2xl font-semibold mb-2 text-secondary">
                      Problem Statement
                    </h2>
                    <p className="mb-4">{problem.description}</p>

                    <h3 className="text-xl font-semibold mb-2 text-accent">
                      Examples:
                    </h3>
                    {problem.visibleTestCases &&
                      problem.visibleTestCases.length > 0 &&
                      problem.visibleTestCases.map((ex, index) => (
                        <div
                          key={ex._id || index}
                          className="bg-base-300 p-4 rounded-md mb-4 shadow-inner"
                        >
                          <p className="font-mono text-lg mb-1">
                            <span className="font-bold text-primary">
                              Input:
                            </span>{" "}
                            <code>{ex.input}</code>
                          </p>
                          <p className="font-mono text-lg">
                            <span className="font-bold text-success">
                              Output:
                            </span>{" "}
                            <code>{ex.output.trim()}</code>
                          </p>
                          {ex.explanation && (
                            <p className="text-sm mt-2 text-base-content/70">
                              <span className="font-bold">Explanation:</span>{" "}
                              {ex.explanation}
                            </p>
                          )}
                        </div>
                      ))}

                    <h3 className="text-xl font-semibold mb-2 text-accent">
                      Constraints:
                    </h3>
                    <ul className="list-disc list-inside bg-base-300 p-4 rounded-md shadow-inner">
                      {problem.constraints && (
                        <>
                          <li>Time Limit: {problem.constraints.timeLimit}</li>
                          <li>
                            Memory Limit: {problem.constraints.memoryLimit}
                          </li>
                        </>
                      )}
                    </ul>
                  </>
                )}
                {activeTab === "solution" && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-2 text-secondary">
                      Solution (Premium Content)
                    </h2>
                    <p>
                      This section would typically contain official solutions,
                      video explanations, etc.
                    </p>
                    <p className="text-warning">
                      Access to solutions often requires a premium subscription.
                    </p>
                    {/* Dummy solution content */}
                    <pre className="bg-base-300 p-4 rounded-md overflow-x-auto mt-4 text-primary-content">
                      <code>
                        {`function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`}
                      </code>
                    </pre>
                  </div>
                )}
                {activeTab === "submissions" && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-2 text-secondary">
                      Your Submissions
                    </h2>
                    {user ? (
                      <p className="text-info">
                        Fetching your past submissions...
                      </p>
                    ) : (
                      // Here you would fetch and display user's past submissions for this problem
                      <p className="text-warning">
                        Please log in to view your submissions.
                      </p>
                    )}
                    {/* Dummy submissions */}
                    <ul className="mt-4">
                      <li className="bg-base-300 p-3 rounded-md mb-2 flex justify-between items-center">
                        <span className="font-mono text-success">Accepted</span>
                        <span className="text-sm text-base-content/70">
                          2 days ago
                        </span>
                      </li>
                      <li className="bg-base-300 p-3 rounded-md mb-2 flex justify-between items-center">
                        <span className="font-mono text-error">
                          Wrong Answer
                        </span>
                        <span className="text-sm text-base-content/70">
                          3 days ago
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Panel>
          <PanelResizeHandle className="group w-3 bg-base-300 hover:bg-primary-focus cursor-col-resize transition-colors flex items-center justify-center">
            {/* Bar inside */}
            <div className="w-1 h-12 bg-primary rounded-full group-hover:bg-primary-focus" />
          </PanelResizeHandle>

          <Panel defaultSize={50} minSize={30}>
            {/* Right Panel: Code Editor and Output */}
            <div className="flex flex-col h-full gap-8">
              <div className="card bg-base-100 shadow-xl p-6 flex-grow overflow-hidden">
                <h2 className="text-2xl font-bold mb-4 text-primary-content">
                  Code Editor
                </h2>
                <div className="flex justify-between items-center mb-4">
                  <select className="select select-bordered bg-base-200 text-base-content">
                    <option>JavaScript</option>
                    <option disabled>Python (Coming Soon)</option>
                    <option disabled>Java (Coming Soon)</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-outline btn-warning"
                      onClick={() =>
                        setCode(
                          problem.starterCode ||
                            `// Write your code here for ${problem.title}`
                        )
                      }
                    >
                      Reset Code
                    </button>
                  </div>
                </div>
                <textarea
                  className="textarea textarea-bordered h-full flex-grow font-mono bg-base-300 text-primary-content p-4 text-lg resize-none custom-scrollbar"
                  placeholder="Write your code here..."
                  value={code}
                  onChange={handleCodeChange}
                  style={{ minHeight: "300px" }} // Ensure enough height for the editor
                ></textarea>
              </div>

              <div className="card bg-base-100 shadow-xl p-6">
                <h2 className="text-2xl font-bold mb-4 text-primary-content">
                  Output
                </h2>
                <div
                  className="bg-base-300 text-primary-content p-4 rounded-md font-mono text-lg overflow-auto custom-scrollbar"
                  style={{ minHeight: "150px" }}
                >
                  <pre>{output || "Run your code to see the output."}</pre>
                </div>

                {testCases.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold mb-2 text-accent">
                      Test Cases:
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="table w-full text-base-content">
                        <thead>
                          <tr>
                            <th>Input</th>
                            <th>Expected</th>
                            <th>Actual</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {testCases.map((tc, index) => (
                            <tr key={index}>
                              <td>{tc.input}</td>
                              <td>{tc.expected}</td>
                              <td>{tc.actual}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    tc.status === "Passed"
                                      ? "badge-success"
                                      : "badge-error"
                                  }`}
                                >
                                  {tc.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="card-actions justify-end mt-6 gap-4">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleRunCode}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading loading-spinner"></span>
                        Running
                      </>
                    ) : (
                      <>
                        <i className="fas fa-play mr-2"></i> Run Code
                      </>
                    )}
                  </button>
                  <button
                    className="btn btn-success btn-lg"
                    onClick={handleSubmitCode}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading loading-spinner"></span>
                        Submitting
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2"></i> Submit
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* Footer */}
      <footer className="footer footer-center p-4 bg-base-300 text-base-content mt-8 rounded-box">
        <aside>
          <p>Copyright © 2024 - All right reserved by SpidyLeet</p>
        </aside>
      </footer>

      {/* Custom Scrollbar Styling (can be in index.css or global stylesheet) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #333; /* Darker track */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6D28D9; /* Primary purple */
          border-radius: 10px;
          border: 2px solid #333; /* Add border for contrast */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #8B5CF6; /* Lighter purple on hover */
        }
        .prose code {
          background-color: #333;
          padding: 0.2em 0.4em;
          border-radius: 0.3em;
          color: #E0E0E0;
        }
      `}</style>
    </div>
  );
};

export default ProblemPage;
