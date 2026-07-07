export interface Recipe {
  id?: string;
  title: string;
  prep: string;
  cook: string;
  yield: string;
  category: string;
  favorite: boolean;
  ingredients: string[];
  directions: string[];
  ownerId?: string;
  imageUrl?: string;
  createdAt?: any;
  updatedAt?: any;
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
