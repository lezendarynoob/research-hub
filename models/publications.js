var mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

var publicationDetailsSchema = new mongoose.Schema({
    Category: String,
    author: String,
    title: String,
    journal_name: String,
    publication_title: String,
    volume_number: String,
    issue_number: String,
    page_number: String,
    issn_number: String,
    pindexing: String,
    fileURI: String,
    createdBy: String


});

module.exports = mongoose.model("publicationDetails", publicationDetailsSchema);