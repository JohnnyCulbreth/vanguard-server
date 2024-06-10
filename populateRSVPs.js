const { MongoClient } = require('mongodb');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL; // Replace with your actual MongoDB connection string
const DATABASE_NAME = 'luna';
const IN_PERSON_COLLECTION = 'mtcRSVP';
const TOTAL_SUBMISSIONS_COLLECTION = 'mtcRSVPTotalSubmissions';

async function populateRSVPs() {
  let client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const database = client.db(DATABASE_NAME);
    const inPersonCollection = database.collection(IN_PERSON_COLLECTION);
    const totalSubmissionsCollection = database.collection(
      TOTAL_SUBMISSIONS_COLLECTION
    );

    for (let i = 0; i < 30; i++) {
      const dummyData = {
        name: faker.person.fullName(),
        phone: faker.phone.number(),
        email: faker.internet.email(),
        attendance: 'in-person',
        isClinician: 'yes',
        guestCount: '1',
        rsvpAt: new Date(),
      };

      // Insert into mtcRSVP collection
      await inPersonCollection.insertOne(dummyData);

      // Insert into mtcRSVPTotalSubmissions collection
      await totalSubmissionsCollection.insertOne(dummyData);
    }

    console.log('Successfully inserted 30 dummy RSVPs.');
  } catch (error) {
    console.error('Error inserting dummy RSVPs:', error);
  } finally {
    await client.close();
  }
}

populateRSVPs();
