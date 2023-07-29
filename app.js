const express = require('express');
const bodyparser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const e = require('express');

const app = express();
app.set("view engine","ejs");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://0.0.0.0:27017/todolist",{useNewUrlParser:true});
const itemsSchema = mongoose.Schema({
    name: String
});

const Item  = mongoose.model("Item",itemsSchema);

const listSchema = mongoose.Schema({
    name:String,
    items:[itemsSchema]
});

const List = mongoose.model("List",listSchema);

const item1 = new Item({
    name:"Welcome to our To-Do list"
});
const item2 = new Item({
    name:"Click + button to add new item"
});
const item3 = new Item({
    name:"<-- to delete item"
});

const defaultItem = [item1, item2, item3];



app.get('/', function(req, res) {
    
    Item.find(function(err, item) {
        
        if(item.length === 0) {
            Item.insertMany(defaultItem, function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Successfully added into defalut list");
                }
            });
            res.redirect('/')
        }else{
            res.render("list",{listTitle:"Today",newListItems:item});
            
        }
    });
    

});

app.get("/:customList",function(req, res){
    const customList = req.params.customList;
    List.findOne({name: customList},function(err, list) {
        if(!err){
            if(!list){
                const list = new List({
                    name: customList,
                    items:defaultItem
                });
                list.save();
            }else{
                res.render("list",{listTitle:list.name,newListItems:list.items});
            }
        }
    });
    

});

app.post('/', function(req, res){
    console.log(req.body);
    var text = req.body.newItem; 
    const listName = req.body.list;
   
    const item = new Item({
        name: text
    });
    if(listName === "Today"){
        item.save();    
        res.redirect('/');
    }else{  
        List.findOne({name:listName},function(err,list){
            if(!err){
                    list.items.push(item);
                    list.save();
                    res.redirect("/" + listName);
            }
        });
    }
});

app.post('/delete',function(req,res){
    const id = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
        Item.findByIdAndRemove(id,function(err){
            if(!err){
                console.log("Item deleted successfully");
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:id}}},function(err,list){
            if(!err){
                console.log("Item deleted successfully");
                res.redirect("/" + listName);
            }
        });
    }
});


app.get('/about',function(req, res){
    res.render("about");
});

app.listen(3000, function(){
    console.log("Server listening on port 3000");
});