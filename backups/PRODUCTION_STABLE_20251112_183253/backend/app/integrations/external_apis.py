"""
External API Integration Module
News Sentiment Analysis & Social Media Monitoring for Prophecy Discussions
"""

import os
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import json

# Sentiment analysis (requires installation)
try:
    from textblob import TextBlob
    SENTIMENT_AVAILABLE = True
except ImportError:
    SENTIMENT_AVAILABLE = False
    print("Warning: TextBlob not installed. Sentiment analysis disabled.")
    print("Install with: pip install textblob")


class NewsAPIClient:
    """
    News API integration for earthquake/prophecy news sentiment
    API: https://newsapi.org (Free tier: 100 requests/day)
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize News API client
        
        Args:
            api_key: NewsAPI key (get from https://newsapi.org/register)
                     Falls back to NEWS_API_KEY environment variable
        """
        self.api_key = api_key or os.getenv('NEWS_API_KEY')
        self.base_url = "https://newsapi.org/v2"
        
        if not self.api_key:
            print("Warning: NEWS_API_KEY not set. News API functionality disabled.")
    
    def search_earthquake_news(self, days_back: int = 7, language: str = 'en') -> List[Dict]:
        """
        Search for recent earthquake-related news
        
        Args:
            days_back: Number of days to search back (default 7)
            language: Language code (default 'en')
        
        Returns:
            List of news articles with sentiment scores
        """
        if not self.api_key:
            return []
        
        from_date = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d')
        
        params = {
            'q': 'earthquake OR seismic OR tremor',
            'from': from_date,
            'language': language,
            'sortBy': 'publishedAt',
            'apiKey': self.api_key
        }
        
        try:
            response = requests.get(f"{self.base_url}/everything", params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            articles = []
            for article in data.get('articles', [])[:50]:  # Limit to 50
                processed = self._process_article(article, category='earthquake')
                articles.append(processed)
            
            return articles
        
        except Exception as e:
            print(f"Error fetching earthquake news: {e}")
            return []
    
    def search_prophecy_news(self, days_back: int = 30, language: str = 'en') -> List[Dict]:
        """
        Search for prophecy and biblical signs news
        
        Args:
            days_back: Number of days to search back (default 30)
            language: Language code (default 'en')
        
        Returns:
            List of news articles with sentiment scores
        """
        if not self.api_key:
            return []
        
        from_date = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d')
        
        # Multiple search queries for prophecy-related content
        queries = [
            '"biblical prophecy"',
            '"end times" signs',
            '"blood moon" prophecy',
            '"celestial signs" biblical'
        ]
        
        all_articles = []
        for query in queries:
            params = {
                'q': query,
                'from': from_date,
                'language': language,
                'sortBy': 'publishedAt',
                'apiKey': self.api_key
            }
            
            try:
                response = requests.get(f"{self.base_url}/everything", params=params, timeout=10)
                response.raise_for_status()
                data = response.json()
                
                for article in data.get('articles', [])[:20]:  # Limit per query
                    processed = self._process_article(article, category='prophecy')
                    all_articles.append(processed)
            
            except Exception as e:
                print(f"Error fetching prophecy news for '{query}': {e}")
        
        # Remove duplicates by URL
        seen_urls = set()
        unique_articles = []
        for article in all_articles:
            if article['url'] not in seen_urls:
                seen_urls.add(article['url'])
                unique_articles.append(article)
        
        return unique_articles
    
    def _process_article(self, article: Dict, category: str) -> Dict:
        """Process article and add sentiment analysis"""
        text = f"{article.get('title', '')} {article.get('description', '')}"
        
        sentiment = self.analyze_sentiment(text)
        
        return {
            'title': article.get('title'),
            'description': article.get('description'),
            'url': article.get('url'),
            'source': article.get('source', {}).get('name'),
            'published_at': article.get('publishedAt'),
            'category': category,
            'sentiment': sentiment,
            'image_url': article.get('urlToImage')
        }
    
    @staticmethod
    def analyze_sentiment(text: str) -> Dict:
        """
        Analyze sentiment of text using TextBlob
        
        Returns:
            Dict with polarity (-1 to 1) and classification
        """
        if not SENTIMENT_AVAILABLE or not text:
            return {'polarity': 0.0, 'classification': 'neutral'}
        
        try:
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            
            if polarity > 0.1:
                classification = 'positive'
            elif polarity < -0.1:
                classification = 'negative'
            else:
                classification = 'neutral'
            
            return {
                'polarity': round(polarity, 3),
                'classification': classification
            }
        except Exception as e:
            print(f"Sentiment analysis error: {e}")
            return {'polarity': 0.0, 'classification': 'neutral'}


class TwitterAPIClient:
    """
    Twitter/X API integration for social media monitoring
    API: https://developer.twitter.com (Free tier available with v2 API)
    
    Note: Twitter API requires OAuth 2.0 Bearer Token
    """
    
    def __init__(self, bearer_token: Optional[str] = None):
        """
        Initialize Twitter API client
        
        Args:
            bearer_token: Twitter API Bearer Token
                         Falls back to TWITTER_BEARER_TOKEN environment variable
        """
        self.bearer_token = bearer_token or os.getenv('TWITTER_BEARER_TOKEN')
        self.base_url = "https://api.twitter.com/2"
        
        if not self.bearer_token:
            print("Warning: TWITTER_BEARER_TOKEN not set. Twitter API functionality disabled.")
    
    def search_prophecy_tweets(self, max_results: int = 100) -> List[Dict]:
        """
        Search recent tweets about biblical prophecy and signs
        
        Args:
            max_results: Maximum tweets to return (10-100, default 100)
        
        Returns:
            List of tweets with sentiment analysis
        """
        if not self.bearer_token:
            return []
        
        # Search query (Twitter advanced search syntax)
        query = '(biblical prophecy OR blood moon OR end times signs OR celestial signs) -is:retweet lang:en'
        
        params = {
            'query': query,
            'max_results': min(max_results, 100),
            'tweet.fields': 'created_at,public_metrics,author_id',
            'expansions': 'author_id',
            'user.fields': 'username,verified'
        }
        
        headers = {
            'Authorization': f'Bearer {self.bearer_token}'
        }
        
        try:
            response = requests.get(
                f"{self.base_url}/tweets/search/recent",
                headers=headers,
                params=params,
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            tweets = []
            users = {user['id']: user for user in data.get('includes', {}).get('users', [])}
            
            for tweet in data.get('data', []):
                processed = self._process_tweet(tweet, users)
                tweets.append(processed)
            
            return tweets
        
        except Exception as e:
            print(f"Error fetching tweets: {e}")
            return []
    
    def _process_tweet(self, tweet: Dict, users: Dict) -> Dict:
        """Process tweet and add sentiment analysis"""
        author = users.get(tweet.get('author_id'), {})
        text = tweet.get('text', '')
        
        sentiment = NewsAPIClient.analyze_sentiment(text)
        metrics = tweet.get('public_metrics', {})
        
        return {
            'id': tweet.get('id'),
            'text': text,
            'author': author.get('username'),
            'author_verified': author.get('verified', False),
            'created_at': tweet.get('created_at'),
            'likes': metrics.get('like_count', 0),
            'retweets': metrics.get('retweet_count', 0),
            'replies': metrics.get('reply_count', 0),
            'sentiment': sentiment,
            'url': f"https://twitter.com/{author.get('username')}/status/{tweet.get('id')}" if author.get('username') else None
        }


class USGSEarthquakeClient:
    """
    USGS Real-Time Earthquake Feed Integration
    API: https://earthquake.usgs.gov/fdsnws/event/1/
    No API key required (public data)
    """
    
    def __init__(self):
        """Initialize USGS API client"""
        self.base_url = "https://earthquake.usgs.gov/fdsnws/event/1"
    
    def get_recent_earthquakes(self, min_magnitude: float = 4.5, days_back: int = 30) -> List[Dict]:
        """
        Fetch recent earthquakes from USGS
        
        Args:
            min_magnitude: Minimum magnitude to fetch (default 4.5)
            days_back: Number of days to look back (default 30)
        
        Returns:
            List of earthquake events in standardized format
        """
        start_time = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d')
        
        params = {
            'format': 'geojson',
            'starttime': start_time,
            'minmagnitude': min_magnitude,
            'orderby': 'time'
        }
        
        try:
            response = requests.get(f"{self.base_url}/query", params=params, timeout=15)
            response.raise_for_status()
            data = response.json()
            
            earthquakes = []
            for feature in data.get('features', []):
                props = feature.get('properties', {})
                coords = feature.get('geometry', {}).get('coordinates', [])
                
                earthquakes.append({
                    'magnitude': props.get('mag'),
                    'place': props.get('place'),
                    'time': datetime.fromtimestamp(props.get('time') / 1000).isoformat() if props.get('time') else None,
                    'longitude': coords[0] if len(coords) > 0 else None,
                    'latitude': coords[1] if len(coords) > 1 else None,
                    'depth': coords[2] if len(coords) > 2 else None,
                    'url': props.get('url'),
                    'tsunami': props.get('tsunami', 0) == 1,
                    'type': props.get('type'),
                    'status': props.get('status')
                })
            
            return earthquakes
        
        except Exception as e:
            print(f"Error fetching USGS earthquakes: {e}")
            return []


class ExternalDataAggregator:
    """
    Aggregate data from all external APIs
    Provides unified interface for fetching and analyzing multi-source data
    """
    
    def __init__(self, news_api_key: Optional[str] = None, twitter_bearer_token: Optional[str] = None):
        """
        Initialize aggregator with API credentials
        
        Args:
            news_api_key: NewsAPI key
            twitter_bearer_token: Twitter Bearer Token
        """
        self.news_client = NewsAPIClient(news_api_key)
        self.twitter_client = TwitterAPIClient(twitter_bearer_token)
        self.usgs_client = USGSEarthquakeClient()
    
    def get_comprehensive_update(self) -> Dict:
        """
        Fetch data from all sources and aggregate
        
        Returns:
            Dictionary with earthquake events, news articles, and tweets
        """
        print("Fetching comprehensive external data...")
        
        # Fetch from all sources
        earthquakes = self.usgs_client.get_recent_earthquakes(min_magnitude=4.5, days_back=30)
        earthquake_news = self.news_client.search_earthquake_news(days_back=7)
        prophecy_news = self.news_client.search_prophecy_news(days_back=30)
        tweets = self.twitter_client.search_prophecy_tweets(max_results=50)
        
        # Analyze sentiment trends
        news_sentiment = self._calculate_average_sentiment(earthquake_news + prophecy_news)
        tweet_sentiment = self._calculate_average_sentiment(tweets)
        
        return {
            'timestamp': datetime.now().isoformat(),
            'earthquakes': {
                'count': len(earthquakes),
                'data': earthquakes[:20],  # Limit response size
                'max_magnitude': max([eq['magnitude'] for eq in earthquakes], default=0)
            },
            'news': {
                'earthquake_articles': len(earthquake_news),
                'prophecy_articles': len(prophecy_news),
                'average_sentiment': news_sentiment,
                'recent_articles': (earthquake_news + prophecy_news)[:10]
            },
            'social_media': {
                'tweets_analyzed': len(tweets),
                'average_sentiment': tweet_sentiment,
                'top_tweets': sorted(tweets, key=lambda t: t['likes'] + t['retweets'], reverse=True)[:5]
            },
            'alert_triggers': self._check_alert_conditions(earthquakes, news_sentiment, tweet_sentiment)
        }
    
    @staticmethod
    def _calculate_average_sentiment(items: List[Dict]) -> Dict:
        """Calculate average sentiment from list of items with sentiment"""
        if not items:
            return {'polarity': 0.0, 'classification': 'neutral', 'sample_size': 0}
        
        polarities = [item.get('sentiment', {}).get('polarity', 0) for item in items]
        avg_polarity = sum(polarities) / len(polarities)
        
        if avg_polarity > 0.1:
            classification = 'positive'
        elif avg_polarity < -0.1:
            classification = 'negative'
        else:
            classification = 'neutral'
        
        return {
            'polarity': round(avg_polarity, 3),
            'classification': classification,
            'sample_size': len(items)
        }
    
    @staticmethod
    def _check_alert_conditions(earthquakes: List[Dict], news_sentiment: Dict, tweet_sentiment: Dict) -> List[Dict]:
        """Check if alert conditions are met based on external data"""
        alerts = []
        
        # Check for M7+ earthquakes
        major_quakes = [eq for eq in earthquakes if eq['magnitude'] >= 7.0]
        if major_quakes:
            alerts.append({
                'type': 'major_earthquake',
                'severity': 'critical',
                'message': f"{len(major_quakes)} M7+ earthquake(s) detected in last 30 days",
                'data': major_quakes
            })
        
        # Check for negative sentiment surge
        if news_sentiment.get('polarity', 0) < -0.3 and news_sentiment.get('sample_size', 0) > 10:
            alerts.append({
                'type': 'negative_sentiment',
                'severity': 'medium',
                'message': f"Negative news sentiment detected (polarity: {news_sentiment['polarity']})",
                'data': news_sentiment
            })
        
        # Check for high social media activity
        if tweet_sentiment.get('sample_size', 0) > 50:
            alerts.append({
                'type': 'high_social_activity',
                'severity': 'low',
                'message': f"Elevated social media activity on prophecy topics ({tweet_sentiment['sample_size']} tweets)",
                'data': tweet_sentiment
            })
        
        return alerts


# Example usage
if __name__ == '__main__':
    # Initialize aggregator (API keys from environment variables)
    aggregator = ExternalDataAggregator()
    
    # Get comprehensive update
    update = aggregator.get_comprehensive_update()
    
    # Display results
    print("\n=== External Data Summary ===")
    print(f"Earthquakes: {update['earthquakes']['count']} (Max M{update['earthquakes']['max_magnitude']})")
    print(f"News Articles: {update['news']['earthquake_articles'] + update['news']['prophecy_articles']}")
    print(f"News Sentiment: {update['news']['average_sentiment']['classification']}")
    print(f"Tweets Analyzed: {update['social_media']['tweets_analyzed']}")
    print(f"Tweet Sentiment: {update['social_media']['average_sentiment']['classification']}")
    print(f"\nAlerts Triggered: {len(update['alert_triggers'])}")
    for alert in update['alert_triggers']:
        print(f"  - {alert['severity'].upper()}: {alert['message']}")
