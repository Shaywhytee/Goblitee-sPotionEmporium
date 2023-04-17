// Menu Buttons
const username = document.getElementById("username");
username.addEventListener("click", () => {
    openplayersMenu()
});
function openplayersMenu() {
    playersMenu.classList.add("visible");
;}
// Inventory
const playerInventoryWrapper = document.getElementById("player_inventory_wrapper")
const inventorySlots = document.querySelector(".inventory_slots");
const inventorySlotsIndicator = document.getElementById("inventory_slots_indicator");
let inventoryItems = [];
const inventory = document.getElementById("inventory");
inventory.addEventListener("click", () => {
  playerInventoryWrapper.classList.add("visible");
  fetch(`http://127.0.0.1:5000/account/${accountId}/player/${selectedPlayerId}/inventory`, {
  method: "GET"
  })
  .then(response => {

    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`Server returned ${response.status} ${response.statusText}`)
    }
  })
  .then(inventory_items => {
    console.log(inventory_items)
    const inventorySlot = []
    for (let i = 0; i < inventory_items.length; i++) {
      inventorySlot[i] = document.createElement("div");
      inventorySlot[i].classList.add(`inventory_slot_${[i]}`);
      const itemName = document.createElement("p");
      itemName.classList.add(`item_name_${[i]}`);
      itemName.textContent = "Name: " + inventory_items[i].inventory_item_name;
      inventorySlot[i].appendChild(itemName);
      const itemType = document.createElement("p");
      itemType.classList.add(`item_type_${[i]}`);
      itemType.textContent = "Type: " + inventory_items[i].inventory_item_type;
      inventorySlot[i].appendChild(itemType);
      const itemQuantity = document.createElement("p");
      itemQuantity.classList.add(`item_quantity_${[i]}`);
      itemQuantity.textContent = "Quantity: " + inventory_items[i].inventory_item_quantity;
      inventorySlot[i].appendChild(itemQuantity);
      const itemPrice = document.createElement("p");
      itemPrice.classList.add(`item_price_${[i]}`);
      itemPrice.textContent = "Worth: " + inventory_items[i].inventory_item_price + " Gold"; 
      inventorySlot[i].appendChild(itemPrice);
      const itemId = inventory_items[i].id;
      inventorySlots.appendChild(inventorySlot[i]);
      console.log(inventorySlot)
    }
  })
  .catch(error => {
    console.error("Couldn't get player inventory", error);
    alert("Couldn't get player inventory");
  });
});
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
  dimmer.classList.add("active")
  confirmationWindow.classList.add("visible")
  confirmationText.textContent = "Are you sure you want to log out?"
  confirmBtn.addEventListener ("click", () => {
    window.location.href = "login.html"
  })
  denyBtn.addEventListener("click", () => {
    dimmer.classList.remove("active")
    confirmationWindow.classList.remove("visible")
  })
});
let selectedPlayerId;
const selectedPlayerName = document.getElementById("selected_player_name");
const selectedPlayerTitle = document.getElementById("selected_player_title");

const startBtn = document.getElementById("start_btn");
startBtn.addEventListener("click", function() {
    window.location.href = `index.html?accountId=${accountId}?playerId=${selectedPlayerId}`
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
        })
      })
      .then(response => {
        if (response.ok) {
          alert('Player created successfully');
          newPlayerSetup.classList.remove("visible")
          const playerId = data[0].id
          return playerId
        } else {
          alert('Maximum number of players reached. Please delete an exsisting player to create a new one.');
        }
      })
      .catch(error => {
        console.error('Maximum number of players reached. Please delete an exsisting player to create a new one.', error);
      });
    } else {
      alert('Both Player Name and Player Title are required');
    }
  })
}
// User Info Menu
const playerMenuIds = [1, 2, 3];
const players = []
let selectedPlayer = []
const playerButtonsWrapperList = document.querySelectorAll('.player_button_wrapper')
for (let i = 0; i < playerMenuIds.length; i++){
  const playerButtonsWrapper = playerButtonsWrapperList[i]
  console.log(players);
  console.log(i);
  const selectButton = document.createElement("button")
  selectButton.classList.add(`select_button_${playerMenuIds[i]}`)
  selectButton.textContent = ('Select')
  playerButtonsWrapper.appendChild(selectButton)
  selectButton.addEventListener("click", () =>{
    selectedPlayerId = players[i].playerId
    selectedPlayer = players[i]
    selectedPlayerName.textContent = selectedPlayer.name.textContent
    selectedPlayerTitle.textContent = selectedPlayer.title.textContent
    console.log(selectedPlayerId)

    alert("Player Selected")
  })
  const changeNameButton = document.createElement("button")
  changeNameButton.classList.add(`change_name_button_${playerMenuIds[i]}`)
  changeNameButton.textContent = ('Change Name')
  playerButtonsWrapper.appendChild(changeNameButton)
  changeNameButton.addEventListener("click", () =>{
    let changeNameMenu = document.getElementById('change_name')
    let changeNameInput = document.getElementById('change_name_input')
    let changeTitleSelect = document.getElementById('change_title')
    let nameSubmit = document.getElementById('change_name_submit')
    changeNameMenu.classList.add("visible")
    nameSubmit.addEventListener("click", () =>{
      fetch(`http://127.0.0.1:5000/account/${accountId}/player/${players[i].playerId}`,{
      method:"PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        player_name: changeNameInput.value,
        player_title: changeTitleSelect.value
      })
      })
      .then(response => {
        if (response.ok) {
          alert('Player updated successfully');
          changeNameMenu.classList.remove("visible")
          players[i].name.textContent = changeNameInput.value
        } else {
          alert("Couldn't update player name");
        }
      })
      .catch(error => {
        console.error("Couldn't update player name", error);
      });
    })
  })
  const deleteButton = document.createElement("button")
  deleteButton.classList.add(`delete_button_${playerMenuIds[i]}`)
  deleteButton.textContent = ('Delete')
  playerButtonsWrapper.appendChild(deleteButton)
  deleteButton.addEventListener("click", () => {
    dimmer.classList.add("active")
    confirmationWindow.classList.add("visible")
    confirmationText.textContent = "Are you sure you want to delete this player? This is permanent."
    confirmBtn.addEventListener ("click", () => {
    fetch(`http://127.0.0.1:5000/account/${accountId}/playerdelete/${players[i].playerId}`, {
      method:"DELETE"
    })
      .then(response => {
        if (response.ok){
          alert('Player sucessfully deleted');
          confirmationWindow.classList.remove("visible");
          dimmer.classList.remove("active");
        } else {
          alert("Couldn't delete player. Please try again.");
          confirmationWindow.classList.remove("visible");
          dimmer.classList.remove("active");
        }
      })
      .catch(error => {
        console.error("Couldn't update player name", error);
        confirmationWindow.classList.remove("visible");
        dimmer.classList.remove("active");
      });
    });
    denyBtn.addEventListener("click", () => {
      dimmer.classList.remove("active")
      confirmationWindow.classList.remove("visible")
    });
  });
  const player =  {
    name: document.getElementById(`name_${playerMenuIds[i]}`),
    title: document.getElementById(`title_${playerMenuIds[i]}`),
    creationDate: document.getElementById(`creation_date_${playerMenuIds[i]}`),
    gold: document.getElementById(`gold_${playerMenuIds[i]}`),
    playerId: null,
    buttons : {
      selectName: document.getElementById(`select_name_${playerMenuIds[i]}`),
      changeName: document.getElementById(`change_name_${playerMenuIds[i]}`),
      changeTitle: document.getElementById(`change_title_${playerMenuIds[i]}`),
      deletePlayer: document.getElementById(`delete_player_${playerMenuIds[i]}`),
    }
  };
  players.push(player);
}

const playersMenu = document.getElementById("players_wrapper")
let accountStatusBoolean;
//Gold
const coinPurseTotal = document.getElementById("gold_indicator");
const goldWrapper = document.getElementById("gold_wrapper");
const totalGoldEarned = document.getElementById("total_gold_earned")
const totalGoldSpent = document.getElementById("total_gold_spent");
// Discovered Potion List
const discoveredPotionList = document.getElementById("discovered_potion_list");
// Account info
const accountInfoMenu = document.getElementById("account_info_menu")
const userEmail = document.getElementById("user_email");
const accountCreationDate = document.getElementById("account_creation_date");
const accountStatus = document.getElementById("account_status")
const deactAccountBtn = document.getElementById("deactivate_account");
deactAccountBtn.addEventListener ("click", () => {
  dimmer.classList.add("active")
  confirmationWindow.classList.add("visible")
  confirmationText.textContent = "Are you sure you want to deactivate your account?"
  confirmBtn.addEventListener ("click", () => {
    disableAccount()
  })
  denyBtn.addEventListener("click", () => {
    dimmer.classList.remove("active")
    confirmationWindow.classList.remove("visible")
  })
})
function disableAccount() {
  if (accountStatusBoolean === true){
    fetch(`http://127.0.0.1:5000/account/deactivate/${accountId}`, {
      method: "PUT",
    })
    .then (response => {
      if (response.ok) {
        accountStatus.textContent = "Inactive"
        alert('Success: Account has been deactivated')
        window.location.href = "login.html"
      } else {
        alert('Error:', 'Account was not deactivated. Please try again.')
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);  
    })
  }
};
function reactAccount () {
  dimmer.classList.add("active")
  confirmationWindow.classList.add("visible")
  confirmationText.textContent = "Your account is deactivated. Would you like to reactivate it?"
  confirmBtn.addEventListener ("click", () => {
    console.log(accountId, accountStatusBoolean)
    fetch(`http://127.0.0.1:5000/account/reactivate/${accountId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    })
    .then (response => {
      if (response.ok) {
        accountStatus.textContent = "Active"
        alert('Success: Account has been Reactivated')
        dimmer.classList.remove("active")
        confirmationWindow.classList.remove("visible")
      } else {
        alert('Error: Account was not reactivated. Please try again.')
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);  
    })
  })
  denyBtn.addEventListener("click", () => {
    window.location.href = "login.html"
  })
}
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
              })
            })
            .then(response => {
              if (response.ok) {
                alert('Player created successfully');
                newPlayerSetup.classList.remove("visible")
              } else {
                alert('Maximum number of player reached. Delete one to create a new one.');
              }
            })
            .catch(error => {
              console.error('Error creating player:', error);
            });
          } else {
            alert('Both Player Name and Player Title are required');
          }
        })
      } else if (data.account_status === false) {
        reactAccount()
        return accountStatusBoolean = data.account_status
      } else {
        console.log(data);
        accountStatusBoolean = data[0].account_status;
        accountCreationDate.textContent = data[0].account_creation_date
        userEmail.textContent = data[0].player_email

        for (let i = 0; i < data.length; i++) {
          const player = data[i];
          players[i].name.textContent = player.player_name;
          players[i].title.textContent = player.player_title;
          players[i].creationDate.textContent = player.player_creation_date;
          players[i].gold.textContent = player.player_coin
          players[i].playerId = player.player_id
        }
        selectedPlayer = players[0]
        selectedPlayerName.textContent = selectedPlayer.name.textContent
        selectedPlayerTitle.textContent = selectedPlayer.title.textContent
        coinPurseTotal.textContent = selectedPlayer.gold.textContent
        console.log(selectedPlayer)
        console.log(players)
        if (accountStatusBoolean === true) {
          accountStatus.textContent = "Active";
        } else {
          accountStatus.textContent = "Inactive";
        }
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);  
    })
  };
  
CheckForPlayer()
// Obtain Player info

// Misc Btn
function closeMenu() {
  playersMenu.classList.remove("visible");
  playerInventoryWrapper.classList.remove("visible");
  goldWrapper.classList.remove("visible");
  discoveredPotionList.classList.remove("visible");
  accountInfoMenu.classList.remove("visible");
  newPlayerSetup.classList.remove("visible");
}
function closeWindow() {
  change_name.classList.remove("visible");
  change_title.classList.remove("visible");
}
const closeSecondWindow = document.querySelectorAll(".close_btn2")
closeSecondWindow.forEach(btn => {
  btn.addEventListener("click", () => {
    closeWindow()
  })
});
const closeMenuBtns = document.querySelectorAll(".close_btn");
closeMenuBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    closeMenu()
  })
});
const confirmationWindow = document.getElementById("confirmation_window")
const confirmBtn = document.getElementById("confirm_btn")
const denyBtn = document.getElementById("deny_btn")
const confirmationText = document.getElementById("confirmation_text")
const dimmer = document.getElementById("dimmer")