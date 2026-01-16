# Cinema Website — Seat Booking & Payment (HTML/CSS/JS)

## Description
Multi-page cinema booking website:
- Movies list (search + genre filter)
- Movie details + showtimes (from JSON via fetch)
- Seat selection with hall plan (Available/Selected/Taken)
- Checkout + payment simulation + validation
- Success page with receipt
- Login required for checkout

## Pages
- index.html — Movies / Sessions list (movies grid)
- movie.html — Movie details + showtimes
- seats.html — Seat selection (8 rows × 10 seats)
- checkout.html — Payment + order summary (login required)
- success.html — Receipt
- login.html — Demo login

## Features checklist
- [x] Responsive UI (grid/cards + layouts)
- [x] Header + navigation
- [x] Fetch & render from JSON (movies + sessions)
- [x] Seat booking logic: Available/Selected/Taken
- [x] Rule: max 6 seats per order + cannot select Taken
- [x] Continue passes sessionId + selectedSeats + totalPrice (sessionStorage + query)
- [x] Checkout payment simulation with JS validation
- [x] On pay: bookingId + mark seats Taken in localStorage + redirect to success
- [x] Success receipt: bookingId/movie/date/time/seats/total
- [x] Search by title
- [x] Filter by genre
- [x] Dark/Light mode stored in localStorage
- [x] Login required to access checkout

## Local run
Open `index.html` via a local server (recommended).
Example:
- VS Code Live Server extension
or
- `python -m http.server` (then open http://localhost:8000)

## Hosting
### GitHub Pages
1) Push repo to GitHub
2) Settings → Pages → Deploy from branch → `main` / root
3) Live link appears in Pages section

### Minimum commits
- init
- booking
- payment

## Live link
- https://muraditakashvili.github.io/Cinema/
