const express = require('express')
const app = express()
const port = process.env.PORT || 8000;
const cors = require('cors')
const jwt = require('jsonwebtoken')

const { MongoClient, ServerApiVersion } = require('mongodb');
const { config } = require('dotenv');

//middlewares 
app.use([cors(), express.json()])


require('dotenv').config()
require('colors')

// database connection  


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.afdwhlk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    console.log('Database Connected'.yellow);
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    const usersCollection = client.db('House-Hunter-DB').collection('users')
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");


    //save user in db and get jwt 
    app.post('/signup', async(req, res) =>{
        // Existing user check 
        //user creation 
        //Jeson web token generate 
        const {name, email, password, role, phoneNumber, image }  = req.body ;
        console.log(name, email);
        try{
            const existingUser = await  usersCollection.findOne({email: email})
            if(existingUser){
             return res.send('Email already exist  ')

            }
            else{
              const result = await usersCollection.insertOne({name, email, password, role, phoneNumber, image})
            const token = jwt.sign({email: result.email, id: result._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '24h'})
            console.log(result);
            res.send({message: 'User created', token: token, userInfo:{name, email, image, phoneNumber, role}})
            }

        }
        catch(err){
            console.log('Error: ',err);
            res.status(500).send('Server Error')
        }
    })

    ///Login user 
    app.post('/login', async(req,res)=>{
      const {email, password} = req.body;
      try{
        const existingUser = await usersCollection.findOne({email: {$eq: email}})
        if(!existingUser){
          return res.status(400).send("User Not found")
        }else{
            const matchedPassword = existingUser?.password
            if(matchedPassword == password){
              const token = jwt.sign({email: existingUser.email, id: existingUser._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '24h'})
              delete existingUser?.password 
              delete existingUser?._id
              return res.send({success: true,message:"Login successfull", token: token , userInfo: existingUser})
            }
            console.log(result);
         res.send({success: false, message: "wrong password"})
        }
      }
      catch(err){
        console.log(err)
        res.status(400).send('Server Error')
      }
    })

    //get all users  from our database 
    app.get('/users', async(req,res) =>{
    try{
      const users = await usersCollection.find({}).toArray()
      res.send(users)
    } catch(err){
      console.log(err)
    }
    })


} 
catch(err){
    console.log(`${err}`.red);
    
  }
  finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.json('House Hunter is running ')
})
app.listen(port, () =>{
    console.log('Server is running on  .. ', port);
})