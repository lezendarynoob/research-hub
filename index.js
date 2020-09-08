var express=require('express'),
    app= express(),
    PORT=process.env.PORT || 3000,
    bodyParser=require('body-parser'),
    ejs=require('ejs'),
    expressLayout=require('express-ejs-layouts'),
    path=require('path')

    app.use(bodyParser.urlencoded({ extended: true }));

//Setting View Engine
// app.use(expressLayout)
app.use(express.static(__dirname + '/public'));
app.set('view engine','ejs')


//Routes
app.get('/',function(req,res){
    res.render('home')
})






app.listen(PORT,function(){
    console.log("Research Paper Application has Started!")

});


