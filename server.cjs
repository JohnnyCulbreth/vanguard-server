const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const { ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 4000;
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

  let client = new MongoClient(MONGO_URL);

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

// Luncheon

app.post('/api/rsvp', async (req, res) => {
  const { name, phone, email, guestCount } = req.body;

  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const database = client.db('luna');
    const collection = database.collection('luncheonRSVP');

    const existingRSVP = await collection.findOne({ email });
    if (existingRSVP) {
      return res.status(400).send({
        success: false,
        message: "You have already RSVP'd with this email address.",
      });
    }

    const formData = { name, phone, email, guestCount };
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

// Skate Party

app.post('/api/rsvpskate', async (req, res) => {
  const { name, phone, email, guestCount } = req.body;

  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const database = client.db('luna');
    const collection = database.collection('alumniSkateRSVP');
    const formData = {
      name,
      phone,
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

// Unsubscribe

app.post('/api/unsubscribe', async (req, res) => {
  const { email } = req.body;

  let client = new MongoClient(MONGO_URL);

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

// RSVP Luncheon Dashboard

app.get('/luncheon-data', async (req, res) => {
  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const collection = client.db('luna').collection('luncheonRSVP');
    const data = await collection.find().sort({ name: 1 }).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).send('Error fetching data.');
  } finally {
    await client.close();
  }
});

// RSVP Luncheon Dashboard Skate

app.get('/skate-data', async (req, res) => {
  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const collection = client.db('luna').collection('alumniSkateRSVP');
    const data = await collection.find().sort({ name: 1 }).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).send('Error fetching data.');
  } finally {
    await client.close();
  }
});

// RSVP Luncheon Dashboard Dinner

app.get('/dinner-data', async (req, res) => {
  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const collection = client.db('luna').collection('privateDinner');
    const data = await collection.find().sort({ name: 1 }).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).send('Error fetching data.');
  } finally {
    await client.close();
  }
});

// RSVP Luncheon Dashboard Golf

app.get('/golf-data', async (req, res) => {
  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const collection = client.db('luna').collection('golfOuting');
    const data = await collection.find().sort({ name: 1 }).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).send('Error fetching data.');
  } finally {
    await client.close();
  }
});

// Luncheon New RSVP

app.post('/api/rsvpluncheon', async (req, res) => {
  const { name, phone, email, guestCount } = req.body;

  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const database = client.db('luna');
    const collection = database.collection('newLuncheonRSVP');
    const formData = {
      name,
      phone,
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

// Check for RSVP for Luncheon

app.get('/api/check-rsvp', async (req, res) => {
  const { email } = req.query;

  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const database = client.db('luna');
    const collection = database.collection('luncheonRSVP');
    const rsvp = await collection.findOne({ email });

    if (rsvp) {
      const hasGuests = rsvp.guestCount && parseInt(rsvp.guestCount) > 1;
      const guestInfoExists =
        Array.isArray(rsvp.guestInfo) && rsvp.guestInfo.length > 0;
      res.json({
        found: true,
        hasGuests,
        guestInfoExists,
        guestCount: rsvp.guestCount,
      });
    } else {
      res.json({ found: false });
    }
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  } finally {
    await client.close();
  }
});

// Luncheon Update Guest Info

app.post('/api/update-guests', async (req, res) => {
  const { email, guests } = req.body;

  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const database = client.db('luna');
    const collection = database.collection('luncheonRSVP');

    await collection.updateOne({ email }, { $set: { guestInfo: guests } });

    res.json({
      success: true,
      message: 'Guest information updated successfully',
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  } finally {
    await client.close();
  }
});

// Update Guest Count for Luncheon RSVP
app.post('/api/update-guest-count', async (req, res) => {
  const { email, newGuestCount } = req.body;

  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const database = client.db('luna');
    const collection = database.collection('luncheonRSVP');

    await collection.updateOne(
      { email },
      { $set: { guestCount: newGuestCount } }
    );

    res.json({
      success: true,
      message: 'Guest count updated successfully',
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  } finally {
    await client.close();
  }
});

// Delete Guest Info for Luncheon RSVP
app.post('/api/delete-guest-info', async (req, res) => {
  const { email } = req.body;

  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const database = client.db('luna');
    const collection = database.collection('luncheonRSVP');

    await collection.updateOne({ email }, { $unset: { guestInfo: '' } });

    res.json({
      success: true,
      message: 'Guest information deleted successfully',
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  } finally {
    await client.close();
  }
});

// Private Dinner RSVP
app.post('/api/rsvpPrivateDinner', async (req, res) => {
  const { name, phone, email, guestCount, guestName } = req.body;

  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const database = client.db('luna');
    const collection = database.collection('privateDinner');

    const existingRSVP = await collection.findOne({ email });
    if (existingRSVP) {
      return res.status(400).send({
        success: false,
        message: "You have already RSVP'd with this email address.",
      });
    }

    const formData = { name, phone, email, guestCount, guestName };
    await collection.insertOne(formData);
    res
      .status(200)
      .send({ success: true, message: 'RSVP submitted successfully' });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  } finally {
    await client.close();
  }
});

// Golf Outing RSVP
app.post('/api/rsvpGolfOuting', async (req, res) => {
  const { name, phone, email } = req.body;

  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const database = client.db('luna');
    const collection = database.collection('golfOuting');

    const existingRSVP = await collection.findOne({ email });
    if (existingRSVP) {
      return res.status(400).send({
        success: false,
        message: "You have already RSVP'd with this email address.",
      });
    }

    const formData = { name, phone, email };
    await collection.insertOne(formData);
    res
      .status(200)
      .send({ success: true, message: 'RSVP submitted successfully' });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  } finally {
    await client.close();
  }
});

// Delete RSVP from RSVP Portal by ID for LUNCHEON
app.delete('/api/delete-rsvp/:id', async (req, res) => {
  const { id } = req.params;

  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const database = client.db('luna');
    const collection = database.collection('luncheonRSVP');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      res.json({ success: true, message: 'RSVP deleted successfully' });
    } else {
      res.status(404).send({ success: false, message: 'RSVP not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: error.message });
  } finally {
    await client.close();
  }
});

// Delete RSVP from RSVP Portal by ID for GOLF EVENT
app.delete('/api/delete-golf/:id', async (req, res) => {
  const { id } = req.params;

  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const database = client.db('luna');
    const collection = database.collection('golfOuting');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      res.json({ success: true, message: 'RSVP deleted successfully' });
    } else {
      res.status(404).send({ success: false, message: 'RSVP not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: error.message });
  } finally {
    await client.close();
  }
});

// Delete RSVP from RSVP Portal by ID for PRIVATE DINNER
app.delete('/api/delete-dinner/:id', async (req, res) => {
  const { id } = req.params;

  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const database = client.db('luna');
    const collection = database.collection('privateDinner');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      res.json({ success: true, message: 'RSVP deleted successfully' });
    } else {
      res.status(404).send({ success: false, message: 'RSVP not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: error.message });
  } finally {
    await client.close();
  }
});

// Edit Luncheon guestCount from Portal
app.put('/api/update-guest-count/:id', async (req, res) => {
  const { id } = req.params;
  const { newGuestCount } = req.body;

  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const database = client.db('luna');
    const collection = database.collection('luncheonRSVP');

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { guestCount: newGuestCount } }
    );

    res.json({
      success: true,
      message: 'Guest count updated successfully',
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  } finally {
    await client.close();
  }
});

// Edit Luncheon confirmed status from Portal
app.put('/api/update-confirm-status/:id', async (req, res) => {
  const { id } = req.params;
  const { confirmed, canceled } = req.body;

  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const database = client.db('luna');
    const collection = database.collection('luncheonRSVP');

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { confirmed: confirmed, canceled: canceled } }
    );

    res.json({
      success: true,
      message: 'RSVP confirmation status updated successfully',
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  } finally {
    await client.close();
  }
});

// Navix Unsubscribe

app.post('/api/navix-unsubscribe', async (req, res) => {
  const { email } = req.body;

  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const database = client.db('navix');
    const collection = database.collection('navixUnsubscribe');
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

// RSVP Rest and Restore

app.post('/api/rsvprr', async (req, res) => {
  const { name, phone, email, guestCount } = req.body;

  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const database = client.db('luna');
    const collection = database.collection('alumniRrRSVP');
    const formData = {
      name,
      phone,
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

// RSVP Luncheon Dashboard Rest and Restore

app.get('/rr-data', async (req, res) => {
  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const collection = client.db('luna').collection('alumniRrRSVP');
    const data = await collection.find().sort({ name: 1 }).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).send('Error fetching data.');
  } finally {
    await client.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
