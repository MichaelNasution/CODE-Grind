import requests
import pandas as pd

from config import API_KEY

from analyze import (
    prepare_data,
    get_team_stats
)

from predictor import (
    predict_total,
    predict_winner
)

# =====================================
# API CONFIG
# =====================================

url = "https://api.balldontlie.io/v1/games"

headers = {
    "Authorization": API_KEY
}

params = {
    "seasons[]": 2024,
    "per_page": 100
}

# =====================================
# REQUEST API
# =====================================

response = requests.get(
    url,
    headers=headers,
    params=params
)

print("STATUS:", response.status_code)

data = response.json()

games = data["data"]

# =====================================
# DATAFRAME
# =====================================

df = pd.DataFrame(games)

# =====================================
# PREPARE DATA
# =====================================

df = prepare_data(df)

# =====================================
# MATCHUP
# =====================================

home_team = "Los Angeles Lakers"

visitor_team = "Boston Celtics"

# =====================================
# TEAM STATS
# =====================================

home_stats = get_team_stats(
    df,
    home_team
)

visitor_stats = get_team_stats(
    df,
    visitor_team
)

# =====================================
# PREDICTIONS
# =====================================

predicted_total = predict_total(
    df,
    home_team,
    visitor_team
)

predicted_winner = predict_winner(
    df,
    home_team,
    visitor_team
)

# =====================================
# OUTPUT
# =====================================

print("\n==========================")
print("NBA ANALYTICS")
print("==========================")

print("\nHOME TEAM")
print(home_stats)

print("\nVISITOR TEAM")
print(visitor_stats)

print("\nPREDICTIONS")

print(
    "Predicted Winner:",
    predicted_winner
)

print(
    "Predicted Total:",
    predicted_total
)