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
        Promise.resolve(mealIngredients).then(function (response) {
            response.meals.sort(function (a, b) {
                return a.strIngredient.localeCompare(b.strIngredient);
            });

            // Meal ingredient button generation loop.
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

                // Append buttons into the modal windows for this ingredient.
                let rowTemp = '<button class="button mealSelector' + classAdd + '" data-state=' + storeMeal + '>' + titleCase(response.meals[i].strIngredient) + '</button>';

                // Append Button
                $("#contentMI").append(rowTemp);
            };

            // On Click function for meal ingredient buttons.
            $('.mealSelector').on('click', function (event) {
                event.preventDefault;
                ingredButtonFormatting(this);
            });
        });

        // API get drink ingredients and sort alphabetically
        Promise.resolve(drinkIngredients).then(function (response) {
            response.drinks.sort(function (a, b) {
                return a.strIngredient1.localeCompare(b.strIngredient1);
            });

            // Drink ingredient button generation loop.
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

                // Changes CSS based on saved data state of this ingredient.
                let rowTemp = '<button class="button drinkSelector' + classAdd + '" data-state=' + storeDrink + '>' + titleCase(response.drinks[i].strIngredient1) + '</button>';

                // Append Button
                $("#contentDI").append(rowTemp);
            };

            // On Click function for drink ingredient buttons.
            $('.drinkSelector').on('click', function (event) {
                event.preventDefault;
                ingredButtonFormatting(this);

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
                Object.entries(goodCounts).forEach(function (e) {
                    if (!badCounts[e[0]] === false) {
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
                for (let i = 0; (i < 30) && (i < goodList.items.length) ; i++) {
                    top30[i] = $.get(functionURL + lookUpURL + goodList.items[i].id, ((response) => { return response }))
                };


                // When all promises returned, get a random entry to display.
                Promise.all(top30).then((response) => {
                    let itemID = Math.floor(Math.random() * top30.length);
                    if (type === "drink") {
                        $("#drinkTitle").text(response[itemID].drinks[0].strDrink);
                        $("#drinkImg").attr("src", response[itemID].drinks[0].strDrinkThumb);
                        $("#drinkIngredients").empty();
                        let liTemp = ""

                        // Generate Recipe List, turn GREEN ingredients, well, green.
                        for (let i = 1; i < 20; i++) {
                            if (!response[itemID].drinks[0]["strIngredient" + i] === false) {
                                if (JSON.parse(localStorage.getItem(titleCase(response[itemID].drinks[0]["strIngredient" + i])) == 1)) {
                                    liTemp = '<li class="haveIng">' + response[itemID].drinks[0]["strMeasure" + i] + ' - ' + titleCase(response[itemID].drinks[0]["strIngredient" + i]) + '</li>';
                                } else {
                                    liTemp = '<li>' + response[itemID].drinks[0]["strMeasure" + i] + ' - ' + titleCase(response[itemID].drinks[0]["strIngredient" + i]) + '</li>'
                                };
                                $("#drinkIngredients").append(liTemp);
                            }
                        }

                    } else if (type === "meal") {
                        $("#mealTitle").text(response[itemID].meals[0].strMeal);
                        $("#mealImg").attr("src", response[itemID].meals[0].strMealThumb);
                        $("#mealIngredients").empty();

                        for (let i = 1; i < + 20; i++) {
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

        getIngredPromises(dGoodIngred, dBadIngred, "drink", arrGenDrink, badGenDrink, goodCountsDrink, badCountsDrink, drinkGoodList, drinkURL);

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

        getIngredPromises(mGoodIngred, mBadIngred, "meal", arrGenMeal, badGenMeal, goodCountsMeal, badCountsMeal, mealGoodList, mealURL);

    }

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

    function titleCase(str) {
        str = str.toLowerCase().split(' ');
        for (var i = 0; i < str.length; i++) {
            str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
        }
        return str.join(' ');
    }


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
// ​
// // mealCategories is an object
// // Each key is a meal category
// // Each value is an array of meals, represented in the API by an ID
// // Any ID is the meat (pun intended) of the API call -- it's what becomes randomMeal in the queryURL!!!
// // How, say, mealCategories["beef"] is called from HTML will be explained in comments below this object
// // NOTE: Normally, mealCategories["beef"] would be the syntax. However, the HTML value (beef) is a string!
// let mealCategories = {
//     beef: ["52874", "52878", "52997", "52904", "52812", "52873", "52952", "52834", "52824", "52803", "53013", "52979", "52826", "52998", "53031", "53021", "52781", "52938", "52947", "52827", "52876", "52927", "53006", "53029", "52943", "53017", "52930", "52941", "52992", "52770", "52881", "52935", "52950", "53000"],
//     breakfast: ["52965", "52895", "52957", "52896", "52967", "52962", "52964"],
//     chicken: ["52940", "53016", "52846", "52796", "52934", "52956", "52850", "52765", "52818", "52875", "52795", "52831", "52920", "52879", "53011", "52832", "52830", "52996", "52951", "52993", "52937", "52820", "52813", "52945", "52851", "52774", "52780", "52933", "53020", "53028", "52806", "52772", "52814"],
//     dessert: ["52893", "52768", "52767", "52855", "52894", "52928", "52891", "52792", "52961", "52923", "52897", "52976", "52898", "52910", "52856", "52853", "52966", "52776", "52860", "52905", "52990", "52788", "52989", "52988", "52899", "52888", "52791", "53007", "52787", "52890", "52859", "53015", "52900", "52991", "52924", "52858", "52854", "52902", "52862", "52861", "52958", "52916", "53022", "52932", "52857", '52901', '52786', '53024', '52833', '52886', '52883', '52793', '53005', '52931', '52889', '52909', '52929', '52892', '52970', '52917'],
//     goat: ["52968"],
//     lamb: ["52769", "52974", "53009", "52877", "52805", "52808", "52843", "52782", "53010", "52884", "52880", "52783", "53008", "52972"],
//     miscellaneous: ["52848", "52939", "52969", "52907", "52815", "52915", "52810", "53014", "52804", "52912", "52845"],
//     pasta: ["52839", "52835", "52829", "52987", "52844", "52837", "52982", "52838"],
//     pork: ["52885", "52995", "53018", "53036", "53037", "52999", "53035", "52954", "53034", "52847", "52994", "52980", "52949", "52822", "53032", "52926", "52828", "52948"],
//     seafood: ["52959", "52819", "52944", "52802", "52918", "52764", "52773", "52887", "52946", "52821", "52777", "52809", "52960", "52823", "52936", "52836", "52953", "53023", "52882", "52975", "52852"],
//     side: ["52914", "52913", "52977", "52919", "53030", "52903", "53033", "52978", "53038", "53019", "52922", "52981", "52925"],
//     starter: ["52842", "52840", "52779", "52841"],
//     vegan: ["52942", "52794", "52775"],
//     vegetarian: ["52807", "52870", "52785", "52955", "52906", "53025", "53012", "52971", "52868", "53027", "52973", "52865", "52864", "52921", "52908", "52811", "52816", "52963", "52784", "52872", "52771", "52797", "52849", "52866", "52817", "52911", "52869", "53026", "52863", "52867", "52871"]
// }

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

//             // Regular expressions start with an open / signifying the start
//             // \b indicates the word we are looking for, in this case strIngredient then strMeasure
//             // Regular expressions end with a close / signifying both end and start of expression flags
//             // g is a global search -- retain the index of the last match, allowing iterative searches
//             const regexIng = /\bstrIngredient/g;
//             const regexMeas = /\bstrMeasure/g;
//             // these empty arrays will store they value for each key that matches the regular expression
//             let ingredients = [];
//             let measurements = [];
//             // i serves as the dynamic beginning of the array, and will be set to 0 for both 
//             let i = 0;
//             // OBJECT TRAVERSAL: response a.k.a. fullDeets.meals[0]. here could be idMeal, str... etc.
//             // for each property in full details, see if the property has strIngredient in it.
//             // if it does, and equates to true, isn't string 'null' or an empty space...
//             // ... then populate the strIngredient key's value into the ingredients array.
//             for (property in details) {
//                 let a = `${property}`.match(regexIng);
//                 // console.log(`key= ${property} value= ${details[property]}`)

//                 if (a &&
//                     `${details[property]}` &&
//                     `${details[property]}` !== '' && 
//                     `${details[property]}` !== 'null' && 
//                     `${details[property]}` !== ' ') {
//                     // console.log('The Ingredient is: ' + `${property}`);
//                     // console.log(`Ingredient ${i} is: ` + `${details[property]}`);
//                     // console.log(i);
//                     ingredients[i] = `${details[property]}`
//                     i++
//                 }
//             }
//             // reset i to once again serve as the dynamic beginning of the array, this time for measure
//             i = 0;
//             // same idea as above, except this time ' ' space strings are acceptable for measurements
//             for (property in details) {
//                 let b = `${property}`.match(regexMeas);

//                 if (b && 
//                     `${details[property]}` &&
//                     `${details[property]}` !== '' && 
//                     `${details[property]}` !== 'null') {

//                     // console.log(`Measurement ${i} is: ` + `${details[property]}`);
//                     measurements[i] = `${details[property]}`
//                     i++
//                 }
//             }
//             // NOTE: ingredients and measurements array length are always the same
//             // for each ingredient in the array, append it to a list and add it to the unordered list
//             for (let j = 0; j < ingredients.length; j++) {
//                 // let ingredientsUL = $(`<ul></ul>`).attr('id', 'ingredientsUL')
//                 $('#ingredientsUL').append($(`<li></li>`).text(
//                     measurements[j] + ' ' + ingredients[j]
//                 ));
//                 // console.log(`${j}:` + ' ' + measurements[j] + ' ' + ingredients[j])
//             }
//         });
//     }
});


