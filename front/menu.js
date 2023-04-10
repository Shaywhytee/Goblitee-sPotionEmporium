// Potion Bases
const potionBase = [
    {name: "1: Green Slime", price: 3 },
    {name: "2: Blue Slime", price: 4 },
    {name: "3: Red Slime", price: 4 },
    {name: "4: Goat Milk", price: 2 },
    {name: "5: Dragon Blood", price: 30 },
    {name: "6: Death Remnants", price: 6 },
];

// Potion Active ingrediants
const activeIngredient = [
    {name: "1: Goblin Jello", price: 5},
    {name: "2: Unicorn Horn Shavings", price: 20},
    {name: "3: Zombie Fruit", price: 10},
    {name: "4: Yeti Teeth", price: 11},
    {name: "5: Holy Cloth", price: 7},
];

// Player Coin Purse
var playerCoinPurse = 20
coinPurseText = document.getElementById("coin_purse")
coinPurseText.innerHTML = `${playerCoinPurse} Gold`
coinPurseChangesText = document.getElementById("coin_purse_changes")
// Comments

function getPotionComment(selectedBase) {
    switch (selectedBase.name) {
        case "1: Green Slime":
            return "Farmed from the greenest slimes.";
        case "2: Blue Slime":
            return "Sometimes I can't tell the difference between a blue slime and a puddle...";
        case "3: Red Slime":
            return "I picked this red slime up this morning. Fresh as ever!";
        case "4: Goat Milk":
            return "Yelga out back made this.";
        case "5: Dragon Blood":
            return "This stuff is pretty rare. Luckily it preserves itself.";
        case "6: Death Remnants":
            return "Don't ask where I got this...";
        default:
            return "";
    }
}

function getIngredientComment(selectedIngredient) {
    switch (selectedIngredient.name) {
        case "1: Goblin Jello":
            return "It's green just like me.";
        case "2: Unicorn Horn Shavings":
            return "These are definitely from a unicorn. Not Yelga...";
        case "3: Zombie Fruit":
            return "If you thought this came from a tree you are sorely mistaken.";
        case "4: Yeti Teeth":
            return "Dentists are important";
        case "5: Holy Cloth":
            return "Picked this one up at the Good Will";
            default:
                return "";
    }
}

// Phrases
const basePhrases = potionBase.map(item => `${item.name} at ${item.price} Gold`)
const ingredientPhrases = activeIngredient.map(item => `${item.name} at ${item.price} Gold`)
var phrases = [
    "Here are our Potion BASES:",
    basePhrases.join("\n"),
    "Here are the ACTIVE INGREDIENTS you can add to your BASE",
    ingredientPhrases.join("\n"),
    "Looks like ya got all that you wanted.",
    "Let's get it all tallied up",
    "",
    "Thanks for the Gold!",
    "",
    "",
];


// Text Boxes
gobliteeText = document.getElementById("goblitee_text");
playerText = document.getElementById("player_text");
playerInput = document.getElementById("player_input");
gobilteeSpeechWrapper = document.querySelector(".speech_wrapper");
gobliteeImage = document.getElementById("goblitee_image")

// Buttons
var talkButton = document.getElementById("talk_button");
talkButton.addEventListener("click", runPotionEmporioum);
var nextButton = document.getElementById("next_button");
nextButton.disabled = true;
nextButton.classList.add("disabled");
var selectButton = document.getElementById("select_button");
selectButton.disabled = true;
selectButton.classList.add("disabled");
var cancelButton = document.getElementById("cancel_button");
cancelButton.disabled = true;
cancelButton.classList.add("disabled");

function nextButtonClick() {
    gobliteeText.innerHTML = "<p>" +phrases[currentPhraseIndex] + "</p>";
    currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
};
// User Selection

function selectBase() {
  playerText.innerHTML = "<p>Select which one you would like 1-6: or press CANCEL to purchase an ACTIVE INGREDIENT only.</p>";
  selectButton.disabled = false;
  selectButton.classList.remove("disabled");
  cancelButton.disabled = false;
  cancelButton.classList.remove("disabled");
  nextButton.disabled = true;
  nextButton.classList.add("disabled");
  return new Promise((resolve) => {
    function handleSelect() {
      var selectedBase = null;
      nextButton.disabled = false;
      nextButton.classList.remove("disabled");
      const baseList = parseInt(playerInput.value);
      if (isNaN(baseList)) {
        gobliteeText.innerHTML = "<p>That's not what I asked numbnuts. Select a number between 1 and 6, or hit CANCEL!</p>";
      } else if (baseList >= 1 && baseList <= 6) {
        selectedBase = potionBase[baseList - 1];
        const potionComment = getPotionComment(selectedBase);
        gobliteeText.innerHTML = `<p>${selectedBase.name.substring(3)}: ${selectedBase.price} Gold. ${potionComment}</p>`;
        playerText.innerHTML = "<p></p>";
        selectButton.removeEventListener("click", handleSelect);
        cancelButton.removeEventListener("click", handleCancel);
        selectButton.disabled = true;
        selectButton.classList.add("disabled");
        cancelButton.disabled = true;
        cancelButton.classList.add("disabled");
        resolve(selectedBase);
      } else {
        gobliteeText.innerHTML = "<p>Sorry I can't carry everything here. We don't have that. Select 1-6</p>";
        playerText.innerHTML = "<p>" + basePhrases.join("\n") + "</p>";
      }
    }
    
    function handleCancel() {
      console.log("Ingredient only");
      gobliteeText.innerHTML = "<p></p>"
      selectButton.removeEventListener("click", handleSelect);
      cancelButton.removeEventListener("click", handleCancel);
      resolve(null);
      ingredientOnly();
    }
    
    selectButton.addEventListener("click", handleSelect);
    cancelButton.addEventListener("click", handleCancel);
  });
}

  
function ingredientOnly() {
  console.log("ingredient only check")
  playerText.innerHTML = "<p>Proceed to ingredient only purchase? y/n</p>"
  // Promise for input
  const inputPromise = new Promise((resolve) => {
    selectButton.addEventListener("click", () => {
      const answer = playerInput.value.toLowerCase();
      if (answer[0] === "y") {
        gobliteeText.innerHTML = "<p> Alrighty then cheapskate. Lets get you that ACTIVE INGREDIENT"
        nextButton.disabled = false;
        nextButton.classList.remove("disabled");
        resolve("ingredient only")
      } else if (answer[0] === "n") {
        selectBase().then((base) => {
          resolve(base);
        });
      } else {
        gobliteeText.innerHTML = "<p>Not a valid answer bud. No POTION BASE today y/n?<p>"
      }
    });
  });
  console.log(inputPromise)
  return inputPromise
};
  
  
  
  
  //Ingredient selection

  function selectActiveIngredient(){
    playerText.innerHTML = ("<p>Select your ACTIVE INGREDIENT 1-5: or CANCEL to purchase your POTION BASE</p>");
    selectButton.disabled = false;
    selectButton.classList.remove("disabled");
    cancelButton.disabled = false;
    cancelButton.classList.remove("disabled");
    nextButton.disabled = true;
    nextButton.classList.add("disabled");
    return new Promise((resolve) => {
      function handleSelect () {
        var selectedIngredient = null;
        nextButton.disabled = false;
        nextButton.classList.remove("disabled");
        const ingredientList = parseInt(playerInput.value);
        if (isNaN(ingredientList)) {
          gobliteeText.innerHTML = "<p>That's not what I asked numbnuts. Select a number between 1 and 5, or hit CANCEL!</p>";
        } else if (ingredientList >= 1 && ingredientList <=5) {
          selectedIngredient = activeIngredient[ingredientList - 1];
          const ingredientComment = getIngredientComment(selectedIngredient);
          gobliteeText.innerHTML = (`${selectedIngredient.name.substring(3)}: ${selectedIngredient.price} Gold. ${ingredientComment}`)
          playerText.innerHTML = "<p></p>";
          selectButton.removeEventListener("click", handleSelect);
          cancelButton.removeEventListener("click", handleCancel);
          selectButton.disabled = true;
          selectButton.classList.add("disabled");
          cancelButton.disabled = true;
          cancelButton.classList.add("disabled");
          resolve(selectedIngredient)
        } else {
          gobliteeText.innerHTML = "<p>That's not what I asked numbnuts. Select a number between 1 and 5, or hit CANCEL!</p>";
          playerText.innerHTML = "<p>" + ingredientPhrases.join("\n") + "</p>";
        }
      }
      function handleCancel() {
        console.log("base only");
        gobliteeText.innerHTML = "<p></p>"
        selectButton.removeEventListener("click", handleSelect);
        cancelButton.removeEventListener("click", handleCancel);
        resolve(null);
        baseOnly();
      }
      selectButton.addEventListener("click", handleSelect);
      cancelButton.addEventListener("click", handleCancel);
    });
  };
  
function baseOnly() {
  console.log("base only check")
  playerText.innerHTML = "<p>Would you like to purchase only your potion base? y/n</p>"
  const inputPromise = new Promise((resolve) => {
    selectButton.addEventListener("click", () => {
      const answer = playerInput.value.toLowerCase()
    // Player input
      if (answer[0] === "y") {
        gobliteeText.innerHTML = "<p> Gotcha."
        nextButton.disabled = false;
        nextButton.classList.remove("disabled");
        resolve("base only")
      } else if (ingredientOnlyAnswer[0] === "n"){
        selectActiveIngredient().then((ingredient) => {
          resolve(ingredient);
        });
      } else {
        gobliteeText.innerHTML = "<p>Not what I'm asking. Just the base today? Y/N"
      }
    });
  });
  console.log(inputPromise)
  return inputPromise
};



function runPotionEmporioum() {
    nextButton.disabled = false;
    nextButton.classList.remove("disabled")
    talkButton.disabled = true;
    talkButton.classList.add("disabled")
    gobilteeSpeechWrapper.classList.add("visible");
    gobliteeImage.classList.add("visible");

    let currentPhraseIndex = 0;
    let selectedBase = null;
    let selectedIngredient = null;
  
    gobliteeText.innerHTML = "<p>Welcome to Goblitee Potion Emporium. To make your potion you need to tell me the potion base you would like and then add an active ingredient.</p>";
  
    function nextButtonClick() {
      gobliteeText.innerHTML = "<p>" + phrases[currentPhraseIndex] + "</p>";
      currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
  
      if (currentPhraseIndex === 2) {
        selectedBase = selectBase();
      } else if (currentPhraseIndex === 4) {
        selectedIngredient = selectActiveIngredient();
      } else if (currentPhraseIndex === 7) {
        const totalCost = totalCostCalc(selectedBase, selectedIngredient);
        gobliteeText.innerHTML = `<p>Your total cost is ${totalCost} gold. </p>`;
      } else if (currentPhraseIndex === 9){
        talkButton.disabled = false;
        talkButton.classList.remove("disabled")
        nextButton.disabled = true;
        nextButton.classList.add("disabled")
        gobilteeSpeechWrapper.classList.remove("visible")
        gobliteeImage.classList.remove("visible")
        coinPurseChangesText.classList.remove("visible")
        currentPhraseIndex = 0
      }
    }
  
    nextButton.addEventListener("click", nextButtonClick);
  };
  
  
  
function totalCostCalc(selectedBasePromise, selectedIngredientPromise) {
    Promise.all([selectedBasePromise, selectedIngredientPromise])
        .then (([selectedBase, selectedIngredient]) => {
            console.log(selectedBase, selectedIngredient, "check 2")
            const totalCost = (selectedBase?.price ?? 0) + (selectedIngredient?.price ?? 0);
            console.log("check")            
            if (totalCost > playerCoinPurse) {
                gobliteeText.innerHTML = ("<p>Why'd we go through all of that if you don't even have the coin to play?!</p>");
                gobilteeSpeechWrapper.classList.remove("visible")
                gobliteeImage.classList.remove("visible")
            }
            else {
                if (selectedBase === "ingredient only") {
                    gobliteeText.innerHTML = (`<p>Only an ACTIVE INGREDIENT today? For ${selectedIngredient.name.substring(3)} your total is ${selectedIngredient.price} Gold! \n ${selectedIngredient.itemPrice} Gold was removed from your coin purse.<p/>`)
                    playerCoinPurse -= totalCost
                    return totalCost
                }
            
                else if (selectedIngredient === "base only") {
                    gobliteeText.innerHTML = (`<p>Only a POTION BASE today? For ${selectedBase.name.substring(3)} your total is ${selectedBase.price} Gold! \n ${selectedBase.itemPrice} Gold was removed from your coin purse.</p>`)
                    playerCoinPurse -= totalCost
                    return totalCost
                }
                else if (selectedBase !== null && selectedIngredient !== null) {
                    
                    const newPotion = `${selectedBase.name.charAt(3) + selectedBase.name.slice(4).toLowerCase()} ${selectedIngredient.name.substring(3).toLowerCase()}`
                    gobliteeText.innerHTML = (`<p>Your potion total is ${selectedBase.price  + selectedIngredient.price} Gold. You created a ${newPotion} potion!</p>`);
                    playerCoinPurse -= totalCost
                    coinPurseText.innerHTML = `${playerCoinPurse} Gold`
                    coinPurseChangesText.classList.add("visible")
                    coinPurseChangesText.innerHTML = (`<p>-${totalCost}</p>`)
                    return totalCost
                }
            }
        })
    .catch((error) => {
    console.error(error)
    playerText.innerHTML = (`Player Gold: ${playerCoinPurse} Gold remaining`)
    })
}