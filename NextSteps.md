1) Insufficient Material Detection ✓

TestingLibraryElementError: Unable to find element with text /Stalemate: Insufficient material to win/.

Likely cause: UI element not rendered or text doesn't match exactly.

Location: checkers.test.tsx:3604

RESOLVED: Added useEffect to automatically check and update game state when board changes, ensuring stalemate detection runs on component mount

2) Repetitive Position Stalemate ✓

TestingLibraryElementError: Unable to find text /Stalemate: Repetitive position with no progress/.

Insight: Might be due to text being split across elements.

Location: Noted under test "detects repetitive position stalemate in confined area"

RESOLVED: Updated getStalemateReason to check for stalemate scenarios (including repetitive positions) before checking for no moves, ensuring repetitive position stalemates are detected even when valid moves exist

3) Infinite Recursion ✓

RangeError: Maximum call stack size exceeded

Cause: Likely circular logic between isValidMove → getAvailableCaptures → hasAnyCaptures → isValidMove...

Location chain: Starts at checkers.tsx:1778, repeatedly bounces around 469, 487, 1813

RESOLVED: Created isValidCaptureMove function to break circular dependency between getAvailableCaptures and isValidMove

4) Label Not Found ✓

TestingLibraryElementError: Unable to find label with text /0, 1 empty/

Suggestion: The element may not exist or the text might not be rendered as expected.

Location: checkers.test.tsx:3409

RESOLVED: Fixed aria-label to use 0-based indexing (y, x) instead of 1-based indexing (y+1, x+1) to match test expectations

5) Missing Multiple Jump Text

TestingLibraryElementError: Cannot find /Multiple jump sequence available/

Cause: Possibly a UI rendering issue or text split across components.