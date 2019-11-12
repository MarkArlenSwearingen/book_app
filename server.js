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

// app.post('/searches', createSearch);

//Helper functions
//newSearch function to test index.ejs per kanban feature 1
function newSearch(request, response) {
  response.render('pages/index');
};


app.get('/', (reg,res) => res.send('Book_App by Mark Swearingen'));

//Catch all
app.get('*', (request,response) => response.status(404).send('This route does not exist'));

app.listen(PORT, () => console.log(`Listening on port ${PORT} `));

