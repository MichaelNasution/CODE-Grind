import pandas as pd
from typing import Dict, Any

def prepare_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans and prepares the raw games data for analysis.
    Adds calculated columns like total_points and winner.
    """
    if df.empty:
        return df
        
    # Standardizing column names and types
    df['total_points'] = df['home_team_score'] + df['visitor_team_score']
    
    # Identify the winner of each game
    df['winner'] = df.apply(
        lambda row: 'home' if row['home_team_score'] > row['visitor_team_score'] else 'visitor', 
        axis=1
    )
    
    # Convert date to datetime objects
    df['date'] = pd.to_datetime(df['date'])
    
    return df

def get_team_stats(df: pd.DataFrame, team_name: str) -> Dict[str, Any]:
    """
    Calculates summary statistics for a specific team.
    """
    team_games = df[(df['home_team'] == team_name) | (df['visitor_team'] == team_name)]
    if team_games.empty:
        return {"error": "Team not found", "avg_score": 0}
    
    # Calculate average score for the team across all games (home and away)
    avg_score = (team_games.apply(
        lambda row: row['home_team_score'] if row['home_team'] == team_name else row['visitor_team_score'], 
        axis=1
    )).mean()
    
    return {
        "team": team_name,
        "games_played": len(team_games),
        "avg_score": round(avg_score, 2)
    }

def get_last_5_games(df: pd.DataFrame, team_name: str) -> pd.DataFrame:
    """
    Retrieves the last 5 games for a specific team, sorted by date.
    """
    team_games = df[(df['home_team'] == team_name) | (df['visitor_team'] == team_name)]
    return team_games.sort_values('date', ascending=False).head(5)

def calculate_average_total(df: pd.DataFrame, team_name: str) -> float:
    """
    Calculates the average total points in games involving a specific team.
    """
    team_games = df[(df['home_team'] == team_name) | (df['visitor_team'] == team_name)]
    if team_games.empty:
        return 0.0
    return round(team_games['total_points'].mean(), 2)

def calculate_home_away_split(df: pd.DataFrame, team_name: str) -> Dict[str, float]:
    """
    Calculates win rates for home vs away games.
    """
    home_games = df[df['home_team'] == team_name]
    away_games = df[df['visitor_team'] == team_name]
    
    home_win_rate = (home_games['winner'] == 'home').mean() if not home_games.empty else 0.0
    away_win_rate = (away_games['winner'] == 'visitor').mean() if not away_games.empty else 0.0
    
    return {
        "home_win_rate": round(home_win_rate, 2),
        "away_win_rate": round(away_win_rate, 2)
    }