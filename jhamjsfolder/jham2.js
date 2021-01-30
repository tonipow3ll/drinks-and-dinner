$(document).ready(function() {
    // 
    // This query worked fine in the behaviour.js I just switched it out for a $.get method
    // $.ajax({
    //     url: queryURL,
    //     method: "GET"
    // }).then(function(fullDeets) {
    //     console.log(fullDeets);
    // })
    ​
        let beef = ["52874", "52878", "52997", "52904", "52812", "52873", "52952", "52834", "52824", "52803", "53013", "52979", "52826", "52998", "53031", "53021", "52781", "52938", "52947", "52827", "52876", "52927", "53006", "53029", "52943", "53017", "52930", "52941", "52992", "52770", "52881", "52935", "52950", "53000"];
        let breakfast = ["52965", "52895", "52957", "52896", "52967", "52962", "52964"];
        let chicken = ["52940", "53016", "52846", "52796", "52934", "52956", "52850", "52765", "52818", "52875", "52795", "52831", "52920", "52879", "53011", "52832", "52830", "52996", "52951", "52993", "52937", "52820", "52813", "52945", "52851", "52774", "52780", "52933", "53020", "53028", "52806", "52772", "52814"];
        let dessert = ["52893","52768", "52767", "52855", "52894", "52928", "52891", "52792", "52961", "52923", "52897", "52976", "52898", "52910", "52856", "52853", "52966", "52776", "52860", "52905", "52990", "52788", "52989", "52988", "52899","52888", "52791", "53007", "52787", "52890", "52859", "53015", "52900", "52991", "52924", "52858", "52854", "52902", "52862", "52861", "52958", "52916", "53022", "52932", "52857", '52901', '52786', '53024', '52833', '52886', '52883','52793','53005','52931','52889','52909','52929','52892','52970','52917'];
        let goat = ["52968"];
        let lamb = ["52769", "52974", "53009", "52877", "52805", "52808", "52843", "52782", "53010", "52884", "52880", "52783", "53008", "52972"];
        let misc = ["52848", "52939", "52969", "52907", "52815", "52915", "52810", "53014", "52804", "52912", "52845"];
        let pasta = ["52839", "52835", "52829", "52987", "52844", "52837", "52982", "52838"];
        let pork = ["52885", "52995", "53018", "53036", "53037", "52999", "53035", "52954", "53034", "52847", "52994", "52980", "52949", "52822", "53032", "52926", "52828", "52948"];
        let seafood = ["52959", "52819", "52944", "52802", "52918", "52764", "52773", "52887", "52946", "52821", "52777", "52809", "52960", "52823", "52936", "52836", "52953", "53023", "52882", "52975", "52852"];
        let sides = ["52914", "52913", "52977", "52919", "53030", "52903", "53033", "52978", "53038", "53019", "52922", "52981", "52925"];
        let starters = ["52842", "52840", "52779", "52841"];
        let vegan = ["52942", "52794", "52775"];
        let vegetarian = ["52807", "52870", "52785", "52955", "52906", "53025", "53012", "52971", "52868", "53027", "52973", "52865", "52864", "52921", "52908", "52811", "52816", "52963", "52784", "52872", "52771", "52797", "52849", "52866", "52817", "52911", "52869", "53026", "52863", "52867", "52871"];
    ​
    ​
        let spacer = "========================================";
        let ingredient = "beef"
        // 
        let queryURL = "https://www.themealdb.com/api/json/v1/1/filter.php?c=" + ingredient;
        // let queryURL = "https://www.themealdb.com/api/json/v1/1/filter.php?i=chicken_breast";
    ​
    // Meals Categories: just for notes
    /* mealsCatArr = [
        "Beef", "Breakfast", "Chicken", "Dessert", "Goat", "Lamb", "Miscellaneous", "Pasta", "Pork", "Seafood", "Side", "Starter", "Vegan", "Vegetarian"
        ]
    */
    ​
    // Meals filtered by category returns every meal ID in that category:
    // https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood
    ​
    // When user selects dropdown, they see the meals categories.
    // What GETS the first API information is www.apicall/
    ​
    // User selects dropdown, clicks submit, queries submission for: Meal Categories
        $.ajax({
            url: queryURL,
            method: "GET"
          }).then(function(identifier) {
    // I want a function that 
    ​
    ​
    ​
            console.log("Meal Name, Meal Image, and Meal ID:");
            console.log(identifier);
            console.log(spacer);
            console.log("Meal ID: " + identifier.meals[0].idMeal);
            console.log(spacer);
    // Second API uses ID from above to  
               // Get Full Meal Details by ID
                //  https://www.themealdb.com/api/json/v1/1/lookup.php?i=52772
                // let mealID = '52874';
                let mealID = identifier.meals[0].idMeal;
                let mealIDURL = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + mealID;
                $.ajax({
                  url: mealIDURL,
                  method: "GET"
                }).then(function(fullDeets) {
                    let details = fullDeets.meals[0];
                    console.log(details);
                    console.log("Meal Name: " + details.strMeal);
                    console.log(spacer);
                    console.log("Meal Image: " + details.strMealThumb);
                    console.log(spacer);
                    console.log("Meal Ingredient #1: " + details.strIngredient1);
                    console.log(spacer);
                    console.log("Meal Measurement #1: " + details.strMeasure1);
                    console.log(spacer);
                    console.log("Meal Instructions:");
                    console.log(details.strInstructions);
                })
        });
    ​
        // getMealID(mealCategories.vegetarian)
    // let mealID = '52874';
    // let queryURL = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + mealID;
    // console.log(spacer);
        // $.ajax({
        //     url: queryURL,
        //     method: "GET"
        // }).then(function(fullDeets) {
        //     // let details = fullDeets.meals[0];
        //     // console.log(details);
        //     // console.log("Meal Name: " + details.strMeal);
        //     // console.log(spacer);
        //     // console.log("Meal Image: " + details.strMealThumb);
        //     // console.log(spacer);
        //     // console.log("Meal Ingredient #1: " + details.strIngredient1);
        //     // console.log(spacer);
        //     // console.log("Meal Measurement #1: " + details.strMeasure1);
        //     // console.log(spacer);
        //     // console.log("Meal Instructions:");
        //     // console.log(details.strInstructions);
        // })
    ​
        /*
        Function receives
        function getIDList(ingredient) {
            $.get("https://www.themealdb.com/api/json/v1/1/filter.php?i=" + ingredient, function(response) { 
                const arrayGen = response.meals.map(function(v) {return v.idMeal})
                let workingID = arrayGen[Math.floor(Math.random() * arrayGen.length)]
                $.get("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + workingID, function(response) {
                    console.log(response);
             }) 
            });
        } 
    ​
    */
    // $('#meals').on('click', function() {
        
    //     let selection = $(this).val();
    //     // console.log($(this).val());
    //     console.log(selection);
    //     // getMealID(mealCategories.vegetarian)
    //     getMealID(mealCategories[selection]);
    // }) 
    ​
        // let mealID = '52874';
        // let queryURL = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + mealID;
    ​
        // Get Full Meal Details by ID
        //  https://www.themealdb.com/api/json/v1/1/lookup.php?i=52772
    ​
    // read me https://stackoverflow.com/questions/17769934/need-to-use-value-of-an-html-select-option-as-an-array-name
    // turn arrays into object keys, create function
    ​
    $('#getMealBtn').on('click', function(event) {
        event.preventDefault();
        let selection = $('#meals').val();
        console.log(selection);
        getMealID(mealCategories[selection]);
    })
    ​
    function getMealID(meal) {
        let rand = Math.random();
        let totalMeals = meal.length;
        let randIndex = Math.floor(rand * totalMeals);
        let randomMeal = meal[randIndex];
        console.log(randomMeal);
        let queryURL = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + randomMeal;
    ​
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(fullDeets) {
            console.log(fullDeets);
        })
    }
    });
    ​
    ​
    ​
    });
    