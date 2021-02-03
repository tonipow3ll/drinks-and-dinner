// List of Ingredients - Drinks
const drinkIngredients = $.get("https://www.thecocktaildb.com/api/json/v2/9973533/list.php?i=list", function (response) {
    return response;
})

// List of Categories - Drinks
const drinkCategories = $.get("https://www.thecocktaildb.com/api/json/v2/9973533/list.php?c=list", function (response) {
    return response;
});

// list of Glasses - Drinks
const drinkGlasses = $.get("https://www.thecocktaildb.com/api/json/v2/9973533/list.php?g=list", function (response) {
    return response;
});

// list of Alcoholic 'type' - Drinks
const drinkAlcoholic = $.get("https://www.thecocktaildb.com/api/json/v2/9973533/list.php?a=list", function (response) {
    return response;
});

// List of Ingredients - Meals
const mealIngredients = $.get("https://www.themealdb.com/api/json/v2/9973533/list.php?i=list", function (response) {
    return response;
})

// List of Categories - Meals
const mealCategories = $.get("https://www.themealdb.com/api/json/v2/9973533/list.php?c=list", function (response) {
    return response;
});

// list of Areas - Meals
const mealAreas = $.get("https://www.themealdb.com/api/json/v2/9973533/list.php?a=list", function (response) {
    return response;
});

// Example on how to call the promise.

// Promise.resolve(drinkIngredients).then((response) => { }/* Your function goes here. */)

// Or copy the $.get call into your own code.
