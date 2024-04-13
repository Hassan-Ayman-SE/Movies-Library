// Require would make available the
// express package to be used in
// our code
const express = require("express");
const movieData = require("./data.json");


// Creates an express object
const app = express();
const port = 3001;

// It listens to HTTP get requests. 
// Here it listens to the root i.e '/'
app.get("/", handleHomePage);
app.get("/favorite", handleFavoritePage);
app.get("*", handleError404);
app.get("*", handleError500);


//functions:
function handleHomePage(req, res) {
    let newMovie = new Movie(movieData.title, movieData.poster_path, movieData.overview);
    res.json(newMovie);
}

function handleFavoritePage(req, res) {
    res.send("Welcome to Favorite Page");
}

function handleError404(req, res) {
    const error404 = {
        'status': 404,
        'responseText': 'Page Not Found',
    };
    res.status(404).send(error404);
}

function handleError500(req, res) {
    const error500 = {
        'status': 500,
        'responseText': 'Sorry, something went wrong',
    };
    res.status(500).send(error500);
}
class Movie {
    constructor(title, poster_path, overview) {
        this.title = title;
        this.poster_path = poster_path;
        this.overview = overview;
    }
}

app.listen(port, () => {

    // Print in the console when the
    // servers start to listen on 3001
    console.log(`Listening to port ${port}`);
});

