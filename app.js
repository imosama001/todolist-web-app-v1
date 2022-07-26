//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const app = express();
const _ =require("lodash");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://osama:asdf1234@cluster0.jvgde.mongodb.net/todoListDB",);

const itemsSchema=({
   name:String,
});
const Item=new mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome to todo list"
});
const item2=new Item({
  name:"Hit the + button to add new item"
});
const item3=new Item({
  name:"Hit this to delete an item"
});

const defaultItems=[item1,item2,item3];

const ListSchema={
  name:String,
  items:[itemsSchema],
};
const List=mongoose.model("List",ListSchema);

app.get("/", function(req, res) {

  Item.find({},(err,foundItems)=>{
    if(foundItems.length===0){
      Item.insertMany(defaultItems,(err)=>{
      if(err){
      console.log(err);
      } else{
         console.log("Successfully added default to database");
     }
    });
    res.redirect("/");
    }
      else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
  });

});

app.get("/:customListName",(req,res)=>{
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName},(err,foundList)=>{
    if(!err){
      if(!foundList){
        //create new list
        const list=new List({
          name :customListName,
          items:defaultItems,
        });
        list.save();
        res.redirect("/"+customListName);
      } else{
        //show new list
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
      }
    } else{
      console.log(err);
    }
  });

  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name:itemName,
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name:listName},(err,foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete",(req,res)=>{
 // console.log(req.body.checkbox);
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndDelete(checkedItemId,(err)=>{
      if(err){
        console.log(err);
      }else{
        console.log("successfully deleted"+checkedItemId);
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},(err)=>{
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

})
app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

const port=process.env.PORT || 3000;

app.listen(port, function() {
  console.log("Server started on port "+port);
});
