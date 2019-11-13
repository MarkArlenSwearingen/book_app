'use strict'

const express = require('express');//modules required.
const ejs = require('ejs');
const superagent = require ('superagent');

const PORT = process.env.PORT || 3000;//setting the port from .env along with a default of 3000

const app = express();// setting the application

//Application Middleware
app.use(express.urlencoded({extended:true}));//encoding the URL for the POST rather than get so people can't look at the database data being sent in the resquest,response
app.use(express.static('public')); //setting server to serve up the static CSS from the Public subfolder;

//Set the view engine for server side rendering
app.set('view engine', 'ejs');


//API Route
app.get('/' ,newSearch);//route for index.ejs, renders the search form

//new search for Google API
app.post('/searches', createSearch);

//Helper functions
//newSearch function to test index.ejs per kanban feature 1
function newSearch(request, response) {
  response.render('pages/index');
};

function createSearch(request,response){
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  //   console.log(request.body);
  // console.log(request.body.search);

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show'), {searchResults: results});
    // .then(results => console.log(results));
}


app.get('/', (reg,res) => res.send('Book_App by Mark Swearingen'));

//Catch all
app.get('*', (request,response) => response.status(404).send('This route does not exist'));

app.listen(PORT, () => console.log(`Listening on port ${PORT} `));

