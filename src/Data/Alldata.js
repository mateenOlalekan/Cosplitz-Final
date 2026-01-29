// assets
import ticket from "../assets/ticket.jpg";
import shop from "../assets/shop.jpg";
import car from "../assets/car.jpg";
import {
  UtensilsCrossed,
  Users,
  DollarSign,
  Zap,
  Clock,
  TrendingUp,
  BookOpen,
  Globe,
  Briefcase,
  MapPin,
  Lock,
  Eye,
  Check,
  Plane,
  Wrench,
  Lightbulb,
  FileInput,
  Package,
  Headphones,
  Hotel,
  Truck,
} from "lucide-react";

export const deals = [
  {
    id: "deal-transport-1",
    badge: "Limited Deal",
    discount: "40% Off",
    title: "Get Special Offer",
    description: "Flash Sale: Shared Taxi",
    details: "All Services Available / T & C Applied",
    time: "15 min left!",
    image: car,
    participants: "3/5 Participants",
    category: "ride",
    color: "from-[#065026] via-[#0F8542] to-[#065026]",
  },
  {
    id: "deal-grocery-1",
    badge: "Popular",
    discount: "30% Off",
    title: "Bulk Grocery Deal",
    description: "Flash Sale: Save on Group Orders",
    details: "Fresh Produce / Same Day Delivery",
    time: "30 min left!",
    image: shop,
    participants: "7/10 Participants",
    category: "groceries",
    color: "from-[#065026] via-[#0F8542] to-[#065026]",
  },
  {
    id: "deal-event-1",
    badge: "Newest",
    discount: "20% Off",
    title: "Concert Deal",
    description: "Flash Sale: Group Tickets",
    details: "Instant Access / Limited Seats",
    time: "30 min left!",
    image: ticket,
    participants: "7/10 Participants",
    category: "event",
    color: "from-[#065026] via-[#0F8542] to-[#065026]",
  },
];

/* ------------------------------------------------------------------
   TABS
------------------------------------------------------------------- */
export const TABS = [
  "All Active",
  "Popular",
  "Newest",
  "Food",
  "Groceries",
  "Rides",
  "Events",
  "Tools",
];

/* ------------------------------------------------------------------
   CATEGORY STYLES
------------------------------------------------------------------- */
export const CATEGORY_STYLES = {
  food: {
    name: "food",
    textColor: "#65CADF",
    bgClass: "bg-[rgba(101,202,223,0.16)]",
    badge: "Food",
  },
  groceries: {
    name: "groceries",
    textColor: "#65CADF",
    bgClass: "bg-[rgba(101,202,223,0.16)]",
    badge: "Groceries",
  },
  ride: {
    name: "ride",
    textColor: "#FB9851",
    bgClass: "bg-[rgba(251,152,81,0.16)]",
    badge: "Ride",
  },
  transport: {
    name: "ride",
    textColor: "#FB9851",
    bgClass: "bg-[rgba(251,152,81,0.16)]",
    badge: "Ride",
  },
  event: {
    name: "event",
    textColor: "#65CADF",
    bgClass: "bg-[rgba(101,202,223,0.16)]",
    badge: "Event",
  },
  ticket: {
    name: "event",
    textColor: "#65CADF",
    bgClass: "bg-[rgba(101,202,223,0.16)]",
    badge: "Event",
  },
  tools: {
    name: "tools",
    textColor: "#8B5CF6",
    bgClass: "bg-[rgba(139,92,246,0.16)]",
    badge: "Tools",
  },
  default: {
    name: "other",
    textColor: "#65CADF",
    bgClass: "bg-[rgba(101,202,223,0.16)]",
    badge: "Split",
  },
};

/* ------------------------------------------------------------------
   ONBOARDING STEPS
------------------------------------------------------------------- */
export const steps = [
  {
    title: "What are you most interested in splitting?",
    description:
      "Select all the categories that apply to help us find you relevant splits nearby.",
    type: "multiple",
    options: [
      { id: "groceries", label: "Groceries", icon: UtensilsCrossed },
      { id: "rosca", label: "ROSCA (Esusu)", icon: Briefcase },
      { id: "car", label: "Car / Transport", icon: Truck },
      { id: "accommodation", label: "Accommodation", icon: Hotel },
      { id: "study", label: "Study Materials", icon: BookOpen },
      { id: "bills", label: "Utility Bills", icon: FileInput },
      { id: "bulk", label: "Bulk Purchase", icon: Package },
      { id: "subscriptions", label: "Subscriptions", icon: Headphones },
    ],
    input: "Other Interests",
    placeholder: "e.g. Pet supplies, Gym memberships",
  },
  {
    title: "What is your current situation?",
    description:
      "This helps us match you with relevant hyperlocal opportunities.",
    type: "single",
    options: [
      { id: "student", label: "Student", icon: BookOpen },
      { id: "immigrant", label: "New Immigrant", icon: Globe },
      { id: "traveler", label: "Traveler / Nomad", icon: Plane },
      { id: "professional", label: "Working Professional", icon: Briefcase },
      { id: "micro", label: "Micro Business", icon: Lightbulb },
      { id: "handyman", label: "Handyman", icon: Wrench },
      { id: "events", label: "Event Planner", icon: Zap },
      { id: "religious", label: "Religious Group", icon: Users },
    ],
    input: "Other (if none apply):",
    placeholder: "e.g. Freelancer, Retiree",
  },
  {
    title: "What is most important to you when splitting costs?",
    description: "Choose your top 2 priorities.",
    type: "multiple-limited",
    limit: 2,
    options: [
      { id: "saving", label: "Saving Money", icon: DollarSign },
      { id: "convenience", label: "Convenience", icon: Clock },
      { id: "trust", label: "Trust / Reliability", icon: Check },
      { id: "location", label: "Nearby Location", icon: MapPin },
      { id: "flexibility", label: "Flexibility", icon: Zap },
      { id: "security", label: "Security", icon: Lock },
      { id: "transparency", label: "Transparency", icon: Eye },
      { id: "selection", label: "Flexible Selection", icon: TrendingUp },
    ],
    input: "Other (if none apply):",
    placeholder: "e.g. Speed, Fairness",
  },
  {
    title: "What is your top goal for using Co-splitz?",
    description: "We'll customize your dashboard based on this motivation.",
    type: "single",
    options: [
      { id: "save", label: "Save Money", icon: DollarSign },
      { id: "meet", label: "Meet People", icon: Users },
      { id: "simplify", label: "Simplify Payments", icon: TrendingUp },
      { id: "share", label: "Share Resources", icon: Zap },
      { id: "crowdfunding", label: "Crowdfunding", icon: Lightbulb },
      { id: "time", label: "Time Saving", icon: Clock },
    ],
    input: "Other (if none apply):",
    placeholder: "e.g. Collaboration",
  },
];
