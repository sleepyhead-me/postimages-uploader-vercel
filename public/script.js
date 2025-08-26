const fileInput = document.getElementById('fileInput');


function onFileSelected(f) {
selectedFile = f;
statusEl.textContent = `Selected: ${f.name} (${Math.round(f.size/1024)} KB)`;
resultEl.innerHTML = '';
}


uploadBtn.addEventListener('click', async () => {
if (!selectedFile) return alert('Please choose an image first.');
uploadBtn.disabled = true;
statusEl.textContent = 'Preparing file...';


try {
// Convert file to base64
const base64 = await fileToBase64(selectedFile);
// Remove prefix like data:image/png;base64,
const comma = base64.indexOf(',');
const stripped = comma >= 0 ? base64.slice(comma + 1) : base64;


statusEl.textContent = 'Uploading...';


const payload = {
filename: selectedFile.name,
data: stripped,
expiration: expirationSel.value
};


const resp = await fetch('/api/upload', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(payload)
});


const json = await resp.json();


if (!resp.ok) throw new Error(json.error || JSON.stringify(json));


// Postimages returns several fields; direct image link often in `image` or `direct` (varies)
const direct = json?.image || json?.direct || (json?.images && json.images[0]) || null;


statusEl.textContent = 'Upload complete!';
resultEl.innerHTML = `
<div class="link">
<input readonly id="directLink" value="${direct || JSON.stringify(json)}" />
<button class="copy-btn" id="copyBtn">Copy</button>
</div>
<div style="margin-top:8px;"><a target="_blank" rel="noopener" href="${json?.url || '#'}">Open postimages page</a></div>
`;


document.getElementById('copyBtn').addEventListener('click', () => {
const el = document.getElementById('directLink');
el.select();
document.execCommand('copy');
alert('Copied to clipboard');
});


} catch (err) {
console.error(err);
statusEl.textContent = 'Error: ' + (err.message || err);
resultEl.innerHTML = '';
} finally {
uploadBtn.disabled = false;
}
});


function fileToBase64(file) {
return new Promise((resolve, reject) => {
const reader = new FileReader();
reader.onload = () => resolve(reader.result);
reader.onerror = reject;
reader.readAsDataURL(file);
});
}
