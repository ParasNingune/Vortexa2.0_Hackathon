const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

const app = express();
const port = 5000;

// Enable CORS for all routes
app.use(cors());

// Define the API endpoint to get data
app.get('/data', async (req, res) => {
  const csvFilePath = path.resolve(__dirname, 'random_outbreak_data_proper.csv');
  const records = [];

  // Create the parser
  const parser = fs.createReadStream(csvFilePath).pipe(parse({
    columns: true,
    skip_empty_lines: true
  }));

  // Listen for the 'data' and 'end' events
  parser.on('data', (record) => {
    // Convert string values to numbers
    record.Latitude = parseFloat(record.Latitude);
    record.Longitude = parseFloat(record.Longitude);
    record.Cases = parseInt(record.Cases, 10);
    records.push(record);
  });

  parser.on('end', () => {
    console.log('CSV file successfully processed');
    res.json(records);
  });

  parser.on('error', (err) => {
    console.error('Error processing CSV:', err);
    res.status(500).json({ error: 'Failed to process data' });
  });
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});