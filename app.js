const API_KEY = '204e1818801c4c52a540d9087e4c163a'; // Your Spoonacular API key
const BASE_URL = 'https://api.spoonacular.com/recipes/findByIngredients';

// Dark Mode Toggle
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  themeToggle.textContent = document.body.dataset.theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
});

// Fetch recipes based on ingredient
async function fetchRecipes(ingredient, diet = '', cuisine = '') {
  const url = `${BASE_URL}?ingredients=${ingredient}&diet=${diet}&cuisine=${cuisine}&number=9&apiKey=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// Fetch detailed recipe information
async function fetchRecipeDetails(recipeId) {
  const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// Display recipes on the page
function displayRecipes(recipes) {
  const recipeResults = document.getElementById('recipeResults');
  recipeResults.innerHTML = recipes.map(recipe => `
    <div class="recipe-card" data-id="${recipe.id}">
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <p>Missing ingredients: ${recipe.missedIngredientCount}</p>
      <button class="view-details-btn">View Details</button>
      <button class="save-btn">Save</button>
      <div class="share-buttons">
        <button class="share-facebook" data-url="${recipe.sourceUrl}">Share on Facebook</button>
        <button class="share-twitter" data-url="${recipe.sourceUrl}" data-text="Check out this recipe: ${recipe.title}">Share on Twitter</button>
        <button class="share-email" data-url="${recipe.sourceUrl}" data-subject="Recipe: ${recipe.title}" data-body="Check out this recipe: ${recipe.title} - ${recipe.sourceUrl}">Share via Email</button>
      </div>
    </div>
  `).join('');
}

// Display recipe details in a modal
function showRecipeDetails(details) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.onclick = closeModal;

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <h2>${details.title}</h2>
    <img src="${details.image}" alt="${details.title}">
    <h3>Ingredients:</h3>
    <ul>
      ${details.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}
    </ul>
    <h3>Instructions:</h3>
    <p>${details.instructions || 'No instructions available.'}</p>
    <button onclick="closeModal()">Close</button>
  `;

  document.body.appendChild(backdrop);
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

// Close the modal
function closeModal() {
  const backdrop = document.querySelector('.modal-backdrop');
  const modal = document.querySelector('.modal');

  if (backdrop) backdrop.remove();
  if (modal) modal.remove();

  document.body.style.overflow = 'auto';
}

// Save recipe to favorites
function saveRecipe(recipe) {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.some(fav => fav.id === recipe.id)) {
    favorites.push(recipe);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('Recipe saved to favorites!');
    displayFavorites();
  } else {
    alert('Recipe is already in favorites!');
  }
}

// Display favorite recipes
function displayFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const favoriteRecipes = document.getElementById('favoriteRecipes');
  favoriteRecipes.innerHTML = favorites.map(recipe => `
    <div class="recipe-card" data-id="${recipe.id}">
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <p>Missing ingredients: ${recipe.missedIngredientCount}</p>
      <button class="view-details-btn">View Details</button>
    </div>
  `).join('');
}

// Save recipe to meal plan
function saveMealPlan(day, recipe) {
  const mealPlan = JSON.parse(localStorage.getItem('mealPlan')) || {};
  mealPlan[day] = recipe;
  localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
  alert(`Recipe saved for ${day}!`);
  displayMealPlan();
}

// Display meal plan
function displayMealPlan() {
  const mealPlan = JSON.parse(localStorage.getItem('mealPlan')) || {};
  const week = document.querySelector('.week');
  week.innerHTML = Object.entries(mealPlan).map(([day, recipe]) => `
    <div class="day" data-day="${day}">
      <h4>${day}</h4>
      <img src="${recipe.image}" alt="${recipe.title}">
      <h5>${recipe.title}</h5>
    </div>
  `).join('');
}

// Generate shopping list
function generateShoppingList() {
  const mealPlan = JSON.parse(localStorage.getItem('mealPlan')) || {};
  const recipes = Object.values(mealPlan);
  const ingredients = recipes.flatMap(recipe => recipe.extendedIngredients || []);
  const uniqueIngredients = [...new Set(ingredients.map(ing => ing.original))];

  const shoppingItems = document.getElementById('shoppingItems');
  shoppingItems.innerHTML = uniqueIngredients.map(ing => `<li>${ing}</li>`).join('');
}

// Handle form submission
document.getElementById('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const ingredient = document.getElementById('ingredient').value.split(',').map(i => i.trim()).join(',');
  const diet = document.getElementById('diet').value;
  const cuisine = document.getElementById('cuisine').value;
  const recipes = await fetchRecipes(ingredient, diet, cuisine);
  displayRecipes(recipes);
});

// Add click events to buttons
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('view-details-btn')) {
    const recipeCard = e.target.closest('.recipe-card');
    const recipeId = recipeCard.dataset.id;
    const details = await fetchRecipeDetails(recipeId);
    showRecipeDetails(details);
  }

  if (e.target.classList.contains('save-btn')) {
    const recipeCard = e.target.closest('.recipe-card');
    const recipe = {
      id: recipeCard.dataset.id,
      title: recipeCard.querySelector('h3').innerText,
      image: recipeCard.querySelector('img').src,
      missedIngredientCount: recipeCard.querySelector('p').innerText.replace('Missing ingredients: ', ''),
    };
    const day = prompt('Enter the day to save this recipe (e.g., Monday):');
    if (day) saveMealPlan(day, recipe);
  }
});

// Load favorites, meal plan, and shopping list on page load
displayFavorites();
displayMealPlan();
generateShoppingList();