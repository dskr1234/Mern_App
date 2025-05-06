const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

//user Schema 

const UserSchema = new mongoose.Schema({
id: {type: String,required: true, unique: true},
email: {type: String,required: true, unique: true},
password: {type: String,required: true}
})
const Person = mongoose.model('Person',UserSchema,'persons');

app.use(cors());
app.use(express.json());


app.post('/add',async(req,res)=>{
 const {id,email,password}=req.body;
 if (!id || !email || !password){
    return res.status(401).json({message: 'All fields are required'})
 }else{
    try{
        const hashed = await bcrypt.hash(password,10);
        await new Person({id,email,password: hashed}).save();
        return res.status(201).json({message: 'User added successfully'})
     }catch(err){
        if(err.code === 11000){
            return res.status(400).json({message: 'User already exist'})
        }else{
            return res.status(500).json({message: err.message})
        }
        
     }
 }
 
})

app.post('/login',async(req,res)=>{
    const {email,password} = req.body;
    if(!email.trim() || !password.trim()){
        return res.status(400).json({message: 'All fields are required'})
    }else{
        try{
            const us = await Person.findOne({email})
            if(!us){
                return res.status(404).json({message: 'User not found'})
            }
            const isMatch = await bcrypt.compare(password,us.password)
            if(!isMatch){
                return res.status(401).json({message: 'Invalid password'})
            }else{
                const payload = {userId: us.id,email: us.email}
                const token = jwt.sign(payload,process.env.JWT_SECRET)
                return res.status(200).json({message: 'Login Successfull and redirecting to home',token,us})
            }
            
        }catch(err){
return res.status(500).json({message: 'Database error'})
        }
    }
})

app.get('/user/:id', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Token missing' });
  
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.userId !== req.params.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
  
      const userr = await Person.findOne({ id: req.params.id }).select('-password');
      return res.status(200).json({ message: 'User fetched successfully', userr });
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  });

  app.put('/update',async(req,res)=>{
    const {email,password}=req.body;
    if(!email.trim() || !password.trim()){
        return res.status(404).json({message: 'All fields are required'})
    }else{
        try{
            const user = await Person.findOne({email})
            const hasheded = await bcrypt.hash(password,10);
            await Person.updateOne({email: email},{$set: {password: hasheded}})
            return res.status(200).json({message: 'Password Updated'})
        }catch(err){
            res.status(500).json({message: 'Database Error'})
        }

    }
  })
  
mongoose.connect(process.env.MONGO_URI)

.then(()=>{
    console.log('Mongoo Connected');
    app.listen(5000,()=>{
        console.log('Server is running at http://localhost:5000');
    })
})
.catch((err)=>{
    console.error('Error occured while connecting to mongooose',err)
})