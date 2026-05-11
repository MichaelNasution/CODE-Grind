"""
NBA CLI-Based Betting Prediction Engine
Main Entry Point
"""
import argparse
import sys
from cli.parser import setup_parser
from cli.commands import handle_today, handle_tomorrow, handle_predict, handle_live

def main():
    parser = setup_parser()
    args = parser.parse_args()

    if args.command == 'today':
        handle_today(args)
    elif args.command == 'tomorrow':
        handle_tomorrow(args)
    elif args.command == 'predict':
        handle_predict(args)
    elif args.command == 'live':
        handle_live(args)
    else:
        parser.print_help()
        sys.exit(1)

if __name__ == "__main__":
    main()