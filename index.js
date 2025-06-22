const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");

const PORT = 8000;
const app = express();
const connectionUrl = "mongodb://localhost:27017/todoDb";

// Setup
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
  .connect(connectionUrl)
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch((error) => console.log(error.message));

// Schema and Model
const todoSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 20,
      minlength: 3,
    },
    desc: String,
  },
  { timestamps: true }
);

const Todo = mongoose.model("todo", todoSchema);

// Routes

// Home Page: Show all todos
app.get("/", async (req, res, next) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.render("index", { todos: todos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Show form to add new todo
app.get("/add-todo", (req, res) => {
  try {
    res.render("newTodo");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Handle form to add new todo
app.post("/add-todo", async (req, res) => {
  try {
    const { title, desc } = req.body;
    const newTodo = new Todo({ title, desc });
    await newTodo.save();
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Show form to update todo
app.get("/update-todo", async (req, res) => {
  try {
    const { id } = req.query;
    const todo = await Todo.findById(id);
    res.render("updateTodo", { todo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Handle update
app.post("/update-todo", async (req, res) => {
  try {
    const { id, title, desc } = req.body;
    await Todo.findByIdAndUpdate(id, { title, desc });
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Show confirmation page for delete
app.get("/delete-todo", (req, res) => {
  try {
    const { id } = req.query;
    res.render("deleteTodo", { id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Handle deletion
app.get("/confirm-delete", async (req, res) => {
  try {
    const { id } = req.query;
    await Todo.findByIdAndDelete(id);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
