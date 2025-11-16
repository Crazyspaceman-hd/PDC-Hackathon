const urlInput = document.getElementById('urlInput');
const scrapeBtn = document.getElementById('scrapeBtn');
const errorMessage = document.getElementById('errorMessage');
const articleSection = document.getElementById('articleSection');
const articleTitle = document.getElementById('articleTitle');
const articleUrl = document.getElementById('articleUrl');
const articleContent = document.getElementById('articleContent');
const articleOutput = document.getElementById('articleOutput');
const amendedOutput = document.getElementById('amendedOutput');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const downloadAmendedBtn = document.getElementById('downloadAmendedBtn');
const amendBtn = document.getElementById('amendBtn');

// Handle Enter key in URL input
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        scrapeArticle();
    }
});

// Scrape button click
scrapeBtn.addEventListener('click', scrapeArticle);

// Copy button
copyBtn.addEventListener('click', () => {
    articleContent.select();
    document.execCommand('copy');
    
    // Visual feedback
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✓ Copied!';
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
});

// Clear button
clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the article?')) {
        articleSection.style.display = 'none';
        urlInput.value = '';
        articleContent.value = '';
        articleOutput.innerHTML = '<p class="output-placeholder">Article content will appear here...</p>';
        amendedOutput.innerHTML = '<p class="output-placeholder">Click the button above to amend measurements with animal or sport comparisons...</p>';
        articleTitle.textContent = '';
        articleUrl.textContent = '';
        downloadAmendedBtn.style.display = 'none';
        hideError();
    }
});

// Amend button
amendBtn.addEventListener('click', amendArticle);

// Download button
downloadBtn.addEventListener('click', () => {
    const title = articleTitle.textContent || 'article';
    const content = articleContent.value;
    const url = articleUrl.textContent;
    
    const fullContent = `${title}\n\nSource: ${url}\n\n${content}`;
    
    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url_blob = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url_blob;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url_blob);
});

// Download amended button
downloadAmendedBtn.addEventListener('click', () => {
    const title = articleTitle.textContent || 'article';
    const amendedText = amendedOutput.textContent.trim();
    const url = articleUrl.textContent;
    
    const fullContent = `${title} (Amended)\n\nSource: ${url}\n\n${amendedText}`;
    
    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url_blob = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url_blob;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_amended.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url_blob);
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

async function scrapeArticle() {
    const url = urlInput.value.trim();
    
    if (!url) {
        showError('Please enter a URL');
        return;
    }
    
    // Hide previous errors and article
    hideError();
    articleSection.style.display = 'none';
    
    // Show loading state
    scrapeBtn.disabled = true;
    const buttonText = scrapeBtn.querySelector('.button-text');
    const buttonLoader = scrapeBtn.querySelector('.button-loader');
    buttonText.style.display = 'none';
    buttonLoader.style.display = 'inline';
    
    try {
        const response = await fetch('/api/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to scrape article');
        }
        
        // Display the article
        articleTitle.textContent = data.title || 'Untitled Article';
        articleUrl.textContent = data.url;
        articleUrl.href = data.url;
        articleUrl.target = '_blank';
        
        // Populate output area
        if (data.content) {
            // Format content with proper line breaks
            const formattedContent = data.content
                .split(/\n\n+/)
                .filter(para => para.trim())
                .map(para => '<p>' + para.trim().replace(/\n/g, '<br>') + '</p>')
                .join('');
            articleOutput.innerHTML = formattedContent || '<p class="output-placeholder">No content found</p>';
        } else {
            articleOutput.innerHTML = '<p class="output-placeholder">No content found</p>';
        }
        
        // Populate editable textarea
        articleContent.value = data.content || '';
        
        articleSection.style.display = 'block';
        
        // Scroll to article
        articleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to scrape article. Please check the URL and try again.');
    } finally {
        // Reset button state
        scrapeBtn.disabled = false;
        buttonText.style.display = 'inline';
        buttonLoader.style.display = 'none';
    }
}

async function amendArticle() {
    const articleText = articleContent.value.trim();
    
    if (!articleText) {
        showError('Please scrape an article first or enter text to amend');
        return;
    }
    
    // Show loading state
    amendBtn.disabled = true;
    const buttonText = amendBtn.querySelector('.button-text');
    const buttonLoader = amendBtn.querySelector('.button-loader');
    buttonText.style.display = 'none';
    buttonLoader.style.display = 'inline';
    
    // Clear previous amended output
    amendedOutput.innerHTML = '<p class="output-placeholder">Processing...</p>';
    hideError();
    
    try {
        const response = await fetch('/api/amend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: articleText })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to amend article');
        }
        
        // Display amended text
        if (data.amended_text) {
            const formattedContent = data.amended_text
                .split(/\n\n+/)
                .filter(para => para.trim())
                .map(para => '<p>' + para.trim().replace(/\n/g, '<br>') + '</p>')
                .join('');
            amendedOutput.innerHTML = formattedContent || '<p class="output-placeholder">No content returned</p>';
            downloadAmendedBtn.style.display = 'inline-block';
        } else {
            amendedOutput.innerHTML = '<p class="output-placeholder">No amended content returned</p>';
        }
        
        // Scroll to amended section
        amendedOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to amend article. Please try again.');
        amendedOutput.innerHTML = '<p class="output-placeholder">Error processing article. Please try again.</p>';
    } finally {
        // Reset button state
        amendBtn.disabled = false;
        buttonText.style.display = 'inline';
        buttonLoader.style.display = 'none';
    }
}

