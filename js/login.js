import { mountHeader, qs, getParam, setAuthUser } from "./app.js";

mountHeader();

const redirect = getParam("redirect");

const err = qs("#err");
function show(msg){
  err.textContent = msg;
  err.style.display = "block";
}
function clear(){
  err.textContent = "";
  err.style.display = "none";
}

qs("#loginBtn").addEventListener("click", () => {
  clear();
  const name = (qs("#name").value || "").trim();
  const pass = (qs("#pass").value || "").trim();

  if(!name) return show("Name is required.");
  if(!pass) return show("Password is required.");

  setAuthUser({ name, loggedInAt: new Date().toISOString() });

  location.href = redirect ? decodeURIComponent(redirect) : "index.html";
});
