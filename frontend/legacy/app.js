document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const imageInput = document.getElementById('imageInput');
    const resultsSection = document.getElementById('results-section');

    analyzeBtn.addEventListener('click', async () => {
        if (!imageInput.files || imageInput.files.length === 0) {
            alert('Please select an image first.');
            return;
        }

        // Logic to upload will be implemented in Stage 1
        resultsSection.style.display = 'block';
        resultsSection.innerHTML = '<p>Investigation started. (API connection pending Stage 1)</p>';
    });
});
