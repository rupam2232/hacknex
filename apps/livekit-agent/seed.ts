import mongoose from "mongoose";
import dotenv from "dotenv";
import { Job } from "./src/models/Job.js";

dotenv.config();

const SEED_JOBS = [
  {
    title: "Exterior House Painting for Independent Villa",
    skill: "painter",
    region: "Kalyani",
    area: "Kalyani B Block",
    aliases: ["B Block", "Kalyani Station", "Central Park", "Buddha Park", "A Block"],
    dailyWage: 850,
    locationCoordinates: { type: "Point", coordinates: [88.4419, 22.9751] },
    contractorName: "Tapan Mondal",
    contractorPhone: "9830112233",
    status: "active" as const
  },
  {
    title: "Wooden Wardrobe & Door Frame Fitting",
    skill: "carpenter",
    region: "Kalyani",
    area: "Kalyani AIIMS Area",
    aliases: ["AIIMS", "Saguna", "NH 12", "Kalyani Expressway"],
    dailyWage: 950,
    locationCoordinates: { type: "Point", coordinates: [88.4688, 22.9612] },
    contractorName: "Bidyut Karmakar",
    contractorPhone: "9830223344",
    status: "active" as const
  },
  {
    title: "Boundary Wall Brick Laying & Plastering",
    skill: "mason",
    region: "Kalyani",
    area: "Kanchrapara",
    aliases: ["Kanchrapara Station", "Kalyani More", "Workshop Gate", "Gandhi More"],
    dailyWage: 900,
    locationCoordinates: { type: "Point", coordinates: [88.4352, 22.9329] },
    contractorName: "Swapan Halder",
    contractorPhone: "9830334455",
    status: "active" as const
  },
  {
    title: "Factory Internal Wiring & DB Dressing",
    skill: "electrician",
    region: "Kalyani",
    area: "Kalyani Phase 2 Industrial Area",
    aliases: ["Industrial Area", "Silpanchal", "Chakdah More"],
    dailyWage: 900,
    locationCoordinates: { type: "Point", coordinates: [88.4285, 22.9867] },
    contractorName: "Debashis Roy",
    contractorPhone: "9830445566",
    status: "active" as const
  },
  {
    title: "Pipeline Repair & Water Tank Installation",
    skill: "plumber",
    region: "Kalyani",
    area: "Gayeshpur",
    aliases: ["Gayeshpur Municipality", "Bediapara", "Kataganj"],
    dailyWage: 800,
    locationCoordinates: { type: "Point", coordinates: [88.4870, 22.9620] },
    contractorName: "Sukumar Sarkar",
    contractorPhone: "9830556677",
    status: "active" as const
  },
  {
    title: "Full 3BHK Flat Wall Putty & Emulsion Painting",
    skill: "painter",
    region: "Kolkata",
    area: "Salt Lake Sector 5",
    aliases: ["Karunamoyee", "College More", "Ultadanga", "Bidhannagar", "Nicco Park"],
    dailyWage: 900,
    locationCoordinates: { type: "Point", coordinates: [88.4312, 22.5804] },
    contractorName: "Subir Paul",
    contractorPhone: "9830667788",
    status: "active" as const
  },
  {
    title: "Ceiling Polish & Door Varnish Work",
    skill: "painter",
    region: "Kolkata",
    area: "New Town Action Area 1",
    aliases: ["New Town", "Action Area 1", "Rajarhat", "Chinar Park", "Eco Park"],
    dailyWage: 850,
    locationCoordinates: { type: "Point", coordinates: [88.4645, 22.5937] },
    contractorName: "Animesh Mukherjee",
    contractorPhone: "9830778899",
    status: "active" as const
  },
  {
    title: "Modular Kitchen Wooden Cabinet Installation",
    skill: "carpenter",
    region: "Kolkata",
    area: "Gariahat",
    aliases: ["Ballygunge", "Golpark", "Dhakuria", "Southern Avenue"],
    dailyWage: 1000,
    locationCoordinates: { type: "Point", coordinates: [88.3643, 22.5186] },
    contractorName: "Ramen Sen",
    contractorPhone: "9830889900",
    status: "active" as const
  },
  {
    title: "2-Story House Structural Brickwork",
    skill: "mason",
    region: "Kolkata",
    area: "Dum Dum",
    aliases: ["Nagerbazar", "Airport Gate 1", "Cantonment", "Dum Dum Junction"],
    dailyWage: 950,
    locationCoordinates: { type: "Point", coordinates: [88.4208, 22.6450] },
    contractorName: "Bapi Biswas",
    contractorPhone: "9830990011",
    status: "active" as const
  },
  {
    title: "Underground Drainage Pipe Fitting",
    skill: "plumber",
    region: "Kolkata",
    area: "Howrah",
    aliases: ["Shibpur", "Mandirtala", "Howrah Maidan", "Kadamtala"],
    dailyWage: 850,
    locationCoordinates: { type: "Point", coordinates: [88.3247, 22.5958] },
    contractorName: "Kartik Bag",
    contractorPhone: "9831001122",
    status: "active" as const
  }
];

async function main(): Promise<void> {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log("✅ Connected to MongoDB");

  await Job.deleteMany({});
  console.log("🗑️  Cleared existing jobs");

  await Job.insertMany(SEED_JOBS);
  console.log(`🌱 Seeded ${SEED_JOBS.length} jobs successfully`);

  await mongoose.connection.close();
  console.log("👋 MongoDB connection closed");
}

main().catch((err: Error) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
