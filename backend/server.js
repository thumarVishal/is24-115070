const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const xml2js = require('xml2js');
const app = express();
const port = 3000;

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

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
