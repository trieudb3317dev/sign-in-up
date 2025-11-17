import React from "react";
import RecipeDetail from "@/components/RecipeDetail";
import { notFound } from "next/navigation";

type Recipe = {
    id: number;
    title: string;
    image: string;
    author?: string;
    date?: string;
    prep?: string;
    cook?: string;
    category?: string;
    nutrition?: Record<string, string>;
    content?: string;
};

const RECIPES: Recipe[] = [
    { id: 1, title: "Big and Juicy Wagyu Beef Cheeseburger", image: "/images/recipes/1.jpg", author: "John Smith" },
    { id: 2, title: "Fresh Lime Roasted Salmon with Ginger Sauce", image: "/images/recipes/2.jpg", author: "Jane Doe" },
    { id: 3, title: "Strawberry Oatmeal Pancake with Honey Syrup", image: "/images/recipes/3.jpg", author: "Alice" },
    { id: 4, title: "Fresh and Healthy Mixed Mayonnaise Salad", image: "/images/recipes/4.jpg", author: "Bob" },
    { id: 5, title: "Chicken Meatballs with Cream Cheese", image: "/images/recipes/5.jpg", author: "John" },
    { id: 6, title: "Fruity Pancake with Orange & Blueberry", image: "/images/recipes/6.jpg", author: "Anna" },
    { id: 7, title: "One Pot Chicken and Rice", image: "/images/recipes/7.jpg", author: "Chef Mike" },
    { id: 8, title: "Creamy Chicken and Bacon Pasta", image: "/images/recipes/8.jpg", author: "Chef Lee" },
    { id: 9, title: "Tasty Meat Skewers with Herbs", image: "/images/recipes/9.jpg", author: "Chef Tom" },
];

// export async so we can await params if it's a Promise in this environment
export default async function Page({ params }: { params: { id: string } | Promise<{ id: string }> }) {
    // ensure params is resolved (works whether params is an object or a Promise)
    const resolved = await params;
    const id = Number(resolved?.id);
    if (Number.isNaN(id)) return notFound();

    const recipe = RECIPES.find((r) => r.id === id);
    if (!recipe) return notFound();

    return <RecipeDetail recipe={recipe} />;
}
