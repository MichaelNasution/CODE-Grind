from analyze import get_team_stats


# =====================================
# PREDICT TOTAL
# =====================================

def predict_total(
    df,
    home_team,
    visitor_team
):

    home_stats = get_team_stats(
        df,
        home_team
    )

    visitor_stats = get_team_stats(
        df,
        visitor_team
    )

    predicted_total = (
        home_stats["avg_total"]
        + visitor_stats["avg_total"]
    ) / 2

    return round(predicted_total, 2)


# =====================================
# PREDICT WINNER
# =====================================

def predict_winner(
    df,
    home_team,
    visitor_team
):

    home_stats = get_team_stats(
        df,
        home_team
    )

    visitor_stats = get_team_stats(
        df,
        visitor_team
    )

    if (
        home_stats["avg_scored"]
        >
        visitor_stats["avg_scored"]
    ):

        return home_team

    return visitor_team