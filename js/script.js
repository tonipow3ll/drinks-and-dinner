$(document).ready(function () {

    // API Constants
    const drinkAPIkey = "1";
    const mealAPIkey = "1";
    const drinkURL = "https://www.thecocktaildb.com/api/json/v1/" + drinkAPIkey + "/";
    const mealURL = "https://www.themealdb.com/api/json/v1/" + mealAPIkey + "/";
    const filterURL = "filter.php?i=";
    const lookUpURL = "lookup.php?i=";
    const searchURL = "search.php?s=";

    // Initialize Function
    init();

    // FUNCTION: Initialize. Generate ingredient buttons and establish on click for said buttons. Generate a meal and drink based on previously saved data.
    function init() {

        // API get meal ingredients and sort alphabetically
        Promise.resolve(mealIngredients).then(function(response) {
            response.meals.sort(function (a, b) {
                return a.strIngredient.localeCompare(b.strIngredient);
            });

            // Meal ingredient button generation loop.
            for(let i =0; i < response.meals.length; i++) {

                // Default variables.
                let storeMeal = 0;
                let classAdd = "";

                // Checks to see if this ingredient has a stored data state. If it does, get the data state.
                if(JSON.parse(localStorage.getItem(titleCase(response.meals[i].strIngredient))) !== null) { storeMeal = localStorage.getItem(titleCase(response.meals[i].strIngredient)) };

                // Changes CSS based on saved data state of this ingredient.
                switch(parseInt(storeMeal)) {
                    case 1:
                        classAdd = " is-success"
                    break;
                    case -1:
                        classAdd = " is-danger"
                    break;
                }

                // Append buttons into the modal windows for this ingredient.
                let rowTemp = '<button class="button mealSelector' + classAdd + '" data-state=' + storeMeal + '>' + titleCase(response.meals[i].strIngredient) + '</button>';

                // Append Button
                $("#contentMI").append(rowTemp);
            };

            // On Click function for meal ingredient buttons.
            $('.mealSelector').on('click', function (event) {
                event.preventDefault;
                let _this = this;

                // Switch Data State and CSS on click.
                switch(parseInt($(_this).attr("data-state"))) {
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
                };

                // Store data state every time an ingredient button is clicked.
                localStorage.setItem(titleCase($(_this).text()), $(_this).attr("data-state"));
            });
        });

        // API get drink ingredients and sort alphabetically
        Promise.resolve(drinkIngredients).then(function(response) {
            response.drinks.sort(function (a, b) {
                return a.strIngredient1.localeCompare(b.strIngredient1);
            });

            // Drink ingredient button generation loop.
            for(let i =0; i < response.drinks.length; i++) {

                // Default Variables
                let storeDrink = 0;
                let classAdd = "";

                // Checks to see if this ingredient has a stored data state. If it does, get the data state.
                if(JSON.parse(localStorage.getItem(titleCase(response.drinks[i].strIngredient1))) !== null) { storeDrink = localStorage.getItem(titleCase(response.drinks[i].strIngredient1)) };

                // Changes CSS based on saved data state of this ingredient.
                switch(parseInt(storeDrink)) {
                    case 1:
                        classAdd = " is-success"
                    break;
                    case -1:
                        classAdd = " is-danger"
                    break;
                }

                // Changes CSS based on saved data state of this ingredient.
                let rowTemp = '<button class="button drinkSelector' + classAdd + '" data-state=' + storeDrink + '>' + titleCase(response.drinks[i].strIngredient1) + '</button>';

                // Append Button
                $("#contentDI").append(rowTemp);
            };

            // On Click function for drink ingredient buttons.
            $('.drinkSelector').on('click', function (event) {
                event.preventDefault;
                let _this = this;

                // Switch Data State and CSS on click.
                switch(parseInt($(_this).attr("data-state"))) {
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

                // Store data state every time an ingredient button is clicked.
                localStorage.setItem(titleCase($(_this).text()), $(_this).attr("data-state"));
            });
        });

        // Generate first meal and drink pair on website open.
        Promise.all([mealIngredients, drinkIngredients]).then((response) => { generatePair() })

    };

    // get Ingredient Promises function
    function getIngredPromises(array, badArray, type, arrGen, badGen, goodCounts, badCounts, goodList, functionURL) {

        // Create an array of promises, each index being the response for one of the GREEN ingredients in the array.
        for (let i = 0; i < array.length; i++) {
            array[i] = $.get(functionURL + filterURL + array[i], ((response) => { return response }));
        };

        // Create an array of promises, each index being the response for one of the RED ingredients in the array.
        for (let i = 0; i < badArray.length; i++) {
            badArray[i] = $.get(functionURL + filterURL + badArray[i], ((response) => { return response }));
        };

        // Waits for all GREEN promises, then generates a list of IDs for the drinks/meals that use the ingredients. Sorts the list by most ingredients found to least.
        Promise.all(array).then((response) => {

            // Loop to concat the arrays of the GREEN IDs together.
            for (let i = 0; i < response.length; i++) {
                if (type === "drink" && response[i].drinks !== null) { arrGen = arrGen.concat(response[i].drinks.map(function (v) { return v.idDrink })) }
                else if (type === "meal" && response[i].meals !== null) { arrGen = arrGen.concat(response[i].meals.map(function (v) { return v.idMeal })) }
            }

            Promise.all(badArray).then((response) => {
            // Loop to concat the arrays of the RED IDs together.
                for (let i = 0; i < response.length; i++) {
                    if (type === "drink" && response[i].drinks !== null) { badGen = badGen.concat(response[i].drinks.map(function (v) { return v.idDrink })) }
                    else if (type === "meal" && response[i].meals !== null) { badGen = badGen.concat(response[i].meals.map(function (v) { return v.idMeal })) }
                }

                // Counts the number of times each ID appears in the GREEN list.
                arrGen.forEach(function (x) {
                    goodCounts[x] = (goodCounts[x] || 0) + 1;
                })

                // Counts the number of times each ID appears in the RED list.
                badGen.forEach(function (x) {
                    badCounts[x] = (badCounts[x] || 0) + 1;
                })

                // If an id exists in the RED object, remove it from the GREEN object.
                Object.entries(goodCounts).forEach(function(e) {
                    if( !badCounts[e[0]] === false )
                        { 
                            goodCounts[e[0]].delete;
                        }
                })

                // Turn the remaining GREEN IDs into a JSON object.
                Object.entries(goodCounts).forEach(e => goodList["items"].push({ "id": e[0], "count": e[1] }))

                // Sorts the JSON object descending by the number of GREEN ingredients in it.
                goodList.items.sort(function (a, b) { return b.count - a.count });

                // Top 30 empty array.
                let top30 = [];

                // Selects the top 30 IDs from the sorted list of GREEN ingredients and calls the API for them.
                for (let i = 0; i < 30 || i < goodList.length; i++) { top30[i] = $.get(functionURL + lookUpURL + goodList.items[i].id, ((response) => { return response })) };

                // When all promises returned, get a random entry to display.
                Promise.all(top30).then((response) => {
                    let itemID = Math.floor(Math.random() * top30.length);
                    if ( type === "drink") {
                            $("#drinkTitle").text(response[itemID].drinks[0].strDrink);
                            $("#drinkImg").attr("src", response[itemID].drinks[0].strDrinkThumb);
                            $("#drinkIngredients").empty();
                            let liTemp = ""

                            // Generate Recipe List, turn GREEN ingredients, well, green.
                            for(let i = 1; i <+ 20; i++){
                                if (!response[itemID].drinks[0]["strIngredient" + i] === false) {
                                    if (JSON.parse(localStorage.getItem(titleCase(response[itemID].drinks[0]["strIngredient" + i])) == 1)) {
                                        liTemp = '<li class="haveIng">' + response[itemID].drinks[0]["strMeasure" + i] + ' - ' + titleCase(response[itemID].drinks[0]["strIngredient" + i]) + '</li>';
                                    } else { 
                                        liTemp = '<li>' + response[itemID].drinks[0]["strMeasure" + i] + ' - ' + titleCase(response[itemID].drinks[0]["strIngredient" + i]) + '</li>'
                                    };
                                    $("#drinkIngredients").append(liTemp);
                                }
                            }

                        } else if ( type === "meal") {
                            $("#mealTitle").text(response[itemID].meals[0].strMeal);
                            $("#mealImg").attr("src", response[itemID].meals[0].strMealThumb);
                            $("#mealIngredients").empty();

                            for(let i = 1; i <+ 20; i++){
                                if (!response[itemID].meals[0]["strIngredient" + i] === false) {
                                    if (JSON.parse(localStorage.getItem(titleCase(response[itemID].meals[0]["strIngredient" + i])) == 1)) {
                                        liTemp = '<li class="haveIng">' + response[itemID].meals[0]["strMeasure" + i] + ' - ' + titleCase(response[itemID].meals[0]["strIngredient" + i]) + '</li>';
                                    } else { 
                                        liTemp = '<li>' + response[itemID].meals[0]["strMeasure" + i] + ' - ' + titleCase(response[itemID].meals[0]["strIngredient" + i]) + '</li>'
                                    };
                                    $("#mealIngredients").append(liTemp);
                                }
                            } 
                        }

                });
            })
        })
    };

    $('#genButton').on('click', function (event) {
        event.preventDefault;
        generatePair();
    });

    $('#buttonMI').on('click', function (event) {
        event.preventDefault;
        $('#modalMI').addClass('is-active');
    });
    
    $('#buttonDI').on('click', function (event) {
        event.preventDefault;
        $('#modalDI').addClass('is-active');
    });

    $('.saveButton').on('click', function (event) {
        event.preventDefault;
        $('.modal').removeClass("is-active");
        $('.searchBar').val("");
        $('.drinkSelector').show();
        $('.mealSelector').show();
    })

    $('#drinkSearch').on('input', function (event) {
        $('.drinkSelector').hide();
        $('.drinkSelector:contains("' + $(this).val() + '")').show()
    })

    $('#mealSearch').on('input', function (event) {
        $('.mealSelector').hide();
        $('.mealSelector:contains("' + $(this).val() + '")').show()
    })

    function generatePair() {
        let drinkGoodList = { "items": [] };
        let dBadIngred = [];
        let dIng2Pass = [];
        let arrGenDrink = [];
        let badGenDrink = [];
        let goodCountsDrink = {};
        let badCountsDrink = {};
        let drinkGreenButtons = $(".drinkSelector.is-success");
        let drinkRedButtons = $(".drinkSelector.is-danger");
        for(let i = 0; i < drinkGreenButtons.length; i++) {
            dIng2Pass[i] = $(drinkGreenButtons[i]).text()
        }
        for(let i = 0; i < drinkRedButtons.length; i++) {
            dBadIngred[i] = $(drinkRedButtons[i]).text()
        }

        getIngredPromises(dIng2Pass, dBadIngred, "drink", arrGenDrink, badGenDrink, goodCountsDrink, badCountsDrink, drinkGoodList, drinkURL);

        let mealGoodList = { "items": [] };
        let mBadIngred = [];
        let mIng2Pass = [];
        let arrGenMeal = [];
        let badGenMeal = [];
        let goodCountsMeal = {};
        let badCountsMeal = {};
        let mealGreenButtons = $(".mealSelector.is-success");
        let mealRedButtons = $(".mealSelector.is-danger");
        for(let i = 0; i < mealGreenButtons.length; i++) {
            mIng2Pass[i] = $(mealGreenButtons[i]).text()
        }
        for(let i = 0; i < mealRedButtons.length; i++) {
            mBadIngred[i] = $(mealRedButtons[i]).text()
        }
        
        getIngredPromises(mIng2Pass, mBadIngred, "meal", arrGenMeal, badGenMeal, goodCountsMeal, badCountsMeal, mealGoodList, mealURL);

    }

    function titleCase(str) {
        str = str.toLowerCase().split(' ');
        for (var i = 0; i < str.length; i++) {
          str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
        }
        return str.join(' ');
    }
})