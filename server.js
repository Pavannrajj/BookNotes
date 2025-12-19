import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config()

import {
  getusers,
  credentialCheck,
  addBooktoDatabase,
  newUser,
  userspage,
  getbookId,
  getapi,
  getbookDetails,
  deleteBook,
} from "./databaseFetch.js";

import {
  insertNote,
  deleteNote,
  editNote,
  readNote,
} from "./notes.js";

const app = express();
const port = process.env.PORT||3000;

// Global state variables
let U_id = null;
let N_id = null;
let B_id = null;
let U_name = null;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Preload user data
console.log("DATABASE_URL(at server.js):", process.env.DATABASE_URL);

const users = await getusers();

/* ========== ROUTES ========== */

// Homepage
app.get("/", async (req, res) => {
  try {
    const users = await getusers();
    res.render("home.ejs", { users });
  } catch (error) {
    console.error("fetch error:", error.message);
    res.status(500).send("error in fetching");
  }
});

// Login Page (GET)
app.get("/log-in", (req, res) => {
  res.render("login.ejs");
});

// Login Submission (POST)
app.post("/log-in", async (req, res) => {
  try {
    const user_id = await credentialCheck(req.body.username, req.body.password);
    U_id = user_id;

    const imageUrls = await userspage(user_id);
    var bookId = await getbookId(user_id);
    const user = users.find((row) => row.user_id == user_id);

    const FinalimageUrls = bookId.map((bookId, index) => ({
      bookId: bookId.book_id,
      url: imageUrls[index],
    }));

    res.render("user(edit).ejs", { imageUrls: FinalimageUrls, userName: user.name });
  } catch (error) {
    console.error("Login error:", error.message);
    res.render("login.ejs", { error: "Wrong Credentials. Try again!" });
  }
});

// Signup Page (GET)
app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

// Signup Submission (POST)
app.post("/sign-up", async (req, res) => {
  try {
    await newUser(req.body.username, req.body.password);
    const user_id = await credentialCheck(req.body.username, req.body.password);
    U_id = user_id;

    const users = await getusers();
    const user = users.find((row) => row.user_id == user_id);

    res.render("user(edit).ejs", { imageUrls: null, userName: user.name });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.render("signup.ejs", { error: "Error signing up. Try again!" });
  }
});

// User Book Gallery Page
app.get("/user", async (req, res) => {
  try {
    const user_id = req.query.user;
    const imageUrls = await userspage(user_id);
    const bookId = await getbookId(user_id);
    const user = users.find((row) => row.user_id == user_id);

    const FinalimageUrls = bookId.map((bookId, index) => ({
      bookId: bookId.book_id,
      url: imageUrls[index],
    }));

    res.render("user.ejs", { imageUrls: FinalimageUrls, userName: user.name });
  } catch (error) {
    console.error("User page error:", error);
    res.status(500).send("error in db fetching");
  }
});

// Notes Page (Read-only)
app.get("/notes", async (req, res) => {
  try {
    const book_id = req.query.bookId;
    const userName = req.query.userName;

    const result = await getbookDetails(book_id);
    const bookName = result[0].book_name;
    const author = result[0].author;
    const imageUrl = await getapi(book_id);
    const notes = await readNote(book_id);

    res.render("notes.ejs", { book_id, userName, bookName, imageUrl, author, notes });
  } catch (error) {
    console.error("Notes fetch error:", error);
    res.status(500).send("error in db manipulation");
  }
});

// Add Book Page
app.get("/addBook", (req, res) => {
  res.render("addBook.ejs", { U_id });
});

// Add Book Submission
app.post("/addBook", async (req, res) => {
  try {
    const newBookName = req.body.bookName;
    const formattedDate = getDate();

    await addBooktoDatabase(U_id, newBookName, formattedDate, req.body.authorName, 'isbn', req.body.isbnNumber);

    const user_id = U_id;
    const imageUrls = await userspage(user_id);
    const bookId = await getbookId(user_id);
    const users = await getusers();
    const user = users.find((row) => row.user_id == user_id);

    const FinalimageUrls = bookId.map((bookId, index) => ({
      bookId: bookId.book_id,
      url: imageUrls[index],
    }));

    res.render("user(edit).ejs", { imageUrls: FinalimageUrls, userName: user.name });
  } catch (error) {
    console.error("Add book error:", error.message);
    res.status(500).send("error in db manipulation");
  }
});

// Delete Book
app.get("/deleteBook", async (req, res) => {
  const book_id = req.query.BookId;
  await deleteBook(book_id);

  try {
    const user_id = U_id;
    const imageUrls = await userspage(user_id);
    const bookId = await getbookId(user_id);
    const user = users.find((row) => row.user_id == user_id);

    const FinalimageUrls = bookId.map((bookId, index) => ({
      bookId: bookId.book_id,
      url: imageUrls[index],
    }));

    res.render("user(edit).ejs", { imageUrls: FinalimageUrls, userName: user.name });
  } catch (error) {
    console.error("Delete book error:", error.message);
    res.status(500).send("error in db manipulation");
  }
});

// Notes (Edit Mode)
app.get("/notesEdit", async (req, res) => {
  try {
    const book_id = req.query.bookId;
    const userName = req.query.userName;
    B_id = book_id;
    U_name = userName;

    const result = await getbookDetails(book_id);
    const bookName = result[0].book_name;
    const author = result[0].author;
    const imageUrl = await getapi(book_id);
    const notes = await readNote(book_id);

    res.render("notes(edit).ejs", { book_id, userName, bookName, imageUrl, author, notes });
  } catch (error) {
    console.error("NotesEdit error:", error);
    res.status(500).send("error in db manipulation");
  }
});

// Add Note (POST)
app.post("/addNote", async (req, res) => {
  try {
    const note = req.body.newNote;
    const date = getDate();
    await insertNote(B_id, note, date);

    res.redirect(`/notesEdit?bookId=${B_id}&userName=${U_name}`);
  } catch (error) {
    console.error("Add note error:", error.message);
    res.status(500).send("error in db manipulation");
  }
});

// Delete Note
app.get("/deleteNote", async (req, res) => {
  try {
    const note_id = req.query.noteId;
    await deleteNote(note_id);

    const result = await getbookDetails(B_id);
    const bookName = result[0].book_name;
    const author = result[0].author;
    const imageUrl = await getapi(B_id);
    const notes = await readNote(B_id);

    res.render("notes(edit).ejs", {
      note_id,
      userName: U_name,
      bookName,
      imageUrl,
      author,
      notes,
      book_id: B_id,
    });
  } catch (error) {
    console.error("Delete note error:", error.message);
    res.status(500).send("error in db manipulation");
  }
});

// Update Note
app.get("/updateNote", async (req, res) => {
  try {
    const note_id = req.query.note_id;
    const note = req.query.updatednote;
    const date = getDate();

    await editNote(note, date, note_id);
    res.redirect(`/notesEdit?bookId=${B_id}&userName=${U_name}`);
  } catch (error) {
    console.error("Update note error:", error.message);
    res.status(500).send("error in db manipulation");
  }
});

// API to delete note (REST-style)
app.delete("/note", async (req, res) => {
  try {
    const response = await deleteNote(req.body.note_id);
    res.send(response);
  } catch (error) {
    console.error("Delete note API error:", error.message);
    res.status(500).send("error in db manipulation");
  }
});

// Utility: Get current date in dd-mm-yyyy
function getDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
}

// Start server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
