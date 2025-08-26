// api/upload.js
import FormData from 'form-data';


export default async function handler(req, res) {
// Allow CORS from anywhere (you can restrict in production)
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');


if (req.method === 'OPTIONS') return res.status(200).end();


if (req.method !== 'POST') {
return res.status(405).json({ error: 'Method not allowed' });
}


try {
// Expect JSON body with { filename, data (base64), expiration }
const { filename, data, expiration = '0' } = req.body;
if (!filename || !data) return res.status(400).json({ error: 'Missing file data' });


// Decode base64
const buffer = Buffer.from(data, 'base64');


// Construct form-data to forward to postimages
const form = new FormData();
// field name 'file' matches what postimages expects
form.append('file', buffer, {
filename: filename,
contentType: 'application/octet-stream'
});
// postimages expects an expiration string — try to forward it
form.append('expiration', expiration);


// Send request to Postimages
const resp = await fetch('https://postimages.org/json/rr', {
method: 'POST',
body: form,
headers: form.getHeaders()
});


const json = await resp.json();


// Return Postimages JSON directly to the frontend
return res.status(200).json(json);
} catch (err) {
console.error('Upload error', err);
return res.status(500).json({ error: err.message || 'Server error' });
}
}
