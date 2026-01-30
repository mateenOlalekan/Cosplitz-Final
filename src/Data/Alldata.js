import ticket from "../assets/ticket.jpg";
import shop from "../assets/shop.jpg";
import car from "../assets/car.jpg";

export const deals = [
    {
      badge: "Limited Deal",
      discount: "40% Off",
      title: "Get Special Offer",
      description: "Flash Sale: Shared Taxi",
      details: "All Services Available / T & C Applied",
      time: "15 min left!",
      image: car,
      participants: "3/5 Participants",
      color: "from-[#065026] via-[#0F8542] to-[#065026]",
    },
    {
      badge: "Popular",
      discount: "30% Off",
      title: "Bulk Grocery Deal",
      description: "Flash Sale: Save on Group Orders",
      details: "Fresh Produce / Same Day Delivery",
      time: "30 min left!",
      image: shop,
      participants: "7/10 Participants",
      color: "from-[#065026] via-[#0F8542] to-[#065026]",
    },
    {
      badge: "Newest",
      discount: "20% Off",
      title: "Concert Deal",
      description: "Flash Sale: Shared Taxi",
      details: "Fresh Produce / Same Day Delivery",
      time: "30 min left!",
      image: ticket,
      participants: "7/10 Participants",
      color: "from-[#065026] via-[#0F8542] to-[#065026]",
    },
    {
      badge: "Popular",
      discount: "30% Off",
      title: "Bulk Grocery Deal",
      description: "Flash Sale: Save on Group Orders",
      details: "Fresh Produce / Same Day Delivery",
      time: "30 min left!",
      image: shop,
      participants: "7/10 Participants",
      color: "from-[#065026] via-[#0F8542] to-[#065026]",
    },
    {
      badge: "Newest",
      discount: "20% Off",
      title: "Concert Deal",
      description: "Flash Sale: Shared Taxi",
      details: "Fresh Produce / Same Day Delivery",
      time: "30 min left!",
      image: ticket,
      participants: "7/10 Participants",
      color: "from-[#065026] via-[#0F8542] to-[#065026]",
    },
  ];

export const TABS = ["All Active", "Popular", "Newest", "Food", "Rides", "Tools"];

export const CATEGORY_STYLES = {
  food: {
    name: "food",
    textColor: "#65CADF",
    bgClass: "bg-[rgba(101,202,223,0.16)]",
    badge: "Food",
  },
  groceries: {
    name: "food",
    textColor: "#65CADF",
    bgClass: "bg-[rgba(101,202,223,0.16)]",
    badge: "Food",
  },
  transport: {
    name: "ride",
    textColor: "#FB9851",
    bgClass: "bg-[rgba(251,152,81,0.16)]",
    badge: "Ride",
  },
  ride: {
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