import { mountHeader, qs, getParam, money, getBookings, escapeHTML } from "./app.js";

mountHeader();

const bookingId = getParam("bookingId");
const receipt = qs("#receipt");

const bookings = getBookings();
const b = bookingId ? bookings[bookingId] : null;

if(!b){
  receipt.innerHTML = `<div class="small">Booking not found.</div>`;
} else {
  receipt.innerHTML = `
    <div class="kv"><span>Booking ID</span><strong>${escapeHTML(b.bookingId)}</strong></div>
    <div class="kv"><span>Movie</span><strong>${escapeHTML(b.movieTitle ?? "—")}</strong></div>
    <div class="kv"><span>Date/Time</span><strong>${escapeHTML(b.date)} ${escapeHTML(b.time)}</strong></div>
    <div class="kv"><span>Hall</span><strong>${escapeHTML(b.hallId)}</strong></div>
    <div class="hr"></div>
    <div class="kv"><span>Seats</span><strong>${b.seats.length}</strong></div>
    <div class="list">${b.seats.map(s => `<span class="chip">${escapeHTML(s)}</span>`).join("")}</div>
    <div class="hr"></div>
    <div class="kv"><span>Total</span><strong>${money(b.totalPrice)}</strong></div>
    <div class="kv"><span>Card</span><strong>**** ${escapeHTML(b.cardLast4 || "—")}</strong></div>
    <div class="footer-note">Paid at: ${escapeHTML(b.paidAt)}</div>
  `;
}
