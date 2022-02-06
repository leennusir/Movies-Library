'use strict'

const express = require ("express"); //import library make server
const app = express();// call node.js
const axios = require("axios"); //Api

const pg = require("pg");// call pgPostgress

                                                                    
const client = new pg.Client({ connectionString:"postgres://wrwcyfxovquyel:f6e5ee371d80f80fe72decd155cf256808525111bad148238924e0fd5f0af188@ec2-99-81-177-233.eu-west-1.compute.amazonaws.com:5432/dbc7hq2c8phk3k",
    ssl: { rejectUnauthorized: false }
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));//avtivation for library
app.use(bodyParser.json());// obj-->json

 // json file must convert to constructor
function Move(title,original_language,original_title,poster_path,video,vote_average,overview,release_date,
    vote_count,id,adult,backdrop_path,popularity,media_type){
        this.title = title;
        this.original_language = original_language;
        this.original_title = original_title;
        this.poster_path = poster_path;
        this.video = video;
        this.vote_average = vote_average;
        this.overview = overview;
        this.release_date = release_date;
        this.vote_count = vote_count;
        this.id = id;
        this.adult = adult;
        this.backdrop_path = backdrop_path;
        this.popularity = popularity;
        this.media_type = media_type;
    }
const dataMove = require("./Movie Data/data.json");// require =>call files

app.get("/",home); //route = /:end point , type: get
function home (req,res){
    let move = new Move(dataMove.title,dataMove.original_language,dataMove.original_title,dataMove.poster_path,
              dataMove.video,dataMove.vote_average,dataMove.overview,dataMove.release_date,dataMove.vote_count,dataMove.id,dataMove.adult,
              dataMove.backdrop_path,dataMove.popularity,dataMove.media_type);
    res.status(200).json(move);
}

app.get("/favorite",favorite); //route = endpoint =favorite
function favorite(req,res){
    res.status(200).send("Welcome to Favorite Page");// 200 status
}

function TheMoveDb(adult,backdrop_path,genre_ids,original_language,original_title,poster_path,video,vote_average
    ,vote_count,overview,release_date,id,title,popularity,media_type){
        this.adult = adult;
        this.backdrop_path = backdrop_path;
        this.genre_ids = genre_ids;
        this.original_language = original_language;
        this.original_title = original_title;
        this.poster_path = poster_path;
        this.video = video;
        this.vote_average = vote_average
        this.vote_count = vote_count;
        this.overview = overview;
        this.release_date = release_date;
        this.id = id;
        this.title = title;
        this.popularity = popularity;
        this.media_type = media_type;
}

app.get("/trending",trending);//3rd party api
function trending(req,res){
let moves = [];
axios.get('https://api.themoviedb.org/3/trending/all/week?api_key=44153feea6c5e3119956b3949a5f5cb0&language=en-US').then(value =>{
    console.log(value.data.results);
    value.data.results.forEach(element => {
        let move = new TheMoveDb(element.adult,element.backdrop_path,element.genre_ids,element.original_language
            ,element.original_title,element.poster_path,element.video,element.vote_average,
            element.vote_count,element.overview,element.release_date,element.id,element.title,
            element.popularity,element.media_type)
            moves.push(move);
    });
    return res.status(200).json(moves);
})
}

app.get("/search",getSearch);
function getSearch(req,res){
    console.log(req.query.search);
    let moves = [];
    axios.get(`https://api.themoviedb.org/3/search/movie?api_key=44153feea6c5e3119956b3949a5f5cb0&language=en-US&query=${req.query.search}&page=2`).then(value =>{
        console.log(value.data.results);
        value.data.results.forEach(element => {
            let move = new TheMoveDb(element.adult,element.backdrop_path,element.genre_ids,element.original_language
                ,element.original_title,element.poster_path,element.video,element.vote_average,
                element.vote_count,element.overview,element.release_date,element.id,element.title,
                element.popularity,element.media_type)
                moves.push(move);
        });
        return res.status(200).json(moves);
    })
}

app.get("/listApi",listApi);
function listApi(req,res){
    axios.get("https://api.themoviedb.org/3/movie/latest?api_key=44153feea6c5e3119956b3949a5f5cb0").then(value =>{
        console.log(value.data);
        
            let move = new TheMoveDb(value.data.adult,value.data.backdrop_path,value.data.genre_ids,value.data.original_language
                ,value.data.original_title,value.data.poster_path,value.data.video,value.data.vote_average,
                value.data.vote_count,value.data.overview,value.data.release_date,value.data.id,value.data.title,
                value.data.popularity,value.data.media_type)
              
       
        return res.status(200).json(move);
    })
}

function TheRegions(iso_3166_1,english_name,native_name){
    this.iso_3166_1 = iso_3166_1;
    this.english_name = english_name;
    this.native_name = native_name;
}

app.get("/regions",regions);
function regions(req,res){
let regions = [];
axios.get('https://api.themoviedb.org/3/watch/providers/regions?api_key=44153feea6c5e3119956b3949a5f5cb0&language=en-US').then(value =>{
console.log(value.data.results);
value.data.results.forEach(element => {
    let region = new TheRegions(element.iso_3166_1,element.english_name,element.native_name )
        regions.push(region);
});
return res.status(200).json(regions);
});
}


app.post("/addMovie",addMovie);
function addMovie (req,res){
    console.log(req.body.test);//place that i set data and send to route //body=>post man
    const body = req.body;
    const sql = `INSERT INTO movies (title, description) values ($1,$2)`;
    const values = [body.title,body.description] //create and updatae
    client.query(sql,values).then(()=>{
        return res.status(200).send("success")
    })
}
app.get("/getMovies",getMovies);
function getMovies (req,res){
    const sql = `select * from movies`;//get value
    client.query(sql).then(data=>{
        return res.status(200).json(data.rows)
    }) 
}

app.put("/moveUpdate/:id",moveUpdateById);
function moveUpdateById (req,res){
    const body = req.body;
    const sql = `UPDATE movies
    SET title = $1, description=$2
    WHERE moveid=${req.params.id};`;//update value
    const values = [body.title,body.description]
    client.query(sql,values).then(()=>{
        return res.status(200).send("success")
    })
}

app.delete("/moveDelete/:id",moveDelete);
function moveDelete(req,res){
    const sql = `DELETE FROM movies WHERE moveid=${req.params.id}`;
    client.query(sql).then(()=>{
        return res.status(200).send()
    }) 
    

}

app.get("/getMovies/:id",getMoviesById);//get value dend on id
function getMoviesById (req,res){
    const sql = `select * from movies where moveid=${req.params.id}`;
    client.query(sql).then(data=>{
        return res.status(200).json(data.rows)
    }) 

}



//Handle errors
app.use("*",errorNotFound);
function errorNotFound(req,res){
    res.status(404).send("Teeest");
}


client.connect().then(()=>{
    app.listen(3000,()=>{ //run local server (i can bulit my web site) port : any number

        console.log("serever run");
        });
});