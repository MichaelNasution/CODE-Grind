import pandas as pd

def analyze_games(df):

    # total points
    df["total_points"] = (
        df["home_team_score"]
        + df["visitor_team_score"]
    )

    # home team name
    df["home_team_name"] = df["home_team"].apply(
        lambda x: x["full_name"]
    )

    # visitor team name
    df["visitor_team_name"] = df["visitor_team"].apply(
        lambda x: x["full_name"]
    )

    # predicted winner
    df["predicted_winner"] = df.apply(
        lambda row:
        row["home_team_name"]
        if row["home_team_score"] >
        row["visitor_team_score"]
        else row["visitor_team_name"],
        axis=1
    )

    return df