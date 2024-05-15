"use strict";
// Require would make available the
// express package to be used in
// our code
const express = require("express");
const cors = require("cors");
const axios = require("axios").default;
require("dotenv").config();

const movieData = require("./Movie Data/data.json");

const apiKey = process.env.API_KEY;
const pgUrl = process.env.PG_URL;
const PORT = process.env.PORT || 5000;

//for quiery in js file using pg package
const { Client } = require("pg");
const client = new Client(pgUrl);

const app = express();
//server open for all clients requests
app.use(cors());
//for parsing body
app.use(express.json());

// routes
app.get("/", handleHomePage);
app.get("/favorite", handleFavoritePage);
app.get("/trending", handleTrending);
app.get("/search", handleSearch);
//Two more routes
app.get("/popular", handlePopular);
app.get("/top_rated", handleTopRated);
//CRUD Routes
app.post("/addMovie", handleAddMovie);
app.get("/getMovies", handleGetMovies);
app.put("/UPDATE/:id", handleUpdateMovie);
app.delete("/DELETE/:id", handleDeleteMovie);
app.get("/getMovie/:id", getMovieById);
//Error Handlers
app.use(errorHandler404);
app.use(errorHandler500);

//functions:
function handleHomePage(req, res) {
  let newMovie = new Movie(
    movieData.title,
    movieData.poster_path,
    movieData.overview
  );
  res.json(newMovie);
}

function handleFavoritePage(req, res) {
  res.send("Welcome to Favorite Page");
}

function handleTrending(req, res) {
  const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}`;
  try {
    axios
      .get(url)
      .then((result) => {
        let movies = result.data.results.map((movie) => {
          return new Movie(
            movie.id,
            movie.title,
            movie.release_date,
            movie.poster_path,
            movie.overview
          );
        });
        res.json(movies);
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    errorHandler500(error, req, res);
  }
}

function handleSearch(req, res) {
  let movieQuery = req.query.name;
  let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${movieQuery}&page=2`;
  try {
    axios
      .get(url)
      .then((result) => {
        res.json(result.data.results);
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    errorHandler500(error, req, res);
  }
}

function handlePopular(req, res) {
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`;
  try {
    axios
      .get(url)
      .then((result) => {
        let movies = result.data.results.map((movie) => {
          return new Movie(
            movie.id,
            movie.title,
            movie.release_date,
            movie.poster_path,
            movie.overview
          );
        });
        res.json(movies);
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    errorHandler500(error, req, res);
  }
}

function handleTopRated(req, res) {
  const url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}`;
  try {
    axios
      .get(url)
      .then((result) => {
        let movies = result.data.results.map((movie) => {
          return new Movie(
            movie.id,
            movie.title,
            movie.release_date,
            movie.poster_path,
            movie.overview
          );
        });
        res.json(movies);
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    errorHandler500(error, req, res);
  }
}

// //(Post) Add Request
function handleAddMovie(req, res) {
  const { id, title, release_date, poster_path, overview, comment } = req.body;

  let sql =
    "INSERT INTO movies(id, title, release_date, poster_path, overview, comment) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;"; // sql query
  let values = [id, title, release_date, poster_path, overview, comment];
  client
    .query(sql, values)
    .then((result) => {
      // console.log(result.rows);
      return res.status(201).json(result.rows[0]);
    })
    .catch((error) => {
      errorHandler500(error, req, res);
    });
}

//get request
function handleGetMovies(req, res) {
  let sql = "SELECT * FROM movies;";
  client
    .query(sql)
    .then((result) => {
      console.log(result);
      res.status(200).json(result.rows);
    })
    .catch((error) => {
      errorHandler500(error, req, res);
    });
}
//(Put) update request
function handleUpdateMovie(req, res) {
  const id = req.params.id;
  // const { title, release_date, poster_path, overview, comment } = req.body;
  const { comment } = req.body;
  // const sql = `UPDATE  movies SET title = $1, release_date = $2, poster_path = $3, overview = $4, comment = $5  where id = ${id} RETURNING *;`;
  const sql = `UPDATE movies
    SET comment=$1
    WHERE id=$2 RETURNING *;`;

  //let values = [title, release_date, poster_path, overview, comment];

  let values = [comment, id];
  client
    .query(sql, values)
    .then((result) => {
      //handleGetMovies(req, res);
      res.status(200).json(result.rows[0]);
    })
    .catch((error) => {
      // errorHandler500(error, req, res);
      console.log(error);
    });
}

//(Delete) Delete request
function handleDeleteMovie(req, res) {
  const id = req.params.id;

  const sql = `DELETE FROM movies where id= $1 RETURNING *;`;
  let values = [id];
  client
    .query(sql, values)
    .then((result) => {
      //  res.status(204).json(result.rows[0]);recommended
      //res.json(result.rows[0]);
      handleGetMovies(req, res);
    })
    .catch((error) => {
      errorHandler500(error, req, res);
    });
}
//get a Movie By Id
function getMovieById(req, res) {
  let id = req.params.id;

  let sql = `SELECT * FROM movies WHERE id=${id};`;

  client
    .query(sql)
    .then((result) => {
      return res.json(result.rows);
    })
    .catch((error) => {
      errorHandler500(error, req, res);
    });
}

//middleware function
function errorHandler500(erorr, req, res) {
  const err = {
    status: 500,
    massage: erorr,
  };
  res.status(500).send(err);
}

function errorHandler404(erorr, req, res) {
  const err = {
    status: 404,
    massage: erorr,
  };
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

// after connection to db, start the server
client.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is listening ${PORT}`);
  });
});
