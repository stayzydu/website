export const HARDCODED_PGS = [
  {
    _id: "hc-1",
    name: "Sunrise Girls PG",
    location: "Kamla Nagar",
    pgFor: "Girls",
    mealTypes: ["Breakfast", "Dinner"],
    commonAmenities: ["Wi-Fi Availability", "AC", "CCTV Surveillance", "Laundry Service", "Power Backup", "Security Guard"],
    thingsToKnow: {
      allowed: ["Food from outside allowed", "Guests allowed in common area till 8PM"],
      notAllowed: ["Male guests in rooms", "Smoking inside premises", "Pets"],
    },
    images: [
      { url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80", publicId: "hc1-1" },
      { url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80", publicId: "hc1-2" },
      { url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80", publicId: "hc1-3" },
    ],
    rooms: [
      { type: "Single", pricePerBed: 10500, amenities: ["AC", "Study Table", "Wardrobe", "Attached Bathroom"], images: [{ url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80" }, { url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80" }] },
      { type: "Double", pricePerBed: 8500, amenities: ["Fan", "Study Table", "Wardrobe"], images: [{ url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80" }, { url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&q=80" }] },
    ],
  },
  {
    _id: "hc-2",
    name: "GTB Nagar Boys PG",
    location: "GTB Nagar",
    pgFor: "Boys",
    mealTypes: ["Breakfast", "Lunch", "Dinner"],
    commonAmenities: ["Wi-Fi Availability", "Study Table", "Power Backup", "Security Guard", "Parking", "CCTV Surveillance"],
    thingsToKnow: {
      allowed: ["Outside food allowed", "24-hour access"],
      notAllowed: ["Female guests in rooms", "Alcohol", "Smoking"],
    },
    images: [
      { url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80", publicId: "hc2-1" },
      { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", publicId: "hc2-2" },
      { url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80", publicId: "hc2-3" },
    ],
    rooms: [
      { type: "Double", pricePerBed: 7500, amenities: ["Fan", "Study Table", "Chair"], images: [{ url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&q=80" }, { url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80" }] },
      { type: "Triple", pricePerBed: 6000, amenities: ["Fan", "Study Table"], images: [{ url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80" }] },
    ],
  },
  {
    _id: "hc-3",
    name: "Hudson Lane Residency",
    location: "Hudson Lane",
    pgFor: "Both",
    mealTypes: ["Breakfast", "Lunch", "Dinner", "Snacks"],
    commonAmenities: ["AC", "Wi-Fi Availability", "Elevator", "Daily Housekeeping", "Power Backup", "Common Dining Area", "CCTV Surveillance"],
    thingsToKnow: {
      allowed: ["Guests in common area till 9PM", "Food delivery allowed", "Weekend checkout"],
      notAllowed: ["Smoking", "Alcohol", "Loud music after 10PM"],
    },
    images: [
      { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", publicId: "hc3-1" },
      { url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80", publicId: "hc3-2" },
      { url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80", publicId: "hc3-3" },
    ],
    rooms: [
      { type: "Single", pricePerBed: 12000, amenities: ["AC", "Study Table", "Wardrobe", "Attached Bathroom", "Balcony Access"], images: [{ url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80" }, { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80" }] },
      { type: "Double", pricePerBed: 9500, amenities: ["AC", "Study Table", "Wardrobe"], images: [{ url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80" }, { url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80" }] },
    ],
  },
  {
    _id: "hc-4",
    name: "DU North Campus Stay",
    location: "Chhatra Marg",
    pgFor: "Girls",
    mealTypes: ["Breakfast", "Dinner"],
    commonAmenities: ["Wi-Fi Availability", "AC", "Daily Housekeeping", "CCTV Surveillance", "Security Guard", "Power Backup"],
    thingsToKnow: {
      allowed: ["Food from outside allowed", "Guests till 7PM in common area"],
      notAllowed: ["Male guests beyond reception", "Smoking", "Pets", "Alcohol"],
    },
    images: [
      { url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80", publicId: "hc4-1" },
      { url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80", publicId: "hc4-2" },
      { url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80", publicId: "hc4-3" },
    ],
    rooms: [
      { type: "Single", pricePerBed: 11000, amenities: ["AC", "Study Table", "Wardrobe", "Attached Bathroom"], images: [{ url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80" }, { url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&q=80" }] },
      { type: "Double", pricePerBed: 8800, amenities: ["AC", "Study Table", "Chair"], images: [{ url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80" }] },
    ],
  },
  {
    _id: "hc-5",
    name: "Vijay Nagar Nest",
    location: "Vijay Nagar",
    pgFor: "Boys",
    mealTypes: ["Breakfast"],
    commonAmenities: ["Wi-Fi Availability", "Fan", "Parking", "Security Guard", "Power Backup"],
    thingsToKnow: {
      allowed: ["24-hour access", "Cooking in common kitchen", "Guests anytime in common area"],
      notAllowed: ["Smoking inside rooms", "Loud music"],
    },
    images: [
      { url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80", publicId: "hc5-1" },
      { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", publicId: "hc5-2" },
      { url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80", publicId: "hc5-3" },
    ],
    rooms: [
      { type: "Double", pricePerBed: 7000, amenities: ["Fan", "Study Table", "Chair", "Wardrobe"], images: [{ url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80" }, { url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80" }] },
      { type: "Triple", pricePerBed: 5500, amenities: ["Fan", "Study Table"], images: [{ url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80" }] },
    ],
  },
  {
    _id: "hc-6",
    name: "Mukherjee Nagar Abode",
    location: "Mukherjee Nagar",
    pgFor: "Both",
    mealTypes: ["Breakfast", "Lunch", "Dinner"],
    commonAmenities: ["Wi-Fi Availability", "Study Table", "Wardrobe", "Common Dining Area", "Power Backup", "CCTV Surveillance"],
    thingsToKnow: {
      allowed: ["Guests in common area till 8PM", "Outside food allowed"],
      notAllowed: ["Smoking", "Alcohol", "Pets"],
    },
    images: [
      { url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80", publicId: "hc6-1" },
      { url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80", publicId: "hc6-2" },
      { url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80", publicId: "hc6-3" },
    ],
    rooms: [
      { type: "Single", pricePerBed: 9500, amenities: ["Fan", "Study Table", "Wardrobe", "Attached Bathroom"], images: [{ url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&q=80" }, { url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80" }] },
      { type: "Double", pricePerBed: 7800, amenities: ["Fan", "Study Table", "Wardrobe"], images: [{ url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80" }] },
      { type: "Triple", pricePerBed: 6200, amenities: ["Fan", "Study Table"], images: [{ url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80" }] },
    ],
  },
];
