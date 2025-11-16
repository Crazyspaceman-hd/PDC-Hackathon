# News Article Scraper & Editor

A web application that allows users to input a news article URL, scrape the article content, and edit it in a user-friendly interface.

## Features

- 🎯 **Simple URL Input**: Just paste a news article URL
- 📰 **Smart Content Extraction**: Automatically extracts article title and body content
- ✏️ **Editable Interface**: Edit the scraped content directly in the browser
- 🤖 **AI-Powered Amendments**: Automatically amend measurements with animal or sport comparisons
- 📋 **Copy to Clipboard**: One-click copy functionality
- 💾 **Download as TXT**: Save original or amended articles as text files
- 🎨 **Modern UI**: Beautiful, responsive design

## Setup Instructions

### Prerequisites

- Python 3.7 or higher
- pip (Python package manager)
- OpenAI API key (for AI amendment feature)

### Installation

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up OpenAI API key (optional, for AI amendment feature):**
   
   On Windows:
   ```bash
   set OPENAI_API_KEY=your-api-key-here
   ```
   
   On Linux/Mac:
   ```bash
   export OPENAI_API_KEY=your-api-key-here
   ```
   
   Or create a `.env` file in the project root (not recommended for production):
   ```
   OPENAI_API_KEY=your-api-key-here
   ```

3. **Run the application:**
   ```bash
   python app.py
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5000`

## Usage

1. Enter a news article URL in the input field
2. Click "Scrape Article" or press Enter
3. The article content will be extracted and displayed in:
   - **Scraped Article Content**: Read-only view of the original content
   - **Edit Article**: Editable text area where you can modify the content
4. (Optional) Click "🤖 Amend Measurements with Animals/Sports" to have AI add animal or sport comparisons to all measurements
5. The amended article will appear in the "AI Amended Article" section
6. Use the "Copy" button to copy the content to clipboard
7. Use the "Download as TXT" button to save the original article
8. Use the "Download Amended TXT" button to save the AI-amended version

## How It Works

The application uses:
- **Flask**: Backend web framework
- **BeautifulSoup4**: HTML parsing and content extraction
- **Requests**: HTTP library for fetching web pages
- **OpenAI API**: AI-powered text amendment for measurements

The scraper intelligently identifies article content by looking for common HTML elements and attributes used by news websites. The AI amendment feature uses GPT-4o-mini to add engaging animal or sport comparisons to all measurements in the article while preserving the original measurements.

## Notes

- Some websites may block automated scraping. If a URL doesn't work, try a different article source.
- The scraper works best with standard news websites that use semantic HTML.
- Content extraction quality may vary depending on the website's HTML structure.

## License

This project is open source and available for use in the PDC Hackathon.

