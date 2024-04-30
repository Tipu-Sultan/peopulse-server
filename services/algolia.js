
ALGOLIA_APP_ID=process.env.ALGOLIA_APP_ID;
ALGOLIA_SECRET=process.env.ALGOLIA_SECRET;
const algoliasearch = require('algoliasearch');

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SECRET);
const index = client.initIndex('user');

module.exports = index;


// const dotenv = require('dotenv');
// dotenv.config();
// const mongoose = require('mongoose');
// const algoliasearch = require('algoliasearch');
// const Users = require('../models/users'); // Replace with your Mongoose model and its location
// const MONGODB_URI=process.env.MONGODB_URI;
// const ALGOLIA_APP_ID=process.env.ALGOLIA_APP_ID;
// const ALGOLIA_API_KEY=process.env.ALGOLIA_SECRET;
// const ALGOLIA_INDEX_NAME='user';

// const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
// const index = client.initIndex(ALGOLIA_INDEX_NAME);

// async function importData(req,res) {
//     try {
//         // Fetch data from MongoDB collection using Mongoose
//         const mongoData = await Users.find();
    
//         const transformedData = mongoData.map((doc) => {
//           const transformedDoc = { objectID: doc._id.toString() };
    
//           // Dynamically add properties to transformedDoc based on the properties in the MongoDB document
//           for (const key in doc._doc) {
//             if (Object.prototype.hasOwnProperty.call(doc._doc, key)) {
//               transformedDoc[key] = doc[key];
//             }
//           }
    
//           return transformedDoc;
//         });
    
//         // Add or update records in Algolia index
//         await index.saveObjects(transformedData);
    
//         console.log('Data imported into Algolia successfully.');
//         res.json({ success: true, message: 'Data imported into Algolia successfully.' });
//       } catch (error) {
//         console.error('Error importing data:', error);
//         res.status(500).json({ success: false, error: 'Internal Server Error' });
//       }
// }

// importData();


