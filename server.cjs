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
  const { name, phone, email } = req.body;

  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const database = client.db('luna');
    const collection = database.collection('alumniRrRSVP');

    // Check if an entry with the same email already exists
    const existingEntry = await collection.findOne({ email });
    if (existingEntry) {
      return res.status(400).send({
        success: false,
        message: "You have already RSVP'd to this event.",
      });
    }

    const formData = { name, phone, email, guestCount: '1' };
    await collection.insertOne(formData);
    res.status(200).send({
      success: true,
      message: 'Thank you for your RSVP!',
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  } finally {
    await client.close();
  }
});

// RSVP Dashboard Rest and Restore

app.post('/api/rsvpmtc', async (req, res) => {
  const { name, phone, email, attendance, isClinician } = req.body;

  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const database = client.db('luna');
    const inPersonCollection = database.collection('mtcRSVP');
    const virtualCollection = database.collection('mtcRSVPVirtual');
    const waitlistCollection = database.collection('mtcRSVPWaitlist');
    const totalSubmissionsCollection = database.collection(
      'mtcRSVPTotalSubmissions'
    );

    // Check if an entry with the same email already exists in the total submissions collection
    const existingTotalSubmission = await totalSubmissionsCollection.findOne({
      email,
    });

    // If the user is already in the total submissions collection, but trying to switch to virtual
    if (existingTotalSubmission && attendance === 'virtual') {
      const existingVirtualEntry = await virtualCollection.findOne({ email });
      const existingInPersonEntry = await inPersonCollection.findOne({ email });
      const existingWaitlistEntry = await waitlistCollection.findOne({ email });

      if (!existingVirtualEntry && !existingInPersonEntry) {
        // Update the attendance to virtual in the total submissions collection
        await totalSubmissionsCollection.updateOne(
          { email },
          {
            $set: {
              attendance: 'virtual',
              attemptedAttendance: existingTotalSubmission.attendance,
            },
          }
        );

        // Add the user to the virtual RSVP collection
        const virtualSubmissionData = {
          name,
          phone,
          email,
          attendance,
          isClinician,
          guestCount: '1',
          attemptedAttendance: existingTotalSubmission.attendance,
          rsvpAt: new Date(),
        };
        await virtualCollection.insertOne(virtualSubmissionData);

        // Remove the user from the waitlist collection if they switch to virtual
        if (existingWaitlistEntry) {
          await waitlistCollection.deleteOne({ email });
        }

        return res.status(200).send({
          success: true,
          message:
            'Thank you! You have been registered for virtual attendance.',
        });
      } else {
        return res.status(400).send({
          success: false,
          message: "You have already RSVP'd to this event.",
        });
      }
    }

    if (!existingTotalSubmission) {
      // Add the user to the total submissions collection
      const totalSubmissionData = {
        name,
        phone,
        email,
        attendance,
        isClinician,
        guestCount: '1',
        rsvpAt: new Date(),
      };
      await totalSubmissionsCollection.insertOne(totalSubmissionData);
    }

    // Check if an entry with the same email already exists in any collection
    const existingInPersonEntry = await inPersonCollection.findOne({ email });
    const existingVirtualEntry = await virtualCollection.findOne({ email });
    const existingWaitlistEntry = await waitlistCollection.findOne({ email });

    if (
      existingInPersonEntry ||
      existingVirtualEntry ||
      existingWaitlistEntry
    ) {
      return res.status(400).send({
        success: false,
        message: "You have already RSVP'd to this event.",
      });
    }

    // Check attendance type and process accordingly
    if (attendance === 'in-person') {
      if (isClinician === 'no') {
        // Add non-clinicians directly to the waitlist
        const waitlistSubmissionData = {
          name,
          phone,
          email,
          attendance: 'waitlist', // Set attendance to 'waitlist'
          isClinician,
          guestCount: '1',
          attemptedAttendance: 'in-person',
          rsvpAt: new Date(),
        };
        await waitlistCollection.insertOne(waitlistSubmissionData);

        // Update the attendance to waitlist in the total submissions collection
        await totalSubmissionsCollection.updateOne(
          { email },
          { $set: { attendance: 'waitlist' } }
        );

        return res.status(400).send({
          success: false,
          message:
            'Sorry! This event has reached the maximum number of in-person attendees. You have been added to the waitlist. Would you like to switch to virtual attendance instead? If not, you will be contacted if an in-person spot becomes available!',
        });
      }

      const inPersonCount = await inPersonCollection.countDocuments();
      if (inPersonCount >= 30) {
        // Add the licensed clinician to the waitlist
        const waitlistSubmissionData = {
          name,
          phone,
          email,
          attendance: 'waitlist', // Set attendance to 'waitlist'
          isClinician,
          guestCount: '1',
          attemptedAttendance: 'in-person',
          rsvpAt: new Date(),
        };
        await waitlistCollection.insertOne(waitlistSubmissionData);

        // Update the attendance to waitlist in the total submissions collection
        await totalSubmissionsCollection.updateOne(
          { email },
          { $set: { attendance: 'waitlist' } }
        );

        return res.status(400).send({
          success: false,
          message:
            'Sorry! This event has reached the maximum number of in-person attendees. You have been added to the waitlist. Would you like to switch to virtual attendance instead? If not, you will be contacted if an in-person spot becomes available!',
        });
      }

      // Add the user to the in-person RSVP collection
      const inPersonSubmissionData = {
        name,
        phone,
        email,
        attendance,
        isClinician,
        guestCount: '1',
        rsvpAt: new Date(),
      };
      await inPersonCollection.insertOne(inPersonSubmissionData);
    } else {
      // Check if an entry with the same email already exists in the virtual RSVP collection
      const existingVirtualEntry = await virtualCollection.findOne({ email });
      if (existingVirtualEntry) {
        return res.status(400).send({
          success: false,
          message: "You have already RSVP'd to this event.",
        });
      }

      // Add the user to the virtual RSVP collection
      const virtualSubmissionData = {
        name,
        phone,
        email,
        attendance,
        isClinician,
        guestCount: '1',
        rsvpAt: new Date(),
      };
      await virtualCollection.insertOne(virtualSubmissionData);
    }

    res.status(200).send({
      success: true,
      message: 'Thank you for your RSVP!',
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  } finally {
    await client.close();
  }
});

// RSVP Managing Teen Crisis

app.post('/api/rsvpmtc', async (req, res) => {
  const { name, phone, email, attendance, isClinician } = req.body;

  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const database = client.db('luna');
    const inPersonCollection = database.collection('mtcRSVP');
    const virtualCollection = database.collection('mtcRSVPVirtual');
    const waitlistCollection = database.collection('mtcRSVPWaitlist');
    const totalSubmissionsCollection = database.collection(
      'mtcRSVPTotalSubmissions'
    );

    // Check if an entry with the same email already exists in the total submissions collection
    const existingTotalSubmission = await totalSubmissionsCollection.findOne({
      email,
    });

    // If the user is already in the total submissions collection, but trying to switch to virtual
    if (existingTotalSubmission && attendance === 'virtual') {
      const existingVirtualEntry = await virtualCollection.findOne({ email });
      const existingInPersonEntry = await inPersonCollection.findOne({ email });
      if (!existingVirtualEntry && !existingInPersonEntry) {
        // Update the attendance to virtual in the total submissions collection
        await totalSubmissionsCollection.updateOne(
          { email },
          {
            $set: {
              attendance: 'virtual',
              attemptedAttendance: existingTotalSubmission.attendance,
            },
          }
        );

        // Add the user to the virtual RSVP collection
        const virtualSubmissionData = {
          name,
          phone,
          email,
          attendance,
          isClinician,
          guestCount: '1',
          attemptedAttendance: existingTotalSubmission.attendance,
          rsvpAt: new Date(),
        };
        await virtualCollection.insertOne(virtualSubmissionData);
        return res.status(200).send({
          success: true,
          message:
            'Thank you! You have been registered for virtual attendance.',
        });
      } else {
        return res.status(400).send({
          success: false,
          message: "You have already RSVP'd to this event.",
        });
      }
    }

    if (!existingTotalSubmission) {
      // Add the user to the total submissions collection
      const totalSubmissionData = {
        name,
        phone,
        email,
        attendance,
        isClinician,
        guestCount: '1',
        rsvpAt: new Date(),
      };
      await totalSubmissionsCollection.insertOne(totalSubmissionData);
    }

    // Check if an entry with the same email already exists in any collection
    const existingInPersonEntry = await inPersonCollection.findOne({ email });
    const existingVirtualEntry = await virtualCollection.findOne({ email });
    const existingWaitlistEntry = await waitlistCollection.findOne({ email });

    if (
      existingInPersonEntry ||
      existingVirtualEntry ||
      existingWaitlistEntry
    ) {
      return res.status(400).send({
        success: false,
        message: "You have already RSVP'd to this event.",
      });
    }

    // Check attendance type and process accordingly
    if (attendance === 'in-person') {
      if (isClinician === 'no') {
        // Add non-clinicians directly to the waitlist
        const waitlistSubmissionData = {
          name,
          phone,
          email,
          attendance,
          isClinician,
          guestCount: '1',
          attemptedAttendance: 'in-person',
          rsvpAt: new Date(),
        };
        await waitlistCollection.insertOne(waitlistSubmissionData);

        return res.status(400).send({
          success: false,
          message:
            'Sorry! This event has reached the maximum number of in-person attendees. You have been added to the waitlist. Would you like to switch to virtual attendance instead? If not, you will be contacted if an in-person spot becomes available!',
        });
      }

      const inPersonCount = await inPersonCollection.countDocuments();
      if (inPersonCount >= 30) {
        // Add the licensed clinician to the waitlist
        const waitlistSubmissionData = {
          name,
          phone,
          email,
          attendance,
          isClinician,
          guestCount: '1',
          attemptedAttendance: 'in-person',
          rsvpAt: new Date(),
        };
        await waitlistCollection.insertOne(waitlistSubmissionData);

        return res.status(400).send({
          success: false,
          message:
            'Sorry! This event has reached the maximum number of in-person attendees. You have been added to the waitlist. Would you like to switch to virtual attendance instead? If not, you will be contacted if an in-person spot becomes available!',
        });
      }

      // Add the user to the in-person RSVP collection
      const inPersonSubmissionData = {
        name,
        phone,
        email,
        attendance,
        isClinician,
        guestCount: '1',
        rsvpAt: new Date(),
      };
      await inPersonCollection.insertOne(inPersonSubmissionData);
    } else {
      // Check if an entry with the same email already exists in the virtual RSVP collection
      const existingVirtualEntry = await virtualCollection.findOne({ email });
      if (existingVirtualEntry) {
        return res.status(400).send({
          success: false,
          message: "You have already RSVP'd to this event.",
        });
      }

      // Add the user to the virtual RSVP collection
      const virtualSubmissionData = {
        name,
        phone,
        email,
        attendance,
        isClinician,
        guestCount: '1',
        rsvpAt: new Date(),
      };
      await virtualCollection.insertOne(virtualSubmissionData);
    }

    res.status(200).send({
      success: true,
      message: 'Thank you for your RSVP!',
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  } finally {
    await client.close();
  }
});

// RSVP Dashboard Managing Teen Crisis

app.get('/mtc-data', async (req, res) => {
  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const collection = client.db('luna').collection('mtcRSVPTotalSubmissions');
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
