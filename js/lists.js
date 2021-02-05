// API Constants
const drinkAPIkey = "9973533";
const mealAPIkey = "9973533";
const drinkURL = "https://www.thecocktaildb.com/api/json/v2/" + drinkAPIkey + "/";
const mealURL = "https://www.themealdb.com/api/json/v2/" + mealAPIkey + "/";
const filterURL = "filter.php?i=";
const lookUpURL = "lookup.php?i=";
const randomURL = "random.php";


// List of Ingredients - Drinks
const drinkIngredients = $.get("https://www.thecocktaildb.com/api/json/v2/" + drinkAPIkey + "/list.php?i=list", function (response) {
    return response;
})

// List of Categories - Drinks
const drinkCategories = $.get("https://www.thecocktaildb.com/api/json/v2/" + drinkAPIkey + "/list.php?c=list", function (response) {
    return response;
});

// list of Glasses - Drinks
const drinkGlasses = $.get("https://www.thecocktaildb.com/api/json/v2/" + drinkAPIkey + "/list.php?g=list", function (response) {
    return response;
});

// list of Alcoholic 'type' - Drinks
const drinkAlcoholic = $.get("https://www.thecocktaildb.com/api/json/v2/" + drinkAPIkey + "/list.php?a=list", function (response) {
    return response;
});

// List of Ingredients - Meals
const mealIngredients = $.get("https://www.themealdb.com/api/json/v2/" + mealAPIkey + "/list.php?i=list", function (response) {
    return response;
})

// List of Categories - Meals
const mealCategories = $.get("https://www.themealdb.com/api/json/v2/" + mealAPIkey + "/list.php?c=list", function (response) {
    return response;
});

// list of Areas - Meals
const mealAreas = $.get("https://www.themealdb.com/api/json/v2/" + mealAPIkey + "/list.php?a=list", function (response) {
    return response;
});