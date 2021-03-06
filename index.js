const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require("passport-local");
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const publicationDetails = require('./models/publications');
const targetDetails = require('./models/setTarget');
const User = require('./models/user');
const studentPublicationDetails = require('./models/studentPub')
const fundedProject = require('./models/fundedProject.js');
const studentPub = require('./models/studentPub');
const e = require('express');

mongoose.connect("mongodb://localhost/researchApp", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
});





app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(fileUpload());
//Setting View Engine
// app.use(expressLayout)
app.use(express.static(__dirname + '/public'));
app.use('/file', express.static(__dirname + '/public/uploads'));
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

var currentDateTime = new Date();

//Routes


// Login Page
app.get('/', function(req, res) {
    if (req.user) {
        if (req.user.isAdmin == 1) {
            res.redirect(301, '/admlogin')
        } else {
            res.redirect(301, '/login')
        }
    } else {
        res.render('home');
    }
})

//PUBLICATION 
app.get("/publication", async function(req, res) {

    if (req.user.isAdmin != 1) {
        try {
            let publications = []
            let canDelete = []

            for (let i = 0; i < req.user.publications.length; i++) {
                let pub = await publicationDetails.findById(req.user.publications[i]);
                publications.push(pub);
                if(pub.createdBy == req.user._id){
                    canDelete.push(true);
                }else{
                    canDelete.push(false);
                }
            }

            res.render("papers", {
                rPapers: publications,
                canDelete: canDelete,
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
    }
});

app.get("/admpublication", async function(req, res) {
    if (req.user.isAdmin == 1) {
        // Pass All publications
        let publications = []
        await publicationDetails.find({}, async function(err, result) {
            if (err) {
                console.log(err);
            } else {
                publications = result;
            }
        });

        res.render("admpapers", {
            rPapers: publications,
            currentUser: req.user.firstName,
            lastName: req.user.lastName,
            School: req.user.School,
            WebOfScience: req.user.WebOfScience,
            ScorpusId: req.user.ScorpusId,
            GoogleScholarId: req.user.GoogleScholarId,
            OrchidId: req.user.OrchidId
        });
    } else {
        res.redirect("/publication")
    }
});





app.post("/publication", function(req, res) {
    var Category = req.body.category;
    var title = req.body.title;
    var journal_name = req.body.journal_name;
    var publication_title = req.body.publication_title;
    var volume_number = req.body.volume_number;
    var issue_number = req.body.issue_number;
    var page_number = req.body.page_number;
    var issn_number = req.body.issn_number;
    var pindexing = req.body.pindexing;

    let users = req.body.author.split(',');

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.pubfile;

    // Use the mv() method to place the file somewhere on your server
    let path = issn_number + Date.now() + sampleFile.name;
    sampleFile.mv(__dirname + '/public/uploads/' + path, function(err) {
        if (err)
            return res.status(500).send(err);

        console.log(path);
    });


    var newPublication = {
        Category: Category,
        title: title,
        journal_name: journal_name,
        publication_title: publication_title,
        volume_number: volume_number,
        issue_number: issue_number,
        page_number: page_number,
        issn_number: issn_number,
        pindexing: pindexing,
        fileURI: path,
        createdBy: req.user._id

    }
    publicationDetails.create(newPublication, async function(err, newPublication) {
        if (err) {
            console.log(err);
        } else {
            //redirect back to the research papers Page
            var author = '';
            for (let i = 0; i < users.length; i++) {
                let user = await User.findOne({
                    username: users[i].trim()
                }).exec();
                if (user) {
                    user.publications.push(newPublication._id);
                    await user.save();
                    if(i === users.length - 1){
                        author = author + user.firstName + ' ' + user.lastName
                    }else{
                        author = author + user.firstName + ' ' + user.lastName + ','
                    }
                    
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
app.get("/publication/edit", async function(req, res) {
    console.log("Edit Profile")
    let publication = await publicationDetails.findById(req.query.puid)
    res.render("editPublication", {
        currentUser: req.user.firstName,
        username: req.user.username,
        grade: req.user.Grade,
        lastName: req.user.lastName,
        School: req.user.School,
        WebOfScience: req.user.WebOfScience,
        ScorpusId: req.user.ScorpusId,
        GoogleScholarId: req.user.GoogleScholarId,
        OrchidId: req.user.OrchidId,
        author: publication.author,
        publication_title: publication.publication_title,
        journal_name: publication.journal_name,
        volume_number: publication.volume_number,
        issue_number: publication.issue_number,
        page_number: publication.page_number,
        issn_number: publication.issn_number,
        pindexing: publication.pindexing,
        pubid: publication._id
    });
})
app.post('/publication/edit', async function(req, res) {
    updatepubRecord(req, res);
    res.redirect('/publication');

});

function updatepubRecord(req, res) {
    publicationDetails.findOne({
        _id: req.body.pubid
    }, (err, pub) => {
        //this will give you the document what you want to update.. then 
        pub.author = req.body.author;
        pub.publication_title = req.body.publication_title;
        pub.journal_name = req.body.journal_name;
        pub.volume_number = req.body.volume_number;
        pub.issue_number = req.body.issue_number;
        pub.page_number = req.body.page_number;
        pub.issn_number = req.body.issn_number;
        pub.pindexing = req.body.pindexing;
        // then save that document
        pub.save();

    });

}

app.post('/delete', async function(req, res){
    let pub = await publicationDetails.findById(req.body.id);
    if(req.user.isAdmin == 1 || pub.createdBy == req.user._id){
        await pub.deleteOne();
        
    }
    res.redirect('/publication');
});


// Publication Ends

// Profile
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
});


// 
app.post('/profile/edit', async function(req, res) {
    updateRecord(req, res);
    res.redirect('/login');

});

function updateRecord(req, res) {
    User.findOne({
        _id: req.user._id
    }, (err, user) => {
        //this will give you the document what you want to update.. then 
        user.ScorpusId = req.body.ScorpusId;
        user.OrchidId = req.body.OrchidId;
        user.GoogleScholarId = req.body.GoogleScholarId;
        user.WebOfScience = req.body.WebOfScience; //so on and so forth

        // then save that document
        user.save();

    });

}
// 



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
    // Set Target End

// Student Publication Start

app.get("/studpub", async function(req, res) {
    if (req.user.isAdmin != 1) {
        try {
            let studPublications = []

            for (let i = 0; i < req.user.studPublications.length; i++) {
                let spub = await studentPublicationDetails.findById(req.user.studPublications[i]);
                studPublications.push(spub);
            }

            res.render("student_view", {
                sPapers: studPublications,
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
    } else {
        res.redirect("/admstudpub")
    }
});



app.get("/admstudpub", async function(req, res) {
    if (req.user.isAdmin == 1) {
        // Pass all student Publication here
        let studPublications = []

        await studentPub.find({}, async function(err, result) {
            if (err) {
                console.log(err);
            } else {
                studPublications = result;
            }
        });

        res.render("admstudent_view", {
            sPapers: studPublications,
            currentUser: req.user.firstName,
            lastName: req.user.lastName,
            School: req.user.School,
            WebOfScience: req.user.WebOfScience,
            ScorpusId: req.user.ScorpusId,
            GoogleScholarId: req.user.GoogleScholarId,
            OrchidId: req.user.OrchidId
        });

    } else {
        res.redirect("/studpub");
    }
});



app.post("/studpub", function(req, res) {
    var studentName = req.body.student_name;
    var enrollmentNumber = req.body.enrollment_number;
    var volume_number = req.body.volume_number_studpub;
    var semester = req.body.semester;
    var program = req.body.program_studpub;
    var category = req.body.category_studpub;
    var pubTitle = req.body.title_studpub;
    var journalName = req.body.journal_name_studpub;
    var issueNum = req.body.issue_number_studpub;
    var pageNumber = req.body.page_number_studpub;
    var issnNumber = req.body.issn_number_studpub;
    var indexing = req.body.indexing_studpub;


    let users = req.body.author_studpub.split(',');

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.stupubfile;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv('./Student Publication Uploads/' + enrollmentNumber + pubTitle + currentDateTime, function(err) {
        if (err)
            return res.status(500).send(err);

        res.send('File uploaded!');
        return;
    });


    var newStuPublication = {
        studentName: studentName,
        enrollmentNum: enrollmentNumber,
        semester: semester,
        program: program,
        category: category,
        publicationTitle: pubTitle,
        journalName: journalName,
        volumeNum: volume_number,
        issueNum: issueNum,
        pageNum: pageNumber,
        issnNum: issnNumber,
        indexing: indexing
    }
    studentPublicationDetails.create(newStuPublication, async function(err, newStuPublication) {
        if (err) {
            console.log(err);
        } else {
            //redirect back to the research papers Page
            for (let i = 0; i < users.length; i++) {
                let user = await User.findOne({
                    username: users[i].trim()
                }).exec();
                if (user) {
                    user.studPublications.push(newStuPublication._id);
                    await user.save();
                } else {
                    continue;
                }
            }
            res.redirect("/studpub");
        }
    })

})

app.get("/studpub/new", function(req, res) {
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
app.get("/studpub/edit", async function(req, res) {
    console.log("Edit Profile")
    let publication = await studentPublicationDetails.findById(req.query.puid)
    res.render("student_publication_edit", {
        currentUser: req.user.firstName,
        username: req.user.username,
        grade: req.user.Grade,
        lastName: req.user.lastName,
        School: req.user.School,
        WebOfScience: req.user.WebOfScience,
        ScorpusId: req.user.ScorpusId,
        GoogleScholarId: req.user.GoogleScholarId,
        OrchidId: req.user.OrchidId,

        student_name: publication.studentName,
        enrollment_number: publication.enrollmentNum,
        semester: publication.semester,
        program_studpub: publication.program,
        author_studpub: publication.authorName,
        journal_name_studpub: publication.journalName,
        volume_number_studpub: publication.volumeNum,
        issue_number_studpub: publication.issueNum,
        page_number_studpub: publication.pageNum,
        issn_number_studpub: publication.issnNum,
        indexing_studpub: publication.indexing,
        pubid: publication._id
    });
})
app.post('/studpub/edit', async function(req, res) {
    updatestupubRecord(req, res);
    res.redirect('/studpub');

});

function updatestupubRecord(req, res) {
    studentPublicationDetails.findOne({
        _id: req.body.pubid
    }, (err, pub) => {
        //this will give you the document what you want to update.. then 
        pub.studentName = req.body.student_name;
        pub.enrollmentNum = req.body.enrollment_number;
        pub.semester = req.body.semester;
        pub.publicationTitle = req.body.program_studpub;
        pub.journalName = req.body.journal_name_studpub;
        pub.volumeNum = req.body.volume_number_studpub;
        pub.issueNum = req.body.issue_number_studpub;
        pub.pageNum = req.body.page_number_studpub;
        pub.issnNum = req.body.issn_number_studpub;
        pub.indexing = req.body.indexing_studpub;
        // then save that document
        pub.save();

    });

}




// STUDENT PUBLICATION ENDS

// Funded Project Starts
app.get("/fundprj", async function(req, res) {
    if (req.user.isAdmin != 1) {


        try {
            let fundProject = []

            for (let i = 0; i < req.user.fundProjects.length; i++) {
                let fpro = await fundedProject.findById(req.user.fundProjects[i]);
                fundProject.push(fpro);
            }

            res.render("funded_project_view", {
                fDetails: fundProject,
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
    } else {
        res.redirect("/admfundprj")
    }
});


app.get("/admfundprj", async function(req, res) {
    if (req.user.isAdmin == 1) {


        // Pass all funded Project
        let fundProject = []
        await fundedProject.find({}, async function(err, result) {
            if (err) {
                console.log(err);
            } else {
                fundProject = result;
            }
        });


        res.render("admfunded_project_view", {
            fDetails: fundProject,
            currentUser: req.user.firstName,
            lastName: req.user.lastName,
            School: req.user.School,
            WebOfScience: req.user.WebOfScience,
            ScorpusId: req.user.ScorpusId,
            GoogleScholarId: req.user.GoogleScholarId,
            OrchidId: req.user.OrchidId
        });

    }

});

app.post("/fundprj", function(req, res) {
    var namePrincipalInvestigator = req.body.principal_investigator;
    var nameCoInvestigator = req.body.co_investigator;
    var title = req.body.title_fund_prj;
    var fundingAgency = req.body.funding_agency;
    var overallCost = req.body.Overall_cost;
    var startDate = req.body.start_date;
    var EndDate = req.body.end_date;



    let users = req.body.principal_investigator.split(',');

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.fundfile;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv('./Funded Project Uploads/' + users + nameCoInvestigator + title + currentDateTime, function(err) {
        if (err)
            return res.status(500).send(err);

        res.send('File uploaded!');
    });


    var newfundedproject = {
        namePrincipalInvestigator: namePrincipalInvestigator,
        nameCoInvestigator: nameCoInvestigator,
        title: title,
        fundingAgency: fundingAgency,
        overallCost: overallCost,
        startDate: startDate,
        EndDate: EndDate

    }
    fundedProject.create(newfundedproject, async function(err, newfundedproject) {
        if (err) {
            console.log(err);
        } else {
            //redirect back to the research papers Page
            for (let i = 0; i < users.length; i++) {
                let user = await User.findOne({
                    username: users[i].trim()
                }).exec();
                if (user) {
                    user.fundProjects.push(newfundedproject._id);
                    await user.save();
                } else {
                    continue;
                }
            }
            res.redirect("/fundprj");
        }
    })

})
app.get("/fundprj/new", function(req, res) {
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

app.get("/fundprj/edit", async function(req, res) {
    console.log("Edit Profile")
    let publication = await fundedProject.findById(req.query.puid)
    res.render("edit_funded_project", {
        currentUser: req.user.firstName,
        username: req.user.username,
        grade: req.user.Grade,
        lastName: req.user.lastName,
        School: req.user.School,
        WebOfScience: req.user.WebOfScience,
        ScorpusId: req.user.ScorpusId,
        GoogleScholarId: req.user.GoogleScholarId,
        OrchidId: req.user.OrchidId,

        namePrincipalInvestigator: publication.namePrincipalInvestigator,
        nameCoInvestigator: publication.nameCoInvestigator,
        title: publication.title,
        fundingAgency: publication.fundingAgency,
        overallCost: publication.overallCost,
        startDate: publication.startDate,
        EndDate: publication.EndDate,
        pubid: publication._id

    });
})
app.post('/fundprj/edit', async function(req, res) {
    updatefundpubRecord(req, res);
    res.redirect('/fundprj');

});

function updatefundpubRecord(req, res) {
    fundedProject.findOne({
        _id: req.body.pubid
    }, (err, pub) => {
        //this will give you the document what you want to update.. then 
        pub.namePrincipalInvestigator = req.body.principal_investigator;
        pub.nameCoInvestigator = req.body.co_investigator;
        pub.title = req.body.title_fund_prj;
        pub.fundingAgency = req.body.funding_agency;
        pub.overallCost = req.body.Overall_cost;
        pub.startDate = req.body.start_date;
        pub.EndDate = req.body.end_date;
        // then save that document
        pub.save();

    });

}


// Funded Project Ends
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
        emailId: req.body.email,
        isAdmin: req.body.isAdmin
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
app.get("/admlogin", function(req, res) {
    if (req.user.isAdmin == 1) {
        res.render("admlogin", {
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
    } else {
        res.redirect("/login")
    }
})

app.get("/login", function(req, res) {
    if (req.user.isAdmin == 1) {
        res.redirect("/admlogin")
    } else {
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
    }
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
