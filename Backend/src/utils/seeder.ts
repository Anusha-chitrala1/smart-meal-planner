import mongoose from 'mongoose';
import Meal from '../../../lib/models/Meal';

const healthyRecipes = [
  {
    name: "Quinoa Buddha Bowl",
    protein: 25,
    carbs: 65,
    fat: 18,
    calories: 520,
    category: "lunch",
    ingredients: [
      "1 cup cooked quinoa",
      "1/2 avocado, sliced",
      "1 cup mixed greens",
      "1/2 cup cherry tomatoes, halved",
      "1/4 cup chickpeas, roasted",
      "2 tbsp tahini dressing",
      "1 tbsp pumpkin seeds"
    ],
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    instructions: "1. Cook quinoa according to package directions. 2. Arrange greens in a bowl. 3. Top with sliced avocado, tomatoes, and chickpeas. 4. Drizzle with tahini dressing. 5. Sprinkle with pumpkin seeds. 6. Serve immediately.",
    prepTime: 15,
    cookTime: 15,
    servings: 1,
    isHealthy: true
  },
  {
    name: "Greek Yogurt Parfait",
    protein: 28,
    carbs: 45,
    fat: 12,
    calories: 380,
    category: "breakfast",
    ingredients: [
      "1 cup Greek yogurt (plain, low-fat)",
      "1/2 cup mixed berries",
      "1/4 cup granola (low-sugar)",
      "1 tbsp chia seeds",
      "1 tsp honey"
    ],
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop",
    instructions: "1. Layer Greek yogurt in a glass or bowl. 2. Add a layer of mixed berries. 3. Sprinkle with granola and chia seeds. 4. Drizzle with honey. 5. Repeat layers if desired. 6. Serve immediately or chill for 10 minutes.",
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    isHealthy: true
  },
  {
    name: "Grilled Salmon with Asparagus",
    protein: 35,
    carbs: 12,
    fat: 22,
    calories: 380,
    category: "dinner",
    ingredients: [
      "6 oz salmon fillet",
      "1 bunch asparagus, trimmed",
      "1 tbsp olive oil",
      "1 lemon, sliced",
      "Salt and pepper to taste",
      "1 tsp fresh dill (optional)"
    ],
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
    instructions: "1. Preheat grill to medium-high heat. 2. Brush salmon and asparagus with olive oil. 3. Season with salt and pepper. 4. Grill salmon for 4-5 minutes per side. 5. Grill asparagus for 3-4 minutes, turning occasionally. 6. Serve with lemon slices and fresh dill.",
    prepTime: 10,
    cookTime: 10,
    servings: 1,
    isHealthy: true
  },
  {
    name: "Avocado Toast with Egg",
    protein: 18,
    carbs: 35,
    fat: 20,
    calories: 380,
    category: "breakfast",
    ingredients: [
      "2 slices whole grain bread",
      "1 avocado, mashed",
      "2 eggs, poached",
      "1 tomato, sliced",
      "Salt and pepper to taste",
      "Red pepper flakes (optional)"
    ],
    image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop",
    instructions: "1. Toast bread slices until golden. 2. Mash avocado and spread on toast. 3. Poach eggs according to preference. 4. Top avocado toast with poached eggs. 5. Add tomato slices. 6. Season with salt, pepper, and red pepper flakes.",
    prepTime: 10,
    cookTime: 5,
    servings: 1,
    isHealthy: true
  },
  {
    name: "Turkey and Vegetable Stir-Fry",
    protein: 32,
    carbs: 28,
    fat: 15,
    calories: 380,
    category: "dinner",
    ingredients: [
      "6 oz ground turkey",
      "2 cups mixed vegetables (broccoli, bell peppers, carrots)",
      "1 tbsp low-sodium soy sauce",
      "1 tsp ginger, minced",
      "2 cloves garlic, minced",
      "1 tbsp olive oil",
      "1 cup cooked brown rice"
    ],
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    instructions: "1. Heat olive oil in a wok or large skillet. 2. Add garlic and ginger, cook for 30 seconds. 3. Add ground turkey and cook until browned. 4. Add vegetables and stir-fry for 5-7 minutes. 5. Add soy sauce and cook for another 2 minutes. 6. Serve over brown rice.",
    prepTime: 15,
    cookTime: 15,
    servings: 1,
    isHealthy: true
  },
  {
    name: "Chia Seed Pudding",
    protein: 12,
    carbs: 45,
    fat: 18,
    calories: 350,
    category: "snack",
    ingredients: [
      "3 tbsp chia seeds",
      "1 cup almond milk (unsweetened)",
      "1/2 banana, sliced",
      "1/4 cup berries",
      "1 tsp vanilla extract",
      "1 tsp maple syrup"
    ],
    image: "https://images.unsplash.com/photo-1488477304112-4944851de03d?w=400&h=300&fit=crop",
    instructions: "1. Mix chia seeds, almond milk, vanilla, and maple syrup. 2. Refrigerate for at least 4 hours or overnight. 3. Stir well before serving. 4. Top with sliced banana and berries. 5. Serve chilled.",
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    isHealthy: true
  },
  {
    name: "Mediterranean Chickpea Salad",
    protein: 18,
    carbs: 45,
    fat: 16,
    calories: 380,
    category: "lunch",
    ingredients: [
      "1 can chickpeas, drained and rinsed",
      "1 cucumber, diced",
      "2 tomatoes, diced",
      "1/4 red onion, finely chopped",
      "1/4 cup feta cheese, crumbled",
      "2 tbsp olive oil",
      "1 tbsp lemon juice",
      "Fresh herbs (parsley, mint)"
    ],
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop",
    instructions: "1. Combine chickpeas, cucumber, tomatoes, and red onion in a bowl. 2. Add crumbled feta cheese. 3. Whisk together olive oil and lemon juice for dressing. 4. Pour dressing over salad and toss. 5. Garnish with fresh herbs. 6. Chill for 15 minutes before serving.",
    prepTime: 15,
    cookTime: 0,
    servings: 2,
    isHealthy: true
  },
  {
    name: "Sweet Potato and Black Bean Bowl",
    protein: 22,
    carbs: 65,
    fat: 12,
    calories: 450,
    category: "dinner",
    ingredients: [
      "1 medium sweet potato, cubed",
      "1 can black beans, drained and rinsed",
      "1 cup spinach",
      "1 avocado, sliced",
      "2 tbsp salsa",
      "1 tbsp olive oil",
      "Spices (cumin, paprika, garlic powder)"
    ],
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop",
    instructions: "1. Preheat oven to 400°F (200°C). 2. Toss sweet potato cubes with olive oil and spices. 3. Roast sweet potatoes for 25-30 minutes. 4. Heat black beans in a saucepan. 5. Assemble bowl with spinach, roasted sweet potatoes, black beans, and avocado. 6. Top with salsa.",
    prepTime: 10,
    cookTime: 30,
    servings: 1,
    isHealthy: true
  }
];

export const seedHealthyRecipes = async () => {
  try {
    console.log('Seeding healthy recipes...');

    // Check if recipes already exist
    const existingRecipes = await Meal.countDocuments({ isHealthy: true });
    if (existingRecipes > 0) {
      console.log('Healthy recipes already seeded. Skipping...');
      return;
    }

    // Insert healthy recipes
    const recipesToInsert = healthyRecipes.map((recipe: any) => ({
      ...recipe,
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await Meal.insertMany(recipesToInsert);
    console.log(`Successfully seeded ${healthyRecipes.length} healthy recipes`);
  } catch (error) {
    console.error('Error seeding healthy recipes:', error);
  }
};
