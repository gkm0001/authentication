import express from 'express';
import path from 'path'
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

mongoose.connect("mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.10.5",{
    dbName:"backend",
})
.then(()=>console.log("Database connected"))
.catch((e) => console.log(e));

const userSchema = new mongoose.Schema({
     name: String,
     email:String,
     password: String,
});

const User = mongoose.model("User",userSchema);
const users = []
const app = express();


app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());

app.set("view engine","ejs");


 const isAuthenticated = async (req,res,next) =>{
    const {token} = req.cookies;

    if(token) {
       const decoded =  jwt.verify(token,"sdjfslddsjlas")

       req.user = await User.findById(decoded._id)

       console.log(decoded )
         next();
    }
    else{
        res.redirect("/login")
    }
};

app.get("/",isAuthenticated,(req,res) => {

    
    res.render("logout",{name:req.user.name});
});


app.get("/register",(req,res) => {

    
    res.render("register");
});

app.post('/login',async(req,res) => {

    const {email, password} = req.body;

    let user = await User.findOne({email});

    if(!user) return res.redirect("/register")

    const isMatch =  await bcrypt.compare(password,user.password);

    
     
    if(!isMatch) return res.render("login",{email,message:"Incorrect password "});

    const token = jwt.sign({_id:user._id},"sdjfslddsjlas");
    
 
    res.cookie("token",token, {
        httpOnly:true,
        expires:new Date(Date.now()+60*1000),
    });
    res.redirect("/")
})

app.get('/login',(req,res) => {
     res.render("login");
})


 app.post('/register',async(req,res)=>{
     
    const { name,email,password} = req.body;

    let user = await User.findOne({email});

    if(user){
       return res.redirect("/login");
    }

    const hashedPassword = await bcrypt.hash(password,10)
      user = await User.create({
         name,
         email,
         password:hashedPassword,
    });

    const token = jwt.sign({_id:user._id},"sdjfslddsjlas");
    
 
    res.cookie("token",token, {
        httpOnly:true,
        expires:new Date(Date.now()+60*1000),
    });
    res.redirect("/")
})

app.get("/logout",(req,res) =>{
    res.cookie("token",null,{
        httpOnly:true,
        expires:new Date(Date.now()),
    });
    res.redirect("/")
})
 
app.listen(5000,() =>{
    console.log("Srver is working")
});


















// app.get("/success",(req,res ) =>{  
    
     
//     res.render("success" );
    
// });
 

// app.post("/contact",async (req,res) => {
//       const {name,email} = req.body;
      
//      await message.create({name,email});
//      res.redirect("/success");
// })
// app.post("/contact",(req,res)=> {
//      console.log(req.body.name);
//      users.push({username:req.body.name,email:req.body.email});

//      res.redirect("/success");
// })

// app.get("/users",(req,res) => {
//      res.json ({
//         users
//      });
// })

// app.get("/add",async (req,res ) =>{
    
//     await message.create({name:"Gkm01",email:"smalks@gmail.com"}) 
//         res.send("Nice")
     
     
    
// });



// app.get("/",(req,res ) =>{
    //     const {token} =  req.cookies ;
        
    //     if(token){
    //         res.render("logout");
    //     }
    //     else {
    //         res.render("login");
    //         } 
        
    // });