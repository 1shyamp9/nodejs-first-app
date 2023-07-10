import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(path.resolve(), "public")))
app.set("view engine", "ejs");
app.use(cookieParser())

mongoose.connect("mongodb://127.0.0.1:27017/Sample").then(() => {
    console.log("Connected To MongoDB");
}).catch((e) => { console.log(e); })

const studentSchema = new mongoose.Schema({ name: String, email: String, password: String });
const User = new mongoose.model("User", studentSchema);



// app.get('/', (req,res)=>{
//     res.render("index",{name:"Register Form"})
//     // res.sendFile("index")
// })
// app.get('/success', (req,res)=>{
//     res.render("success") ;
// })
// app.get('/users', async(req,res)=>{
//     const {name,email} = req.body;
// ;     await User.create(name,email)
// })
// app.post('/', (req,res)=>{
//     users.push({
//         "name":req.body.name,
//         "email":req.body.email
//     });
//     res.redirect('/success')
// })
// app.post('/', async(req,res)=>{
//     const {name,email} = req.body
//     await User.create({name,email});
//         res.redirect('/success')
// })
// ======================= Login LogOut Authentication ===========================

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
        return res.redirect('/login');
    } else {
        const hashedPass = await bcrypt.hash(password,10);
        user = await User.create({ name, email, password:hashedPass, });

        const token = jwt.sign({ _id: user._id }, "asdasdasdasdas");

        res.cookie("token", token, {
            httpOnly: true,
            // expires:new Date(Date.now()+60*1000)
        });
        res.redirect("/")
    }
})
app.get('/register', (req, res) => {
    res.render('register')
})
app.get('/', async (req, res) => {
    const { token } = req.cookies;
    if (token) {
        const decodedData = jwt.verify(token, "asdasdasdasdas")
        req.user = await User.findById(decodedData._id);
        res.render("logout", { name: req.user.name, email: req.user.email })
    } else {
        res.redirect("login")
    }
})
app.get('/login', (req, res) => {
    res.render("login")
})
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const varifyUser = await User.findOne({ email });

    if (!varifyUser) return res.redirect('/register');

    const varifyPass = await bcrypt.compare(password , varifyUser.password)

    if (!varifyPass) return res.render('login', { message: "Password is Incurrect" ,email})

    const token = jwt.sign({ _id: varifyUser._id }, "asdasdasdasdas");

    res.cookie("token", token, {
        httpOnly: true, 
    });
    res.redirect("/")

})
app.get('/logout', (req, res) => {
    res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now())
    });
    res.redirect("/")
})

app.listen(5000, () => {
    console.log("Server is Start On http://localhost:4500");
})