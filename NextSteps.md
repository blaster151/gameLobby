Backgammon:
    Missing core game mechanics
        No bearing off implementation (pieces can't be removed from board when in home quadrant)
        No bar re-entry system (hit pieces can't re-enter from the bar)
        Missing "must use higher die first" rule when both dice can't be used
        No validation that all pieces are in home board before bearing off
    Incomplete capture system
        Hit pieces disappear instead of going to bar
        No bar state tracking in board representation
        Missing "blot" concept (single pieces that can be hit)
    No proper scoring (gammon/backgammon)
        No gammon detection (opponent hasn't borne off any pieces)
        No backgammon detection (opponent still has pieces on bar)
        Missing doubling cube mechanics
        No match scoring system
    Simplified board state management
        Board only tracks piece counts, not individual piece states
        No proper home board/outer board distinction
        Missing bar and off-board piece tracking
Checkers:
    ✅ No king promotion implementation
        Pieces don't become kings when reaching opposite end
        Kings can't move backward or capture backward
        No visual distinction for king pieces
    Missing multiple jump sequences
        Only single jumps allowed
        ✓ No forced capture validation
        Missing "must capture if available" rule
        No chain capture detection
    Basic move validation
        No validation that captures are mandatory when available
        Missing edge case handling for board boundaries
        No stalemate detection
        Simplified diagonal movement validation
    Simplified bot AI
        No look-ahead for capture sequences
        Basic positional evaluation only
        No strategic planning for king creation
        Missing endgame tactics
Chess:
   More comprehensive testing
