import pandas as pd


# =====================================
# PREPARE DATA
# =====================================

def prepare_data(df):

    # TEAM NAMES
    df["home_team_name"] = df["home_team"].apply(
        lambda x: x["full_name"]
    )

    df["visitor_team_name"] = df["visitor_team"].apply(
        lambda x: x["full_name"]
    )

    # TOTAL POINTS
    df["total_points"] = (
        df["home_team_score"]
        + df["visitor_team_score"]
    )

    return df


# =====================================
# TEAM STATS
# =====================================

def get_team_stats(df, team_name):

    games = df[
        (df["home_team_name"] == team_name)
        |
        (df["visitor_team_name"] == team_name)
    ]

    if len(games) == 0:

        return {
            "team": team_name,
            "games_played": 0
        }

    scored = []
    allowed = []

    for _, game in games.iterrows():

        if game["home_team_name"] == team_name:

            scored.append(
                game["home_team_score"]
            )

            allowed.append(
                game["visitor_team_score"]
            )

        else:

            scored.append(
                game["visitor_team_score"]
            )

            allowed.append(
                game["home_team_score"]
            )

    avg_scored = sum(scored) / len(scored)

    avg_allowed = sum(allowed) / len(allowed)

    avg_total = games["total_points"].mean()

    return {
        "team": team_name,
        "games_played": len(games),
        "avg_scored": round(avg_scored, 2),
        "avg_allowed": round(avg_allowed, 2),
        "avg_total": round(avg_total, 2)
    }


# =====================================
# LAST 5 GAMES
# =====================================

def get_last_5_games(df, team_name):

    games = df[
        (df["home_team_name"] == team_name)
        |
        (df["visitor_team_name"] == team_name)
    ]

    return games.tail(5)