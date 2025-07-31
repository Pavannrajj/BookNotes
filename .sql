-- Create users table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(20),
  password VARCHAR(20),
  time VARCHAR(20)
);

-- Create book table
CREATE TABLE book (
  book_id SERIAL PRIMARY KEY,
  book_name VARCHAR(50),
  user_id INTEGER,
  createdtime VARCHAR(50),
  author VARCHAR(50),
  identifiertype VARCHAR(10),
  identifiernumber BIGINT,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create notes table
CREATE TABLE notes (
  book_id INTEGER,
  note TEXT,
  time TEXT,
  FOREIGN KEY (book_id) REFERENCES book(book_id)
);
