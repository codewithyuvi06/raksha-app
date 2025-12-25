const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Fake user database (replace with DB later)
const users = [{ email: "test@gmail.com", password: "$2a$10$abc..." }]; 

// REGISTER
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashedPass = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPass });
  res.send({ message: "User registered" });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).send({ error: "User not found" });
  
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).send({ error: "Wrong password" });

  const token = jwt.sign({ email: user.email }, "SECRET_KEY", { expiresIn: "1h" });
  res.send({ message: "Logged in", token });
});

// PROTECTED ROUTE
app.get("/profile", (req, res) => {
  const auth = req.headers.authorization?.split(" ")[1];
  try {
    const data = jwt.verify(auth, "SECRET_KEY");
    res.send({ message: "Profile Access Granted", user: data });
  } catch {
    res.status(401).send({ error: "Invalid Token" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
