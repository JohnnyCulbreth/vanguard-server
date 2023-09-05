const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

app.use(cors());

app.use(express.static(path.join(__dirname, 'dist')));

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

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
