const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
require('dotenv').config()

const corsOptions = {
    origin: ['http://localhost:5173'],
    credentials: true,
    optionSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.usv0l7z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        console.log('Database connected successfully');

        // Collection
        const userCollection = client.db('TaskPlanet').collection('allusers');
        //  Get operation
        app.get('/allusers', async (req, res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        })
        // Get a specific user data
        app.get('/allusers/:email', async (req, res) => {
            const email = req.params.email
            const result = await userCollection.findOne({ email })
            res.send(result)
        })
        // Post route for client-side registration
        app.post('/allusers', async (req, res) => {
            try {
                const newUsers = req.body;
                const query = { email: newUsers.email };
                const existingUser = await userCollection.findOne(query);

                if (existingUser) {
                    return res.status(409).send({ message: 'User already exists', insertedId: null });
                }

                const result = await userCollection.insertOne(newUsers);
                res.status(201).send(result);
            } catch (error) {
                console.error("Error inserting user:", error);
                res.status(500).send({ message: 'Internal Server Error' });
            }
        });
    }
    finally { }
}
run().catch(console.dir);

// Default route
app.get('/', (req, res) => {
    res.send('TaskPlanet server is running');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
