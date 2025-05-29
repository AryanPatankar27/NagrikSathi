import praw
import google.generativeai as genai
from pymongo import MongoClient
from flask import Flask, render_template, jsonify
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

# Initialize tools
genai.configure(api_key="AIzaSyAOJJTVluZORi7fltX9VRlPdRQWEq5TNuA")  # Your Gemini API key

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
            return 19.0760, 72.8777  # Fallback to Mumbai center
    except Exception as e:
        logger.error(f"Geocoding error for {key}: {e}")
        return None, None
    finally:
        time.sleep(1)  # Respect Nominatim rate limit

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

# Scrape Reddit using PRAW
def scrape_reddit():
    reddit = praw.Reddit(
        client_id="FAshDYgtBb9WTlCpAQCv8w",  # Replace with your Reddit app client ID
        client_secret="oDe8C3_x5xWiAAD3kmJcXI3C5-t3Nw",  # Replace with your Reddit app client secret
        user_agent="civic_issues_scraper"
    )
    subreddits = ["mumbai", "india"]
    posts = []
    for subreddit_name in subreddits:
        subreddit = reddit.subreddit(subreddit_name)
        for keyword in keywords:
            try:
                for submission in subreddit.search(keyword, limit=10):
                    post_text = f"{submission.title} {submission.selftext}"
                    posts.append(post_text)
                    logger.info(f"Scraped post from r/{subreddit_name}: {post_text[:50]}...")
            except Exception as e:
                logger.error(f"Error scraping r/{subreddit_name} for '{keyword}': {e}")
    return posts

# Scrape news websites
def scrape_news():
    news_urls = [
        f"https://timesofindia.indiatimes.com/city/mumbai?sort=new-desc&q={quote(keyword)}"
        for keyword in keywords
    ]
    posts = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0"
    }
    for url in news_urls:
        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            articles = soup.find_all('div', class_='uwU81')  # Times of India article class
            for article in articles[:5]:  # Limit to 5 articles per keyword
                title = article.find('span')
                if title:
                    posts.append(title.text.strip())
                    logger.info(f"Scraped news article: {title.text.strip()[:50]}...")
        except Exception as e:
            logger.error(f"Error scraping news {url}: {e}")
    return posts

# Combine scraping sources
def scrape_social_media():
    reddit_posts = scrape_reddit()
    news_posts = scrape_news()
    return reddit_posts + news_posts

# Process posts with Gemini
def process_post(post):
    prompt = f"""
    Analyze the following post and extract:
    - Issue: The specific civic issue (e.g., power outage, waterlogging). Return null if no clear issue is mentioned.
    - Location: An object with "city" and "area". Set "area" to null if not specified. Ensure "city" is "Mumbai" if the post is Mumbai-related.
    - Sentiment: Positive, negative, or neutral.
    - Post_text: The original post text.
    Output as a JSON object with keys "issue", "location" (with "city" and "area"), "sentiment", and "post_text".
    Post: "{post}"
    """
    try:
        model = genai.GenerativeModel('gemini-2.5-pro-preview-05-06')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error processing post: {post[:30]}...: {e}")
        return "{}"

# Process and store data
def process_and_store():
    posts = scrape_social_media()
    logger.info(f"Scraped {len(posts)} posts")
    for post in posts:
        if not post or not isinstance(post, str):
            logger.warning(f"Skipping invalid post: {post}")
            continue
        data = process_post(post)
        try:
            data_dict = json.loads(data)
            issue = data_dict.get("issue")
            location = data_dict.get("location", {})
            city = location.get("city")
            area = location.get("area")
            sentiment = data_dict.get("sentiment", "neutral")
            post_text = data_dict.get("post_text", post)
            if issue and city and city.lower() == "mumbai":
                lat, lon = geocode(city, area)
                if lat and lon:
                    issues_collection.insert_one({
                        'issue_type': issue,
                        'city': city,
                        'area': area or None,
                        'latitude': lat,
                        'longitude': lon,
                        'sentiment': sentiment,
                        'post_text': post_text,
                        'timestamp': datetime.now()
                    })
                    logger.info(f"Stored issue: {issue} in {area or 'Mumbai'}")
        except json.JSONDecodeError:
            logger.error(f"Failed to parse: {data}")

# Schedule scraping every 5 minutes
schedule.every(5).minutes.do(process_and_store)

# Flask routes
@app.route('/')
def show_map():
    return render_template('map2.html')

@app.route('/get_issues')
def get_issues():
    issues = list(issues_collection.find({}, {'_id': 0}))
    for issue in issues:
        issue['timestamp'] = issue['timestamp'].isoformat()
    logger.info(f"Retrieved {len(issues)} issues for map")
    return jsonify(issues)

# Run scheduler in a separate thread
def run_scheduler():
    while True:
        schedule.run_pending()
        time.sleep(5)

if __name__ == '__main__':
    scheduler_thread = threading.Thread(target=run_scheduler)
    scheduler_thread.daemon = True
    scheduler_thread.start()
    app.run(debug=True)
