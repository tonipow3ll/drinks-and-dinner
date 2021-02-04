const version = "1.00";
if(JSON.parse(localStorage.getItem("ezrpzWorkingVersion")) !== version) {
    localStorage.clear;
    localStorage.setItem(JSON.stringify("ezrpzWorkingVersion"), version);
}

$(document).ready(function () {

    // API Constants
    const drinkAPIkey = "9973533";
    const mealAPIkey = "9973533";
    const drinkURL = "https://www.thecocktaildb.com/api/json/v2/" + drinkAPIkey + "/";
    const mealURL = "https://www.themealdb.com/api/json/v2/" + mealAPIkey + "/";
    const filterURL = "filter.php?i=";
    const lookUpURL = "lookup.php?i=";
    const randomURL = "random.php";

    // regex Constants
    const regexIng = /\bstrIngredient/g;
    const regexMeas = /\bstrMeasure/g;

    // Initialize Function
    init();

    /* 
    FUNCTION: Initialize. 
    Generates the Meal and Drink ingredient buttons for users to select in the modal windows and assigns associated on.click functionality.
    Selects a random meal and drink based on previously saved ingredient inputs, if no saved ingredient inputs exists then generates a truly random meal.
    */
    function init() {

        // API call to generate a list of meal ingredients and sorts the list alphabetically.
        Promise.resolve(mealIngredients).then(function (response) {
            response.meals.sort(function (a, b) {
                return a.strIngredient.localeCompare(b.strIngredient);
            });

            // This loop generates all of the UI Meal Ingredient buttons in the modal windows.
            for (let i = 0; i < response.meals.length; i++) {

                // Default variables.
                let storeMeal = 0;
                let classAdd = "";

                // Checks to see if this ingredient has a stored data state. If it does, get the data state.
                if (JSON.parse(localStorage.getItem(titleCase(response.meals[i].strIngredient))) !== null) { storeMeal = localStorage.getItem(titleCase(response.meals[i].strIngredient)) };

                // Changes CSS based on saved data state of this ingredient.
                switch (parseInt(storeMeal)) {
                    case 1:
                        classAdd = " is-success"
                        break;
                    case -1:
                        classAdd = " is-danger"
                        break;
                }

                // Creates a row template for the respective ingredient button to be added.
                let rowTemp = '<button class="button mealSelector' + classAdd + '" data-state=' + storeMeal + '>' + titleCase(response.meals[i].strIngredient) + '</button>';

                // Appends the button element.
                $("#contentMI").append(rowTemp);
            };

            // On Click functionality for meal ingredient buttons.
            $('.mealSelector').on('click', function (event) {
                event.preventDefault;
                ingredButtonFormatting(this);
            });
        });

        // API call to generate a list of drink ingredients and sorts the list alphabetically.
        Promise.resolve(drinkIngredients).then(function (response) {
            response.drinks.sort(function (a, b) {
                return a.strIngredient1.localeCompare(b.strIngredient1);
            });

            // This loop generates all of the UI Drink Ingredient buttons in the modal windows.
            for (let i = 0; i < response.drinks.length; i++) {

                // Default Variables
                let storeDrink = 0;
                let classAdd = "";

                // Checks to see if this ingredient has a stored data state. If it does, get the data state.
                if (JSON.parse(localStorage.getItem(titleCase(response.drinks[i].strIngredient1))) !== null) { storeDrink = localStorage.getItem(titleCase(response.drinks[i].strIngredient1)) };

                // Changes CSS based on saved data state of this ingredient.
                switch (parseInt(storeDrink)) {
                    case 1:
                        classAdd = " is-success"
                        break;
                    case -1:
                        classAdd = " is-danger"
                        break;
                };

                // Creates a row template for the respective ingredient button to be added.
                let rowTemp = '<button class="button drinkSelector' + classAdd + '" data-state=' + storeDrink + '>' + titleCase(response.drinks[i].strIngredient1) + '</button>';

                // Append the button element.
                $("#contentDI").append(rowTemp);
            };

            // On Click functionality for drink ingredient buttons.
            $('.drinkSelector').on('click', function (event) {
                event.preventDefault;
                ingredButtonFormatting(this);
            });
        });

        // Generate first meal and drink pair on website open.
        Promise.all([mealIngredients, drinkIngredients]).then((response) => { generatePair() });
    };
    //END FUNCTION: Initialize


    /* 
    FUNCTION: Generates a meal or drink based on parameter inputs including user selected 'Good' (GREEN modal buttons) ingredients, and user selected 'Bad' ingredients (RED modal buttons). If there is no stored button data, generates a truly random meal. If there are only RED buttons, generates a truly random meal but excludes recipes with those ingredients. If GREEN buttons exist, finds all recipes with any of those ingredients in them and sorts the meals by most ingredients present to least. Currently, the program selects a random meal from the Top 30 in this list. If there are less than 30 meals, it selects a random meal from the whole list. Recipes with RED button ingredients are still excluded in this case.
    */
    function getIngredPromises(goodArray, badArray, type, goodGen, badGen, goodCounts, badCounts, goodList, functionURL) {

        // Create an array of promises, each index being the response for one of the GREEN ingredients in the array. If no GREEN ingredients exist, calls one completely random recipe from the API.
        if (goodArray.length === 0) {
            goodArray[0] = $.get(functionURL + randomURL, ((response) => { return response }));
        } else {
            for (let i = 0; i < goodArray.length; i++) {
                goodArray[i] = $.get(functionURL + filterURL + goodArray[i], ((response) => { return response }));
            };
        };

        // Create an array of promises, each index being the response for one of the RED ingredients in the array.
        for (let i = 0; i < badArray.length; i++) {
            badArray[i] = $.get(functionURL + filterURL + badArray[i], ((response) => { return response }));
        };

        // Waits for all GREEN promises (or 1 RANDOM promise), then generates a list of IDs for the drinks/meals that use the ingredients. Sorts the list by most ingredients found to least.
        Promise.all(goodArray).then((response) => {
            // Loop to concat the arrays of the GREEN IDs together.
            for (let i = 0; i < response.length; i++) {
                if (type === "drink" && response[i].drinks !== null && response[i].drinks !== "None Found") { goodGen = goodGen.concat(response[i].drinks.map(function (v) { return v.idDrink })); 
                } else if (type === "meal" && response[i].meals !== null && response[i].meals !== "None Found") { goodGen = goodGen.concat(response[i].meals.map(function (v) { return v.idMeal })); };
            }

            Promise.all(badArray).then((response) => {
                // Loop to concat the arrays of the RED IDs together.
                for (let i = 0; i < response.length; i++) {
                    if (type === "drink" && response[i].drinks !== null) { badGen = badGen.concat(response[i].drinks.map(function (v) { return v.idDrink })); 
                    } else if (type === "meal" && response[i].meals !== null) { badGen = badGen.concat(response[i].meals.map(function (v) { return v.idMeal })); };
                };

                // Counts the number of times each ID appears in the GREEN list.
                goodGen.forEach(function (x) {
                    goodCounts[x] = (goodCounts[x] || 0) + 1;
                });
                console.log(goodCounts)

                // Counts the number of times each ID appears in the RED list.
                badGen.forEach(function (x) {
                    badCounts[x] = (badCounts[x] || 0) + 1;
                });

                // If an id exists in the RED object, remove it from the GREEN object.
                Object.entries(goodCounts).forEach(function (e) {
                    if (!badCounts[e[0]] === false) {
                        delete goodCounts[e[0]];
                    };
                });

                // If no recipes remain after removing RED ingredient recipes from GREEN ingredient recipes, removes all GREEN ingredients from the GREEN ingredient array and reruns the function to generate a completely random meal with no RED ingredients.

                if (!goodCounts === true) {
                    Promise.all(goodArray).then(function () {
                        goodArray = [];
                        getIngredPromises(goodArray, badArray, type, goodGen, badGen, goodCounts, badCounts, goodList, functionURL);
                        return false;
                    });
                };

                // Turn the remaining GREEN IDs into a JSON object.
                Object.entries(goodCounts).forEach(e => goodList["items"].push({ "id": e[0], "count": e[1] }));

                // Sorts the JSON object descending by the number of GREEN ingredients in it.
                goodList.items.sort(function (a, b) { return b.count - a.count });

                let randomCount = 50;
                if (goodList.items.length < 50) { randomCount = goodList.items.length };
                let displayItem = goodList.items[Math.floor(Math.random() * randomCount)].id;
                let displayPromise = $.get(functionURL + lookUpURL + displayItem, ((response) => { return response }));

                Promise.resolve(displayPromise).then((response) => {
                    if (type === "drink") {
                        // Displays the image and title for the drink.
                        $('#drinkIngredientsUL').empty();
        
                        let drinkDetails = response.drinks[0];
                        $("#drinkTitle").text(drinkDetails.strDrink);
                        $("#drinkImg").attr("src", drinkDetails.strDrinkThumb);
                        $("#drinkImg").attr("alt", drinkDetails.strDrink);
                        $("#drinkRecipe").text(drinkDetails.strInstructions);
        
                        let drinkIngArray = [];
                        let drinkMeasurements = [];
        
                        let i = 0;
                        for (property in drinkDetails) {
                            let a = `${property}`.match(regexIng);
        
                            if (a &&
                                `${drinkDetails[property]}` &&
                                `${drinkDetails[property]}` !== '' &&
                                `${drinkDetails[property]}` !== 'null' &&
                                `${drinkDetails[property]}` !== ' ') {
                                drinkIngArray[i] = `${drinkDetails[property]}`
                                i++
                            }
                        }
        
                        i = 0;
                        for (property in drinkDetails) {
                            let b = `${property}`.match(regexMeas);
        
                            if (b &&
                                `${drinkDetails[property]}` &&
                                `${drinkDetails[property]}` !== '' &&
                                `${drinkDetails[property]}` !== 'null') {
                                drinkMeasurements[i] = `${drinkDetails[property]}`
                                i++
                            }
                        }
        
                        for (let j = 0; j < drinkIngArray.length; j++) {
                            let haveDrinkIng = "";
                            let drinkNullString = "";
                            if (JSON.parse(localStorage.getItem(titleCase(drinkIngArray[j])) == 1)) { haveDrinkIng = ' class="haveIng"'; 
                            } else if (JSON.parse(localStorage.getItem(titleCase(drinkIngArray[j])) == -1)) { haveDrinkIng = ' class="badIng"'; };
                            if (!drinkMeasurements[j] === false) { drinkNullString = drinkMeasurements[j] + " "; };
                            $('#drinkIngredientsUL').append($(`<li` + haveDrinkIng + `></li>`).text(
                                drinkNullString + titleCase(drinkIngArray[j])
                            ));
                        };
        
                    } else if (type === "meal") {
                        // Displays the image and title for the meal.
                        $('#mealIngredientsUL').empty();
        
                        let mealDetails = response.meals[0];
                        $("#mealTitle").text(mealDetails.strMeal);
                        $("#mealImg").attr("src", mealDetails.strMealThumb);
                        $("#mealImg").attr("alt", mealDetails.strMeal);
                        $("#mealRecipe").text(mealDetails.strInstructions);
        
                        let mealIngArray = [];
                        let mealMeasurements = [];
        
                        let k = 0;
                        for (property in mealDetails) {
                            let c = `${property}`.match(regexIng);
        
                            if (c &&
                                `${mealDetails[property]}` &&
                                `${mealDetails[property]}` !== '' &&
                                `${mealDetails[property]}` !== 'null' &&
                                `${mealDetails[property]}` !== ' ') {
                                mealIngArray[k] = `${mealDetails[property]}`
                                k++
                            }
                        }
        
                        k = 0;
                        for (property in mealDetails) {
                            let d = `${property}`.match(regexMeas);
        
                            if (d &&
                                `${mealDetails[property]}` &&
                                `${mealDetails[property]}` !== '' &&
                                `${mealDetails[property]}` !== 'null') {
                                mealMeasurements[k] = `${mealDetails[property]}`
                                k++
                            }
                        }
        
                        for (let l = 0; l < mealIngArray.length; l++) {
                            let haveMealIng = "";
                            let mealNullString = "";
                            if (JSON.parse(localStorage.getItem(titleCase(mealIngArray[l])) == 1)) { haveMealIng = ' class="haveIng"';
                            } else if (JSON.parse(localStorage.getItem(titleCase(mealIngArray[l])) == -1)) { haveMealIng = ' class="badIng"'; };
                            if (!mealMeasurements[l] === false) { mealNullString = mealMeasurements[l] + " "; };
                            $('#mealIngredientsUL').append($(`<li` + haveMealIng + `></li>`).text(
                                mealNullString + titleCase(mealIngArray[l])
                            ));
                        };
                    };
                }).catch(function(error) {
                    if (type==="meal") {
                        $("#mealTitle").text("API Error. Try Again");
                        $("#mealImg").attr("src", "./images/unhappy-burger.jpg");
                        $("#mealImg").attr("alt", "API error");
                    } else if (type==="drink") {
                        $("#drinkTitle").text("API Error. Try Again");
                        $("#drinkImg").attr("src", "./images/unhappy-cocktail.jpg");
                        $("#drinkImg").attr("alt", "API Error");
                    }
                });
            }).catch(function(error) {
                if (type==="meal") {
                    $("#mealTitle").text("API Error. Try Again");
                    $("#mealImg").attr("src", "./images/unhappy-burger.jpg");
                    $("#mealImg").attr("alt", "API error");
                } else if (type==="drink") {
                    $("#drinkTitle").text("API Error. Try Again");
                    $("#drinkImg").attr("src", "./images/unhappy-cocktail.jpg");
                    $("#drinkImg").attr("alt", "API Error");
                }
            });
        }).catch(function(error) {
            if (type==="meal") {
                $("#mealTitle").text("API Error. Try Again");
                $("#mealImg").attr("src", "./images/unhappy-burger.jpg");
                $("#mealImg").attr("alt", "API error");
            } else if (type==="drink") {
                $("#drinkTitle").text("API Error. Try Again");
                $("#drinkImg").attr("src", "./images/unhappy-cocktail.jpg");
                $("#drinkImg").attr("alt", "API Error");
            }
        });
    };
    // END FUNCTION: Get Ingredient Promises

    // FUNCTION: Sets up the parameters for generating a new meal.
    function generateMeal() {
        let mealGoodList = { "items": [] };
        let mBadIngred = [];
        let mGoodIngred = [];
        let goodGenMeal = [];
        let badGenMeal = [];
        let goodCountsMeal = {};
        let badCountsMeal = {};
        let mealGreenButtons = $(".mealSelector.is-success");
        let mealRedButtons = $(".mealSelector.is-danger");
        for (let i = 0; i < mealGreenButtons.length; i++) {
            mGoodIngred[i] = $(mealGreenButtons[i]).text()
        }
        for (let i = 0; i < mealRedButtons.length; i++) {
            mBadIngred[i] = $(mealRedButtons[i]).text()
        }

        getIngredPromises(mGoodIngred, mBadIngred, "meal", goodGenMeal, badGenMeal, goodCountsMeal, badCountsMeal, mealGoodList, mealURL);
    }
    //END FUNCTION: Meal parameters

    // FUNCTION: Sets up the parameters for generating a new drink.
    function generateDrink() {
        let drinkGoodList = { "items": [] };
        let dBadIngred = [];
        let dGoodIngred = [];
        let goodGenDrink = [];
        let badGenDrink = [];
        let goodCountsDrink = {};
        let badCountsDrink = {};
        let drinkGreenButtons = $(".drinkSelector.is-success");
        let drinkRedButtons = $(".drinkSelector.is-danger");
        for (let i = 0; i < drinkGreenButtons.length; i++) {
            dGoodIngred[i] = $(drinkGreenButtons[i]).text()
        }
        for (let i = 0; i < drinkRedButtons.length; i++) {
            dBadIngred[i] = $(drinkRedButtons[i]).text()
        }

        getIngredPromises(dGoodIngred, dBadIngred, "drink", goodGenDrink, badGenDrink, goodCountsDrink, badCountsDrink, drinkGoodList, drinkURL);
    }
    /*END FUNCTION: Drink parameters*/

    // FUNCTION: Generate a pair.
    function generatePair() {
        generateMeal();
        generateDrink();
    }
    // END FUNCTION

    // FUNCTION Formats the ingredient buttons on click and stores the data to local storage.
    function ingredButtonFormatting(_this) {
        switch (parseInt($(_this).attr("data-state"))) {
            case 1:
                $(_this).attr("data-state", -1);
                $(_this).removeClass("is-success");
                $(_this).addClass("is-danger");
                break;
            case 0:
                $(_this).attr("data-state", 1);
                $(_this).addClass("is-success");
                break;
            case -1:
                $(_this).attr("data-state", 0);
                $(_this).removeClass("is-danger");
                break;
        }

        localStorage.setItem(titleCase($(_this).text()), $(_this).attr("data-state"));
    }
    // END FUNCTION

    // FUNCTION: Title Case
    function titleCase(str) {
        str = str.toLowerCase().split(' ');
        for (var i = 0; i < str.length; i++) {
            str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
        }
        return str.join(' ');
    }
    // END FUNCTION

    // On Click functionality for the "I'm feelin' lucky" button.
    $('#genButton').on('click', function (event) {
        event.preventDefault;
        generatePair();
    });

    // On Click functionality for the "Random Meal" button.
    $('#mealGenButton').on('click', function (event) {
        event.preventDefault;
        generateMeal();
    });

    // On Click functionality for the "Random Drink" button.
    $('#drinkGenButton').on('click', function (event) {
        event.preventDefault;
        generateDrink();
    });

    // On Click funcionality for the "Food I've got Lying around" button to open Modal window.
    $('#buttonMI').on('click', function (event) {
        event.preventDefault;
        $('#modalMI').addClass('is-active');
    });

    // On Click funcionality for the "Booze I've got Lying around" button to open Modal window.
    $('#buttonDI').on('click', function (event) {
        event.preventDefault;
        $('#modalDI').addClass('is-active');
    });

    // On Click funcionality for the close buttons in the modal windows.
    $('.saveButton').on('click', function (event) {
        event.preventDefault;
        $('.modal').removeClass("is-active");
        $('.searchBar').val("");
        $('.drinkSelector').show();
        $('.mealSelector').show();
    })

    /* This event will allow users to change ingredient status on the fly from the Ingredients Tabs, if we have time to get to it. */
    // $('#mealIngredientsUL').on('click', function (event) {
    //     event.preventDefault;
    //     let _this = event.target;
    //     let wIng = $(_this).text().split(" - ")
    //     let state = "";
    //     if (JSON.parse(localStorage.getItem(wIng[1])) !== null) { state = localStorage.getItem(wIng[1]) };

    //         // Changes CSS based on saved data state of this ingredient.
    //         switch (parseInt(state)) {
    //             case 1:
    //                 $(_this).attr("data-state", -1);
    //                 $(_this).removeClass("haveIng");
    //                 $(_this).addClass("badIng");
    //                 break;
    //             case 0:
    //                 $(_this).attr("data-state", 1);
    //                 $(_this).addClass("haveIng");
    //                 break;
    //             case -1:
    //                 $(_this).attr("data-state", 0);
    //                 $(_this).removeClass("badIng");
    //                 break;
    //         }
    // })

    // Input functionality for the Drink search bar.
    $('#drinkSearch').on('input', function (event) {
        $('.drinkSelector').hide();
        $('.drinkSelector:contains("' + titleCase($(this).val()) + '")').show()
    })

    // Input functionality for the Meal search bar.
    $('#mealSearch').on('input', function (event) {
        $('.mealSelector').hide();
        $('.mealSelector:contains("' + titleCase($(this).val()) + '")').show()
    })
});


