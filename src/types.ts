export interface Recipe {
  title: string;
  prep: string;
  cook: string;
  yield: string;
  category: "Cake" | "Dessert" | "Breakfast" | "Other";
  favorite: boolean;
  ingredients: string[];
  directions: string[];
}

export type SelectedEggSubstitute = 
  | "oil_water"
  | "seltzer"
  | "cornstarch"
  | "aquafaba"
  | "flax"
  | "applesauce"
  | "banana"
  | "yogurt"
  | "vinegar_soda";

export interface EggSubstituteDetail {
  singular: string;
  plural: string;
  ratio: number;
  type: string;
}
