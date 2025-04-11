const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

const { ObjectId } = mongoose.Types;

const courseSchema = new mongoose.Schema({
  id: String,  // Use 'id' field instead of '_id'
  label: String,
  courseName: String,
  level: String,
  entryRequirements: {
    qualification: [String],
    minGrades: Number, // Store minimum grades as numerical percentages
  },
  data: {
    description: String,
    duration: String,
  },
  position: {
    x: Number,
    y: Number,
  },
  next: [String],
});

const edgeSchema = new mongoose.Schema({
  source: String,
  target: String,
});

const Course = mongoose.model("Course", courseSchema, "courses");
const Edge = mongoose.model("Edge", edgeSchema);


app.get("/courses", async (req, res) => {
  try {
    const { label, qualification, grades } = req.query;

    // Validate qualification type
    const validQualifications = ["A-Levels", "Undergraduate", "Masters"];
    if (!validQualifications.includes(qualification)) {
      return res.status(400).json({ error: "Invalid qualification type selected" });
    }

    // Query for courses based on label (field)
    const filter = label ? { label } : {};  
    const baseCourses = await Course.find(filter);

    // Filter courses based on qualifications
    let matchingCourses = baseCourses.filter(course =>
      course.entryRequirements?.qualification?.includes(qualification)
    );

    // Apply grade filtering (ensure grades match or exceed the required grades)
    const minGrade = grades || '';  
    const validCourses = matchingCourses.filter(course => {
      const minGradeRequirement = course.entryRequirements?.minGrades;
      if (minGradeRequirement && minGrade) {
        return compareGrades(minGrade, minGradeRequirement);
      }
      return true;
    });

    // Function to avoid duplicates when combining arrays
    const addUniqueCourses = (courses) => {
      courses.forEach(course => {
        if (!validCourses.some(validCourse => validCourse.id === course.id)) {
          validCourses.push(course);
        }
      });
    };

    // Add master's, PhD courses if qualifications meet requirements, avoiding duplicates
    if (qualification === "A-Levels" && grades >= 60) {
      const undergraduateCourses = await Course.find({ label, level: "Undergraduate" });
      const mastersCourses = await Course.find({ label, level: "Masters" });
      const phdCourses = await Course.find({ label, level: "PhD" });

      addUniqueCourses(undergraduateCourses);
      addUniqueCourses(mastersCourses);
      addUniqueCourses(phdCourses);
    }

    if (qualification === "Undergraduate" && grades >= 70) {
      const mastersCourses = await Course.find({ label, level: "Masters" });
      const phdCourses = await Course.find({ label, level: "PhD" });

      addUniqueCourses(mastersCourses);
      addUniqueCourses(phdCourses);
    }

    if (qualification === "Masters" && grades >= 70) {
      const phdCourses = await Course.find({ label, level: "PhD" });

      addUniqueCourses(phdCourses);
    }
    console.log("Response data:", validCourses.map(course => ({
      id: course.id,
      label: course.label,
      courseName: course.courseName,
      description: course.data?.description || "",  // Access data.description
      duration: course.data?.duration || "",  // Access data.duration
      position: course.position,
      next: course.next
    })));

    // Return only matching courses with description and duration
    return res.json(validCourses.map(course => ({
      id: course.id,  // Use 'id' instead of '_id'
      label: course.label,
      courseName: course.courseName,
      description: course.data?.description || "",  // Access data.description
      duration: course.data?.duration || "",  // Access data.duration
      position: course.position,
      next: course.next
    })));

  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: error.message });
  }
});


// Helper function to compare grades (e.g., 75 vs 80 or percentage vs minimum percentage)
function compareGrades(userGrade, courseMinGrade) {
  try {
    const userGradeNum = parseFloat(userGrade);
    const courseMinGradeNum = parseFloat(courseMinGrade);

    if (isNaN(userGradeNum) || isNaN(courseMinGradeNum)) {
      throw new Error("Invalid grade format");
    }

    return userGradeNum >= courseMinGradeNum; // Check if user's grade meets or exceeds the course requirement
  } catch (error) {
    console.error("Error in grade comparison:", error);
    return false; 
  }
}

app.get("/edges", async (req, res) => {
  try {
    const { label } = req.query;
    let edgeFilter = {};

    if (label) {
      console.log(`Querying for edges with label: ${label}`); // Log to check
      // Fetch the ids of the courses matching the label
      const matchingCourses = await Course.find({ label }, "id");  // Fetch 'id' field
      const courseIds = matchingCourses.map(course => course.id);  // Use course.id instead of _id

      // Directly filter edges using 'source' and 'target'
      edgeFilter = {
        $or: [
          { source: { $in: courseIds } },  // If source matches any course id
          { target: { $in: courseIds } }   // If target matches any course id
        ]
      };
    }

    console.log(`Edge filter: ${JSON.stringify(edgeFilter)}`); // Log the edge filter
    const edges = await Edge.find(edgeFilter);
    console.log(`Fetched edges: ${JSON.stringify(edges)}`); // Log the fetched edges

    // Convert edges to the desired format
    const formattedEdges = edges.map(edge => ({
      id: `e${edge.source}-${edge.target}`, // Format ID as "e[source]-[target]"
      source: edge.source.toString(),
      target: edge.target.toString(),
      animated: true,
      style: { stroke: "#6c63ff", strokeWidth: 5 }
    }));

    console.log("Formatted Edges:", formattedEdges); // Log formatted edges

    res.json(formattedEdges);
  } catch (error) {
    console.error("Error fetching edges:", error);
    res.status(500).json({ error: error.message });
  }
});




app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

