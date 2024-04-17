'use strict';
// Require would make available the
// express package to be used in
// our code
const express = require("express");
const cors = require("cors");
const axios = require('axios').default;
require('dotenv').config();

const movieData = require("./Movie Data/data.json");

const apiKey = process.env.API_KEY;

const app = express();
app.use(cors());

const PORT = 3001;

// routes
app.get("/", handleHomePage);
app.get("/favorite", handleFavoritePage);
app.get("/trending", handleTrending);
app.get("/search", handleSearch);
app.get("/popular", handlePopular);
app.get("/top_rated", handleTopRated);
app.use(errorHandler404);
app.use(errorHandler500);

//functions:
function handleHomePage(req, res) {
    let newMovie = new Movie(movieData.title, movieData.poster_path, movieData.overview);
    res.json(newMovie);
}

function handleFavoritePage(req, res) {
    res.send("Welcome to Favorite Page");
}


function handleTrending(req, res){
    const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}`;
    try{
        axios.get(url)
        .then(result => {
            let movies = result.data.results.map(movie => {
                return new Movie(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview);
            })
            res.json(movies);
        })
        .catch((error) => {
            console.log(error);
            
        })
    }
    catch (error) {
        errorHandler500(error,req,res);
    }
}

function handleSearch(req, res){
    let movieQuery = req.query.name;
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${movieQuery}&page=2`;
    try{
        axios.get(url)
        .then(result => {
            res.json(result.data.results);
        })
        .catch((error) => {
            console.log(error);
            
        })
    }
    catch (error) {
        errorHandler500(error,req,res);
    }
}


function handlePopular(req, res){
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`;
    try{
        axios.get(url)
        .then(result => {
            let movies = result.data.results.map(movie => {
                return new Movie(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview);
            })
            res.json(movies);
        })
        .catch((error) => {
            console.log(error);
            
        })
    }
    catch (error) {
        errorHandler500(error,req,res);
    }
}


function handleTopRated(req, res){
    const url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}`;
    try{
        axios.get(url)
        .then(result => {
            let movies = result.data.results.map(movie => {
                return new Movie(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview);
            })
            res.json(movies);
        })
        .catch((error) => {
            console.log(error);
            
        })
    }
    catch (error) {
        errorHandler500(error,req,res);
    }
}

//middleware function
function errorHandler500(erorr, req, res) {
    const err = {
        status: 500,
        massage: erorr
    }
    res.status(500).send(err);
}

function errorHandler404(erorr, req, res) {
    const err = {
        status: 404,
        massage: erorr
    }
    res.status(404).send(err);
}

class Movie {
    constructor(id, title, release_date, poster_path, overview) {
        this.id = id;
        this.title = title;
        this.release_date = release_date;
        this.poster_path = poster_path;
        this.overview = overview;
    }
}

app.listen(PORT, () => {

    // Print in the console when the
    // servers start to listen on 3001
    console.log(`Listening to PORT ${PORT}`);
});

