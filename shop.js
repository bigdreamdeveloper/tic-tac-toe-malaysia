// Kedai Ikon Logic
const iconList = ["🧋", "🍗", "🥚", "🐔", "🥥", "🍌", "🍞", "🍫"];
const iconPrice = 5; // setiap ikon berharga 5 coin

const coinCountEl = document.getElementById("coinCount");
const iconContainer = document.getElementById("iconContainer");
let coins = parseInt(localStorage.getItem("coins") || "0");
let ownedIcons = JSON.parse(localStorage.getItem("ownedIcons") || "[]");
let selectedIcon = localStorage.getItem("selectedIcon") || "🧋";

coinCountEl.textContent = coins;

function updateCoinDisplay() {
  coinCountEl.textContent = coins;
}

function saveToStorage() {
  localStorage.setItem("coins", coins);
  localStorage.setItem("ownedIcons", JSON.stringify(ownedIcons));
  localStorage.setItem("selectedIcon", selectedIcon);
}

function renderShop() {
  iconContainer.innerHTML = "";
  iconList.forEach(icon => {
    const iconBox = document.createElement("div");
    iconBox.className = "icon-box";
    iconBox.innerHTML = `<div class="icon">${icon}</div>`;

    const button = document.createElement("button");

    if (selectedIcon === icon) {
      button.textContent = "Digunakan";
      button.disabled = true;
    } else if (ownedIcons.includes(icon)) {
      button.textContent = "Guna";
      button.onclick = () => {
        selectedIcon = icon;
        saveToStorage();
        renderShop();
      };
    } else {
      button.textContent = `Beli (${iconPrice} 🪙)`;
      button.onclick = () => {
        if (coins >= iconPrice) {
          coins -= iconPrice;
          ownedIcons.push(icon);
          selectedIcon = icon;
          saveToStorage();
          renderShop();
        } else {
          alert("Coin anda tidak mencukupi!");
        }
      };
    }

    iconBox.appendChild(button);
    iconContainer.appendChild(iconBox);
  });
}

renderShop();
