"""
API Client for interacting with BallDontLie and other data sources.
"""
import requests

class APIClient:
    def __init__(self, api_key, base_url):
        self.api_key = api_key
        self.base_url = base_url
    
    # TODO: Implement methods to fetch games, stats, and live data
