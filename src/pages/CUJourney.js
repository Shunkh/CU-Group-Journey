import React, { useState, useEffect } from "react";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import "reactflow/dist/style.css";
import "./Journey.css";
import axios from "axios";

const Journey = () => {
  const [name, setName] = useState("");
  const [qualification, setQualification] = useState("");
  const [predictedGrades, setPredictedGrades] = useState("");
  const [field, setField] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rubricType, setRubricType] = useState("");

  const qualificationTypes = ["A-Levels", "Undergraduate", "Masters"];
  const fields = ["IT", "Accountancy", "Law", "Business", "Medicine"];

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.body.classList.toggle("journey-active", submitted);
  }, [submitted]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const selectedLabel = field;
        const queryParams = new URLSearchParams({
          label: selectedLabel,
          qualification,
          grades: predictedGrades,
          future: "false",
        });

        const [coursesRes, edgesRes] = await Promise.all([
          axios.get(`http://localhost:5002/courses?${queryParams}`),
          axios.get(`http://localhost:5002/edges?${queryParams}`),
        ]);

        if (coursesRes.data.message) {
          setError(coursesRes.data.message);
          setNodes([]);
          setEdges([]);
          return;
        }

        if (!Array.isArray(coursesRes.data) || coursesRes.data.length === 0) {
          setError("No courses found for this field.");
          setNodes([]);
          setEdges([]);
          return;
        }

        const formattedNodes = coursesRes.data.map((course) => {
          if (!course.next) return null;
          if (!course.id) return null;

          return {
            id: course.id.toString(),
            type: "default",
            data: {
              label: course.courseName || "Unnamed Course",
              description: course.data?.description || "",
              duration: course.data?.duration || "",
            },
            position: course.position || { x: Math.random() * 400, y: Math.random() * 400 },
          };
        }).filter(Boolean);

        const formattedEdges = edgesRes.data.map((edge) => {
          if (!edge.source || !edge.target) return null;

          return {
            id: `e${edge.source}-${edge.target}`,
            source: edge.source.toString(),
            target: edge.target.toString(),
            animated: true,
            style: { stroke: "#6c63ff", strokeWidth: 2 },
          };
        }).filter(Boolean);

        setNodes(formattedNodes);
        setEdges(formattedEdges);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (submitted && field) {
      fetchData();
    }
  }, [submitted, field, qualification, predictedGrades]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (field && qualification) {
      setSubmitted(true);
    }
  };

  const renderRubric = () => {
    if (rubricType === "A-Levels") {
      return (
        <div className="rubric-card">
          <h3>A-Level Grading Rubric:</h3>
          <ul>
            <li>First Class: 70% and above</li>
            <li>Upper Second Class (2:1): 60-69%</li>
            <li>Lower Second Class (2:2): 50-59%</li>
            <li>Third Class: 40-49%</li>
            <li>Pass: 30-39%</li>
            <li>Fail: below 30%</li>
          </ul>
        </div>
      );
    } else if (rubricType === "University") {
      return (
        <div className="rubric-card">
          <h3>University Grading Rubric:</h3>
          <ul>
            <li>First Class: 70% and above</li>
            <li>2:1: 60-69%</li>
            <li>2:2: 50-59%</li>
            <li>Pass: below 50%</li>
          </ul>
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <div className="journey-container">
      <div className="theme-toggle">
        <label htmlFor="dark-toggle" style={{ marginRight: "10px" }}>
          {darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </label>
        <input
          id="dark-toggle"
          type="checkbox"
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
        />
      </div>

      {/* Render Rubric */}
      {!submitted && (
        <div className="journey-main">
          <div className="rubric-column">
            <select
              className="rubric-selector"
              value={rubricType}
              onChange={(e) => setRubricType(e.target.value)}
            >
              <option value="">-- Select Rubric --</option>
              <option value="A-Levels">A-Levels</option>
              <option value="University">University</option>
            </select>
            {renderRubric()}
          </div>
        </div>
      )}

      {!submitted ? (
        <form onSubmit={handleSubmit} className="journey-form" style={{ flex: 1 }}>
          <h2 className="form-title">Enter Your Details</h2>

          <div className="form-group">
            <label>Student Name:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Qualification Type:</label>
            <select value={qualification} onChange={(e) => setQualification(e.target.value)} required>
              <option value="">-- Select --</option>
              {qualificationTypes.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Predicted Grades (Refer Rubric):</label>
            <input
              type="text"
              value={predictedGrades}
              onChange={(e) => setPredictedGrades(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="form-group">
            <label>Select Your Field of Interest:</label>
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              required
            >
              <option value="">-- Select --</option>
              {fields.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="submit-btn">Generate Journey</button>
        </form>
      ) : (
        <section className="journey-map">
          <h3>Welcome, {name}! Here's your personalized learning journey:</h3>
          <div className="map-container">
            {loading ? (
              <p>Loading journey map...</p>
            ) : error ? (
              <p>{error}</p>
            ) : nodes.length > 0 ? (
              <>
                <ReactFlow nodes={nodes} edges={edges} fitView>
                  <MiniMap />
                  <Controls />
                  <Background gap={12} size={1} />
                </ReactFlow>
                <ul>
                  {nodes.map((course) => (
                    <li key={course.id}>
                      <strong>{course.data.label}</strong> - {course.data.description} ({course.data.duration})
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>No courses available for this field.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Journey;
