const express = require('express');
const app = express();
const PORT = 7580;

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

// GET service to load vote statistics
app.get('/download', (req, res) => {
    const acceptHeader = req.headers.accept;
    const stats = Object.keys(votes).map(code => ({
        code,
        votes: votes[code]
    }));

    sendFormattedResponse(res, acceptHeader, stats);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port: ${PORT}`);
});

// Reusable function to handle response formatting
function sendFormattedResponse(res, acceptHeader, stats) {
    if (acceptHeader.includes('application/json')) {
        res.setHeader('Content-disposition', 'attachment; filename=results.json');
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(stats, null, 2));
    } else if (acceptHeader.includes('application/xml')) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?><stats>';
        stats.forEach(stat => {
            xml += `<option><code>${stat.code}</code><votes>${stat.votes}</votes></option>`;
        });
        xml += '</stats>';
        res.setHeader('Content-disposition', 'attachment; filename=results.xml');
        res.setHeader('Content-Type', 'application/xml');
        res.send(xml);
    } else if (acceptHeader.includes('text/html')) {
        let html = '<ul>';
        stats.forEach(stat => {
            html += `<li>${stat.code}: ${stat.votes} votes</li>`;
        });
        html += '</ul>';
        res.setHeader('Content-disposition', 'attachment; filename=results.html');
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } else {
        res.status(400).send('Unsupported format');
    }
}