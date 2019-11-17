'use strict';

// Application Dependencies
const express = require('express');
const methodOverride = require('method-override');
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
app.post('/books', createBook);
app.get('/books/:id', getOneBook);
app.put('/books/:id', updateBook);
app.delete('/books/:id', deleteBook)

app.get('*', (request, response) => response.status(404).send('This route does not exist'));

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

//Middleware
//Logic for using method override in the middleware to change the PUT request into a POST
app.use(express.urlencoded({extended: true}));
//https://www.npmjs.com/package/method-override
app.use(methodOverride((request, response) => {
  if (request.body && typeof request.body === 'object' && '_method' in request.body){
    let method = request.body_method;
    delete request.body._method;
    return method;
  }
}))

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

//(A) render the bookson an EJS page [index.ejs for rendering the response]
function newSearch(request, response) {
  //create a SQL statement to get all books from the the database that were previously saved
  let SQL = 'SELECT * FROM books';

  return client.query(SQL)
    .then (result => {
      response.render('pages/searches/search.ejs', {bookList: result.rows})
    })
    //catch any errors
    .catch(handleError);
}

//(B) render search results [new.ejs for rendering search results] Navigation SEARCH or no saved entries in DB at star.
//POST '/searches' route
function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }
//use superagent to get data from API.  Create new instance of the Book object.  render the results using pages/searches/show.ejs.
  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show.ejs', { searchResults: results }))
    //DRY catch to .catch(handleError);
    .catch(err => handleError(err, response));
}

//(A)The original request to get books that checks for saved data then renders the data using index.ejs
function getBooks(request, response) {
  let SQL = 'SELECT * FROM books';

  // INSERT INTO books (title, author, ISBN, image_url, description) VALUES($1, $2, $3, $4, $5);
  // let values = ['my title 2', 'me too', 'isbn num', 'httpme', 'describe the second book', 'Novels'];

  //render the books on an EJS page using pages/index.ejs or redirect to /searches/new route which is newSearch.
  return client.query(SQL)
    .then (result => {
      if (result.rowCount > 0) {
        response.render('pages/index.ejs', {bookList: result.rows})
      } else {
        response.redirect('/searches/new')
      }
    })
    .catch(handleError);
}

//App.POST to /books route
function createBook(request, response) {
  let {title, author, isbn, image_url, description, bookshelf} = request.body;
  //deconstruct insert statement
  let SQL = 'INSERT INTO books (title, author, ISBN, image_url, description, bookshelf) VALUES($1,$2, $3, $4, $5, $6) RETURNING id;';

  let values= [title, author, isbn, image_url, description, bookshelf];
  //return id of book back to calling function and redirect to book detail page/route
  client.query(SQL, values)
    .then(result => response.redirect(`/books/${result.rows[0].id}`))
    .catch(err => handleError(err, response));
}

//(C) app.get('/books/:id', getOneBook); uses pages/books/show.ejs to render response
//use the id passed in from the front-end (ejs form)
function getOneBook(request, response) {
  getBookShelves()
    .then(shelves => {
      let SQL = 'SELECT * FROM books WHERE ID = $1';
      let values = [request.params.id];
      client.query(SQL, values)
        .then(result => response.render('pages/books/show.ejs' , {book: result.rows[0], bookshelves: shelves.rows})
        )
    })
    .catch(handleError);
}

function updateBook(request, response){
//Create update book function
//  route is app.put('/books/:id', updateBook);
}

function deleteBook(request, response){
  //Create delete book function
//route is app.delete('/books/:id', deleteBook)
}


//Handle errors function
function handleError(error, response) {
  response.render('pages/error', { error: error });
}

//Get the list of options for bookshelf for a drop down list on the form when assigning a bookshelf for a book that is or will be saved to database.
function getBookShelves() {
  let SQL = 'SELECT DISTINCT bookshelf from books ORDER BY bookshelf';
  return client.query(SQL);
}

// https://www.w3schools.com/tags/tryit.asp?filename=tryhtml_form_submit
// https://www.w3schools.com/jquery/tryit.asp?filename=tryjquery_hide_show
// https://stackoverflow.com/questions/30584700/jquery-with-ejs/42221676



