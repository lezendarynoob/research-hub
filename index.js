const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require("passport-local");
const mongoose = require('mongoose');
const publicationDetails = require('./models/publications');
const targetDetails = require('./models/setTarget');
const User = require('./models/user');

mongoose.connect("mongodb://localhost/researchApp", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
});



app.use(bodyParser.urlencoded({
    extended: true
}));

//Setting View Engine
// app.use(expressLayout)
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs')

//Passport Configuration
app.use(require('express-session')({
    secret: "Coding till infinity",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());

app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
})



//Routes

app.get('/', function(req, res) {

    if (req.user) {
        res.redirect('/login', {
            // currentUser: req.user.firstName,
            // lastName: req.user.lastName,
            // School : req.user.School,
            // WebOfScience : req.user.WebOfScience,
            // ScorpusId : req.user.ScorpusId,
            // GoogleScholarId: req.user.GoogleScholarId,
            // OrchidId: req.user.OrchidId


        });
    } else {
        res.render('home');
    }
})

//PUBLICATION 
app.get("/publication", async function(req, res) {

    try {
        let publications = []

        for (let i = 0; i < req.user.publications.length; i++) {
            let pub = await publicationDetails.findById(req.user.publications[i]);
            publications.push(pub);
        }

        res.render("papers", {
            rPapers: publications,
            currentUser: req.user.firstName,
            lastName: req.user.lastName,
            School: req.user.School,
            WebOfScience: req.user.WebOfScience,
            ScorpusId: req.user.ScorpusId,
            GoogleScholarId: req.user.GoogleScholarId,
            OrchidId: req.user.OrchidId
        });


    } catch (err) {
        console.log(err);
    }
});


app.post("/publication", function(req, res) {
    var Category = req.body.category;
    var author = req.body.author;
    var title = req.body.title;
    var journal_name = req.body.journal_name;
    var publication_title = req.body.publication_title;
    var volume_number = req.body.volume_number;
    var issue_number = req.body.issue_number;
    var page_number = req.body.page_number;
    var issn_number = req.body.issn_number;
    var pindexing = req.body.pindexing;

    let users = req.body.author.split(',');


    var newPublication = {
        Category: Category,
        author: author,
        title: title,
        journal_name: journal_name,
        publication_title: publication_title,
        volume_number: volume_number,
        issue_number: issue_number,
        page_number: page_number,
        issn_number: issn_number,
        pindexing: pindexing

    }
    publicationDetails.create(newPublication, async function(err, newPublication) {
        if (err) {
            console.log(err);
        } else {
            //redirect back to the research papers Page
            for (let i = 0; i < users.length; i++) {
                let user = await User.findOne({
                    username: users[i].trim()
                }).exec();
                if (user) {
                    user.publications.push(newPublication._id);
                    await user.save();
                } else {
                    continue;
                }
            }
            res.redirect("/publication");
        }
    })

})
app.get("/publication/new", function(req, res) {
    res.render("newPublication", {
        currentUser: req.user.firstName,
        username: req.user.username,
        grade: req.user.Grade,
        lastName: req.user.lastName,
        School: req.user.School,
        WebOfScience: req.user.WebOfScience,
        ScorpusId: req.user.ScorpusId,
        GoogleScholarId: req.user.GoogleScholarId,
        OrchidId: req.user.OrchidId
    });
})

app.get("/profile", function(req, res) {
    res.render("profile");

})
app.get("/profile/edit", function(req, res) {
    res.render("edit_profile", {
        currentUser: req.user.firstName,
        username: req.user.username,
        grade: req.user.Grade,
        lastName: req.user.lastName,
        School: req.user.School,
        WebOfScience: req.user.WebOfScience,
        ScorpusId: req.user.ScorpusId,
        GoogleScholarId: req.user.GoogleScholarId,
        OrchidId: req.user.OrchidId
    });
})


//SET TARGETcurrentUser: req.user.firstName
app.get("/settarget", function(req, res) {
    targetDetails.find({}, function(err, target) {
        if (err) {
            console.log(err);
        } else {
            res.render("targetDetails", {
                setTarget: target,
                currentUser: req.user.firstName,
                lastName: req.user.lastName,
                School: req.user.School,
                WebOfScience: req.user.WebOfScience,
                ScorpusId: req.user.ScorpusId,
                GoogleScholarId: req.user.GoogleScholarId,
                OrchidId: req.user.OrchidId
            })
        }
    })
})

app.post("/settarget", function(req, res) {
    var category_set_trgt = req.body.category_set_trgt;
    var title_set_trgt = req.body.title_set_trgt;
    var indexing = req.body.indexing_set_trgt;
    var achievement_date_set_trgt = req.body.achievement_date_set_trgt;

    var newTarget = {
        category_set_trgt: category_set_trgt,
        title_set_trgt: title_set_trgt,
        indexing: indexing,
        achievement_date_set_trgt: achievement_date_set_trgt
    }


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

app.get("/settarget/new", function(req, res) {
    res.render("newTarget", {
        currentUser: req.user.firstName,
        username: req.user.username,
        grade: req.user.Grade,
        lastName: req.user.lastName,
        School: req.user.School,
        WebOfScience: req.user.WebOfScience,
        ScorpusId: req.user.ScorpusId,
        GoogleScholarId: req.user.GoogleScholarId,
        OrchidId: req.user.OrchidId
    });
})

app.get("/studpub", function(req, res) {
    res.render("student_publication", {
        currentUser: req.user.firstName,
        username: req.user.username,
        grade: req.user.Grade,
        lastName: req.user.lastName,
        School: req.user.School,
        WebOfScience: req.user.WebOfScience,
        ScorpusId: req.user.ScorpusId,
        GoogleScholarId: req.user.GoogleScholarId,
        OrchidId: req.user.OrchidId

    });
})
app.get("/fundprj", function(req, res) {
    res.render("funded_project", {
        currentUser: req.user.firstName,
        username: req.user.username,
        grade: req.user.Grade,
        lastName: req.user.lastName,
        School: req.user.School,
        WebOfScience: req.user.WebOfScience,
        ScorpusId: req.user.ScorpusId,
        GoogleScholarId: req.user.GoogleScholarId,
        OrchidId: req.user.OrchidId
    });
})
app.get("/publication/:id", function(req, res) {

})

//AUTH Routes
app.get("/register", function(req, res) {
    res.render("register");
});
app.post("/register", function(req, res) {

    let user = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        School: req.body.School,
        Grade: req.body.Grade,
        WebOfScience: req.body.WebOfScience,
        ScorpusId: req.body.ScorpusId,
        GoogleScholarId: req.body.GoogleScholarId,
        OrchidId: req.body.OrchidId,
        emailId: req.body.email

    });

    User.register(user, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function() {
            res.redirect("/login");
        });

    });
});


//LOGIN
app.get("/login", function(req, res) {
    res.render("login", {
        currentUser: req.user.firstName,
        username: req.user.username,
        grade: req.user.Grade,
        lastName: req.user.lastName,
        School: req.user.School,
        WebOfScience: req.user.WebOfScience,
        ScorpusId: req.user.ScorpusId,
        GoogleScholarId: req.user.GoogleScholarId,
        OrchidId: req.user.OrchidId
    });
})
app.post("/login", passport.authenticate("local", {
    successRedirect: "/login",
    failureRedirect: "/"
}), function(req, res) {

});

//LOGOUT 
app.get("/logout", function(req, res) {
    req.logout();

    res.redirect("/");
})


app.listen(PORT, function() {
    console.log("Research Paper Application has Started!")

});