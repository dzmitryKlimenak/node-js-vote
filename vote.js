const express = require('express');
const app = express();
const PORT = 3000;

// Example data
let votes = {
    'option1': 0,
    'option2': 0,
    'option3': 0,
};

const options = [
    { code: 'option1', text: 'Option 1' },
    { code: 'option2', text: 'Option 2' },
    { code: 'option3', text: 'Option 3' },
];

// Middleware to serve static files (for the frontend)
app.use(express.static('public'));
app.use(express.json());

// GET service to return possible response options
app.get('/variants', (req, res) => {
    res.json(options);
});

// POST service to return response statistics
app.post('/stat', (req, res) => {
    const stats = Object.keys(votes).map(code => ({
        code,
        votes: votes[code]
    }));
    res.json(stats);
});

// POST service to accept a vote
app.post('/vote', (req, res) => {
    const { code } = req.body;
    if (votes[code] !== undefined) {
        votes[code]++;
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false, message: 'Invalid option' });
    }
});

// GET service to return the web page (frontend code)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});