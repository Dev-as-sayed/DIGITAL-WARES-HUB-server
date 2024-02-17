const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174' ],
  credentials: true
}));


app.use(express.json());
require('dotenv').config();
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.tpodeld.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const logger = (req, res, next) => {
  console.log('log: info', req.method, req.url);
  next();
}

const varifyToken = (req, res, next) => {
  const token = req?.cookies?.token;

  if(!token){
    return res.status(401).send({message: 'unauthorized access'})
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if(error){
      return res.status(401).send({message: 'unauthorized access'})
    }
    req.user = decoded;
    next()
  })
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const usersCollaction = client.db("DWUsersDB").collection('regiter');
    const brandCollaction = client.db("DWUsersDB").collection('addBrand')
    const productCollaction = client.db("DWUsersDB").collection('addProduct')
    const silactedProduct = client.db("DWUsersDB").collection('silactedProduct')
    const orderCollaction = client.db("DWUsersDB").collection('orderData')


    app.get('/addBrand', logger, async(req, res) => {
      const brand = brandCollaction.find();

      console.log('token', req?.cookies?.token);
      const result = await brand.toArray();

      res.send(result)
    })

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

    app.get('/getOrders', async(req, res) => {
      const orderList = orderCollaction.find();
      const result = await orderList.toArray();

      res.send(result)
    })

    app.post( '/jwt', logger, async(req, res) => {
      const user = req.body;
      console.log('user for token',user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '2h'})

      res
      .cookie('token', token, {
        httpOnly: true,
        secure:false,
      })
      .send({success: true})
    })

    app.post( '/regiter', async(req, res) => {
        const newUser = req.body;
        console.log(newUser);

        const result = await usersCollaction.insertOne(newUser);
        res.send(newUser)
    })

    app.post( '/addProduct', logger, async(req, res) => {
        const newProduct = req.body;

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

    app.post('/orderNaw', async(req, res) => {
      const orders = req.body;
      console.log(orders);

      const result = await orderCollaction.insertOne(orders);
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