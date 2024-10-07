document.getElementById('search-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const query = document.getElementById('search-query').value;

    try {
        const response = await fetch(`http://localhost:3000/search?q=${query}`);
        const data = await response.json();

        const resultsList = document.getElementById('results-list');
        const noResults = document.getElementById('noResults');
        const resultsSection = document.getElementById('results');
        const noResultsSection = document.getElementById('noResults');
        const summarizeSection = document.getElementById('summarize-section');
        const summaryContainer = document.getElementById('summaryContainer');

        summarizeSection.style.display = 'none';

        resultsList.innerHTML = '';

        if (data.results && data.results.doc && data.results.doc.length > 0) {
            resultsSection.style.display = 'block';
            noResultsSection.style.display = 'none';

            data.results.doc.forEach(doc => {
                const listItem = document.createElement('li');

                const title = doc.CIVIX_DOCUMENT_TITLE[0] || 'No Title';
                const documentId = doc.CIVIX_DOCUMENT_ID[0] || 'No ID';
                const indexId = doc.CIVIX_INDEX_ID[0] || 'No Index';

                const documentUrl = `http://www.bclaws.ca/civix/document/id/complete/${indexId}/${documentId}`;

                const summarizeButton = document.createElement('button');
                summarizeButton.innerText = 'Summarize';
                summarizeButton.onclick = () => summarizeDocument(title);

                listItem.innerHTML = `<a href="${documentUrl}" target="_blank">${title}</a>`;
                listItem.appendChild(summarizeButton);

                resultsList.appendChild(listItem);
            });

            async function summarizeDocument(title) {
                const apiKey = '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'; // Replace with your OpenAI API key

                const requestData = {
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: `Summarize the following document: ${title}` }],
                    max_tokens: 100,
                };

                try {
                    summaryContainer.innerHTML = 'Loading summary...';
                    summarizeSection.style.display = 'block';

                    const response = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestData),
                    });

                    if (!response.ok) {
                        throw new Error('Error fetching summary');
                    }

                    const jsonResponse = await response.json();
                    const summaryText = jsonResponse.choices[0].message.content.trim();

                    summaryContainer.innerHTML = `<h3>Summary:</h3><p>${summaryText}</p>`;
                } catch (error) {
                    summaryContainer.innerHTML = `<p>Error: ${error.message}</p>`;
                }
            }
        } else {
            resultsSection.style.display = 'none';
            noResultsSection.style.display = 'block';
            noResults.innerHTML = '<h3>No results found.</h3>';
        }
    } catch (error) {
        console.error('Error fetching search results:', error);
    }
});

document.getElementById('reset-button').addEventListener('click', function () {
    document.getElementById('search-query').value = '';
    document.getElementById('results').style.display = 'none';
    document.getElementById('noResults').style.display = 'none';
    document.getElementById('summaryContainer').innerHTML = '';
    document.getElementById('summarize-section').style.display = 'none';
});
