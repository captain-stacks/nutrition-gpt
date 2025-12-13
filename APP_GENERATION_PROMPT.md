# Nutrition Analyzer App - Generation Prompt

Create a comprehensive React-based nutrition tracking and analysis application with the following features and specifications:

## Core Functionality

### 1. Food Database Management
- Store food items with complete nutrient profiles in browser localStorage
- Each food item should include:
  - Name (normalized, case-insensitive matching)
  - Serving size structure: `{ amount, unit, grams, volume? }`
    - `amount`: Numeric amount (e.g., 100)
    - `unit`: Unit string (e.g., "g", "cup", "oz")
    - `grams`: Converted to grams for calculations
    - `volume`: Optional volume descriptor (e.g., "1 large egg") for unit detection
  - Complete nutrient profile including:
    - Calories (kcal)
    - Protein (g)
    - Fat (g)
    - Carbohydrates (g)
    - Omega-3 fatty acids (g)
    - Omega-6 fatty acids (g)
    - Zinc (mg)
    - Vitamin B-12 (µg)
    - Magnesium (mg)
    - Vitamin E (mg)
    - Vitamin K (µg)
    - Vitamin A (µg RAE)
    - Monounsaturated fat (g)
    - Selenium (µg)
    - Iron (mg)
    - Vitamin D (µg)
    - Thiamin/B1 (mg)
    - Choline (mg)
    - Calcium (mg)
    - Potassium (mg)
    - Iodine (µg)
    - Vitamin C (mg)
    - Folate (µg)
- Support for custom unit weights per food (e.g., "1 cup of rice" = X grams)
- Database management UI to view, delete individual foods, or clear entire database

### 2. Food List Management
- Add foods to a daily list with customizable amounts and units
- Support multiple units:
  - Grams (g)
  - Ounces (oz)
  - Cups
  - Tablespoons (tbsp)
  - Teaspoons (tsp)
  - Pounds (lb)
  - Whole items (with automatic weight resolution)
- Convert between units automatically
- Store unit preferences per food item
- Edit food quantities inline with smart input handling:
  - Switch to text mode when typing starts
  - Format to 2 decimal places after 2 seconds of inactivity (debounced)
  - Preserve spinner arrows functionality for number inputs
  - Select all text on focus for easy replacement
  - **Delayed Decimal Formatting Details**:
    - While typing: Show raw input value without any formatting
    - After 2 seconds of no typing: Automatically format to 2 decimal places
    - If user types again: Reset the 2-second timer
    - Spinner arrows must continue to work (input stays as type="number" when not typing)
    - Implementation requirements:
      - Use debounce/timeout mechanism (2 seconds)
      - Store timeouts in a ref keyed by food ID
      - Clear timeout when user types again
      - Clear timeout when food is removed
      - Display logic should always show raw `inputValue` until timeout formats it
      - The timeout should update `amountInputValues` with formatted value
      - Don't format in display logic - let timeout handle it
    - Challenges to handle:
      - Number inputs format values automatically before switching to text mode
      - Need to switch to text mode synchronously when typing starts
      - Display value should not be formatted before timeout completes
      - Ensure spinner arrows still work (they need type="number")
- Remove foods from list
- Clear all foods with confirmation

### 3. Nutrition Calculation & Display
- Calculate total nutrients from all foods in list
- Scale nutrients based on serving size (if food has 50g protein per 100g serving, and user consumed 200g, show 100g protein)
- Apply multiplier to all calculations (for scaling entire day's intake)
- Display nutrients in a comprehensive table with:
  - Food name
  - Amount and unit (editable)
  - All nutrient values per food item
- Show daily totals in a grid layout with:
  - Nutrient name
  - Total amount with unit
  - Percentage of RDA (if applicable)
  - Color coding: green if ≥100% RDA, red if <100% RDA

### 4. RDA (Recommended Daily Allowance) Tracking
- Support separate RDA values for men and women
- RDA values should include:
  - Calories: 2500 (men) / 2000 (women)
  - Protein: 56g (men) / 46g (women)
  - Fat: 70g (both)
  - Carbs: 300g (men) / 260g (women)
  - Omega-3: 2.5g (men) / 1.1g (women)
  - Omega-6: 17g (men) / 12g (women)
  - Zinc: 11mg (men) / 8mg (women)
  - B12: 2.4µg (both)
  - Magnesium: 420mg (men) / 320mg (women)
  - Vitamin E: 15mg (both)
  - Vitamin K: 120µg (men) / 90µg (women)
  - Vitamin A: 900µg RAE (men) / 700µg RAE (women)
  - Monounsaturated: 33g (both)
  - Selenium: 55µg (both)
  - Iron: 8mg (men) / 18mg (women)
  - Vitamin D: 15µg (both)
  - B1/Thiamin: 1.2mg (men) / 1.1mg (women)
  - Choline: 550mg (men) / 425mg (women)
  - Calcium: 1000mg (both)
  - Potassium: 3400mg (men) / 2600mg (women)
  - Iodine: 150µg (both)
  - Vitamin C: 90mg (men) / 75mg (women)
  - Folate: 400µg (both)
  - Omega-3:6 ratio target: 0.33 (1:3 ratio, higher is better)
- Toggle between men's and women's RDA values
- Calculate and display percentage of RDA for each nutrient
- Show omega-3:6 ratio as "1:X" format (e.g., "1:3.0")

### 5. Data Visualization
- Bar chart showing nutrients as percentage of RDA
- Use Chart.js with react-chartjs-2
- Include annotation plugin to show 100% RDA reference line
- Color coding:
  - Green bars for nutrients ≥100% RDA
  - Red bars for nutrients <100% RDA
  - Red bars for nutrients exceeding upper limits (Tolerable Upper Intake Levels)
- Upper limit detection:
  - Vitamin A: 3000 µg RAE
  - Selenium: 400 µg
  - Iodine: 1100 µg
  - Show warning indicator in both Daily Totals grid and bar chart tooltip when exceeded
  - Turn cell/bar red when upper limit is exceeded
- Exclude carbs, fat, and omega-6 from RDA chart (they're not typically tracked against RDA)
- Include omega-3:6 ratio in chart (show as percentage of target)
- Rotate x-axis labels 45 degrees for readability
- Tooltips showing exact percentage values and upper limit warnings

### 6. OpenAI Integration (NutritionGPT)
- Feature to parse food lists from natural language text
- User provides:
  - Multi-line text input (one food per line)
  - OpenAI API key (stored in localStorage, never sent to server)
- **API Key Input Methods**:
  - Manual entry in splash screen
  - URL query parameter support: `?openai_key=...` or `?openaiKey=...`
  - Automatically extract from URL on page load and remove parameter from URL
- Two-stage process:
  1. **Parsing Stage**: Use GPT to parse each line and extract:
     - Food name (normalized)
     - Quantity
     - Unit
     - Use "whole" or "one whole" for individual items (eggs, apples, bananas, etc.)
     - Normalize plural units to singular (e.g., "cups" → "cup")
  2. **Preview Stage**: Show parsed results for user review
     - Display original input lines with parsed foods below each line
     - Show food name, quantity, and unit for each parsed item
     - Allow user to edit text or proceed with import
  3. **Import Stage**: For each parsed food:
     - Check if food exists in local database
     - If not, batch fetch nutrition data for multiple foods at once (more efficient)
     - Store in database with unique names (handle duplicates with `generateUniqueName`)
     - Add to food list
     - Track failed foods and report them to user
- Handle rate limiting:
  - Queue requests sequentially
  - Wait 21 seconds between requests to avoid rate limits
  - Automatic retry with exponential backoff on 429 errors
  - Show status indicators for rate limiting and throttling
- Support both "gpt-4o-mini" (with temperature=0) and "gpt-5" models
- Use structured JSON responses with response_format
- Parse and normalize nutrient data from API responses:
  - Handle various unit formats (g, mg, µg, IU, kcal, cal)
  - Convert IU (International Units) to metric:
    - Vitamin D: 1 IU = 0.025 µg
    - Vitamin A: 1 IU = 0.3 µg RAE (approximation)
    - Vitamin E: 1 IU = 0.67 mg (natural form)
  - Normalize units (handle variations like "mcg" = "µg", "ug" = "µg")
  - Remove qualifiers like "RAE", "DFE" from unit strings
- Store serving size information with each food:
  - Serving size structure: `{ amount, unit, grams, volume }`
  - `volume` field used for unit detection (e.g., "1 large egg" → suggests "whole" unit)
  - Support both new format (`servingSize` object) and old format (`serving_size` string) for backward compatibility
  - Also handle legacy typo `_serviceSize` for backward compatibility
- **Nutrition Data Fetching**:
  - Batch fetch nutrition for multiple foods when possible
  - Use `NUTRIENT_NAME_MAP` to map API nutrient names to internal keys:
    - "Energy" → "calories"
    - "Protein" → "protein"
    - "Total lipid (fat)" → "fat"
    - "Carbohydrate, by difference" → "carbs"
    - "Fatty acids, total omega-3" → "omega3"
    - "Fatty acids, total omega-6" → "omega6"
    - "Zinc, Zn" → "zinc"
    - "Vitamin B-12" → "b12"
    - "Magnesium, Mg" → "magnesium"
    - "Vitamin E (alpha-tocopherol)" → "vitaminE"
    - "Vitamin K (phylloquinone)" → "vitaminK"
    - "Vitamin A, RAE" → "vitaminA"
    - "Fatty acids, total monounsaturated" → "monounsaturated"
    - "Selenium, Se" → "selenium"
    - "Iron, Fe" → "iron"
    - "Vitamin D (D2 + D3)" → "vitaminD"
    - "Thiamin" → "b1"
    - "Choline, total" → "choline"
    - "Calcium, Ca" → "calcium"
    - "Potassium, K" → "potassium"
    - "Iodine, I" → "iodine"
    - "Vitamin C, total ascorbic acid" → "vitaminC"
    - "Folate, total" → "folate"
  - Parse serving size from various formats (object with weight/volume, or string)
  - Handle both single food and array responses
  - Support multiple response formats: `perServing`, `per_serving`, `per_100g`, `per_ounce`, `nutrients`
- Show progress indicator during import
- **Loading List Progress**: When loading a saved list:
  - Identify foods missing from database
  - Show progress indicator with status messages
  - Fetch nutrition data for missing foods
  - Update progress as foods are loaded
- Handle errors gracefully with user-friendly messages
- Track and report failed foods that couldn't be imported

### 7. Unit Conversion System
- **Unit Normalization**:
  - Comprehensive alias handling (gram/grams/gms → g, ounce/ounces/oz. → oz, etc.)
  - Extract units from complex strings (e.g., "cups cooked", "oz cooked salmon")
  - Handle unit qualifiers and remove them (e.g., "µg RAE" → "µg")
  - Support variations: "mcg" = "µg", "ug" = "µg", "IU" = "IU"
- Comprehensive unit normalization:
  - Handle aliases (gram/grams/gms → g, ounce/ounces/oz. → oz, etc.)
  - Extract units from strings like "cups cooked" or "oz cooked salmon"
- Conversion between units:
  - Weight units: g ↔ kg ↔ oz ↔ lb
  - Volume units: cup ↔ tbsp ↔ tsp ↔ ml ↔ l ↔ floz
  - Custom units: serving, piece, clove, handful, stick, can, package, bag, whole
- Default weights for common units:
  - 1 oz = 28.3495 g
  - 1 cup = 240 g (approximate)
  - 1 tbsp = 15 g
  - 1 tsp = 5 g
  - 1 lb = 453.592 g
- Store custom unit weights per food (e.g., "1 cup of rice" = 185g)
- **Common Whole Food Weights Lookup Table**: Pre-defined weights for common foods:
  - Medium potato (russet/red/white): 213g
  - Medium sweet potato: 130g
  - Medium apple: 182g
  - Medium banana: 118g
  - Large egg: 50g
  - Medium orange: 131g
  - Medium peach: 150g
  - Medium pear: 178g
  - Medium tomato: 182g
  - Medium onion: 110g
  - Medium carrot: 61g
  - Medium cucumber: 301g
  - Medium bell pepper: 186g
  - Medium avocado: 201g
  - Check lookup table first before using API (more reliable)
- **Weight Resolution System** (`resolveItemGrams` function):
  - Check static unit weights first
  - Check stored custom weights per food
  - For "whole" items: check lookup table, then use OpenAI API if needed
  - Cache unit weights during import to avoid redundant API calls
  - Return `{ grams, gramsPerUnit, unitKey }` for each resolved item
- **Unit Weight Memory** (`rememberUnitWeight` function):
  - Store custom unit weights per food name and unit
  - Only store if weight differs significantly from existing (threshold: 0.5g)
  - Support weights map override for batch operations
- Automatic weight resolution for "whole" items using OpenAI API
- **Volume-Based Unit Detection**: 
  - Use serving size `volume` field to detect when to use "whole" unit
  - Pattern matching: "1 large egg", "1 apple", "1 banana" → suggests "whole"
  - Priority: volume suggestion > parsed unit > resolved unitKey

### 8. Save/Load System
- Save food lists with custom names
- Store in localStorage with metadata:
  - List name
  - Foods (name, amount in grams, unit)
  - Multiplier
  - Target daily calories (if set)
  - RDA gender preference
  - Saved timestamp (ISO string)
- Load saved lists
- Rename saved lists
- Delete saved lists
- Show current list name in UI
- "Save As" functionality
- Auto-save current list (if named)
- **List Action Dialog**: When importing foods and existing foods are present:
  - Show dialog: "Add to Current List" or "Create New List"
  - "Add to Current List": Append new foods to existing list
  - "Create New List": Clear current foods and start fresh
  - Cancel option to abort
  - Store pending input while dialog is shown
- **Loading Saved Lists**:
  - When loading a saved list, check for foods missing from database
  - Automatically fetch nutrition data for missing foods
  - Show loading progress with status messages
  - Restore multiplier, target calories, and RDA gender from saved list

### 9. Advanced Mode
- Toggle advanced features:
  - Multiplier input (scale entire day's intake)
    - If multiplier is manually changed, clear the target daily calories
  - Target daily calories input (for planning)
    - Automatically calculate multiplier from target calories: `multiplier = targetCalories / baseCalories`
    - Show current calories in parentheses: "(Current: X kcal)"
    - Base calories calculated without multiplier to avoid circular dependency
    - If target is set, multiplier updates automatically when foods change
  - API logs viewer (shows all OpenAI API requests/responses)
  - Export to JSON
  - Import from JSON
- API logs should show:
  - Request details (model, temperature, messages, response_format)
  - Response details (status, data)
  - Retry attempts
  - Throttle waits
  - Rate limit information
- Export/Import JSON for:
  - Food database
  - Food lists
  - Unit weights
  - All app state

### 10. Text List Generation
- Generate plain text list of all foods with amounts and units
- Copy to clipboard functionality
- Display in modal dialog

### 11. UI/UX Requirements
- Modern, clean design using Tailwind CSS
- Responsive layout
- Color-coded indicators:
  - Green for nutrients meeting/exceeding RDA
  - Red for nutrients below RDA
- Loading states and progress indicators
- Error messages and confirmations
- Modal dialogs for:
  - Save/Load lists
  - Database management
  - Text list
  - API logs
  - NutritionGPT input/preview
- Sticky table headers
- Food name column remains visible when horizontally scrolling through nutrient columns
  - Use CSS `position: sticky` with `left: 0` on food name column cells
  - Ensure proper z-index layering so sticky column appears above scrolling content
  - Maintain consistent styling (background color, hover effects) on sticky column
- Smooth transitions and hover effects
- Accessible form controls

### 12. Data Persistence
- All data stored in browser localStorage:
  - `foods`: Current food list
  - `foodDatabase`: All food nutrient data
  - `savedFoodLists`: Saved lists
  - `foodUnits`: Unit preferences per food
  - `foodUnitWeights`: Custom unit weights
  - `multiplier`: Current multiplier
  - `targetDailyCalories`: Target calories
  - `rdaGender`: Selected RDA gender
  - `advancedMode`: Advanced mode toggle
  - `openAiApiKey`: OpenAI API key
  - `currentListName`: Current list name
  - `nutritionSplashDismissed`: Splash screen state

### 13. Technical Requirements
- React 19.2.0+
- Chart.js with react-chartjs-2 for visualizations
- chartjs-plugin-annotation for reference lines
- Tailwind CSS for styling
- No external API dependencies except OpenAI (all client-side)
- Proper error handling and validation
- Efficient state management
- Debounced input formatting
- Request queue management for API calls

### 14. Special Features
- **Splash Screen**: Welcome screen for NutritionGPT feature (shown on first use or when list is empty)
  - Dismissible (stored in localStorage)
  - Auto-hide when foods are added
  - "Skip" button to dismiss
- **Smart Input Handling**: 
  - Amount inputs switch between text and number modes dynamically
  - Format to 2 decimal places after 2 seconds of inactivity (debounced)
  - Preserve spinner functionality (number input type when not typing)
  - Select all on focus for easy editing
  - Track focused inputs, text mode inputs, and just-selected inputs
  - Preserve user input when foods change (don't overwrite user edits)
  - Use refs to track newly added foods and skip restoration for them
  - Handle edge cases:
    - Number inputs format values automatically - need synchronous text mode switch
    - Prevent formatting in display logic until timeout completes
    - Maintain spinner arrow functionality throughout
    - Handle mouse clicks on spinner vs. input field
    - Clear value when all text is selected and user types
- **Rate Limiting**: 
  - Automatic throttling (21 seconds between requests)
  - Exponential backoff on 429 errors
  - Visual status indicators
  - Request queue with sequential processing
  - Track last request time to enforce delays
- **Unit Memory**: Remember preferred units per food item
  - Store units by food name (not ID) for persistence across sessions
  - Restore units when foods are loaded
  - Convert name-based storage to ID-based mapping on load
- **Serving Size Scaling**: Properly scale nutrients based on actual serving size vs. consumed amount
  - Support backward compatibility with `_serviceSize` (old typo)
  - Check both food item and database for serving size
  - Default to 100g if serving size not found
- **Utility Functions**:
  - `formatLabel(key)`: Format nutrient keys for display (e.g., "omega3" → "Omega 3")
  - `formatNumber(num, decimals)`: Format numbers with thousand separators and decimal places
  - `formatRatio(ratioValue)`: Format omega-3:6 ratio as "1:X" format
  - `titleCase(str)`: Capitalize food names properly
  - `generateUniqueName(baseName, dbState)`: Generate unique food names to avoid duplicates (e.g., "Apple", "Apple (2)", "Apple (3)")
  - `normalizeFoodName(name)`: Normalize food names for case-insensitive matching
  - `findFoodKeyInDatabase(name, dbState)`: Find food in database by normalized name
  - `safeJsonParse(payload)`: Parse JSON with fallback to extract from code fences
  - `parseAmountAndUnit(value)`: Parse amount and unit from various formats (string, object, number)
  - `normalizeUnit(unit)`: Normalize unit strings to standard form
  - `convertToExpectedUnit(key, value, unit)`: Convert nutrient values to expected units
- **State Management Details**:
  - Use refs to avoid dependency issues in useEffect hooks
  - Track newly added food IDs to skip input value restoration
  - Preserve user input values when foods array changes
  - Sync foodUnits between state and ref for async operations

## Implementation Notes

- Use functional React components with hooks
- Implement proper TypeScript-like type checking where possible
- Handle edge cases (empty inputs, invalid numbers, missing data)
- Normalize food names (case-insensitive matching)
- Support both metric and imperial units
- Handle unit conversions accurately
- Parse and validate all user inputs
- Provide helpful error messages
- Optimize for performance (memoization where appropriate)
- Ensure accessibility (keyboard navigation, screen readers)

## Example Usage Flow

1. User opens app → sees splash screen (if first time or list empty)
2. User clicks "NutritionGPT" → enters food list text and API key (or API key from URL parameter)
3. If existing foods present → dialog: "Add to Current List" or "Create New List"
4. App parses text → shows preview with line-by-line breakdown → user confirms → imports foods
5. For each food: check database → if missing, batch fetch nutrition data → store with unique names
6. Foods appear in table with editable amounts and units
7. Totals calculated and displayed (scaled by serving size and multiplier)
8. Bar chart shows RDA percentages with color coding
9. User can save list, add more foods, adjust amounts, change units
10. User can export/import data, view API logs (in advanced mode)
11. When loading saved list: check for missing foods → fetch nutrition → show progress

## Additional Implementation Details

- **Food Name Normalization**: Use case-insensitive matching to find foods in database
- **Duplicate Handling**: Generate unique names for duplicate foods (e.g., "Apple", "Apple (2)")
- **Input Value Preservation**: Preserve user input when foods array changes, only restore for new foods
- **Unit Weight Caching**: Cache unit weights during batch imports to avoid redundant API calls
- **Failed Foods Tracking**: Track foods that fail to import and report them to user
- **State Synchronization**: Use refs to avoid infinite loops in useEffect dependencies
- **Backward Compatibility**: Handle old data formats (`_serviceSize` typo, old serving size formats)

This application should be a complete, production-ready nutrition tracking tool that helps users monitor their daily nutrient intake against recommended daily allowances.

