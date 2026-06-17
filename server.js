const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'enquiries.json');

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Helper function to read data
const readData = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            const initialData = { target: 20, enquiries: [] };
            fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
            fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading data:", err);
        return { target: 20, enquiries: [] };
    }
};

// Helper function to write data
const writeData = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error writing data:", err);
    }
};

// Ensure data file exists on startup
readData();

// --- API Endpoints ---

// Get current stats (total vs target)
app.get('/api/stats', (req, res) => {
    const data = readData();
    res.json({
        total: data.enquiries.length,
        target: data.target
    });
});

// Check if a phone number is already registered
app.get('/api/check-phone/:phone', (req, res) => {
    const data = readData();
    const phoneToFind = req.params.phone.replace(/\D/g, ''); // strip non-digits
    
    const exists = data.enquiries.some(enquiry => {
        const existingPhone = enquiry.phone.replace(/\D/g, '');
        return existingPhone === phoneToFind;
    });

    res.json({ exists });
});

// Submit a new enquiry
app.post('/api/enquiry', (req, res) => {
    const { name, phone, guests, match } = req.body;

    if (!name || !phone || !guests) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const data = readData();
    const cleanPhone = phone.replace(/\D/g, '');

    // Server-side check for existing phone
    const exists = data.enquiries.some(e => e.phone.replace(/\D/g, '') === cleanPhone);
    if (exists) {
        return res.status(400).json({ error: 'This phone number has already been registered.' });
    }

    const newEnquiry = {
        id: Date.now().toString(),
        name,
        phone,
        guests,
        match: match || 'Any Match',
        timestamp: new Date().toISOString()
    };

    data.enquiries.push(newEnquiry);
    writeData(data);

    res.status(201).json({ 
        message: 'Enquiry received successfully!',
        enquiry: newEnquiry
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
