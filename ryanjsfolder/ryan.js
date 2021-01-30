$(document).ready(function() {
    ​
        // API Constants
        const drinkAPIkey = "1";
        const mealAPIkey = "1";
        const drinkURL = "https://www.thecocktaildb.com/api/json/v1/" + drinkAPIkey + "/";
        const mealURL = "https://www.themealdb.com/api/json/v1/" + mealAPIkey + "/";
        const filterURL = "filter.php?i=";
        const lookUpURL = "lookup.php?i=";
        const searchURL = "search.php?s=";
    ​
        // The JSON object that our final list of IDs will push to.
        let finalList = {"items":[]};
    ​
        // Experimental array of ingredients
        let ingredients = ["Chicken", "Spinach", "Lamb", "Butter", "Broccoli"];
        let typeAPI = "meal";
    ​
        // Call get Ingredient Promises
        getIngredPromises(ingredients, typeAPI);
    ​
        // get Ingredient Promises function
        function getIngredPromises(array, type) {
    ​
            if (type === "meal") functionURL = mealURL;
            else if (type === "drink") functionURL = drinkURL;
            else return;
            
            // Created an array of promises, each index being the response for one of the ingredients in the array.
            for (let i = 0; i < array.length; i++) {
                array[i] = $.get(functionURL + filterURL + array[i], ((response) => { return response }));
            };
    ​
            // Waits for all promises, then generates a list of IDs for the drinks that use the ingredients. Sorts the list by most ingredients found to least.
            Promise.all(array).then((response) => {
    ​
                // Array used to concat all of the drinks found for each ingredient provided.
                let arrGen = [];
    ​
                // Object used to count the number of times that each meal appears in the concat list.
                let counts = {};
    ​
                // Loop to concat the arrays of IDs together.
                for (let i = 0; i < response.length; i++) {
                    if (type === "drink") { arrGen = arrGen.concat(response[i].drinks.map(function(v) {return v.idDrink}))}
                    else if (type === "meal") { arrGen = arrGen.concat(response[i].meals.map(function(v) {return v.idMeal}))}
                    else return;
                }
                // forEach counts the number of times each ID appears in the list.
                arrGen.forEach(function(x) {
                    counts[x] = (counts[x] || 0) + 1;
                })
    ​
                // Converts the resulting counts object into a more easily usable JSON object.
                Object.entries(counts).forEach(e => finalList["items"].push({"id":e[0],"count":e[1]}))
    ​
                // Sorts the JSON object by count descending.
                finalList.items.sort(function(a,b) { return b.count - a.count });
    ​
                // Top 10.
                let top10 = [];
                for( let i = 0; i < 10 || i < finalList.length; i++) { top10[i] = $.get(functionURL + lookUpURL + finalList.items[i].id, ((response) => { return response }))};
                Promise.all(top10).then((response) => { console.log(response) });
    ​
    ​
            })
        };
    ​
        // getIDList("chicken");
    ​
        // function getIDList(ingredient) {
        //     $.get("https://www.themealdb.com/api/json/v1/1/filter.php?i=" + ingredient, function(response) { 
        //         const arrayGen = response.meals.map(function(v) {return v.idMeal})
        //         console.log(arrayGen);
        //         let workingID = arrayGen[Math.floor(Math.random() * arrayGen.length)]
        //         $.get("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + workingID, function(response) {
        //             console.log(response);
        //      }) 
    ​
        //     });
    ​
        // }
        
    })