const express = require('express')
const app = express()
const port = process.env.PORT || 8000;
const cors = require('cors')
const jwt = require('jsonwebtoken')


//middlewares 
app.use([cors(), express.json()])


require('dotenv').config()
require('colors')

app.get('/', (req, res) =>{
    res.json('House Hunter is running ')
})
app.listen(port, () =>{
    console.log('Server is running on  .. ', port);
})