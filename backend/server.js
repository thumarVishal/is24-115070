require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const xml2js = require('xml2js');
const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());

const apiKey = process.env.OPENAI_API_KEY;

app.use(express.static(path.resolve(__dirname, '../frontend')));
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/index.html'));
});
app.use(bodyParser.json());

app.get('/search', async (req, res) => {
    const searchQuery = req.query.q;
    const s = 0;
    const e = 20;
    const nFrag = 5;
    const lFrag = 100;

    try {
        const response = await axios.get(`http://www.bclaws.ca/civix/search/complete/fullsearch?q=${searchQuery}&s=${s}&e=${e}&nFrag=${nFrag}&lFrag=${lFrag}`);

        const parser = new xml2js.Parser();
        parser.parseString(response.data, (err, result) => {
            if (err) {
                console.error('Error parsing XML:', err);
                return res.status(500).send('Error parsing XML response');
            }
            res.json(result);
        });
    } catch (error) {
        console.error('Error fetching data from BC Laws API:', error);
        res.status(500).send('Error retrieving data from BC Laws API');
    }
});

app.use(bodyParser.json());

app.post('/summarize', async (req, res) => {

    const content = req.body.content;

    if (!apiKey) {
        return res.status(500).json({ error: "API Key is not defined." });
    }

    if (!content) {
        return res.status(400).json({ error: 'Content is required.' });
    }

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: content }],
            max_tokens: 100,
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching summary:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
