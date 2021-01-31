$(document).ready(function () {
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

    // mealCategories is an object
    // Each key is a meal category
    // Each value is an array of meals, represented in the API by an ID
    // Any ID is the meat (pun intended) of the API call -- it's what becomes randomMeal in the queryURL!!!
    // How, say, mealCategories["beef"] is called from HTML will be explained in comments below this object
    // NOTE: Normally, mealCategories["beef"] would be the syntax. However, the HTML value (beef) is a string!
    let mealCategories = {
        beef: ["52874", "52878", "52997", "52904", "52812", "52873", "52952", "52834", "52824", "52803", "53013", "52979", "52826", "52998", "53031", "53021", "52781", "52938", "52947", "52827", "52876", "52927", "53006", "53029", "52943", "53017", "52930", "52941", "52992", "52770", "52881", "52935", "52950", "53000"],
        breakfast: ["52965", "52895", "52957", "52896", "52967", "52962", "52964"],
        chicken: ["52940", "53016", "52846", "52796", "52934", "52956", "52850", "52765", "52818", "52875", "52795", "52831", "52920", "52879", "53011", "52832", "52830", "52996", "52951", "52993", "52937", "52820", "52813", "52945", "52851", "52774", "52780", "52933", "53020", "53028", "52806", "52772", "52814"],
        dessert: ["52893", "52768", "52767", "52855", "52894", "52928", "52891", "52792", "52961", "52923", "52897", "52976", "52898", "52910", "52856", "52853", "52966", "52776", "52860", "52905", "52990", "52788", "52989", "52988", "52899", "52888", "52791", "53007", "52787", "52890", "52859", "53015", "52900", "52991", "52924", "52858", "52854", "52902", "52862", "52861", "52958", "52916", "53022", "52932", "52857", '52901', '52786', '53024', '52833', '52886', '52883', '52793', '53005', '52931', '52889', '52909', '52929', '52892', '52970', '52917'],
        goat: ["52968"],
        lamb: ["52769", "52974", "53009", "52877", "52805", "52808", "52843", "52782", "53010", "52884", "52880", "52783", "53008", "52972"],
        miscellaneous: ["52848", "52939", "52969", "52907", "52815", "52915", "52810", "53014", "52804", "52912", "52845"],
        pasta: ["52839", "52835", "52829", "52987", "52844", "52837", "52982", "52838"],
        pork: ["52885", "52995", "53018", "53036", "53037", "52999", "53035", "52954", "53034", "52847", "52994", "52980", "52949", "52822", "53032", "52926", "52828", "52948"],
        seafood: ["52959", "52819", "52944", "52802", "52918", "52764", "52773", "52887", "52946", "52821", "52777", "52809", "52960", "52823", "52936", "52836", "52953", "53023", "52882", "52975", "52852"],
        side: ["52914", "52913", "52977", "52919", "53030", "52903", "53033", "52978", "53038", "53019", "52922", "52981", "52925"],
        starter: ["52842", "52840", "52779", "52841"],
        vegan: ["52942", "52794", "52775"],
        vegetarian: ["52807", "52870", "52785", "52955", "52906", "53025", "53012", "52971", "52868", "53027", "52973", "52865", "52864", "52921", "52908", "52811", "52816", "52963", "52784", "52872", "52771", "52797", "52849", "52866", "52817", "52911", "52869", "53026", "52863", "52867", "52871"]
    }

    // When Submit button on front end is clicked:
    $('#getMealBtn').on('click', function (event) {
        // Prevent normal page refresh associated with submit buttons from occurring
        event.preventDefault();
        // Get the value of the dropdown at time of submission
        // NOTE: <select> is comprised of <option values=""> -- the selected option === <select> value!!!
        let selection = $('#meals').val();
        // Console logs 'beef' to help explain what information is being acquired here
        // console.log('Selected meal category: ' + selection);
        // Calls below function that randomizes array item from user-selected meal key
        getMealID(mealCategories[selection]);
    });

    // Function takes 1 argument = user-selected meal, which equates to one of the above keys in the object
    function getMealID(meal) {
        // Random number between 0-1, in float/decimal form
        let rand = Math.random();
        // Meal Array length -- for example, vegan.length = 3
        let totalMeals = meal.length;
        // Floor turns 2.93 into 2, 0.93 into 0, etc.
        // For example, 0.78 * 34 = 26.52 -- Floor makes this 26.
        let randIndex = Math.floor(rand * totalMeals);
        // Random meal equates to something along the lines of: beef[26]...
        // ...Which might be something like '52824'
        let randomMeal = meal[randIndex];
        // Ready to serve https://www.themealdb.com/api/json/v1/1/lookup.php?i=52824 into the API
        let queryURL = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + randomMeal;

        // Sends request to server to retrieve randomMeal object that contains full details of a Meal
        // NOTE: full details includes items such as Meal Name, Image, Ingredients, Measures, Instructions...
        $.get(queryURL, function (fullDeets) {
            console.log(fullDeets);
            // console.log(fullDeets.meals[0].strMeal);
            // console.log(fullDeets.meals[0].strTags);
                $("#strMeal").text(fullDeets.meals[0].strMeal);
                $("#strMealThumb").attr('src', fullDeets.meals[0].strMealThumb);
                $("#strTags").text(fullDeets.meals[0].strTags);
                $("#strYoutube").attr('href', fullDeets.meals[0].strYoutube);
                // console.log('done');
                // let strIngMeas = 20;
                // for (let i = 0; i < strIngMeas.length; i++) {
                //     if (strIngredient`${i}`)
                // }
            // }
            // console.log("The first ingredient is: " + fullDeets.meals[0].strIngredient1);
            // console.log("The first ing. measurement is: " + fullDeets.meals[0].strMeasure1);
            // console.log(fullDeets.meals[0].strMeasure1 + '' + fullDeets.meals[0].strIngredient1);
            // $("[data-content=2]").text(fullDeets.meals[0].strMeasure1 + ' ' + fullDeets.meals[0].strIngredient1);
            let ingredientsUL = $(`<ul></ul>`).attr('id', 'ingredientsUL')
            // NOTES FROM TONI ======== swappeded data-content1, and 2, so ingredients / directions populate in the correct places 
            $("[data-content=1]").append(ingredientsUL);
            $("[data-content=2]").text(fullDeets.meals[0].strInstructions);
            console.log(fullDeets.meals[0].strInstructions)
            let mealKeys = Object.keys(fullDeets.meals[0]);
            let mealEntries = Object.entries(fullDeets.meals[0]);
            // console.log(Object.keys(fullDeets.meals[0]));
            // console.log(mealKeys.length);
            // console.log(mealKeys);
            // console.log(mealEntries);
            // stringify object
            // search for value in string
            const regexIng = /\bstrIngredient/g;
            const regexMeas = /\bstrMeasure/g;
            let ingredients = [];
            let measurements = [];
            let i = 0;
            for (property in fullDeets.meals[0]) {
                let a = `${property}`.match(regexIng);
                // console.log(`key= ${property} value= ${fullDeets.meals[0][property]}`)

                if (a &&
                    `${fullDeets.meals[0][property]}` &&
                    `${fullDeets.meals[0][property]}` !== '' && 
                    `${fullDeets.meals[0][property]}` !== 'null' && 
                    `${fullDeets.meals[0][property]}` !== ' ') {
                    // console.log('The Ingredient is: ' + `${property}`);
                    // console.log(`Ingredient ${i} is: ` + `${fullDeets.meals[0][property]}`);
                    // console.log(i);
                    ingredients[i] = `${fullDeets.meals[0][property]}`
                    i++
                }
            }
            i = 0;
            for (property in fullDeets.meals[0]) {
                let b = `${property}`.match(regexMeas);
                
                if (b && 
                    `${fullDeets.meals[0][property]}` &&
                    `${fullDeets.meals[0][property]}` !== '' && 
                    `${fullDeets.meals[0][property]}` !== 'null' && 
                    `${fullDeets.meals[0][property]}` !== ' ') {

                    // console.log(`Measurement ${i} is: ` + `${fullDeets.meals[0][property]}`);
                    measurements[i] = `${fullDeets.meals[0][property]}`
                    i++
                }
            }
            // console.log('===')
            for (let j = 0; j < ingredients.length; j++) {
                // let ingredientsUL = $(`<ul></ul>`).attr('id', 'ingredientsUL')
                $('#ingredientsUL').append($(`<li></li>`).text(
                    measurements[j] + ' ' + ingredients[j]
                ));
                // console.log(`${j}:` + ' ' + measurements[j] + ' ' + ingredients[j])
            }

            console.log(ingredients);
            console.log(measurements);
        });
    }

});
