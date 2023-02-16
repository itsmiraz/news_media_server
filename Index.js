const express = require('express');
const cors = require('cors');
const app = express()
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()



app.use(cors())
app.use(express.json())
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fpgnyx0.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const newsCollection = client.db('newsCollections').collection('news')
        const catagoryCollection = client.db('newsCollections').collection('catagory')
        const usersCollection = client.db('newsCollections').collection('users')


        // User Api
        app.put("/user/:email", async (req, res) => {
            try {
                const email = req.params.email;

                // check the req
                const query = { email: email }
                const existingUser = await usersCollection.findOne(query)

                if (existingUser) {
                    console.log('user Exist')
                    const token = jwt.sign(
                        { email: email },
                        process.env.ACCESS_TOKEN_SECRET,
                        { expiresIn: "1d" }
                    )
                    return res.send({ data: token })
                }

                else {
                    console.log('user didnt exist')
                    const user = req.body;
                    const filter = { email: email };
                    const options = { upsert: true };
                    const updateDoc = {
                        $set: user
                    }
                    const result = await usersCollection.updateOne(filter, updateDoc, options);

                    // token generate 
                    const token = jwt.sign(
                        { email: email },
                        process.env.ACCESS_TOKEN_SECRET,
                        { expiresIn: "1d" }
                    )
                    return res.send({ data: token })

                }



            }
            catch (err) {
                console.log(err)
            }
        })

        app.get('/userdetail', async (req, res) => {
            const email = req.query.email;
            const query = {
                email: email
            }
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })
        app.put('/updateUser', async (req, res) => {
            const email = req.query.email;
            const body = req.body
            console.log(body);
            const option = { upsert: true }
            const filter = {
                email: email
            }
            const updateDoc = {
                $set: {
                    img: body.img
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, option)
            res.send(result)

        })

        // Reporter
        app.put('/becomereporter', async (req, res) => {
            const email = req.query.email;
            const body = req.body;
            console.log(body);
            const query = {
                email: email
            }
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    reporter: true,
                    userphone: body.userPhone
                }
            }
            const result = await usersCollection.updateOne(query, updateDoc, option)
            res.send(result)
        })



        app.get('/reporter/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            res.send({ isReporter: user.reporter === true })
        })


        app.get('/catagory', async (req, res) => {
            const query = {}
            const result = await catagoryCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/catagory/:id', async (req, res) => {
            const id = req.params.id;
            let query = {}
            if (id === '08') {
                query = {}
            }
            else {
                query = {
                    category_id: id

                }
            }
            const result = await newsCollection.find(query).sort({ _id: -1 }).toArray()
            res.send(result)

        })

        app.get('/news', async (req, res) => {
            const query = {}
            const result = await newsCollection.find(query).sort({ _id: -1 }).toArray()
            res.send(result)
        })
        app.get('/news/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await newsCollection.findOne(query)
            res.send(result)
        })

        app.post('/postnews', async (req, res) => {
            const body = req.body
            const result = await newsCollection.insertOne(body)
            res.send(result)
        })
        // app.get('/test', async (req, res) => {

        //     const query = {}
        //     const updateDoc = {
        //         $set: {
        //             upVote: [],
        //             downVote: []

        //         }
        //     }
        //     const option = { upsert: true }

        //     const result = await newsCollection.updateMany(query, updateDoc, option)
        //     res.send(result)

        // })

        app.put('/likepost/:id', async (req, res) => {
            const id = req.params.id
            const body = req.body
            const filter = { _id: ObjectId(id) }

            console.log(body);
            const existingVotes = await newsCollection.findOne(filter)
          


            const likeExited = existingVotes.upVote.find(voteEmail => voteEmail.userEmail === body.userEmail)
            console.log(likeExited)

            if (likeExited) {
                console.log('Like Removed');
                // if exist then remove the like
                const removedlike = existingVotes.upVote.filter(like => like.userEmail !== body.userEmail)

                console.log(removedlike);
                const updateDoc = {
                    $set: {
                        upVote: [...removedlike]
                    }
                }

                const option = { upsert: true }
                const result = await newsCollection.updateOne(filter, updateDoc, option)
                res.send(result)

                return


            }
            else {
                console.log('Like Added');
                const updateDoc = {
                    $set: {
                        upVote: [...existingVotes.upVote, body]
                    }
                }
                const option = { upsert: true }
                const result = await newsCollection.updateOne(filter, updateDoc, option)
                res.send(result)
                return
            }




        })
        app.put('/dislikepost/:id', async (req, res) => {
            const id = req.params.id
            const body = req.body
            const filter = { _id: ObjectId(id) }

            console.log(body);
            const eventPost = await newsCollection.findOne(filter)
          


            const likeExited = eventPost.downVote.find(voteEmail => voteEmail.userEmail === body.userEmail)
            console.log(likeExited)

            if (likeExited) {
                console.log('Like Removed');
                // if exist then remove the like
                const removedlike = eventPost.downVote.filter(like => like.userEmail !== body.userEmail)

                console.log(removedlike);
                const updateDoc = {
                    $set: {
                        downVote: [...removedlike]
                    }
                }

                const option = { upsert: true }
                const result = await newsCollection.updateOne(filter, updateDoc, option)
                res.send(result)

                return


            }
            else {
                console.log('Like Added');
                const updateDoc = {
                    $set: {
                        downVote: [...eventPost.downVote, body]
                    }
                }
                const option = { upsert: true }
                const result = await newsCollection.updateOne(filter, updateDoc, option)
                res.send(result)
                return
            }




        })

        app.delete('/deletenews/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await newsCollection.deleteOne(query)
            res.send(result)
        })



    }
    catch {

    }
    finally {

    }
}

run().catch(err => console.log(err))

app.get('/', (req, res) => {
    res.send('Hello Word')

})
app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})