// js/app.js
export const STORAGE = {
  theme: "cinema_theme",
  auth: "cinema_auth_user",
  takenPrefix: "cinema_takenSeats_",
  bookings: "cinema_bookings"
};

export function qs(sel, root=document){ return root.querySelector(sel); }
export function qsa(sel, root=document){ return [...root.querySelectorAll(sel)]; }
export function getParam(name){ return new URLSearchParams(location.search).get(name); }

export async function fetchJSON(path){
  const res = await fetch(path);
  if(!res.ok) throw new Error(`Fetch failed: ${path}`);
  return await res.json();
}

export function setTheme(next){
  document.documentElement.dataset.theme = next;
  localStorage.setItem(STORAGE.theme, next);
}

export function initTheme(){
  const saved = localStorage.getItem(STORAGE.theme);
  document.documentElement.dataset.theme = saved || "dark";
}

export function toggleTheme(){
  const cur = document.documentElement.dataset.theme || "dark";
  setTheme(cur === "dark" ? "light" : "dark");
}

export function money(n){
  return `${Number(n).toFixed(2)}₾`;
}

export function getAuthUser(){
  const raw = localStorage.getItem(STORAGE.auth);
  return raw ? JSON.parse(raw) : null;
}
export function setAuthUser(userObj){
  localStorage.setItem(STORAGE.auth, JSON.stringify(userObj));
}
export function logout(){
  localStorage.removeItem(STORAGE.auth);
}

export function requireLoginOrRedirect(redirectTo){
  const u = getAuthUser();
  if(!u){
    const url = `login.html?redirect=${encodeURIComponent(redirectTo)}`;
    location.href = url;
    return false;
  }
  return true;
}

export function getTakenSeats(sessionId){
  const raw = localStorage.getItem(STORAGE.takenPrefix + sessionId);
  return raw ? JSON.parse(raw) : [];
}
export function setTakenSeats(sessionId, seats){
  localStorage.setItem(STORAGE.takenPrefix + sessionId, JSON.stringify(seats));
}

export function getBookings(){
  const raw = localStorage.getItem(STORAGE.bookings);
  return raw ? JSON.parse(raw) : {};
}
export function setBookings(map){
  localStorage.setItem(STORAGE.bookings, JSON.stringify(map));
}

export function mountHeader(){
  initTheme();

  const themeBtn = qs('[data-action="theme"]');
  if(themeBtn){
    themeBtn.addEventListener("click", toggleTheme);
  }

  const authEl = qs('[data-slot="auth"]');
  if(authEl){
    const u = getAuthUser();
    authEl.innerHTML = u
      ? `<span class="pill">Hi, <strong>${escapeHTML(u.name)}</strong></span>
         <button class="btn ghost" data-action="logout">Logout</button>`
      : `<a class="btn ghost" href="login.html">Login</a>`;

    const lo = qs('[data-action="logout"]', authEl);
    if(lo){
      lo.addEventListener("click", () => {
        logout();
        location.reload();
      });
    }
  }
}

export function escapeHTML(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

export function groupBy(arr, keyFn){
  return arr.reduce((acc, x) => {
    const k = keyFn(x);
    (acc[k] ||= []).push(x);
    return acc;
  }, {});
}
