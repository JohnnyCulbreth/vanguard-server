const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'dist')));
app.use('/static', express.static(path.join(__dirname)));

app.get('/getCliaData', async (req, res) => {
  const stateCode = req.query.STATE_CD;
  const facilityCode = req.query.GNRL_FAC_TYPE_CD;
  const page = parseInt(req.query.page, 10) || 1;
  const itemsPerPage = 25;
  const skip = (page - 1) * itemsPerPage;

  let client = new MongoClient(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const database = client.db('vangardData');
    const collection = database.collection('cliaData');

    let query = {};

    if (stateCode) {
      query.STATE_CD = stateCode;
    }

    if (facilityCode) {
      query.GNRL_FAC_TYPE_CD = facilityCode;
    }

    const data = await collection
      .find(query)
      .skip(skip)
      .limit(itemsPerPage)
      .toArray();

    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  } finally {
    await client.close();
  }
});

app.post('/api/rsvp', async (req, res) => {
  const { name, email, guestCount } = req.body;

  let client = new MongoClient(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const database = client.db('luna');
    const collection = database.collection('luncheonRSVP');
    const formData = {
      name,
      email,
      guestCount,
    };

    await collection.insertOne(formData);
    res
      .status(200)
      .send({ success: true, message: 'Data inserted successfully' });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  } finally {
    await client.close();
  }
});

app.post('/api/unsubscribe', async (req, res) => {
  const { email } = req.body; // Destructure the email from the request body

  let client = new MongoClient(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const database = client.db('luna');
    const collection = database.collection('unsubscribe');
    const unsubscribeData = {
      email,
      unsubscribedAt: new Date(),
    };

    await collection.insertOne(unsubscribeData);
    res
      .status(200)
      .send({ success: true, message: 'Email unsubscribed successfully' });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  } finally {
    await client.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
