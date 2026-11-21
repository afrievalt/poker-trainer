# Project rules

## Base

- Make sure README.md ends with `***`
- Keep files under 120 lines; keep functions under 60 lines
- Use TypeScript strict mode
- Prefer interfaces over types for object shapes
- Always type function parameters and return values
- Use const assertions for immutable data
- Avoid `any` — use `unknown` if the type is truly unknown
- Avoid try/catch
- Avoid magic numbers
- Don't use `../../` imports; use the path aliases from `tsconfig.app.json`: `@components/*`, `@hooks/*`, `@poker/*`, `@store/*`, `@trainer/*`, `@utils/*`

## Naming

- Avoid abbreviations in component, file, parameter, and variable names (prefer `HandEvaluator` over `HandEval`)
- Avoid the word `select` unless writing a selector
- Avoid the word `use` unless writing a hook
- Avoid generic names like `index`, `value`, `item`, `data` — use domain names (prefer `seatPosition` over `index`, `holeCards` over `items`)

## Forms

- Always build forms with react-hook-form + zod
- Never use the `placeholder` attribute
- Don't use form components for read-only information

## Usability

- Text boxes must have a distinct border
- Input text must have high contrast
- Don't use disabled buttons — give feedback that helps the user pick the next action

## State

- Avoid `useState`. Prefer:
  - **Redux** (`useSelector` / `useDispatch`) for app and domain state
  - **react-hook-form** for form state and validation (`register`, `control`, `watch`, `handleSubmit`)
- Reserve `useState` for truly local, ephemeral UI state (e.g. a single component's toggle)

## Components

- An ideal component is too small to fail
  - Max 60 lines per component, 120 lines per file
  - One component per file
  - Keep code DRY; extract reusable logic into custom hooks
  - Mirror JSX structure in folders:
    ```
    HomePage/
    ├── HomePage.tsx
    ├── Menu.tsx
    └── MainSection/
        ├── MainSection.tsx
        ├── Summary.tsx
        └── PersonTable.tsx
    ```
- Minimal surface area
  - Avoid prop drilling; prefer injecting values with `useSelector`
  - Props: meaningful camelCase names; booleans start with `is`, callbacks with `on`
  - Avoid ambiguous prop names like `data`, `list`, `items`, or single letters
  - Prefer simple primitive props; avoid props that require parsing
  - Use default values
- Minimal logic
  - Avoid empty checks; use lookup tables
  - Move logic out of the component into selectors, hooks, or CSS
  - JSX has only one return
- Clear separation of JavaScript and JSX ([Mise en place your code](https://daisy-saturnalia-81c.notion.site/Mise-en-place-your-code-and-make-fewer-mistakes-eeee1afc6dc64438a6cf39e70cc09b5f))
  - Never create helper functions that return JSX
  - Define event handlers in the component body, not inline in JSX:
    ```tsx
    // Avoid
    <button onClick={() => dispatch(handFolded())}>
    // Prefer
    const handleFold = () => dispatch(handFolded());
    <button onClick={handleFold}>
    ```
  - Never wrap a function whose signature already matches — pass the reference (`onClick={onClose}`, not `onClick={() => onClose()}`)
- JSX should resemble simple HTML
  - Avoid long classNames, render props, and dot-notation components
  - Limit JavaScript in JSX

## Files

- Prefer types in a separate file
- Prefer hooks in a separate file in the same folder

## Redux

- Use `createSlice` with interfaces for state and `PayloadAction` for typed actions
- Keep slices focused on a single domain; export actions and reducer from the slice file
- Follow the [Redux style guide](https://redux.js.org/style-guide/)
- Avoid dispatching many actions sequentially
- Put logic in reducers and selectors, not click handlers — a handler dispatches one minimal action
- Model actions as past-tense events, not setters. Payloads describe what happened (e.g. `{ guessedRank, isHigh }`), never what to display; derive display strings in selectors
- Never prefix actions with `set`, or bare `update` / `change` / `assign`. Ask "what happened?"
  - ❌ `trainer/setScore` → ✅ `trainer/guessSubmitted`
  - ❌ `trainer/setHand` → ✅ `trainer/handDealt`

## Tests

- Test files may be long; disable the length rule for the whole file:
  `/* eslint-disable max-lines-per-function */`

## Last step — NON-NEGOTIABLE

- Always run `npm run lint` as the last step and fix every issue
