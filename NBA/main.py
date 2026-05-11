import requests
import pandas as pd

from analyze import analyze_games

url = "https://api.balldontlie.io/v1/games"

headers = {
    "Authorization": "658225bf-983a-4ab6-ad78-a52a787d8afe"
}

response = requests.get(
    url,
    headers=headers
)

data = response.json()

games = data["data"]

df = pd.DataFrame(games)

# ANALYSIS
analyzed_df = analyze_games(df)

print(analyzed_df[[
    "home_team_name",
    "visitor_team_name",
    "home_team_score",
    "visitor_team_score",
    "total_points",
    "predicted_winner"
]].head())