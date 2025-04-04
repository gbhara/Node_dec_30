var express= require('express');
var cors= require('cors');
var app = express();
const bodyparser = require('body-parser')
var dotenv= require('dotenv').config();
var db = require('./Modal/db');
var port = process.env.PORT;
var productController = require('./Controller/ProductController')
var multer = require('multer')
var path = require('path');
var userroute = require('./Route/userroute')
var session = require('express-session')
var Auth = require('./Middleware/Auth');
var productroute= require('./Route/product');
var ApiRoute = require('./Route/apiroute')

var hbs = require('hbs');

hbs.registerHelper("multiple",function(index,value){
    return index * value;
}
);
hbs.registerHelper("addition",function(index,value){
    return index + value;
}
);

// Body-parser middleware
app.use(bodyparser.urlencoded({ extended: true }))
app.use(bodyparser.json())

//session
app.use(session({ 
  
    // It holds the secret key for session 
    secret: 'nodeapp', 
    resave: true,
    saveUninitialized: false,
    cookie: {
        expires: 60000 *30
    } 
    
})) 

app.set('view engine','hbs');
hbs.registerPartials(__dirname+'views');

app.use("/upload",express.static(path.join(__dirname,'upload')));

app.use('/users',userroute);
app.use('/products',productroute);
app.use('/api/',ApiRoute)
app.get('/addproduct',async(req,res)=>{
    res.render('index.hbs');
})
//create storage for file upload 
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'upload/')
    },
    filename:(req,file,cb)=>{
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const uploadFile = multer({storage});

app.post('/productadd',uploadFile.single('pimg'),(req,res)=>{
    productController.addProduct(req,res,(data,err)=>{
        if(data){
            res.redirect('/viewproduct');
        }
        else{
            res.status(500).json(err);
        }
    })
})
app.get('/viewproduct',(req,res)=>{
    productController.viewProduct(req,res,(data,err)=>{
        if(data){
            res.render('viewproduct.hbs',{product:data});
        }
    });
})

app.get('/editproduct/:id',(req,res)=>{
     productController.editProduct(req,res,(data,err)=>{
        if(data){
            res.render('editproduct.hbs',{product:data});
        }
     })
})

app.post('/productupdate/:id',uploadFile.single('pimg'),(req,res)=>{
   productController.updateProduct(req,res,(data,err)=>{
    if(data){
        res.redirect('/viewproduct');
    }
    else{
        res.status(500).json({"error":err});
    }
   })
})

app.post('/deleteproduct/:id',(req,res)=>{
    productController.deleteProduct(req,res,(data,err)=>{
        if(data){
            res.redirect('/viewproduct');
        }else{
            res.status(500).json(err);
        }
    })
})

app.listen(port,()=>{
    console.log(`app listing on ${port}`);
})