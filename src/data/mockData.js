// Mock data for the app - replaces API calls during Phase 1

export const TRANSFORMATIONS = [
  { id: 1, member_name: "Rahul K.", achievement_type: "Weight Loss", summary: "Lost 18kg in 5 months with calisthenics", testimonial: "Cali Terrain changed my life. I went from 95kg to 77kg and gained real strength.", date: "March 2025", image: "/transformations/rahul-weightloss.webp" },
  { id: 2, member_name: "Priya S.", achievement_type: "First Pull-Up", summary: "Achieved first pull-up after 8 weeks of training", testimonial: "I never thought I could do a pull-up. The coaches made it possible!", date: "January 2025", image: "/transformations/priya-pullup.webp" },
  { id: 3, member_name: "Arjun M.", achievement_type: "Handstand", summary: "30-second freestanding handstand after 4 months", testimonial: "The skill progressions here are incredible. Methodical and effective.", date: "February 2025", image: "/transformations/arjun-handstand.webp" },
  { id: 4, member_name: "Sneha R.", achievement_type: "Weight Loss", summary: "Lost 12kg and gained visible muscle definition", testimonial: "Better than any gym I've been to. The community keeps you motivated.", date: "April 2025", image: "/transformations/sneha-transformation.webp" },
  { id: 5, member_name: "Kiran D.", achievement_type: "Kids Achievement", summary: "12-year-old achieved 10 clean pull-ups", testimonial: "My son's confidence has skyrocketed since joining Cali Terrain.", date: "December 2024", image: "/transformations/kiran-kids.webp" },
  { id: 6, member_name: "Vikram P.", achievement_type: "Athletic Conditioning", summary: "Improved 5K time by 4 minutes with conditioning program", testimonial: "The functional fitness program is next level.", date: "November 2024", image: "/transformations/vikram-conditioning.webp" },
];

export const TESTIMONIALS = [
  { id: 1, name: "Arun K.", role: "Member - 1 Year", content: "Best decision I made for my fitness. The coaching here is world-class.", rating: 5 },
  { id: 2, name: "Meena S.", role: "Member - 6 Months", content: "My kids love coming here. The kids program is structured and fun.", rating: 5 },
  { id: 3, name: "Ravi T.", role: "Member - 8 Months", content: "I've tried every gym in Secunderabad. Nothing compares to Cali Terrain.", rating: 5 },
  { id: 4, name: "Lakshmi P.", role: "Member - 3 Months", content: "As a complete beginner, I was nervous. The coaches made me feel welcome from day one.", rating: 5 },
  { id: 5, name: "Deepak R.", role: "Member - 1.5 Years", content: "From zero pull-ups to muscle-ups. The progressive training system works.", rating: 5 },
  { id: 6, name: "Ananya G.", role: "Member - 4 Months", content: "Lost 8kg in 4 months. The combination of training and nutrition guidance is perfect.", rating: 5 },
];

export const GALLERY = [
  { id: 1, url: "/disciplines/calisthenics.webp", caption: "Calisthenics Training Session", category: "training" },
  { id: 2, url: "/community/events.webp", caption: "Group Community Workout", category: "group" },
  { id: 3, url: "/skills/handstand-demo-poster.webp", caption: "Handstand Practice & Alignment", category: "skills" },
  { id: 4, url: "/disciplines/strength.webp", caption: "Heavy Strength Training", category: "training" },
  { id: 5, url: "/journey/foundation.webp", caption: "Beginner Movement Session", category: "training" },
  { id: 6, url: "/transformations/rahul-weightloss.webp", caption: "Member Transformation Milestone", category: "transformation" },
  { id: 7, url: "/disciplines/mobility.webp", caption: "Joint Mobility & Active Recovery", category: "training" },
  { id: 8, url: "/disciplines/functional.webp", caption: "Functional Fitness Circuit", category: "group" },
  { id: 9, url: "/transformations/kiran-kids.webp", caption: "Kids Calisthenics Batch", category: "kids" },
  { id: 10, url: "/coaches/vidya-sagar.webp", caption: "1-on-1 Personal Coaching", category: "training" },
  { id: 11, url: "/facility/panorama.webp", caption: "Facility Panorama & Rig", category: "facility" },
  { id: 12, url: "/community/workshops.webp", caption: "Pull-Up Clinic & Workshop Day", category: "workshop" },
  { id: 13, url: "/disciplines/freestyle.webp", caption: "Freestyle Bar Flow", category: "skills" },
  { id: 14, url: "/disciplines/gymnastics.webp", caption: "Gymnastics Rings Support", category: "skills" },
  { id: 15, url: "/disciplines/hyrox.webp", caption: "HYROX Sled Push Conditioning", category: "training" },
  { id: 16, url: "/community/meetups.webp", caption: "Community Meetup & Bonding", category: "group" },
];

// BLOG_POSTS moved to data/blog.js (the prerenderer imports it for routes).

export const VIDEOS = [];
