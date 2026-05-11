import requests
import pandas as pd
import config
import analyze
import os
from typing import List, Dict

def fetch_nba_games() -> List[Dict]:
    """
    Fetches game data from BallDontLie API.
    Utilizes the API Key from config.py.
    """
    headers = {"Authorization": config.API_KEY}
    url = f"{config.BASE_URL}/games"
    
    # We fetch a subset for the demo, e.g., the 2023 season
    params = {
        "per_page": 100,
        "seasons[]": [2023]
    }
    
    print(f"Requesting data from {url}...")
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        games = data.get('data', [])
        print(f"Successfully fetched {len(games)} games.")
        return games
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        return []

def process_data(games_data: List[Dict]):
    """
    Main orchestration function to transform JSON to CSV for analysis.
    """
    if not games_data:
        print("No data to process. Verify your API Key in config.py.")
        return
    
    # Flattening nested JSON for pandas processing
    rows = []
    for game in games_data:
        rows.append({
            "id": game['id'],
            "date": game['date'],
            "home_team": game['home_team']['full_name'],
            "visitor_team": game['visitor_team']['full_name'],
            "home_team_score": game['home_team_score'],
            "visitor_team_score": game['visitor_team_score'],
            "season": game['season'],
            "status": game['status']
        })
    
    df = pd.DataFrame(rows)
    
    # Run analysis preparation (clean and calculate columns)
    df = analyze.prepare_data(df)
    
    # Ensure data directory exists
    if not os.path.exists(config.DATA_DIR):
        os.makedirs(config.DATA_DIR)
    
    # Save to data folder for the dashboard to consume
    output_path = f"{config.DATA_DIR}/processed_games.csv"
    df.to_csv(output_path, index=False)
    print(f"Saved processed data to {output_path}")
    
    return df

if __name__ == "__main__":
    print("--- NBA Analytics System: Data Ingestion ---")
    raw_data = fetch_nba_games()
    if raw_data:
        process_data(raw_data)
        print("Data ingestion complete. You can now run 'streamlit run dashboard.py'")
    else:
        print("Failed to fetch data. Check your internet connection and API key.")