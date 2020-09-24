var mongoose=require('mongoose');
var setTargetSchema=new mongoose.Schema({
    category_set_trgt:String,
    title_set_trgt: String,
   indexing:String,
    achievement_date_set_trgt:Date

});

module.exports=mongoose.model("targetDetails",setTargetSchema);