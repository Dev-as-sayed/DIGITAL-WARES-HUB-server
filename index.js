const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// digital-wares-hub
// Dj8MhGfgrKGWqsn2

app.use(cors());
app.use(express.json());
require('dotenv').config();

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.tpodeld.mongodb.net/?retryWrites=true&w=majority`;
// const uri = "mongodb+srv://digital-wares-hub:Dj8MhGfgrKGWqsn2@cluster0.tpodeld.mongodb.net/?retryWrites=true&w=majority";

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollaction = client.db("DWUsersDB").collection('regiter');
    const brandCollaction = client.db("DWUsersDB").collection('addBrand')
    const productCollaction = client.db("DWUsersDB").collection('addProduct')
    const silactedProduct = client.db("DWUsersDB").collection('silactedProduct')


    app.get('/addBrand', async(req, res) => {
      const brand = brandCollaction.find();
      const result = await brand.toArray();

      res.send(result)
    })
    // app.get('/addProduct', async(req, res) => {
    //   const products = productCollaction.find();
    //   const result = await products.toArray();

    //   res.send(result)
    // })

    app.get('/products/:brd', async(req, res) => {
      const brand = req.params.brd;
      const query = {brandName: brand};
      const products = productCollaction.find(query);
      const result = await products.toArray();
      console.log('brand hit', result);

      res.send(result)
    })

    app.get('/product/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await productCollaction.findOne(query);
      console.log('id hit', result);

      res.send(result)
    })

    app.get('/silactedProduc', async(req, res) => {
      const productsData = silactedProduct.find();
      const result = await productsData.toArray();

      res.send(result)
    })

    app.post( '/regiter', async(req, res) => {
        const newUser = req.body;
        console.log(newUser);

        const result = await usersCollaction.insertOne(newUser);
        res.send(newUser)
    })

    app.post( '/addProduct', async(req, res) => {
        const newProduct = req.body;
        console.log(newProduct);

        const result = await productCollaction.insertOne(newProduct)
        res.send(result)
    })

    app.post('/addBrand', async(req, res) => {
      const newBrand = req.body;
      console.log(newBrand);

      const result = await brandCollaction.insertOne(newBrand)
      res.send(result)
    })

    app.post('/silactedProduct', async(req, res) => {
      const postSilactedProduct = req.body;
      console.log(postSilactedProduct);

      const result = await silactedProduct.insertOne(postSilactedProduct);
      res.send(result)
    })

    app.delete('/deletCard/:id', async(req, res)=>{
      const id = req.params.id;
      console.log(id);

      const query = { _id: new ObjectId(id)};
      const result = await silactedProduct.deleteOne(query);
      res.send(result);
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get( '/', (req, res) => {
    res.send('DIGITAL WARES HUB server is running')
})

app.listen( port, () => {
    console.log(`server running ${port} on port`);
})