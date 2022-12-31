const express = require('express');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000

const app = express()



app.use(cors())
app.use(express.json())




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fpgnyx0.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        
    }
    catch {
        
    }
    finally {
        
    }
}

run().catch(err=>console.log(err))

app.get('/', (req, res) => {
    res.send('Hello Word')

})
app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})