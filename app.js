const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());
let db = null;

const intializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Started at 3000");
    });
  } catch (e) {
    console.log(`Error at : ${e.message}`);
    process.exit(1);
  }
};
intializeDBandServer();

const convertMovieTableToDb = (objectItem) => {
  return {
    movieName: objectItem.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMovieDetailsquery = `select movie_name from movie;`;
  const listOfMovieNamesQuery = await db.all(getMovieDetailsquery);
  response.send(
    listOfMovieNamesQuery.map((eachItem) => convertMovieTableToDb(eachItem))
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const createMovieQuery = `insert into movie(director_id,movie_name,lead_actor) 
  values(${directorId},'${movieName}','${leadActor}');`;
  const createMovieQueryResponse = await db.run(createMovieQuery);
  response.send(`Movie Successfully Added`);
});

const convertMovieTableToDbAPI = (objectItem) => {
  return {
    movieId: objectItem.movie_id,
    directorId: objectItem.director_id,
    movieName: objectItem.movie_name,
    leadActor: objectItem.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetailsQuery = `select * from movie where movie_id = ${movieId};`;
  const getMovieDetailsQueryResponse = await db.get(getMovieDetailsQuery);
  response.send(convertMovieTableToDbAPI(getMovieDetailsQueryResponse));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `update movie set director_id = ${directorId},
  movie_name = '${movieName}', lead_actor = '${leadActor}' where movie_id = ${movieId};`;
  const updateMovieQueryResponse = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieDetailsQuery = `DELETE FROM movie where movie_id = ${movieId};`;
  const deleteMovieDetails = await db.run(deleteMovieDetailsQuery);
  response.send("Movie Removed");
});

const convertDirectorTableToDb = (objectItem) => {
  return {
    directorId: objectItem.director_id,
    directorName: objectItem.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorsListQuery = `SELECT * FROM director`;
  const getDirectorsList = await db.all(getDirectorsListQuery);
  response.send(
    getDirectorsList.map((eachItem) => convertDirectorTableToDb(eachItem))
  );
});

app.get("/directors/:directorId/movies", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorsListQuery = `select movie_name as movieName from movie where director_id = ${directorId};`;
  const movieNames = await db.all(getDirectorsListQuery);
  response.send(movieNames);
});

module.exports = app;
