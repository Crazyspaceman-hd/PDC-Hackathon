from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import re
import os
from openai import OpenAI

app = Flask(__name__, static_folder='static')
CORS(app)

# Initialize OpenAI client (will use OPENAI_API_KEY from environment)
openai_client = None
if os.getenv('OPENAI_API_KEY'):
    openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def clean_text(text):
    """Clean and normalize text content"""
    if not text:
        return ""
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove leading/trailing whitespace
    text = text.strip()
    return text

def scrape_article(url):
    """Scrape article content from URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "header", "footer", "aside", "advertisement"]):
            script.decompose()
        
        # Try to find article content using common selectors
        article = None
        article_selectors = [
            'article',
            '[role="article"]',
            '.article-body',
            '.article-content',
            '.post-content',
            '.entry-content',
            '.story-body',
            '.content-body',
            'main article',
            '.article-text',
            '#article-body',
            '#article-content'
        ]
        
        for selector in article_selectors:
            article = soup.select_one(selector)
            if article:
                break
        
        # If no article found, try to get main content
        if not article:
            article = soup.find('main') or soup.find('article') or soup.find('body')
        
        if not article:
            return {"error": "Could not find article content"}
        
        # Extract text content
        text_content = article.get_text(separator='\n\n', strip=True)
        text_content = clean_text(text_content)
        
        # Extract title
        title = None
        title_selectors = ['h1', '.article-title', '.headline', 'title']
        for selector in title_selectors:
            title_elem = soup.select_one(selector)
            if title_elem:
                title = clean_text(title_elem.get_text())
                break
        
        if not title:
            title = soup.find('title')
            title = clean_text(title.get_text()) if title else "Untitled Article"
        
        return {
            "title": title,
            "content": text_content,
            "url": url
        }
        
    except requests.exceptions.RequestException as e:
        return {"error": f"Failed to fetch URL: {str(e)}"}
    except Exception as e:
        return {"error": f"Error scraping article: {str(e)}"}

@app.route('/api/scrape', methods=['POST'])
def scrape():
    """API endpoint to scrape news article"""
    data = request.get_json()
    url = data.get('url')
    
    if not url:
        return jsonify({"error": "URL is required"}), 400
    
    # Validate URL format
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    result = scrape_article(url)
    
    if 'error' in result:
        return jsonify(result), 400
    
    return jsonify(result), 200

@app.route('/api/amend', methods=['POST'])
def amend_article():
    """API endpoint to amend article measurements with animal/sport references"""
    if not openai_client:
        return jsonify({"error": "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable."}), 500
    
    data = request.get_json()
    article_text = data.get('text')
    
    if not article_text:
        return jsonify({"error": "Article text is required"}), 400
    
    try:
        prompt = f"""Replace all measurements in the following text. For every measurement (distance, weight, size, speed, temperature, or population), replace it with a comparison to a different entity that shares that attribute restructure the sentence to make the change more natural.

For example:
- "2 meters" could become "the length of 7 and a half submarine sandwiches"
- "50 kilograms" could become "roughly the weight of 3 corgies"
- "100 km/h" could become "more than 3 times the top speed of your average electric bicycle"
- "5 feet tall" could become "1 Danny DeVito"
- "10,000 people" could become "the population of Montpellier, France"

Keep the tone professional but engaging. Preserve all other content exactly as is, only modifying sentences that contain measurements.

Article text:
{article_text}

Amended article:"""

        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that adds quirky measurements to news articles relate the measurements in the article to different entities that share that attribute."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=4000
        )
        
        amended_text = response.choices[0].message.content.strip()
        
        return jsonify({
            "amended_text": amended_text,
            "success": True
        }), 200
        
    except Exception as e:
        error_message = str(e)
        
        # Handle specific OpenAI API errors
        if "insufficient_quota" in error_message or "429" in error_message:
            return jsonify({
                "error": "OpenAI API quota exceeded. Please check your OpenAI account billing and usage limits.",
                "error_type": "quota_exceeded"
            }), 429
        elif "invalid_api_key" in error_message or "401" in error_message:
            return jsonify({
                "error": "Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.",
                "error_type": "invalid_key"
            }), 401
        
        return jsonify({
            "error": f"Error processing article: {error_message}",
            "error_type": "general_error"
        }), 500

@app.route('/')
def index():
    """Serve the main page"""
    return app.send_static_file('index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

