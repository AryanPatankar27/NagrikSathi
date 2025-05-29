import praw
import google.generativeai as genai
from pymongo import MongoClient
from flask import Flask, render_template, jsonify
from flask_cors import CORS  # Added for CORS support
import schedule
import time
from datetime import datetime
import json
import threading
from urllib.parse import quote
from geopy.geocoders import Nominatim
import requests
from bs4 import BeautifulSoup
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, template_folder='templates')
CORS(app)  # Enable CORS for all routes

# Initialize tools
genai.configure(api_key="AIzaSyAOJJTVluZORi7fltX9VRlPdRQWEq5TNuA")

# Global statistics tracking
scraping_stats = {
    'total_scraped': 0,
    'total_processed': 0,
    'total_stored': 0,
    'total_duplicates': 0,
    'total_errors': 0,
    'last_run': None,
    'is_running': False
}

client = MongoClient('mongodb+srv://aryanpatankar27:jGGnWtIjE97rF5C5@cluster0.vtjqcbw.mongodb.net/')
db = client['civic_issues_db']
issues_collection = db['issues']

# Geocoding with Nominatim
geolocator = Nominatim(user_agent="civic_issues_mumbai")
geocode_cache = {}

def geocode(city, area):
    if city.lower() != "mumbai":
        logger.warning(f"Non-Mumbai city detected: {city}")
        return None, None
    key = f"{city}_{area if area else 'Mumbai'}"
    if key in geocode_cache:
        return geocode_cache[key]
    try:
        if area:
            location = geolocator.geocode(f"{area}, {city}, India")
        else:
            location = geolocator.geocode(f"{city}, India")
        if location:
            coords = (location.latitude, location.longitude)
            geocode_cache[key] = coords
            logger.info(f"Geocoded {key}: {coords}")
            return coords
        else:
            logger.warning(f"No coordinates found for {key}, using Mumbai default")
            return 19.0760, 72.8777
    except Exception as e:
        logger.error(f"Geocoding error for {key}: {e}")
        return None, None
    finally:
        time.sleep(1)

# Keywords for civic issues
keywords = [
    "no light", "power cut", "electricity issue",
    "waterlogging", "flooding",
    "no water", "water supply issue",
    "garbage", "trash", "waste disposal",
    "traffic jam", "traffic congestion",
    "road repair", "potholes",
    "sewage", "drainage problem",
    "pollution", "air quality", "noise pollution",
    "encroachment", "illegal construction",
    "crime", "safety concern"
]

# Global state to track scraping progress
scraping_state = {
    'current_keyword_index': 0,
    'current_subreddit_index': 0,
    'current_news_keyword_index': 0,
    'processing_reddit': True
}

def scrape_reddit_batch(batch_size=5):
    reddit = praw.Reddit(
        client_id="FAshDYgtBb9WTlCpAQCv8w",
        client_secret="oDe8C3_x5xWiAAD3kmJcXI3C5-t3Nw",
        user_agent="civic_issues_scraper"
    )
    subreddits = ["mumbai", "india"]
    processed_count = 0
    
    while processed_count < batch_size and scraping_state['processing_reddit']:
        if scraping_state['current_subreddit_index'] >= len(subreddits):
            scraping_state['current_subreddit_index'] = 0
            scraping_state['current_keyword_index'] += 1
            
        if scraping_state['current_keyword_index'] >= len(keywords):
            scraping_state['processing_reddit'] = False
            logger.info("Finished Reddit batch, moving to news scraping")
            break
            
        subreddit_name = subreddits[scraping_state['current_subreddit_index']]
        keyword = keywords[scraping_state['current_keyword_index']]
        
        try:
            subreddit = reddit.subreddit(subreddit_name)
            posts_found = 0
            
            for submission in subreddit.search(keyword, limit=3):
                if processed_count >= batch_size:
                    break
                    
                post_data = {
                    'text': f"{submission.title} {submission.selftext}",
                    'url': submission.url,
                    'author': submission.author.name if submission.author else 'Unknown',
                    'created_at': datetime.utcfromtimestamp(submission.created_utc),
                    'source': 'Reddit'
                }
                logger.info(f"Scraped Reddit post from r/{subreddit_name}: {post_data['text'][:50]}...")
                
                if process_and_store_single_post(post_data):
                    processed_count += 1
                    posts_found += 1
                
                time.sleep(2)
                
            if posts_found == 0:
                logger.info(f"No posts found for keyword '{keyword}' in r/{subreddit_name}")
                
        except Exception as e:
            logger.error(f"Error scraping r/{subreddit_name} for '{keyword}': {e}")
        
        scraping_state['current_subreddit_index'] += 1
    
    return processed_count

def scrape_news_batch(batch_size=5):
    processed_count = 0
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0"
    }
    
    while processed_count < batch_size and scraping_state['current_news_keyword_index'] < len(keywords):
        keyword = keywords[scraping_state['current_news_keyword_index']]
        url = f"https://timesofindia.indiatimes.com/city/mumbai?sort=new-desc&q={quote(keyword)}"
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            articles = soup.find_all('div', class_='uwU81')
            
            articles_found = 0
            for article in articles[:3]:
                if processed_count >= batch_size:
                    break
                    
                title = article.find('span')
                if title:
                    post_data = {
                        'text': title.text.strip(),
                        'url': article.find('a')['href'] if article.find('a') else url,
                        'author': 'Unknown',  # News articles may not have author info
                        'created_at': datetime.now(),  # News articles may not provide creation date
                        'source': 'Times of India'
                    }
                    logger.info(f"Scraped news article: {post_data['text'][:50]}...")
                    
                    if process_and_store_single_post(post_data):
                        processed_count += 1
                        articles_found += 1
                    
                    time.sleep(2)
            
            if articles_found == 0:
                logger.info(f"No articles found for keyword '{keyword}'")
                
        except Exception as e:
            logger.error(f"Error scraping news for '{keyword}': {e}")
        
        scraping_state['current_news_keyword_index'] += 1
    
    return processed_count

def process_post(post):
    prompt = f"""
    Analyze the following post and extract ONLY civic issues related to Mumbai:
    - Issue: The specific civic issue (e.g., power outage, waterlogging, garbage, traffic). Return null if no clear civic issue is mentioned.
    - Location: An object with "city" and "area". Set "area" to null if not specified. Ensure "city" is "Mumbai" if the post is Mumbai-related.
    - Sentiment: Positive, negative, or neutral.
    - Post_text: The original post text (keep it concise).
    
    IMPORTANT: Only extract if it's a genuine civic issue in Mumbai. Ignore general discussions, advertisements, or non-civic content.
    
    Output ONLY a valid JSON object with keys "issue", "location" (with "city" and "area"), "sentiment", and "post_text".
    
    Post: "{post[:500]}"
    """
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        scraping_stats['total_processed'] += 1
        
        response_text = response.text.strip()
        if response_text.startswith('```json'):
            response_text = response_text.replace('```json', '').replace('```', '').strip()
        
        logger.info(f"Gemini response: {response_text[:100]}...")
        time.sleep(2)
        return response_text
        
    except Exception as e:
        scraping_stats['total_errors'] += 1
        logger.error(f"Error processing post: {post[:30]}...: {e}")
        if "rate limit" in str(e).lower() or "quota" in str(e).lower():
            logger.warning("Rate limit hit, waiting 30 seconds...")
            time.sleep(30)
        return '{"issue": null, "location": {"city": null, "area": null}, "sentiment": "neutral", "post_text": ""}'

def process_and_store_single_post(post_data):
    post = post_data['text']
    if not post or not isinstance(post, str) or len(post.strip()) < 10:
        logger.warning(f"Skipping invalid/short post: {post}")
        return False
    
    scraping_stats['total_scraped'] += 1
    
    # Check for duplicates using URL
    existing_post = issues_collection.find_one({'url': post_data['url']})
    if existing_post:
        logger.info(f"Skipped duplicate post: {post[:50]}...")
        scraping_stats['total_duplicates'] += 1
        return False
    
    logger.info(f"Processing post: {post[:100]}...")
    data = process_post(post)
    
    try:
        data_cleaned = data.strip()
        if not data_cleaned:
            logger.warning("Empty response from Gemini")
            return False
            
        data_dict = json.loads(data_cleaned)
        issue = data_dict.get("issue")
        location = data_dict.get("location", {})
        city = location.get("city") if location else None
        area = location.get("area") if location else None
        sentiment = data_dict.get("sentiment", "neutral")
        post_text = data_dict.get("post_text", post)
        
        if not issue or issue.lower() == "null" or not city:
            logger.info(f"Post not relevant - Issue: {issue}, City: {city}")
            return False
            
        if city.lower() != "mumbai":
            logger.info(f"Post not Mumbai-related: {city}")
            return False
        
        lat, lon = geocode(city, area)
        if not lat or not lon:
            logger.warning(f"Could not geocode location: {city}, {area}")
            return False
        
        document = {
            'issue_type': issue,
            'city': city,
            'area': area or None,
            'latitude': lat,
            'longitude': lon,
            'sentiment': sentiment,
            'post_text': post_text[:500],
            'url': post_data['url'],
            'author': post_data['author'],
            'created_at': post_data['created_at'],
            'source': post_data['source'],
            'timestamp': datetime.now()
        }
        
        result = issues_collection.insert_one(document)
        if result.inserted_id:
            scraping_stats['total_stored'] += 1
            logger.info(f"✅ STORED: {issue} in {area or 'Mumbai'} (ID: {result.inserted_id})")
            print(f"🎯 NEW CIVIC ISSUE FOUND: {issue} - {area or 'Mumbai'}")
            return True
        else:
            logger.error("Failed to insert document into MongoDB")
            return False
            
    except json.JSONDecodeError as e:
        scraping_stats['total_errors'] += 1
        logger.error(f"JSON decode error: {e}")
        logger.error(f"Raw response was: {data}")
        return False
    except Exception as e:
        scraping_stats['total_errors'] += 1
        logger.error(f"Unexpected error storing post: {e}")
        return False

def process_batch():
    if scraping_stats['is_running']:
        logger.warning("Batch processing already running, skipping...")
        return 0
        
    scraping_stats['is_running'] = True
    scraping_stats['last_run'] = datetime.now()
    
    batch_size = 3
    total_processed = 0
    max_attempts = 10
    
    logger.info("🚀 Starting batch processing...")
    print(f"📊 Stats: Scraped={scraping_stats['total_scraped']}, Stored={scraping_stats['total_stored']}, Errors={scraping_stats['total_errors']}")
    
    try:
        if scraping_state['processing_reddit'] and max_attempts > 0:
            reddit_processed = scrape_reddit_batch(batch_size)
            total_processed += reddit_processed
            logger.info(f"Processed {reddit_processed} Reddit posts in this batch")
            max_attempts -= 1
        
        if total_processed < batch_size and not scraping_state['processing_reddit'] and max_attempts > 0:
            remaining_slots = batch_size - total_processed
            news_processed = scrape_news_batch(remaining_slots)
            total_processed += news_processed
            logger.info(f"Processed {news_processed} news articles in this batch")
            max_attempts -= 1
        
        if (not scraping_state['processing_reddit'] and 
            scraping_state['current_news_keyword_index'] >= len(keywords)):
            logger.info("🔄 Completed full cycle, resetting scraping state")
            scraping_state['current_keyword_index'] = 0
            scraping_state['current_subreddit_index'] = 0
            scraping_state['current_news_keyword_index'] = 0
            scraping_state['processing_reddit'] = True
        
        logger.info(f"✅ Batch complete. Total processed: {total_processed}")
        print(f"📈 Updated Stats: Scraped={scraping_stats['total_scraped']}, Stored={scraping_stats['total_stored']}")
        
        display_recent_issues()
        
    except Exception as e:
        logger.error(f"Error in batch processing: {e}")
        scraping_stats['total_errors'] += 1
    finally:
        scraping_stats['is_running'] = False
    
    return total_processed

def display_recent_issues():
    try:
        recent_issues = list(issues_collection.find({}, {'_id': 0}).sort('timestamp', -1).limit(5))
        if recent_issues:
            print("\n🏙️ RECENT CIVIC ISSUES FOUND:")
            print("-" * 50)
            for i, issue in enumerate(recent_issues, 1):
                area_info = f" in {issue['area']}" if issue.get('area') else ""
                print(f"{i}. {issue['issue_type']}{area_info} [{issue['sentiment']}]")
                print(f"   📍 {issue['latitude']:.4f}, {issue['longitude']:.4f}")
                print(f"   🕒 {issue['timestamp'].strftime('%Y-%m-%d %H:%M')}")
                print()
        else:
            print("📭 No issues stored yet.")
    except Exception as e:
        logger.error(f"Error displaying recent issues: {e}")

schedule.every(10).minutes.do(process_batch)

@app.route('/')
def show_map():
    logger.info("Rendering map2.html")
    return render_template('map2.html')

@app.route('/get_issues')
def get_issues():
    logger.info("Fetching issues from MongoDB")
    issues = list(issues_collection.find({}, {'_id': 0}))
    for issue in issues:
        issue['timestamp'] = issue['timestamp'].isoformat()
    logger.info(f"Retrieved {len(issues)} issues for map")
    return jsonify(issues)

@app.route('/manual_batch')
def manual_batch():
    logger.info("Triggering manual batch processing")
    processed = process_batch()
    return jsonify({"message": f"Processed {processed} posts", "status": "success"})

def run_scheduler():
    while True:
        schedule.run_pending()
        time.sleep(10)

def run_initial_batch():
    logger.info("Starting initial batch processing in background...")
    try:
        process_batch()
    except Exception as e:
        logger.error(f"Error in initial batch processing: {e}")

if __name__ == '__main__':
    # Start initial batch processing in a separate thread
    initial_batch_thread = threading.Thread(target=run_initial_batch)
    initial_batch_thread.daemon = True
    initial_batch_thread.start()
    
    # Start scheduler in a separate thread
    scheduler_thread = threading.Thread(target=run_scheduler)
    scheduler_thread.daemon = True
    scheduler_thread.start()
    
    # Start Flask app on the main thread
    logger.info("Starting Flask app...")
    app.run(debug=True, host='0.0.0.0', port=5002)