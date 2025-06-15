#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import os
import time
import json

def get_all_sidebar_links():
    """Extract all links from the sidebar navigation"""
    base_url = "https://brain.iqai.com"
    start_url = "https://brain.iqai.com/getting-started/overview"
    
    # Define the known structure based on the sidebar
    sections = {
        "getting-started": ["overview", "quickstart","agent-creation","creating-plugins","test-agent","deployment","example-agents"],
        "plugins": [
            "overview", "abi", "near", "fraxlend", "odos", "wiki", 
            "atp", "bamm", "heartbeat", "sequencer", "bootstrap", 
            "images", "node", "solana", "mcp", "wallet"
        ],
        "clients": ["discord", "telegram", "twitter"],
        "adapters":["sqlite","postgres"]
    }
    
    urls = []
    for section, pages in sections.items():
        for page in pages:
            url = f"{base_url}/{section}/{page}"
            urls.append(url)
    
    return urls

def extract_text_content(html_content):
    """Extract clean text content from HTML"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Remove script and style elements
    for script in soup(["script", "style", "nav", "header", "footer"]):
        script.decompose()
    
    # Get text from main content area (adjust selector based on site structure)
    main_content = soup.find('main') or soup.find('article') or soup.find('div', class_='content') or soup.body
    
    if main_content:
        text = main_content.get_text()
    else:
        text = soup.get_text()
    
    # Clean up the text
    lines = (line.strip() for line in text.splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    text = '\n'.join(chunk for chunk in chunks if chunk)
    
    return text

def crawl_brain_docs():
    """Crawl all Brain Framework documentation pages and extract text"""
    urls = get_all_sidebar_links()
    
    # Create output directories
    os.makedirs("brain_docs", exist_ok=True)
    os.makedirs("brain_docs/text", exist_ok=True)
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    results = []
    all_text_content = []
    
    for i, url in enumerate(urls):
        print(f"Crawling {i+1}/{len(urls)}: {url}")
        
        try:
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                # Extract text content
                text_content = extract_text_content(response.text)
                
                # Create filename from URL
                filename = url.replace("https://brain.iqai.com/", "").replace("/", "_")
                text_filename = filename + ".txt"
                text_filepath = os.path.join("brain_docs/text", text_filename)
                
                # Save text content
                with open(text_filepath, 'w', encoding='utf-8') as f:
                    f.write(f"URL: {url}\n")
                    f.write("="*50 + "\n\n")
                    f.write(text_content)
                
                # Extract title
                soup = BeautifulSoup(response.text, 'html.parser')
                title = soup.find('title').get_text() if soup.find('title') else url
                
                # Add to combined content
                all_text_content.append({
                    'url': url,
                    'title': title,
                    'content': text_content
                })
                
                results.append({
                    'url': url,
                    'title': title,
                    'filename': text_filename,
                    'status': 'success',
                    'text_length': len(text_content)
                })
                
                print(f"  ✓ Saved: {text_filename} ({len(text_content)} characters)")
            else:
                print(f"  ✗ Failed: {response.status_code}")
                results.append({
                    'url': url,
                    'status': f'failed_{response.status_code}'
                })
                
        except Exception as e:
            print(f"  ✗ Error: {e}")
            results.append({
                'url': url,
                'status': f'error_{str(e)}'
            })
        
        # Be respectful with requests
        time.sleep(1)
    
    # Save combined text file
    with open("brain_docs/all_content.txt", 'w', encoding='utf-8') as f:
        for item in all_text_content:
            f.write(f"\n{'='*80}\n")
            f.write(f"TITLE: {item['title']}\n")
            f.write(f"URL: {item['url']}\n")
            f.write(f"{'='*80}\n\n")
            f.write(item['content'])
            f.write(f"\n\n{'='*80}\n")
    
    # Save results summary
    with open("brain_docs/crawl_results.json", 'w') as f:
        json.dump(results, f, indent=2)
    
    successful_pages = len([r for r in results if r['status'] == 'success'])
    total_chars = sum([r.get('text_length', 0) for r in results if r['status'] == 'success'])
    
    print(f"\nCrawling complete!")
    print(f"✓ {successful_pages} pages successfully crawled")
    print(f"✓ Total text content: {total_chars:,} characters")
    print(f"✓ Individual text files saved to 'brain_docs/text/' directory")
    print(f"✓ Combined content saved to 'brain_docs/all_content.txt'")

if __name__ == "__main__":
    crawl_brain_docs()
