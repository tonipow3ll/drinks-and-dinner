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
                let store = 0;
                let classAdd = "";

                if(JSON.parse(localStorage.getItem(response.meals[i].strIngredient)) !== null) { store = localStorage.getItem(response.meals[i].strIngredient) };

                switch(parseInt(store)) {
                    case 1:
                        classAdd = " is-success"
                    break;
                    case -1:
                        classAdd = " is-danger"
                    break;
                }

                let rowTemp = '<button class="button mealSelector' + classAdd + '" data-state=' + store + '>' + response.meals[i].strIngredient + '</button>';
                $("#contentMI").append(rowTemp);
            };
        })
    };

    // get Ingredient Promises function
    function getIngredPromises(array, type, arrGen, counts, finalList, functionURL) {

        // Created an array of promises, each index being the response for one of the ingredients in the array.
        for (let i = 0; i < array.length; i++) {
            array[i] = $.get(functionURL + filterURL + array[i], ((response) => { return response }));
        };

        // Waits for all promises, then generates a list of IDs for the drinks that use the ingredients. Sorts the list by most ingredients found to least.
        Promise.all(array).then((response) => {

            // Loop to concat the arrays of IDs together.
            for (let i = 0; i < response.length; i++) {
                if (type === "drink") { arrGen = arrGen.concat(response[i].drinks.map(function (v) { return v.idDrink })) }
                else if (type === "meal") { arrGen = arrGen.concat(response[i].meals.map(function (v) { return v.idMeal })) }
                else return;
            }
            // forEach counts the number of times each ID appears in the list.
            arrGen.forEach(function (x) {
                counts[x] = (counts[x] || 0) + 1;
            })

            // Converts the resulting counts object into a more easily usable JSON object.
            Object.entries(counts).forEach(e => finalList["items"].push({ "id": e[0], "count": e[1] }))

            // Sorts the JSON object by count descending.
            finalList.items.sort(function (a, b) { return b.count - a.count });

            // // Top 10.
            // let top10 = [];
            // for (let i = 0; i < 10 || i < finalList.length; i++) { top10[i] = $.get(functionURL + lookUpURL + finalList.items[i].id, ((response) => { return response })) };
            // Promise.all(top10).then((response) => { console.log(response) });

            // console.log(top10)

            console.log(finalList);
            let drinkID = finalList.items[Math.floor(Math.random() * finalList.items.length)].id;
            if ( type === "drink") {
            $.get(functionURL + lookUpURL + drinkID, function(response) { 
                $("#drinkTitle").text(response.drinks[0].strDrink);
                $("#drinkImg").attr("src", response.drinks[0].strDrinkThumb); 
            }); } else if ( type === "meal") {
                $.get(functionURL + lookUpURL + drinkID, function(response) {
                    $("#mealTitle").text(response.meals[0].strMeal);
                    $("#mealImg").attr("src", response.meals[0].strMealThumb); 
            })}

        })
    };

    $('#ryansButton').on('click', function (event) {
        event.preventDefault;

        // let drinkFinalList = { "items": [] };
        // let arrGenDrink = [];
        // let countsDrink = {};
        // let drinkSelection = $('#drinks').val();
        // let drinkIngredients = [drinkSelection];

        // getIngredPromises(drinkIngredients, "drink", arrGenDrink, countsDrink, drinkFinalList, drinkURL);

        let mealFinalList = { "items": [] };
        let mIng2Pass = [];
        let arrGenMeal = [];
        let countsMeal = {};
        let mealGreenButtons = $(".mealSelector.is-success");
        for(i = 0; i < mealGreenButtons.length; i++) {
            mIng2Pass[i] = $(mealGreenButtons[i]).text()
        }
        console.log(mIng2Pass);
        
        getIngredPromises(mIng2Pass, "meal", arrGenMeal, countsMeal, mealFinalList, mealURL);

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


})