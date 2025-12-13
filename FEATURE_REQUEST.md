# Feature Request: Delayed Decimal Formatting for Amount Input

## Requirement
The amount input field should format values to 2 decimal places, but **only after the user stops typing for 2 seconds**, not on blur.

## Current Behavior (After Revert)
- Formatting happens on blur
- User wants to type freely without formatting while typing

## Desired Behavior
1. **While typing**: Show raw input value without any formatting
2. **After 2 seconds of no typing**: Automatically format to 2 decimal places
3. **If user types again**: Reset the 2-second timer
4. **Spinner arrows**: Must continue to work (input stays as type="number" when not typing)

## Implementation Notes
- Need to use a debounce/timeout mechanism (2 seconds)
- Store timeouts in a ref (e.g., `formatTimeoutRef`) keyed by food ID
- Clear timeout when user types again
- Clear timeout when food is removed
- Display logic should always show raw `inputValue` until timeout formats it
- The timeout should update `amountInputValues` with formatted value
- Don't format in display logic - let timeout handle it

## Challenges Encountered
- Number inputs format values automatically before we can switch to text mode
- Need to switch to text mode synchronously when typing starts
- Display value was being formatted before timeout completed
- Need to ensure spinner arrows still work (they need type="number")

## Status
- Attempted but reverted due to issues
- Needs to be re-implemented with proper debounce handling

