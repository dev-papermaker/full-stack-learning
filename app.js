var express = require("express");
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var campgrounds=[
    {name: "1", image:"https://static01.nyt.com/images/2018/01/02/science/02SCI-MIND/merlin_131683850_13f8c9fe-affa-48bf-ab41-66ed93c2394a-articleLarge.jpg?quality=75&auto=webp&disable=upscale"},
    {name: "2", image:"https://static01.nyt.com/images/2018/01/02/science/02SCI-MIND/merlin_131683850_13f8c9fe-affa-48bf-ab41-66ed93c2394a-articleLarge.jpg?quality=75&auto=webp&disable=upscale"},
    {name: "3", image:"https://static01.nyt.com/images/2018/01/02/science/02SCI-MIND/merlin_131683850_13f8c9fe-affa-48bf-ab41-66ed93c2394a-articleLarge.jpg?quality=75&auto=webp&disable=upscale"},
    {name: "4", image:"https://i1.wp.com/thepointsguy.com/wp-content/uploads/2017/07/GettyImages-652743099.jpg?fit=2000%2C1328px&ssl=1"},
    {name: "5", image:"https://static01.nyt.com/images/2018/01/02/science/02SCI-MIND/merlin_131683850_13f8c9fe-affa-48bf-ab41-66ed93c2394a-articleLarge.jpg?quality=75&auto=webp&disable=upscale"},
    {name: "6", image:"https://i.dailymail.co.uk/i/pix/2014/08/20/article-2729488-20A6089100000578-282_634x627.jpg"},
];

app.get("/", function(req, res){
    res.render("landing");
});

app.get("/campgrounds", function(req, res){
    res.render("campgrounds", {campgrounds: campgrounds});
});

app.post("/campgrounds", function(req, res){
    // get data from form and add to campgrounds array
    // redirect back to campgrounds page
    var name = req.body.name;
    var image = req.body.image;
    var newCampground = {name: name, image: image};
    campgrounds.push(newCampground);
    res.redirect("/campgrounds");
});

app.get("/campgrounds/new", function(req, res){
    res.render("new.ejs");
});

app.listen("3000", "127.0.0.1", function(){
    console.log("The YelpCamp Server has started!");
});

