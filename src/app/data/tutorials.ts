export interface TutorialStep {
  title: string;
  content: string;
  image?: string;
}

export const checkersTutorial: TutorialStep[] = [
  {
    title: "Welcome to Checkers!",
    content: "Checkers is a classic board game where two players take turns moving their pieces diagonally across the board. The goal is to capture all of your opponent's pieces or block them from making any legal moves."
  },
  {
    title: "Basic Movement",
    content: "Pieces can only move diagonally forward (toward your opponent's side). Regular pieces move one square at a time. You can only move on the dark squares of the board."
  },
  {
    title: "Capturing Pieces",
    content: "To capture an opponent's piece, you must jump over it diagonally to an empty square. The captured piece is removed from the board. Multiple captures in a single turn are allowed."
  },
  {
    title: "King Pieces",
    content: "When a piece reaches the opposite end of the board, it becomes a 'king' and can move both forward and backward diagonally. Kings are more powerful and can capture in both directions."
  },
  {
    title: "Winning the Game",
    content: "You win by capturing all of your opponent's pieces or by blocking them so they cannot make any legal moves. The game can also end in a draw if neither player can win."
  }
];

export const chessTutorial: TutorialStep[] = [
  {
    title: "Welcome to Chess!",
    content: "Chess is a strategic board game where two players command armies of different pieces. The goal is to checkmate your opponent's king by putting it in a position where it cannot escape capture."
  },
  {
    title: "The Board and Setup",
    content: "The chessboard has 64 squares arranged in 8x8 grid. Each player starts with 16 pieces: 8 pawns, 2 rooks, 2 knights, 2 bishops, 1 queen, and 1 king. White always moves first."
  },
  {
    title: "Pawn Movement",
    content: "Pawns move forward one square at a time (never backward). On their first move, pawns can move forward two squares. Pawns capture diagonally, one square forward and to the left or right."
  },
  {
    title: "Rook Movement",
    content: "Rooks move any number of squares horizontally or vertically. They cannot jump over other pieces. Rooks are powerful in open positions and are often used to control files and ranks."
  },
  {
    title: "Knight Movement",
    content: "Knights move in an L-shape: two squares in one direction, then one square perpendicular to that direction. Knights are the only pieces that can jump over other pieces."
  },
  {
    title: "Bishop Movement",
    content: "Bishops move any number of squares diagonally. Each player starts with one bishop on light squares and one on dark squares. Bishops cannot jump over other pieces."
  },
  {
    title: "Queen Movement",
    content: "The queen is the most powerful piece. It can move any number of squares horizontally, vertically, or diagonally. The queen combines the movement of both rooks and bishops."
  },
  {
    title: "King Movement",
    content: "The king moves one square in any direction: horizontally, vertically, or diagonally. The king must always be protected, as losing it means losing the game."
  },
  {
    title: "Special Moves",
    content: "Castling is a special move where the king moves two squares toward a rook, and the rook jumps over the king. This can only be done under specific conditions and helps protect the king."
  },
  {
    title: "Check and Checkmate",
    content: "When a king is under attack, it's called 'check.' The player must move to get out of check. If no legal move can get the king out of check, it's 'checkmate' and the game is over."
  }
];

export const backgammonTutorial: TutorialStep[] = [
  {
    title: "Welcome to Backgammon!",
    content: "Backgammon is one of the oldest board games, combining strategy and luck. Players race to move all their pieces around the board and bear them off. The first player to bear off all pieces wins."
  },
  {
    title: "The Board Setup",
    content: "The board has 24 triangles called 'points' arranged in four quadrants. Each player has 15 pieces that start in specific positions. The board is divided by a 'bar' in the middle."
  },
  {
    title: "Rolling the Dice",
    content: "Players take turns rolling two dice. The numbers rolled determine how many points each piece can move. You can move one piece the total of both dice, or split the moves between pieces."
  },
  {
    title: "Moving Pieces",
    content: "Pieces move in opposite directions around the board. You can only move to points that are either empty, occupied by your own pieces, or occupied by a single opponent piece (which you can hit)."
  },
  {
    title: "Hitting and Re-entering",
    content: "When you land on a point with a single opponent piece, you 'hit' it and send it to the bar. Hit pieces must re-enter the board before any other moves can be made."
  },
  {
    title: "Bearing Off",
    content: "Once all your pieces are in your home board (the last 6 points), you can start bearing them off. You must roll the exact number to bear off a piece from each point."
  },
  {
    title: "Winning the Game",
    content: "The first player to bear off all 15 pieces wins. If the opponent hasn't borne off any pieces when you win, it's a 'gammon' (worth 2 points). If they still have pieces on the bar, it's a 'backgammon' (worth 3 points)."
  }
];

export const ginRummyTutorial: TutorialStep[] = [
  {
    title: "Welcome to Gin Rummy!",
    content: "Gin Rummy is a card game for two players. The goal is to form sets (3 or 4 cards of the same rank) and runs (3 or more consecutive cards of the same suit) to reduce your hand's point value."
  },
  {
    title: "Dealing and Setup",
    content: "Each player is dealt 10 cards. The remaining cards form the stock pile, with one card turned face up to start the discard pile. Players take turns drawing and discarding cards."
  },
  {
    title: "Drawing Cards",
    content: "On your turn, you must draw one card. You can either draw from the stock pile (face down) or take the top card from the discard pile. After drawing, you must discard one card."
  },
  {
    title: "Forming Sets and Runs",
    content: "A set consists of 3 or 4 cards of the same rank (e.g., three 7s). A run consists of 3 or more consecutive cards of the same suit (e.g., 5♠, 6♠, 7♠). You can rearrange your hand at any time."
  },
  {
    title: "Knocking",
    content: "When your unmatched cards total 10 points or less, you can 'knock' to end the round. Face cards are worth 10 points, aces are worth 1 point, and number cards are worth their face value."
  },
  {
    title: "Scoring",
    content: "After knocking, both players lay down their cards. If you have no unmatched cards, you have 'gin' and score a bonus. Otherwise, you score the difference between your unmatched cards and your opponent's."
  }
];

export const crazy8sTutorial: TutorialStep[] = [
  {
    title: "Welcome to Crazy 8s!",
    content: "Crazy 8s is a fun card game where players try to get rid of all their cards by matching the suit or rank of the top card on the discard pile. The first player to discard all cards wins."
  },
  {
    title: "Dealing Cards",
    content: "Each player is dealt 7 cards. The remaining cards form the stock pile, with one card turned face up to start the discard pile. Players take turns playing cards that match the top card."
  },
  {
    title: "Playing Cards",
    content: "You can play a card if it matches the suit (hearts, diamonds, clubs, spades) or rank (2-10, Jack, Queen, King, Ace) of the top card on the discard pile. If you can't play, you must draw a card."
  },
  {
    title: "The Power of 8s",
    content: "8s are wild cards! You can play an 8 at any time, and when you do, you get to choose what suit the next player must match. This is a powerful strategic move."
  },
  {
    title: "Special Cards",
    content: "Some variations include special cards: 2s make the next player draw 2 cards, Queens reverse the direction of play, and Aces skip the next player's turn. Check the rules for your specific game."
  },
  {
    title: "Winning the Game",
    content: "The first player to discard all their cards wins the round. You can score points based on the cards remaining in other players' hands, or play multiple rounds to determine the overall winner."
  }
]; 