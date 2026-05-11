"""
CLI Argument Parser Configuration
"""
import argparse

def setup_parser():
    parser = argparse.ArgumentParser(
        description="NBA Betting Prediction Engine - CLI Interface"
    )
    subparsers = parser.add_subparsers(dest='command', help='Commands')

    # Today Command
    subparsers.add_parser('today', help='Predict all NBA matches for today')

    # Tomorrow Command
    subparsers.add_parser('tomorrow', help='Predict all NBA matches for tomorrow')

    # Predict Command
    predict_parser = subparsers.add_parser('predict', help='Predict specific matchup')
    predict_parser.add_argument('home_team', type=str, help='Home Team Name')
    predict_parser.add_argument('visitor_team', type=str, help='Visitor Team Name')

    # Live Command
    subparsers.add_parser('live', help='Real-time live game analysis (Beta)')

    return parser
