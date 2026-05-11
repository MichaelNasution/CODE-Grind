import streamlit as st
import pandas as pd
import analyze
import predictor
import os

# Page Config
st.set_page_config(
    page_title="NBA Analytics Dashboard",
    page_icon="🏀",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for modern look
st.markdown("""
    <style>
    .main {
        background-color: #f5f7f9;
    }
    .stMetric {
        background-color: #ffffff;
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    </style>
    """, unsafe_allow_html=True)

st.title("🏀 NBA Analytics & Prediction System")
st.markdown("Professional betting insights and team performance analysis.")

# Load data
DATA_PATH = "data/processed_games.csv"

if not os.path.exists(DATA_PATH):
    st.warning("⚠️ No data found. Please run `python main.py` to fetch the latest NBA data.")
    st.info("The system needs historical game data to generate statistics and predictions.")
else:
    df = pd.read_csv(DATA_PATH)
    # Ensure date is datetime
    df['date'] = pd.to_datetime(df['date'])
    
    # Sidebar Filters
    st.sidebar.header("Control Panel")
    all_teams = sorted(list(set(df['home_team'].unique()) | set(df['visitor_team'].unique())))
    selected_team = st.sidebar.selectbox("Select Team for Analysis", all_teams)
    
    # Dashboard Tabs
    tab1, tab2 = st.tabs(["Team Analytics", "Match Predictor"])
    
    with tab1:
        st.header(f"Performance Analysis: {selected_team}")
        
        # Key Metrics
        stats = analyze.get_team_stats(df, selected_team)
        avg_total = analyze.calculate_average_total(df, selected_team)
        splits = analyze.calculate_home_away_split(df, selected_team)
        
        m1, m2, m3, m4 = st.columns(4)
        m1.metric("Avg Score", f"{stats['avg_score']} pts")
        m2.metric("Avg Game Total", f"{avg_total} pts")
        m3.metric("Home Win %", f"{int(splits['home_win_rate']*100)}%")
        m4.metric("Away Win %", f"{int(splits['away_win_rate']*100)}%")
        
        st.divider()
        
        # Recent Games
        st.subheader("Recent Form")
        recent_games = analyze.get_last_5_games(df, selected_team)
        # Format for display
        display_df = recent_games[['date', 'home_team', 'home_team_score', 'visitor_team_score', 'visitor_team', 'status']]
        st.dataframe(display_df, use_container_width=True)

    with tab2:
        st.header("Probability-Based Predictor")
        st.write("Predict match outcomes based on historical performance and home/away trends.")
        
        col_a, col_b = st.columns(2)
        with col_a:
            home_team = st.selectbox("Select Home Team", all_teams, index=0)
        with col_b:
            away_team = st.selectbox("Select Visitor Team", all_teams, index=1)
            
        if st.button("Calculate Prediction", type="primary"):
            winner = predictor.predict_winner(df, home_team, away_team)
            pred_total = predictor.predict_total(df, home_team, away_team)
            
            res_col1, res_col2 = st.columns(2)
            with res_col1:
                st.success(f"### Predicted Winner\n**{winner}**")
            with res_col2:
                st.info(f"### Predicted Total Points\n**{pred_total}**")
            
            st.warning("Note: This prediction uses basic statistical models. For professional betting, consider advanced ML models stored in the `models/` directory.")

# Footer
st.sidebar.markdown("---")
st.sidebar.caption("Data provided by BallDontLie API")
st.sidebar.caption("Built with Python & Streamlit")
