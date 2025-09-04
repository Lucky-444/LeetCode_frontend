import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient.js";
import { useSelector } from "react-redux";
import Editor from '@monaco-editor/react';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

const ProblemPage = () => {
  const { id } = useParams(); // Get problem ID from URL
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("javascript"); // Default language
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [output, setOutput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Changed testCases structure to hold more detail from backend for runCode
  const [runTestResults, setRunTestResults] = useState([]); // For 'Run Code' test case details
  const [submissionResult, setSubmissionResult] = useState(null); // For 'Submit Code' overall result
  const [activeLeftTab, setActiveLeftTab] = useState("description"); // 'description', 'solution', 'submissions'
  const editorRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get(`/problem/problemById/${id}`);
        setProblem(data.problem);

        // Initialize code with a basic structure or problem starter code for the default language
        const initialCodeObj = data.problem.starterCode.find((item) => item.language === language);
        setCode(initialCodeObj?.initialCode || "// Write your code here");

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
  }, [id, language]); // Added language to dependency array to re-fetch/set starter code

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    // When language changes, update the code with the starter code for the new language
    if (problem && problem.starterCode) {
      const initialCodeObj = problem.starterCode.find((item) => item.language === newLanguage);
      setCode(initialCodeObj?.initialCode || `// Write your ${newLanguage} code here for ${problem.title}`);
    }
  };

  const handleRunCode = async () => {
    setIsSubmitting(true);
    setOutput("Running code...");
    setRunTestResults([]); // Clear previous run test cases
    setSubmissionResult(null); // Clear previous submission result
    try {
      // NOTE: The problemId is passed in the URL, so the backend route expects it there
      // Your backend code looks like: router.post('/:id/run', userMiddleware, runCode);
      const { data } = await axiosClient.post(`/problem/submit/${problem._id}/run`, {
        code,
        language,
      });

      // Backend returns: { success, testCases, runtime, memory, message }
      let newOutput = "";
      if (data.success === "accepted") {
        newOutput = `Execution successful! Runtime: ${data.runtime}s, Memory: ${data.memory}KB`;
      } else if (data.success === "error") {
        newOutput = `Compilation Error:\n${data.message}`;
      } else { // wrong_answer
        newOutput = `Some tests failed. Message: ${data.message || 'Check test cases below.'}`;
      }
      setOutput(newOutput);

      // Map backend testCases to a format suitable for display
      const mappedTestResults = data.testCases.map((tc, index) => {
        const problemVisibleTestCase = problem.visibleTestCases[index]; // Match with original problem's visible test cases
        return {
          input: problemVisibleTestCase?.input || 'N/A',
          expected: problemVisibleTestCase?.output || 'N/A',
          actual: tc.stdout || (tc.stderr ? `Error: ${tc.stderr}` : 'No output'), // Actual output from Judge0
          status: tc.status_id === 3 ? "Passed" : (tc.status_id === 4 ? "Error" : "Failed"), // Judge0 status_id mapping
        };
      });
      setRunTestResults(mappedTestResults);

    } catch (err) {
      console.error("Error running code:", err);
      const errorMessage = err.response?.data?.message || err.message;
      setOutput(`Error: ${errorMessage}`);
      setRunTestResults([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setOutput("Submitting code...");
    setRunTestResults([]); // Clear run test results
    setSubmissionResult(null); // Reset previous submission result
    try {
      // NOTE: The problemId is passed in the URL, so the backend route expects it there
      // Your backend code looks like: router.post('/:id', userMiddleware, submitProblem);
      const { data } = await axiosClient.post(`/problem/submit/${problem._id}`, {
        code,
        language,
      });

      // Backend returns: { message, data: submissionResult, accepted, totalTestCases, passedTestCases, runtime, memory, msg }
      let submissionStatusMessage = "";
      if (data.accepted) {
        submissionStatusMessage = `Submission Accepted! All ${data.totalTestCases} tests passed.`;
      } else {
        submissionStatusMessage = `Submission Failed! Passed ${data.passedTestCases} out of ${data.totalTestCases} tests.`;
        if (data.message) {
          submissionStatusMessage += `\nError: ${data.message}`;
        }
      }
      setOutput(submissionStatusMessage);

      setSubmissionResult({
        accepted: data.accepted,
        passedTestCases: data.passedTestCases,
        totalTestCases: data.totalTestCases,
        runtime: data.runtime,
        memory: data.memory,
        statusMessage: data.msg || data.message, // Use msg for general success, message for specific error
      });

    } catch (err) {
      console.error("Error submitting code:", err);
      const errorMessage = err.response?.data?.message || err.message;
      setOutput(`Error: ${errorMessage}`);
      setSubmissionResult(null);
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
    <div className="min-h-screen bg-base-200 text-base-content p-5 flex flex-col font-sans">
      {/* Navbar (optional, or reuse HomePage's navbar) */}
      <div className="navbar bg-base-100 shadow-xl px-6 mb-3 rounded-box">
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

      <div className="flex gap-y-3 h-screen flex-col">
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
                    activeLeftTab === "description" ? "tab-active text-primary" : ""
                  }`}
                  onClick={() => setActiveLeftTab("description")}
                >
                  Description
                </a>
                <a
                  className={`tab tab-lg ${
                    activeLeftTab === "solution" ? "tab-active text-primary" : ""
                  }`}
                  onClick={() => setActiveLeftTab("solution")}
                >
                  Solution
                </a>
                <a
                  className={`tab tab-lg ${
                    activeLeftTab === "submissions" ? "tab-active text-primary" : ""
                  }`}
                  onClick={() => setActiveLeftTab("submissions")}
                >
                  Submissions
                </a>
              </div>

              <div className="prose lg:prose-lg max-w-none text-base-content leading-relaxed">
                {activeLeftTab === "description" && (
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
                {activeLeftTab === "solution" && (
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
                {activeLeftTab === "submissions" && (
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
            <div className="flex flex-col h-full gap-3">
              <div className="card bg-base-100 shadow-xl p-4 flex-grow overflow-hidden flex flex-col">

                <div className="flex justify-between items-center mb-2">
                  <select
                    className="select select-bordered bg-base-200 text-base-content"
                    value={language}
                    onChange={handleLanguageChange}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-outline btn-warning"
                      onClick={() => {
                        if (problem && problem.starterCode) {
                          const initialCodeObj = problem.starterCode.find((item) => item.language === language);
                          setCode(initialCodeObj?.initialCode || `// Write your ${language} code here for ${problem.title}`);
                        } else {
                          setCode(`// Write your code here for ${problem.title}`);
                        }
                      }}
                    >
                      Reset Code
                    </button>
                  </div>
                </div>

                {/* Monaco Editor */}
                <div className="flex-grow border border-base-300 rounded-md overflow-hidden">
                  <Editor
                    height="100%"
                    language={language || 'javascript'} // Ensure a default language
                    value={code || `// Write your code here for ${problem.title}`} // Ensure a default value
                    onChange={handleCodeChange}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 14,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: "on",
                      lineNumbers: "on",
                      glyphMargin: false,
                      folding: true,
                      lineDecorationsWidth: 10,
                      lineNumbersMinChars: 3,
                      scrollbar: {
                        vertical: "auto",
                        horizontal: "auto"
                      }
                    }}
                  />
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl p-3">
                <h2 className="text-2xl font-bold mb-4 text-primary-content">
                  Output
                </h2>
                <div
                  className="bg-base-300 text-primary-content p-4 rounded-md font-mono text-lg overflow-auto custom-scrollbar whitespace-pre-wrap" // Added whitespace-pre-wrap for output
                  style={{ minHeight: "100px" }}
                >
                  <pre>{output || "Run your code to see the output."}</pre>
                </div>

                {/* Display for Run Code Test Results */}
                {runTestResults.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold mb-2 text-accent">
                      Test Cases (Run Code):
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
                          {runTestResults.map((tc, index) => (
                            <tr key={index}>
                              <td className="max-w-[150px] overflow-hidden text-ellipsis">{tc.input}</td>
                              <td className="max-w-[150px] overflow-hidden text-ellipsis">{tc.expected}</td>
                              <td className="max-w-[150px] overflow-hidden text-ellipsis">{tc.actual}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    tc.status === "Passed"
                                      ? "badge-success"
                                      : tc.status === "Error"
                                      ? "badge-error"
                                      : "badge-warning"
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

                {/* Display for Submit Code Result */}
                {submissionResult && (
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold mb-2 text-accent">
                      Submission Result:
                    </h3>
                    <div className="bg-base-300 p-4 rounded-md shadow-inner">
                      <p className="text-lg">
                        Status:{" "}
                        <span
                          className={`font-bold ${
                            submissionResult.accepted ? "text-success" : "text-error"
                          }`}
                        >
                          {submissionResult.accepted ? "Accepted" : "Wrong Answer"}
                        </span>
                      </p>
                      <p className="text-lg">
                        Passed Tests: {submissionResult.passedTestCases} /{" "}
                        {submissionResult.totalTestCases}
                      </p>
                      <p className="text-lg">Runtime: {submissionResult.runtime}s</p>
                      <p className="text-lg">Memory: {submissionResult.memory} KB</p>
                      {submissionResult.statusMessage && !submissionResult.accepted && (
                         <p className="text-sm mt-2 text-error">Error Message: {submissionResult.statusMessage}</p>
                      )}
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