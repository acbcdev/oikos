export interface Budget {
  id: string;
  name: string;
  subtitle: string;
  icon: string; // lucide icon name
  spent: number;
  limit: number;
  daysLeft: number;
  variant: "light" | "default" | "danger";
}

export const BUDGETS: Budget[] = [
  {
    id: "b-1",
    name: "Rent",
    subtitle: "",
    icon: "Home",
    spent: 1500,
    limit: 1500,
    daysLeft: 0,
    variant: "light",
  },
  {
    id: "b-2",
    name: "Food",
    subtitle: "Personal Dining",
    icon: "UtensilsCrossed",
    spent: 650,
    limit: 800,
    daysLeft: 12,
    variant: "default",
  },
  {
    id: "b-3",
    name: "Fun",
    subtitle: "Leisure & Social",
    icon: "PartyPopper",
    spent: 550,
    limit: 500,
    daysLeft: 12,
    variant: "danger",
  },
  {
    id: "b-4",
    name: "Transport",
    subtitle: "Commute & Gas",
    icon: "Car",
    spent: 120,
    limit: 300,
    daysLeft: 12,
    variant: "default",
  },
  {
    id: "b-5",
    name: "Subs",
    subtitle: "Digital Services",
    icon: "Tv",
    spent: 30,
    limit: 100,
    daysLeft: 12,
    variant: "default",
  },
];

export const TOTAL_LIMIT = BUDGETS.reduce((s, b) => s + b.limit, 0);
export const TOTAL_BURN = BUDGETS.reduce((s, b) => s + b.spent, 0);
