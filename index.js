var express = require('express'),
    app = express(),
    PORT = process.env.PORT || 3000,
    bodyParser = require('body-parser'),
    ejs = require('ejs'),
    expressLayout = require('express-ejs-layouts'),
    path = require('path'),
    mongoose = require('mongoose');

app.use(bodyParser.urlencoded({
        extended: true
    }));
    

mongoose.connect("mongodb://localhost/researchApp", {
        useUnifiedTopology: true,
        useNewUrlParser: true,
});

//Setting View Engine
// app.use(expressLayout)
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs')

//SCHEMA 
var publicationDetailsSchema = new mongoose.Schema({
    Category:String,
    author: String,
    title: String,
    journal_name: String,
    publication_title: String,
    volume_number: String,
    issue_number: String,
    page_number:String,
    issn_number: String,
    pindexing: String,

    
});


var setTargetSchema=new mongoose.Schema({
    category_set_trgt:String,
    title_set_trgt: String,
   indexing:String,
    achievement_date_set_trgt:Date

});

//Making Schema Model

var publicationDetails = mongoose.model("publicationDetails", publicationDetailsSchema);
// publicationDetails.create( { 
//     Category: "One",
//     author: "K Ballamurgan",
//     title: "abc",
//     journal_name: "The Science",
//     publication_title:"Cs",
//     volume_number:"45C",
//     issue_number:"12869FGFG",
//     page_number:"67",
//     issn_number: "yidia00",
//     indexing: "general",



// } , function(err,publication){
//                         if(err){
//                             console.log(err);
//                         }else{
//                             console.log("Newly added Publication");
//                             console.log(publication);
//                         }
// });

var targetDetails=mongoose.model("targetDetails",setTargetSchema);
// targetDetails.create( { category_set_trgt : "One" ,
//                         title_set_trgt : "Boom On React",
//                         indexing_set_trgt : "general",
//                         achievement_date_set_trgt: "2020-12-10"
//                     } , function(err,target){
//                         if(err){
//                             console.log(err);
//                         }else{
//                             console.log("New target");
//                             console.log(target);
//                         }
// });

//Routes
app.get('/', function(req, res) {
    res.render('home')
})

app.get("/publication", function(req, res) {



    publicationDetails.find({}, function(err, publication) {
        if (err) {
            console.log(err);
        } else {
            res.render("papers", {
                rPapers: publication
            })
        }
    })
});

app.post("/publication", function(req, res) {
    var Category=req.body.category;
    var author = req.body.author;
    var title=req.body.title;
    var journal_name= req.body.journal_name;
    var publication_title= req.body.publication_title;
    var volume_number= req.body.volume_number;
    var issue_number= req.body.issue_number;
    var page_number= req.body.page_number;
    var issn_number= req.body.issn_number;
    var pindexing=req.body.pindexing;
   
   
    var newPublication = {
        Category:Category,
        author :author,
        title:title,
        journal_name:journal_name,
        publication_title:publication_title,
        volume_number:volume_number,
        issue_number:issue_number,
        page_number:page_number,
        issn_number:issn_number,
        pindexing:pindexing
       
    }
    publicationDetails.create(newPublication, function(err, newPublication) {
        if (err) {
            console.log(err);
        } else {
            //redirect back to the research papers Page
            res.redirect("/publication");
        }
    })

})

app.get("/publication/new", function(req, res) {
    res.render("newPublication");
})
app.get("/settarget", function(req, res) {
    targetDetails.find({}, function(err, target) {
        if (err) {
            console.log(err);
        } else {
            res.render("targetDetails", {
                setTarget: target
            })
        }
    })
})

app.post("/settarget", function(req, res) {
    var category_set_trgt= req.body.category_set_trgt;
    var title_set_trgt=req.body.title_set_trgt;
   var indexing=req.body.indexing_set_trgt;
    var achievement_date_set_trgt=req.body.achievement_date_set_trgt;

    var newTarget={
        category_set_trgt: category_set_trgt,
        title_set_trgt:title_set_trgt,
        indexing:indexing,
        achievement_date_set_trgt:achievement_date_set_trgt
    }

    console.log(newTarget);
    targetDetails.create(newTarget, function(err, newlyCreatedPaper) {
        if (err) {
            console.log(err);
        } else {
            //redirect back to the research papers Page
            // res.redirect("/research");
            res.redirect("/settarget");
        }
    })
})

app.get("/settarget/new", function(req, res){
    res.render("newTarget");
})



app.get("/studpub", function(req, res) {
    res.render("student_publication");
})
app.get("/fundprj", function(req, res) {
    res.render("funded_project");
})
app.get("/publication/:id", function(req, res) {

})

app.listen(PORT, function() {
    console.log("Research Paper Application has Started!")

});
