'use strict';

// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT;

// Application Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


// Database
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.log(err));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// API Routes
app.get('/', getBooks) //define route to get all books
app.get('/searches/new', newSearch);
app.post('/searches', createSearch);
// app.post('/books', createBook)
app.get('/books/:id', getOneBook);


app.get('*', (request, response) => response.status(404).send('This route does not exist'));

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// HELPER FUNCTIONS
function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  let httpRegex = /^(http:\/\/)/g

  this.title = info.title ? info.title : 'No title available';
  this.author = info.authors ? info.authors[0] : 'No author available';
  this.isbn = info.industryIdentifiers ? `ISBN_13 ${info.industryIdentifiers[0].identifier}` : 'No ISBN available';
  this.image_url = info.imageLinks ? info.imageLinks.smallThumbnail.replace(httpRegex, 'https://') : placeholderImage;
  this.description = info.description ? info.description : 'No description available';
  this.id = info.industryIdentifiers ? `${info.industryIdentifiers[0].identifier}` : '';
}

function newSearch(request, response) {
  //create a SQL statement to get all books from the the database that were previously saved
  let SQL = 'SELECT * FROM books';

  // INSERT INTO books (title, author, ISBN, image_url, description) VALUES($1, $2, $3, $4, $5);
  // let values = ['my title 2', 'me too', 'isbn num', 'httpme', 'describe the second book', 'Novels'];

  //render the books on an EJS page
  return client.query(SQL)
    .then (result => {
      response.render('pages/index.ejs', {bookList: result.rows})
    })
    //catch any errors
    .catch(err => handleError(err, message))
}

function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show', { searchResults: results }))
    .catch(err => handleError(err, response));
}

function getBooks(request, response) {
  //create a SQL statement to get all books in the the database that was saved previously
  let SQL = 'SELECT * FROM books';

  // INSERT INTO books (title, author, ISBN, image_url, description) VALUES($1, $2, $3, $4, $5);
  let values = ['my title 2', 'me too', 'isbn num', 'httpme', 'describe the second book', 'Novels'];

  //render the books on an EJS page
  return client.query(SQL)
    .then (result => {
//TODO: take result to determine if rows exist to render response or render search pages
      response.render('pages/index.ejs', {bookList: result.rows})  //define results varaible
    })
  //catch any errors
    .catch(err => handleError(err, message))
}

// function createBook() {
//   //create a SQL statement to insert book
//   //return id of book back to calling function

//   let {title, author, isbn, image_url, description} = request.body;
//   let SQL = 'INSERT INTO books (title, author, isbn, image_url, description, bookshelf) VALUES($1,$2, $3, $4, $5, $6)'

//   let values= (title, author, isbn, image_url, description, normalizedBookshelf);

//   return clientInformation.query(SQL, values)
//     .then( () => {
//         SQL = 'SELECT * FROM books WHERE ISBN = $1';
//         values  = [request.body.isbn];
//         return client.query(SQL, values)
//         .then (result=> response.redirect('/books/$(result.rows(0).id}'))
//     }
//     )
// }

function getOneBook(request, response) {
  //use the id passed in from the front-end (ejs form)
//get bookshelves
  getBookShelves()
    .then(shelves => {
      let SQL = 'SELECT * FROM books WHERE ID = $1';
      let values = [request.params.id];
      console.log(values);
      client.query(SQL, values)
        .then(result => response.render('pages/books/show' , {book: result.rows[0], bookshelves: shelves.rows})
        )
        // .then(result => console.log(result) )
    })
    .catch(handleError);
}

function handleError(error, response) {
  response.render('pages/error', { error: error });
}

function getBookShelves() {
  let SQL = 'SELECT DISTINCT bookshelf from books ORDER BY bookshelf';
  return client.query(SQL);
}
