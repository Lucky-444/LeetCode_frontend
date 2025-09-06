import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient.js";
import { useSelector } from "react-redux";
import Editor from "@monaco-editor/react";
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
  const [runTestResults, setRunTestResults] = useState([]); // For 'Run Code' test case details
  const [submissionResult, setSubmissionResult] = useState(null); // For 'Submit Code' overall result
  const [activeLeftTab, setActiveLeftTab] = useState("description"); // 'description', 'solution', 'submissions'
  const editorRef = useRef(null); // This ref isn't strictly needed for Monaco in this setup, but kept for consistency
  const { user } = useSelector((state) => state.auth);

  // New state for controlling the output panel size
  // Adjusted initial size to give more room and ensure buttons are visible
  const [outputPanelSize, setOutputPanelSize] = useState(25);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get(`/problem/problemById/${id}`);
        setProblem(data.problem);

        const initialCodeObj = data.problem.starterCode.find(
          (item) => item.language === language
        );
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
  }, [id, language]);

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    if (problem && problem.starterCode) {
      const initialCodeObj = problem.starterCode.find(
        (item) => item.language === newLanguage
      );
      setCode(
        initialCodeObj?.initialCode ||
          `// Write your ${newLanguage} code here for ${problem.title}`
      );
    }
  };

  // Function to open the output panel
  const openOutputPanel = () => {
    setOutputPanelSize(35); // Set to a reasonable size when opened, ensuring buttons are visible
  };

  const handleRunCode = async () => {
    setIsSubmitting(true);
    setOutput("Running code...");
    setRunTestResults([]);
    setSubmissionResult(null);
    openOutputPanel(); // Open the output panel when code is run

    try {
      const { data } = await axiosClient.post(
        `/problem/submit/${problem._id}/run`,
        {
          code,
          language,
        }
      );

      let newOutput = "";
      if (data.success === "accepted") {
        newOutput = `Execution successful! Runtime: ${data.runtime}s, Memory: ${data.memory}KB`;
      } else if (data.success === "error") {
        newOutput = `Compilation Error:\n${data.message}`;
      } else {
        newOutput = `Some tests failed. Message: ${
          data.message || "Check test cases below."
        }`;
      }
      setOutput(newOutput);

      const mappedTestResults = data.testCases.map((tc, index) => {
        const problemVisibleTestCase = problem.visibleTestCases[index];
        return {
          input: problemVisibleTestCase?.input || "N/A",
          expected: problemVisibleTestCase?.output || "N/A",
          actual:
            tc.stdout || (tc.stderr ? `Error: ${tc.stderr}` : "No output"),
          status:
            tc.status_id === 3
              ? "Passed"
              : tc.status_id === 4
              ? "Error"
              : "Failed",
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
    setRunTestResults([]);
    setSubmissionResult(null);
    openOutputPanel(); // Open the output panel when code is submitted

    try {
      const { data } = await axiosClient.post(
        `/problem/submit/${problem._id}`,
        {
          code,
          language,
        }
      );

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
        statusMessage: data.msg || data.message,
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
      <div className="min-h-screen flex items-center justify-center bg-base-100">
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
    <div
      className="min-h-screen flex flex-col text-base-content p-5 font-sans relative"
      style={{
        backgroundImage:
          "url('/Generated Image August 29, 2025 - 4_41PM.jpeg')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Add a dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      <div className="navbar bg-base-100/40 shadow-xl px-6 mb-3 rounded-box backdrop-blur">
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

      {/* Main horizontal panel group */}
      {/* flex-grow to make it take all available vertical space */}
      <PanelGroup direction="horizontal" className="flex-grow">
        <Panel defaultSize={50} minSize={30}>
          {/* Left Panel: Problem Description */}
          <div className="card bg-base-300/40 shadow-xl p-6 overflow-auto custom-scrollbar h-full">
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

            <div className="tabs tabs-boxed mb-4 bg-base-200/90">
              <a
                className={`tab tab-lg ${
                  activeLeftTab === "description"
                    ? "tab-active text-primary"
                    : ""
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
                  activeLeftTab === "submissions"
                    ? "tab-active text-primary"
                    : ""
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
                        className="bg-base-200/40 p-4 rounded-md mb-4 shadow-inner"
                      >
                        <p className="font-mono text-lg mb-1">
                          <span className="font-bold text-primary">Input:</span>{" "}
                          <code>{ex.input}</code>
                        </p>
                        <p className="font-mono text-lg">
                          <span className="font-bold text-success">
                            Output:
                          </span>{" "}
                          <code>{ex.output.trim()}</code>
                        </p>
                      </div>
                    ))}

                  <h3 className="text-xl font-semibold mb-2 text-accent">
                    Constraints:
                  </h3>
                  <ul className="list-disc list-inside bg-base-200/40 p-4 rounded-md shadow-inner">
                    {problem.constraints && (
                      <>
                        <li>Time Limit: {problem.constraints.timeLimit}</li>
                        <li>Memory Limit: {problem.constraints.memoryLimit}</li>
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
                  <pre className="bg-base-200/40 p-4 rounded-md overflow-x-auto mt-4 text-primary-content">
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
                    <p className="text-warning">
                      Please log in to view your submissions.
                    </p>
                  )}
                  <ul className="mt-4">
                    <li className="bg-base-100/40 p-3 rounded-md mb-2 flex justify-between items-center">
                      <span className="font-mono text-success">Accepted</span>
                      <span className="text-sm text-base-content/70">
                        2 days ago
                      </span>
                    </li>
                    <li className="bg-base-100/40 p-3 rounded-md mb-2 flex justify-between items-center">
                      <span className="font-mono text-error">Wrong Answer</span>
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

        <PanelResizeHandle className="group w-3 bg-base-100/40 hover:bg-primary-focus cursor-col-resize transition-colors flex items-center justify-center">
          <div className="h-full w-1 bg-primary rounded-full group-hover:bg-primary-focus" />
        </PanelResizeHandle>

        <Panel defaultSize={50} minSize={30}>
          {/* Right Panel: Code Editor and Output, now split vertically */}
          <PanelGroup direction="vertical">
            <Panel defaultSize={65} minSize={20}>
              {" "}
              {/* Editor panel */}
              <div className="card bg-base-100/40 shadow-xl p-4 flex-grow overflow-hidden flex flex-col h-full">
                {" "}
                {/* Ensure h-full here */}
                <div className="flex justify-between items-center mb-2">
                  <select
                    className="select select-bordered bg-base-100/40 text-base-content"
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
                      className="btn btn-outline btn-warning btn-sm"
                      onClick={() => {
                        if (problem && problem.starterCode) {
                          const initialCodeObj = problem.starterCode.find(
                            (item) => item.language === language
                          );
                          setCode(
                            initialCodeObj?.initialCode ||
                              `// Write your ${language} code here for ${problem.title}`
                          );
                        } else {
                          setCode(
                            `// Write your code here for ${problem.title}`
                          );
                        }
                      }}
                    >
                      Reset Code
                    </button>
                  </div>
                </div>
                <div className="flex-grow border border-base-300 rounded-md overflow-hidden">
                  <Editor
                    height="100%"
                    language={language || "javascript"}
                    value={
                      code || `// Write your code here for ${problem.title}`
                    }
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
                        horizontal: "auto",
                      },
                      mouseWheelZoom: true,
                      cursorStyle: "line",
                      
                    }}
                  />
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="group h-3 bg-base-100/40 hover:bg-primary-focus cursor-row-resize transition-colors flex items-center justify-center">
              <div className="h-1 w-full bg-primary rounded-full group-hover:bg-primary-focus" />
            </PanelResizeHandle>
            <Panel
              id="output-panel"
              defaultSize={outputPanelSize}
              minSize={15}
              collapsedSize={0}
              onCollapse={() => setOutputPanelSize(0)}
              onExpand={() => setOutputPanelSize(35)}
              onResize={(size) => setOutputPanelSize(size)}
            >
              <div className="card bg-base-100/40 shadow-xl p-3 h-full flex flex-col">
                <h2 className="text-2xl font-bold mb-4 text-primary-content">
                  Output
                </h2>

                {/* Output box grows upward */}
                <div className="flex-grow overflow-auto bg-base-100/40 text-primary-content p-4 rounded-md font-mono text-lg custom-scrollbar whitespace-pre-wrap">
                  <pre>{output || "Run your code to see the output."}</pre>

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
                                <td className="max-w-[150px] overflow-hidden text-ellipsis">
                                  {tc.input}
                                </td>
                                <td className="max-w-[150px] overflow-hidden text-ellipsis">
                                  {tc.expected}
                                </td>
                                <td className="max-w-[150px] overflow-hidden text-ellipsis">
                                  {tc.actual}
                                </td>
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

                  {submissionResult && (
                    <div className="mt-4">
                      <h3 className="text-xl font-semibold mb-2 text-accent">
                        Submission Result:
                      </h3>
                      <div className="bg-base-100/40 p-4 rounded-md shadow-inner">
                        <p className="text-lg">
                          Status:{" "}
                          <span
                            className={`font-bold ${
                              submissionResult.accepted
                                ? "text-success"
                                : "text-error"
                            }`}
                          >
                            {submissionResult.accepted
                              ? "Accepted"
                              : "Wrong Answer"}
                          </span>
                        </p>
                        <p className="text-lg">
                          Passed Tests: {submissionResult.passedTestCases} /{" "}
                          {submissionResult.totalTestCases}
                        </p>
                        <p className="text-lg">
                          Runtime: {submissionResult.runtime}s
                        </p>
                        <p className="text-lg">
                          Memory: {submissionResult.memory} KB
                        </p>
                        {submissionResult.statusMessage &&
                          !submissionResult.accepted && (
                            <p className="text-sm mt-2 text-error">
                              Error Message: {submissionResult.statusMessage}
                            </p>
                          )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Buttons stay pinned to bottom */}
                <div className="card-actions justify-end mt-4">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleRunCode}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Running
                      </>
                    ) : (
                      <>
                        <i className="fas fa-play mr-2"></i> Run
                      </>
                    )}
                  </button>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={handleSubmitCode}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
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
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>

      {/* The footer has been removed */}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #333;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6D28D9;
          border-radius: 10px;
          border: 2px solid #333;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #8B5CF6;
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
