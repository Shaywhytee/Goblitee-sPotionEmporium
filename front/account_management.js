// Menu Buttons
const username = document.getElementById("username");
username.addEventListener("click", () => {
    openUsernameInfo()
});
function openUsernameInfo() {
    usernameInfo.classList.add("visible");
;}
const inventory = document.getElementById("inventory");
inventory.addEventListener("click", () => {
    openPlayerInventory()
});
function openPlayerInventory() {
    playerInventoryWrapper.classList.add("visible")
};
const coinPurse = document.getElementById("gold");
coinPurse.addEventListener("click", () => {
    openCoinPurse()
});
function openCoinPurse() {
    goldWrapper.classList.add("visible")
};
const discoveredPotion = document.getElementById("discovered_potions");
discoveredPotion.addEventListener("click", () => {
    openDiscoveredPotions()
});
function openDiscoveredPotions() {
    discoveredPotionList.classList.add("visible")
};
const accountInfo = document.getElementById("account_info");
accountInfo.addEventListener("click", () => {
    openAccountInfo()
});
function openAccountInfo() {
    accountInfoMenu.classList.add("visible")
};
const logoutBtn = document.getElementById("logout")
logoutBtn.addEventListener("click", function() {
    window.location.href = "login.html"
});
let playerId;
const startBtn = document.getElementById("start_btn");
startBtn.addEventListener("click", function() {
    window.location.href = `index.html?accountId=${accountId}?playerId=${playerId}`
})
const createNewPlayer = document.getElementById("create_new_player")
createNewPlayer.addEventListener("click", () => {
    playerCreation()
})
function playerCreation() {
  newPlayerSetup.classList.add("visible");
  newPlayerSubmit.addEventListener("click", () => {
    if (nameInput.value != null && titleSelect.value != "Select a title") {
      fetch(`http://127.0.0.1:5000/account/${accountId}/playercreate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          player_name: nameInput.value,
          player_title: titleSelect.value,
          player_coin: 200,
          player_inventory: ""
        })
      })
      .then(response => {
        if (response.ok) {
          alert('Player created successfully');
          newPlayerSetup.classList.remove("visible")
          const playerId = data[0].id
          return playerId
        } else {
          alert('Error creating player');
        }
      })
      .catch(error => {
        console.error('Error creating player:', error);
      });
    } else {
      alert('Both Player Name and Player Title are required');
    }
  })
}
// User Info Menu
const playerName = document.getElementById("name");
const playerTitle = document.getElementById("title");
const creationDate = document.getElementById("creation_date");
const changeName = document.getElementById("change_name");
const changeTitle = document.getElementById("change_title");
const usernameInfo = document.getElementById("username_info")
// Inventory
const playerInventoryWrapper = document.getElementById("player_inventory_wrapper")
const inventorySlots = document.getElementById("inventory_slot");
const inventorySlotsIndicator = document.getElementById("inventory_slots_indicator");
function addInventorySlot () {
  const inventorySlot = document.createElement("div");
  inventorySlot.classList.add("inventory-slot");
  inventorySlots.appendChild(inventorySlot);
  inventorySlotsIndicator.textContent = inventorySlots.children.length;
}
//Gold
const goldWrapper = document.getElementById("gold_wrapper");
const coinPurseTotal = document.getElementById("gold_indicator");
const totalGoldEarned = document.getElementById("total_gold_earned")
const totalGoldSpent = document.getElementById("total_gold_spent");
// Discovered Potion List
const discoveredPotionList = document.getElementById("discovered_potion_list");
// Account info
const accountInfoMenu = document.getElementById("account_info_menu")
const userEmail = document.getElementById("user_email");
const accountCreationDate = document.getElementById("account_creation_date");
const deactivateAccountButton = document.getElementById("deactivate_account");
const changePassword = document.getElementById("change_password");


// New Player Setup
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
const accountId = params.accountId;
const newPlayerSetup = document.getElementById("new_player_setup")
const nameInput = document.getElementById("name_input")
const titleSelect = document.getElementById("title_select")
const newPlayerSubmit = document.getElementById("new_player_submit")
function CheckForPlayer() {
    fetch(`http://127.0.0.1:5000/account/${accountId}/player`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        newPlayerSetup.classList.add("visible");
        newPlayerSubmit.addEventListener("click", () => {
          if (nameInput.value != null && titleSelect.value != "Select a title") {
            fetch(`http://127.0.0.1:5000/account/${accountId}/playercreate`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                player_name: nameInput.value,
                player_title: titleSelect.value,
                player_coin: 200,
                player_inventory: ""
              })
            })
            .then(response => {
              if (response.ok) {
                alert('Player created successfully');
                newPlayerSetup.classList.remove("visible")
              } else {
                alert('Error creating player');
              }
            })
            .catch(error => {
              console.error('Error creating player:', error);
            });
          } else {
            alert('Both Player Name and Player Title are required');
          }
        })
      } else {
        playerName.textContent = data.player_name
        playerTitle.textContent = data.player_title
        coinPurseTotal.textContent = data.player_coin
        playerId = data.player_id
        const playerInventory = data.player_inventory ? JSON.parse(data.player_inventory) : [];
        console.log(data);
        const inventoryContainer = document.getElementById("inventory-container");
        playerInventory.forEach(item => {
          const itemDiv = document.createElement("div");
          itemDiv.innerText = item;
          inventoryContainer.appendChild(itemDiv);
        })
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);  
    })
  };
  
CheckForPlayer()
// Obtain Player info

// X Btn close
function closeMenu() {
  usernameInfo.classList.remove("visible");
  playerInventoryWrapper.classList.remove("visible");
  goldWrapper.classList.remove("visible");
  discoveredPotionList.classList.remove("visible");
  accountInfoMenu.classList.remove("visible");
  newPlayerSetup.classList.remove("visible");
}
const closeMenuBtns = document.querySelectorAll(".close_btn");
closeMenuBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    closeMenu()
  })
});
