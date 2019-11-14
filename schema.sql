DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  author VARCHAR(255),
  ISBN VARCHAR(255),
  image_url VARCHAR(255),
  description TEXT,
  bookshelf TEXT
);



-- INSERT INTO books (title, author, ISBN, image_url, description, bookshelf) 
-- VALUES ('Lab 12', 'Mr. Swearingen', '23434kjlkj', 'https://via.placeholder.com/150', 'placehoder image sample book','Novels');
