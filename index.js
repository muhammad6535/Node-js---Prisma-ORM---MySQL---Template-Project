const express = require("express");
const app = express();
const cors = require("cors");

// Import route files
const userRoutes = require("./routes/userRoutes");

app.use(express.json());
app.use(cors());
app.use("/api", userRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
