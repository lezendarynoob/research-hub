var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    School: String,
    Grade: String,
    WebOfScience: String,
    ScorpusId: String,
    GoogleScholarId: String,
    OrchidId: String,
    emailId: String,
    studPublications: [ObjectId],
    publications: [ObjectId],
    fundProjects: [ObjectId]

});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);