import {
  ArrowLeftRight,
  BookOpen,
  Briefcase,
  Car,
  Coffee,
  Dumbbell,
  Gift,
  Heart,
  Home,
  Laptop,
  MoreHorizontal,
  PawPrint,
  Plane,
  Receipt,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Shield,
  Sparkles,
  TrendingUp,
  Tv,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface CategoryDef {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  desc: string;
}

export const CATEGORIES: CategoryDef[] = [
  // Everyday expenses
  {
    id: "food",
    name: "Food & Dining",
    icon: UtensilsCrossed,
    color: "#f97316",
    desc: "Restaurants, groceries",
  },
  {
    id: "groceries",
    name: "Groceries",
    icon: ShoppingCart,
    color: "#84cc16",
    desc: "Supermarket, provisions",
  },
  {
    id: "dining",
    name: "Dining Out",
    icon: Coffee,
    color: "#fb923c",
    desc: "Cafes, bars, takeaway",
  },
  {
    id: "transport",
    name: "Transport",
    icon: Car,
    color: "#3b82f6",
    desc: "Fuel, transit, rides",
  },
  {
    id: "housing",
    name: "Housing",
    icon: Home,
    color: "#06b6d4",
    desc: "Rent, mortgage",
  },
  {
    id: "utilities",
    name: "Utilities",
    icon: Zap,
    color: "#f59e0b",
    desc: "Electric, water, internet",
  },

  // Lifestyle
  {
    id: "shopping",
    name: "Shopping",
    icon: ShoppingBag,
    color: "#a855f7",
    desc: "Clothes, electronics",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    icon: Tv,
    color: "#ec4899",
    desc: "Movies, games, events",
  },
  {
    id: "subscriptions",
    name: "Subscriptions",
    icon: RefreshCw,
    color: "#8b5cf6",
    desc: "Streaming, apps, software",
  },
  {
    id: "travel",
    name: "Travel",
    icon: Plane,
    color: "#6366f1",
    desc: "Flights, hotels, trips",
  },
  {
    id: "sports",
    name: "Sports & Gym",
    icon: Dumbbell,
    color: "#a3e635",
    desc: "Gym, sports, fitness",
  },
  {
    id: "personal_care",
    name: "Personal Care",
    icon: Sparkles,
    color: "#d946ef",
    desc: "Beauty, haircut, hygiene",
  },

  // Health & protection
  {
    id: "health",
    name: "Health",
    icon: Heart,
    color: "#ef4444",
    desc: "Medical, pharmacy, gym",
  },
  {
    id: "insurance",
    name: "Insurance",
    icon: Shield,
    color: "#0ea5e9",
    desc: "Life, car, home coverage",
  },
  {
    id: "pets",
    name: "Pets",
    icon: PawPrint,
    color: "#d97706",
    desc: "Food, vet, grooming",
  },

  // Growth
  {
    id: "education",
    name: "Education",
    icon: BookOpen,
    color: "#eab308",
    desc: "Courses, books, tuition",
  },
  {
    id: "investment",
    name: "Investment",
    icon: TrendingUp,
    color: "#10b981",
    desc: "Dividends, returns",
  },

  // Income
  {
    id: "salary",
    name: "Salary",
    icon: Briefcase,
    color: "#22c55e",
    desc: "Employment income",
  },
  {
    id: "freelance",
    name: "Freelance",
    icon: Laptop,
    color: "#14b8a6",
    desc: "Contract, consulting",
  },

  // Other
  {
    id: "gifts",
    name: "Gifts",
    icon: Gift,
    color: "#f43f5e",
    desc: "Presents, donations",
  },
  {
    id: "taxes",
    name: "Taxes",
    icon: Receipt,
    color: "#64748b",
    desc: "Income, property taxes",
  },
  {
    id: "transfer",
    name: "Transfer",
    icon: ArrowLeftRight,
    color: "#f97316",
    desc: "Between accounts",
  },
  {
    id: "other",
    name: "Other",
    icon: MoreHorizontal,
    color: "#6b7280",
    desc: "Miscellaneous",
  },
];

export const catLabel = (id: string) =>
  CATEGORIES.find((c) => c.id === id)?.name ?? id;
