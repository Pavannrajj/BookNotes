import pg from "pg";
import fetchData from "./api.js";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

console.log("Connecting with:", process.env.DATABASE_URL);

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 1,                      // Railway proxy requirement
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  keepAlive: true              // REQUIRED for ECONNRESET fix
});

db.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err);
});

/* ------------------- FUNCTIONS ------------------- */

export async function userspage(id) {
  const result = await db.query(
    "SELECT identifiertype, identifiernumber FROM book WHERE user_id = $1",
    [id]
  );

  const imageUrls = await fetchData(result.rows);
  return imageUrls;
}

export async function getapi(id) {
  const result = await db.query(
    "SELECT identifiertype, identifiernumber FROM book WHERE book_id = $1",
    [id]
  );

  const imageUrls = await fetchData(result.rows);
  return imageUrls;
}

export async function getusers() {
  const result = await db.query("SELECT * FROM users");
  return result.rows;
}

export async function getbookId(user_id) {
  const result = await db.query(
    "SELECT book_id FROM book WHERE user_id = $1",
    [user_id]
  );
  return result.rows;
}

export async function getbookDetails(book_id) {
  const result = await db.query(
    "SELECT book_name, author FROM book WHERE book_id = $1",
    [book_id]
  );
  return result.rows;
}

export async function credentialCheck(user, password) {
  const result = await db.query(
    "SELECT user_id, name, password FROM users WHERE name = $1",
    [user]
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid User Name or Password");
  }

  const matchedUser = result.rows[0];

  if (matchedUser.password !== password) {
    throw new Error("Invalid User Name or Password");
  }

  return matchedUser.user_id;
}

export async function newUser(user, password) {
  await db.query(
    "INSERT INTO users (name, password) VALUES ($1, $2)",
    [user, password]
  );

  return "User created successfully";
}

export async function addBooktoDatabase(
  userId,
  bookName,
  time,
  author,
  type,
  number
) {
  const result = await db.query(
    `INSERT INTO book
     (book_name, user_id, createdtime, author, identifiertype, identifiernumber)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [bookName, userId, time, author, type, number]
  );

  return result.rowCount === 1 ? "success" : "failed";
}

export async function deleteBook(book_id) {
  const result = await db.query(
    "DELETE FROM book WHERE book_id = $1",
    [book_id]
  );

  return result.rowCount === 1
    ? `Book with id ${book_id} deleted successfully`
    : "Book not deleted";
}
