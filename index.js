var express=require('express'),
    app= express(),
    PORT=process.env.PORT || 3000,
    ejs=require('ejs'),
    expressLayout=require('express-ejs-layouts'),
    path=require('path')




//Routes
app.get('/',function(req,res){
    res.render('home')
})

//Setting View Engine
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'))
app.set('view engine','ejs')


app.listen(PORT,function(){
    console.log("Research Paper Application has Started!")

});


