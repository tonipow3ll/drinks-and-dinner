$(document).ready(function () {

    // API Constants
    const drinkAPIkey = "1";
    const mealAPIkey = "1";
    const drinkURL = "https://www.thecocktaildb.com/api/json/v1/" + drinkAPIkey + "/";
    const mealURL = "https://www.themealdb.com/api/json/v1/" + mealAPIkey + "/";
    const filterURL = "filter.php?i=";
    const lookUpURL = "lookup.php?i=";
    const searchURL = "search.php?s=";

    init();

    function init() {

        Promise.resolve(mealIngredients).then(function(response) {
            response.meals.sort(function (a, b) {
                return a.strIngredient.localeCompare(b.strIngredient);
            });

            for(let i =0; i < response.meals.length; i++) {
                let storeMeal = 0;
                let classAdd = "";

                if(JSON.parse(localStorage.getItem(response.meals[i].strIngredient)) !== null) { storeMeal = localStorage.getItem(response.meals[i].strIngredient) };

                switch(parseInt(storeMeal)) {
                    case 1:
                        classAdd = " is-success"
                    break;
                    case -1:
                        classAdd = " is-danger"
                    break;
                }

                let rowTemp = '<button class="button mealSelector' + classAdd + '" data-state=' + storeMeal + '>' + response.meals[i].strIngredient + '</button>';
                $("#contentMI").append(rowTemp);
            };

            generatePair();
        })

        Promise.resolve(drinkIngredients).then(function(response) {
            response.drinks.sort(function (a, b) {

                return a.strIngredient1.localeCompare(b.strIngredient1);
            });

            for(let i =0; i < response.drinks.length; i++) {
                let storeDrink = 0;
                let classAdd = "";

                if(JSON.parse(localStorage.getItem(response.drinks[i].strIngredient1)) !== null) { storeDrink = localStorage.getItem(response.drinks[i].strIngredient1) };

                switch(parseInt(storeDrink)) {
                    case 1:
                        classAdd = " is-success"
                    break;
                    case -1:
                        classAdd = " is-danger"
                    break;
                }

                let rowTemp = '<button class="button drinkSelector' + classAdd + '" data-state=' + storeDrink + '>' + response.drinks[i].strIngredient1 + '</button>';
                $("#contentDI").append(rowTemp);
            };
        }).then(generatePair())

    };

    // get Ingredient Promises function
    function getIngredPromises(array, badArray, type, arrGen, badGen, goodCounts, badCounts, goodList, functionURL) {

        // Created an array of promises, each index being the response for one of the ingredients in the array.
        for (let i = 0; i < array.length; i++) {
            array[i] = $.get(functionURL + filterURL + array[i], ((response) => { return response }));
        };

        for (let i = 0; i < badArray.length; i++) {
            badArray[i] = $.get(functionURL + filterURL + badArray[i], ((response) => { return response }));
        };

        // Waits for all promises, then generates a list of IDs for the drinks that use the ingredients. Sorts the list by most ingredients found to least.
        Promise.all(array).then((response) => {

            // Loop to concat the arrays of IDs together.
            for (let i = 0; i < response.length; i++) {
                if (type === "drink" && response[i].drinks !== null) { arrGen = arrGen.concat(response[i].drinks.map(function (v) { return v.idDrink })) }
                else if (type === "meal" && response[i].meals !== null) { arrGen = arrGen.concat(response[i].meals.map(function (v) { return v.idMeal })) }
            }

            Promise.all(badArray).then((response) => {
            // Loop to concat the arrays of IDs together.
                for (let i = 0; i < response.length; i++) {
                    if (type === "drink" && response[i].drinks !== null) { badGen = badGen.concat(response[i].drinks.map(function (v) { return v.idDrink })) }
                    else if (type === "meal" && response[i].meals !== null) { badGen = badGen.concat(response[i].meals.map(function (v) { return v.idMeal })) }
                }

                // forEach counts the number of times each ID appears in the list.
                arrGen.forEach(function (x) {
                    goodCounts[x] = (goodCounts[x] || 0) + 1;
                })

                badGen.forEach(function (x) {
                    badCounts[x] = (badCounts[x] || 0) + 1;
                })

            // Converts the resulting counts object into a more easily usable JSON object.
                Object.entries(goodCounts).forEach(function(e) {
                    if( !badCounts[e[0]] === false )
                        { 
                            goodCounts[e[0]].delete;
                        }
                })

                Object.entries(goodCounts).forEach(e => goodList["items"].push({ "id": e[0], "count": e[1] }))

                goodList.items.sort(function (a, b) { return b.count - a.count });

                // Top 30.
                let top30 = [];

                for (let i = 0; i < 30 || i < goodList.length; i++) { top30[i] = $.get(functionURL + lookUpURL + goodList.items[i].id, ((response) => { return response })) };
                Promise.all(top30).then((response) => {
                    console.log(response)
                    let itemID = Math.floor(Math.random() * top30.length);
                    if ( type === "drink") {
                            $("#drinkTitle").text(response[itemID].drinks[0].strDrink);
                            $("#drinkImg").attr("src", response[itemID].drinks[0].strDrinkThumb);
                            $("#drinkIngredients").empty();
                            let liTemp = ""

                            for(let i = 1; i <+ 20; i++){
                                if (!response[itemID].drinks[0]["strIngredient" + i] === false) {
                                    if (JSON.parse(localStorage.getItem(response[itemID].drinks[0]["strIngredient" + i]) == 1)) {
                                        liTemp = '<li class="haveIng">' + response[itemID].drinks[0]["strMeasure" + i] + ' - ' + response[itemID].drinks[0]["strIngredient" + i] + '</li>';
                                    } else { 
                                        liTemp = '<li>' + response[itemID].drinks[0]["strMeasure" + i] + ' - ' + response[itemID].drinks[0]["strIngredient" + i] + '</li>'
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
                                    if (JSON.parse(localStorage.getItem(response[itemID].meals[0]["strIngredient" + i]) == 1)) {
                                        liTemp = '<li class="haveIng">' + response[itemID].meals[0]["strMeasure" + i] + ' - ' + response[itemID].meals[0]["strIngredient" + i] + '</li>';
                                    } else { 
                                        liTemp = '<li>' + response[itemID].meals[0]["strMeasure" + i] + ' - ' + response[itemID].meals[0]["strIngredient" + i] + '</li>'
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

            $('.mealSelector').on('click', function (event) {
                event.preventDefault;
                let _this = this;

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

                localStorage.setItem($(_this).text(), $(_this).attr("data-state"));
            });
        });
    

    $('#buttonDI').on('click', function (event) {
        event.preventDefault;
        $('#modalDI').addClass('is-active');

            $('.drinkSelector').on('click', function (event) {
                event.preventDefault;
                let _this = this;

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

                localStorage.setItem($(_this).text(), $(_this).attr("data-state"));
            });
        });

        $('.saveButton').on('click', function (event) {
            $('.modal').removeClass("is-active");

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

    function compareJSON () {

    }
})