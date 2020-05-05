//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _=require("lodash");
const app = express();



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://nakul-admin:nakul@cluster-ffwly.mongodb.net/todolistDB" , { useNewUrlParser: true , useUnifiedTopology: true});

const itemsSchema = {
  name : String,
}

const Item = mongoose.model("item" , itemsSchema);

const read = new Item({
  name : "Read",
});

const write = new Item({
  name : "Write",
});

const sleep = new Item({
  name : "sleep",
});

const timepass = [read , write , sleep];


const listsSchema = {
  name : String,
  items : [itemsSchema]
}

const List = mongoose.model("list" , listsSchema);





app.get("/", function(req, res) {

// const day = date.getDate();
Item.find({} , function(err , item) {

if (item.length == 0) {

  Item.insertMany(timepass , function (err) {
    if(err){
      console.log(err);
    }else {
      console.log("added succesful");
    }
  });

res.redirect("/");

} else {
    res.render("list", {listTitle: "Today", newListItems: item});
}


  });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;


if (itemName !== "") {
  const newItem = new Item({
    name : itemName,
  });
  newItem.save();
  res.redirect("/");
}else {
  res.redirect("/");
}


});

app.get("/about", function(req, res){
  res.render("about");
});


app.post("/delete", function(req, res){
const itemId = req.body.checkbox;
console.log(itemId);

Item.findByIdAndRemove(itemId , function (err) {
  console.log(err);
})

res.redirect("/");

});



app.get("/:post" , function (req ,res) {
const title =_.capitalize(req.params.post);


List.findOne({name: title} , function(err , item) {

if (!item) {
  const list = new List({
    name: title,
    items: timepass,
  });

  list.save();

res.redirect("/"+title);

} else {
  console.log(item);
res.render("custom", {listTitle: title, newListItems: item.items});
}

});
});

app.post("/custom" , function (req ,res) {

  const itemName = req.body.newItem;
const title = req.body.list;

const newItem = new Item({
name : itemName,
});

List.findOne({name: title} , function (err , gotitem) {
  gotitem.items.push(newItem);
  gotitem.save();
  res.redirect("/"+title);
});

});



app.post("/customdelete", function(req, res){
const itemId = req.body.checkbox;
console.log(itemId);
const title = req.body.listName;


List.findOneAndUpdate({name : title} , {$pull : {items : {_id : itemId}}} , function (err , foundItem) {
  res.redirect("/"+title);
})



});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
