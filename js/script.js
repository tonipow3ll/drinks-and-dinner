$(document).ready(function () {

    // API Constants
    const drinkAPIkey = "1";
    const mealAPIkey = "1";
    const drinkURL = "https://www.thecocktaildb.com/api/json/v1/" + drinkAPIkey + "/";
    const mealURL = "https://www.themealdb.com/api/json/v1/" + mealAPIkey + "/";
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
                }

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
        Promise.all([mealIngredients, drinkIngredients]).then((response) => { generatePair() })
    };

    /* 
    FUNCTION: Generates a meal or drink based on parameter inputs including user selected 'Good' (GREEN modal buttons) ingredients, and user selected 'Bad' ingredients (RED modal buttons). If there is no stored button data, generates a truly random meal. If there are only RED buttons, generates a truly random meal but excludes recipes with those ingredients. If GREEN buttons exist, finds all recipes with any of those ingredients in them and sorts the meals by most ingredients present to least. Currently, the program selects a random meal from the Top 30 in this list. If there are less than 30 meals, it selects a random meal from the whole list. Recipes with RED button ingredients are still excluded in this case.
    */
    function getIngredPromises(array, badArray, type, arrGen, badGen, goodCounts, badCounts, goodList, functionURL) {

        // Create an array of promises, each index being the response for one of the GREEN ingredients in the array. If no GREEN ingredients exist, calls one completely random recipe from the API.
        if (array.length === 0) {
            array[0] = $.get(functionURL + randomURL, ((response) => {  return response }));
        } else {    
            for (let i = 0; i < array.length; i++) {
                array[i] = $.get(functionURL + filterURL + array[i], ((response) => { return response }));
            }
        }

        // Create an array of promises, each index being the response for one of the RED ingredients in the array.
        for (let i = 0; i < badArray.length; i++) {
            badArray[i] = $.get(functionURL + filterURL + badArray[i], ((response) => { return response }));
        };

        // Waits for all GREEN promises (or 1 RANDOM promise), then generates a list of IDs for the drinks/meals that use the ingredients. Sorts the list by most ingredients found to least.

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
                Object.entries(goodCounts).forEach(function (e) {
                    if (!badCounts[e[0]] === false) {
                        goodCounts[e[0]].delete;
                    }
                })

                // If no recipes remain after removing RED ingredient recipes from GREEN ingredient recipes, removes all GREEN ingredients from the GREEN ingredient array and reruns the function to generate a completely random meal with no RED ingredients.
                if(!goodCounts) {
                    array = [];
                    getIngredPromises(array, badArray, type, arrGen, badGen, goodCounts, badCounts, goodList, functionURL);
                    return false;
                }

                // Turn the remaining GREEN IDs into a JSON object.
                Object.entries(goodCounts).forEach(e => goodList["items"].push({ "id": e[0], "count": e[1] }))

                // Sorts the JSON object descending by the number of GREEN ingredients in it.
                goodList.items.sort(function (a, b) { return b.count - a.count });

                // Top 30 empty array.
                let top30 = [];

                // Selects the top 30 IDs from the sorted list of GREEN ingredients and calls the API for them. If the list is less than 30 elements long, returns entire list.
                for (let i = 0; (i < 30) && (i < goodList.items.length) ; i++) {
                    top30[i] = $.get(functionURL + lookUpURL + goodList.items[i].id, ((response) => { return response }))
                };

                // When all promises returned, get a random entry to display.
                Promise.all(top30).then((response) => {
                    let itemID = Math.floor(Math.random() * top30.length);
                    if (type === "drink") {
                        // Displays the image and title for the drink.
                        $("#drinkTitle").text(response[itemID].drinks[0].strDrink);
                        $("#drinkImg").attr("src", response[itemID].drinks[0].strDrinkThumb);
                        
                        let drinkDetails = response[itemID].drinks[0];
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
                            let haveDrinkIng = ''
                            if (JSON.parse(localStorage.getItem(titleCase(drinkIngArray[j])) == 1)) { haveDrinkIng = ' class="haveIng"' }
                            $('#drinkIngredientsUL').append($(`<li` + haveDrinkIng + `></li>`).text(
                                drinkMeasurements[j] + ' ' + titleCase(drinkIngArray[j])
                            ));
                        }
                        
                    } else if (type === "meal") {
                        // Displays the image and title for the meal.
                        $("#mealTitle").text(response[itemID].meals[0].strMeal);
                        $("#mealImg").attr("src", response[itemID].meals[0].strMealThumb);

                        let mealDetails = response[itemID].meals[0];
                        let mealIngArray= [];
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
                            let haveMealIng = '';
                            if (JSON.parse(localStorage.getItem(titleCase(mealIngArray[l])) == 1)) { haveMealIng = ' class="haveIng"' }
                            $('#mealIngredientsUL').append($(`<li` + haveMealIng + `></li>`).text(
                                mealMeasurements[l] + ' ' + titleCase(mealIngArray[l])
                            ));
                        }
                    }
                });
            })
        })
    };

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

    // Input functionality for the Drink search bar.
    $('#drinkSearch').on('input', function (event) {
        $('.drinkSelector').hide();
        $('.drinkSelector:contains("' + $(this).val() + '")').show()
    })

    // Input functionality for the Meal search bar.
    $('#mealSearch').on('input', function (event) {
        $('.mealSelector').hide();
        $('.mealSelector:contains("' + $(this).val() + '")').show()
    })

    // Function that sets up the parameters for generating a new meal.
    function generateMeal() {
        let mealGoodList = { "items": [] };
        let mBadIngred = [];
        let mGoodIngred = [];
        let arrGenMeal = [];
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

        $('#mealIngredientsUL').empty();

        getIngredPromises(mGoodIngred, mBadIngred, "meal", arrGenMeal, badGenMeal, goodCountsMeal, badCountsMeal, mealGoodList, mealURL);
    }

    // Function that sets up the parameters for generating a new drink.
    function generateDrink() {
        let drinkGoodList = { "items": [] };
        let dBadIngred = [];
        let dGoodIngred = [];
        let arrGenDrink = [];
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

        $('#drinkIngredientsUL').empty();

        getIngredPromises(dGoodIngred, dBadIngred, "drink", arrGenDrink, badGenDrink, goodCountsDrink, badCountsDrink, drinkGoodList, drinkURL);
    }

    // Function to generate a pair.
    function generatePair() {
        generateMeal();
        generateDrink();
    }

    // Function that formats the ingredient buttons on click and stores the data to local storage.
    function ingredButtonFormatting(_this) {
        // Switch Data State and CSS on click.
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

    // Returns a string to Title Case.
    function titleCase(str) {
        str = str.toLowerCase().split(' ');
        for (var i = 0; i < str.length; i++) {
            str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
        }
        return str.join(' ');
    }


    // JON JAVA
    // jquery for tabs functionality - will need to have this populate with some form of 'data', recipes/ingredients?
    $("#ingredients").on('mouseover', function () {
        $("#ingredients").addClass("is-active")
    })

    $("#ingredients").on('mouseleave', function () {
        $("#ingredients").removeClass("is-active")
    })

    $("#recipes").on('mouseover', function () {
        $("#recipes").addClass("is-active")
    })

    $("#recipes").on('mouseleave', function () {
        $("#recipes").removeClass("is-active")
    })

    // $('#tabs li').on('click', function () {
    //     var tab = $(this).data('tab');

    //     $('#tabs li').removeClass('is-active');
    //     $(this).addClass('is-active');

    //     $('#tab-content p').removeClass('is-active');
    //     $('p[data-content="' + tab + '"]').addClass('is-active');
    // });

// // START JON JS!!!!
//

//     // When div holding Recipe | Ingredients | Drink Mixes | Steps is clicked
//     // If the paragraph with .pre-p is currently active, show pre tag; else hide the pre tag.
//     $('#tabs').on('click', function() {
//         if ($('.pre-p').hasClass('is-active')) {
//             $('pre').each(function()
//             {
//                 this.style.display = 'block';
//             })
//         } else {
//             $('pre').each(function()
//             {
//                 this.style.display = 'none';
//             })
//         }
//     })

//     // When Submit button on front end is clicked:
//     // $('#getMealBtn').on('click', function (event) {
//     $('#genButton').on('click', function (event) {
//     // Prevent normal page refresh associated with submit buttons from occurring
//         event.preventDefault();
//         // Empty the ingredients paragraph every time to remove the UL and corresponding list items.
//         // Each time user clicks, the AJAX returns, and below code makes a new UL and adds list items.
//         $("[data-content=1]").empty();
//         // Get the value of the dropdown at time of submission
//         // NOTE: <select> is comprised of <option values=""> -- the selected option === <select> value!!!
//         // let selection = $('#meals').val();
//         let selection = 'chicken';
//         // Console logs 'beef' to help explain what information is being acquired here
//         // console.log('Selected meal category: ' + selection);
//         // Calls below function that randomizes array item from user-selected meal key
//         getMealID(mealCategories[selection]);
//         if ($('.pre-p').hasClass('is-active')) {
//             $('pre').each(function()
//             {
//                 this.style.display = 'block';
//             })
//         } else {
//             $('pre').each(function()
//             {
//                 this.style.display = 'none';
//             })
//         }
//     });

//     // Function takes 1 argument = user-selected meal, which equates to one of the above keys in the object
//     function getMealID(meal) {
//         // Random number between 0-1, in float/decimal form
//         let rand = Math.random();
//         // Meal Array length -- for example, vegan.length = 3
//         let totalMeals = meal.length;
//         // Floor turns 2.93 into 2, 0.93 into 0, etc.
//         // For example, 0.78 * 34 = 26.52 -- Floor makes this 26.
//         let randIndex = Math.floor(rand * totalMeals);
//         // Random meal equates to something along the lines of: beef[26]...
//         // ...Which might be something like '52824'
//         let randomMeal = meal[randIndex];
//         // Ready to serve https://www.themealdb.com/api/json/v1/1/lookup.php?i=52824 into the API
//         let queryURL = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + randomMeal;

//         // Sends request to server to retrieve randomMeal object that contains full details of a Meal
//         // NOTE: full details includes items such as Meal Name, Image, Ingredients, Measures, Instructions...
//         $.get(queryURL, function (fullDeets) {
//             // Console log returned object -- this section will change if Ryan's idea is applied here.
//             console.log(fullDeets);
//             let details = fullDeets.meals[0];
//             // Traverse the object and fill in HTML text, save for the image/a which are hrefs.
//             $("#strMeal").text(details.strMeal);
//             $("#strMealThumb").attr('src', details.strMealThumb);
//             $("#strTags").text(details.strTags);
//             $("#strYoutube").attr('href', details.strYoutube);
//             // <pre> represents preformatted text which is to be presented exactly as written.
//             $("pre").text(details.strInstructions);
//             // $("[data-content=1]").text(details.strInstructions);
//             // Add an empty unordered list to the ingredients paragraph, where items will be listed.
//             let ingredientsUL = $(`<ul></ul>`).attr('id', 'ingredientsUL')
//             $("[data-content=1]").append(ingredientsUL);

            // Regular expressions start with an open / signifying the start
            // \b indicates the word we are looking for, in this case strIngredient then strMeasure
            // Regular expressions end with a close / signifying both end and start of expression flags
            // g is a global search -- retain the index of the last match, allowing iterative searches

//             }
//         });
//     }
});


