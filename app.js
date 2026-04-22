let guests = [];

async function load() {
  const res = await fetch(CONFIG.URL);
  const data = await res.json();
  guests = data.guests || [];

  if (data.meta && data.meta.event_name) {
    document.getElementById("eventTitle").textContent = data.meta.event_name;
  }
  render();
}

function buildSearchString(g) {
  return (
    (g.name || "") +
    " " +
    (g.first_name || "") +
    " " +
    (g.last_name || "") +
    " " +
    (g.email || "")
  ).toLowerCase();
}

function displayName(g) {
  if (g.name) return g.name;
  return (g.first_name || "") + " " + (g.last_name || "");
}

function render() {
  const q = document.getElementById("search").value.toLowerCase();

  const filtered = guests.filter(g =>
    buildSearchString(g).includes(q)
  );

  const unchecked = filtered.filter(g => !g.checked_in_at);
  const checked = filtered.filter(g => g.checked_in_at);

  renderList("guestList", unchecked, false);
  renderList("checkedList", checked, true);
  const total = guests.length;
  const checkedCount = guests.filter(g => g.checked_in_at).length;
  document.getElementById("counter").textContent =
  `${checkedCount} / ${total}`;
}

function renderList(id, list, isChecked) {
  const el = document.getElementById(id);
  el.innerHTML = "";

  list
    .sort((a, b) => displayName(a).localeCompare(displayName(b)))
    .forEach(g => {
      const div = document.createElement("div");
      div.className = "row " + (isChecked ? "checked" : "");

      div.innerHTML = `
            <span>${displayName(g)}</span>
            <button onclick="checkIn('${g.guest_id}')">✓</button>
          `;

      el.appendChild(div);
    });
}

function checkIn(id) {
  const g = guests.find(x => x.guest_id === id);

  const isChecked = !!g.checked_in_at;

  // Toggle locally
  g.checked_in_at = isChecked ? "" : new Date().toISOString();
  render();

  // Send update
  fetch(CONFIG.URL, {
    method: "POST",
    body: JSON.stringify({
      guest_id: id,
      checked_in_at: g.checked_in_at
    })
  });
}

document.getElementById("search").addEventListener("input", render);

load();