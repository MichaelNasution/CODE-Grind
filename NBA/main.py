import requests
import pandas as pd

url = "https://api.balldontlie.io/v1/games"

headers = {
    "Authorization": "658225bf-983a-4ab6-ad78-a52a787d8afe"
}

response = requests.get(url, headers=headers)

data = response.json()

games = data["data"]

df = pd.DataFrame(games)

print(df.head())