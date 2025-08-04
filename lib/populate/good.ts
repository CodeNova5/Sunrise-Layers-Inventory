import { faker } from "@faker-js/faker";
import Good from "../inventory/models/good";
import { goodCategories } from "../stores/good-store";

const productData = [
  {
    category: "Engine Components",
    products: [
      {
        name: "Oil filter",
        description: "High-performance oil filter for engine protection",
        sku: "ENG-001",
      },
      {
        name: "Spark plug",
        description: "Durable spark plug for better combustion efficiency",
        sku: "ENG-002",
      },
      {
        name: "Piston",
        description: "Aluminum piston for high-performance engines",
        sku: "ENG-003",
      },
      {
        name: "Timing belt",
        description: "Reinforced timing belt for accurate engine timing",
        sku: "ENG-004",
      },
    ],
  },
  {
    category: "Transmission Parts",
    products: [
      {
        name: "Gearbox",
        description: "Heavy-duty gearbox for smooth transmission",
        sku: "TRN-001",
      },
      {
        name: "Clutch plate",
        description: "High-friction clutch plate for better performance",
        sku: "TRN-002",
      },
      {
        name: "Transmission fluid",
        description: "High-quality transmission fluid for smooth shifting",
        sku: "TRN-003",
      },
      {
        name: "Flywheel",
        description: "Lightweight flywheel for improved throttle response",
        sku: "TRN-004",
      },
    ],
  },
  {
    category: "Suspension and Steering",
    products: [
      {
        name: "Shock absorber",
        description: "Hydraulic shock absorber for smooth ride",
        sku: "SUS-001",
      },
      {
        name: "Coil spring",
        description: "High-strength coil spring for suspension support",
        sku: "SUS-002",
      },
      {
        name: "Tie rod",
        description: "Durable tie rod for precise steering",
        sku: "SUS-003",
      },
      {
        name: "Steering rack",
        description: "Power steering rack for easy handling",
        sku: "SUS-004",
      },
    ],
  },
  {
    category: "Brakes",
    products: [
      {
        name: "Brake pad",
        description: "High-performance brake pads for smooth stopping",
        sku: "BRK-001",
      },
      {
        name: "Brake rotor",
        description: "Vented brake rotors for enhanced heat dissipation",
        sku: "BRK-002",
      },
      {
        name: "Brake caliper",
        description: "Precision brake calipers for even braking pressure",
        sku: "BRK-003",
      },
      {
        name: "Brake fluid",
        description: "High-temperature brake fluid for optimal performance",
        sku: "BRK-004",
      },
    ],
  },
  {
    category: "Exhaust System",
    products: [
      {
        name: "Muffler",
        description: "Stainless steel muffler for reduced noise",
        sku: "EXT-001",
      },
      {
        name: "Exhaust pipe",
        description: "Durable exhaust pipe for high-flow performance",
        sku: "EXT-002",
      },
      {
        name: "Catalytic converter",
        description:
          "Emission-reducing catalytic converter for cleaner exhaust",
        sku: "EXT-003",
      },
      {
        name: "Oxygen sensor",
        description: "Oxygen sensor for efficient fuel-air mixture",
        sku: "EXT-004",
      },
    ],
  },
  {
    category: "Electrical Components",
    products: [
      {
        name: "Battery",
        description: "Long-lasting car battery for reliable starting power",
        sku: "ELE-001",
      },
      {
        name: "Alternator",
        description: "High-output alternator for powering electrical systems",
        sku: "ELE-002",
      },
      {
        name: "Starter",
        description: "Heavy-duty starter motor for reliable engine starts",
        sku: "ELE-003",
      },
      {
        name: "Fuse",
        description: "Car fuses for protecting electrical circuits",
        sku: "ELE-004",
      },
    ],
  },
  {
    category: "Cooling System",
    products: [
      {
        name: "Radiator",
        description: "Aluminum radiator for efficient engine cooling",
        sku: "COOL-001",
      },
      {
        name: "Water pump",
        description: "High-flow water pump for improved cooling",
        sku: "COOL-002",
      },
      {
        name: "Thermostat",
        description: "Accurate thermostat for temperature control",
        sku: "COOL-003",
      },
      {
        name: "Coolant",
        description: "Engine coolant for protecting against overheating",
        sku: "COOL-004",
      },
    ],
  },
  {
    category: "Tires and Wheels",
    products: [
      {
        name: "Tire",
        description: "All-season tire for enhanced grip and durability",
        sku: "TIR-001",
      },
      {
        name: "Rim",
        description: "Aluminum alloy rim for lightweight strength",
        sku: "TIR-002",
      },
      {
        name: "Wheel bearing",
        description: "Precision wheel bearings for smooth rotation",
        sku: "TIR-003",
      },
      {
        name: "Lug nut",
        description: "Heavy-duty lug nuts for secure wheel installation",
        sku: "TIR-004",
      },
    ],
  },
  {
    category: "Lighting and Mirrors",
    products: [
      {
        name: "Headlight",
        description: "Bright LED headlight for enhanced night visibility",
        sku: "LGT-001",
      },
      {
        name: "Taillight",
        description: "Durable taillight for rear visibility",
        sku: "LGT-002",
      },
      {
        name: "Side mirror",
        description: "Heated side mirrors for clear view in all weather",
        sku: "LGT-003",
      },
      {
        name: "Fog light",
        description: "High-intensity fog lights for better visibility in fog",
        sku: "LGT-004",
      },
    ],
  },
  {
    category: "Fluids and Lubricants",
    products: [
      {
        name: "Engine oil",
        description: "Synthetic engine oil for superior lubrication",
        sku: "FLD-001",
      },
      {
        name: "Brake fluid",
        description: "High-performance brake fluid for optimal braking",
        sku: "FLD-002",
      },
      {
        name: "Transmission fluid",
        description: "Automatic transmission fluid for smooth gear shifts",
        sku: "FLD-003",
      },
      {
        name: "Power steering fluid",
        description: "Fluid for ensuring smooth power steering operation",
        sku: "FLD-004",
      },
    ],
  },
];

export default async function populateGoods() {
  await Good.deleteMany({}).exec();
  const goods = [];
  for (const data of productData) {
    for (const product of data.products) {
      const good = new Good({
        name: product.name,
        description: product.description,
        productId: product.sku,
        costPrice: faker.commerce.price({min: 5000, max: 50000}), // Random price between 5000 and 50000
        qty: Math.floor(Math.random() * 100), // Random number between 0 and 100
        minQty: Math.floor(Math.random() * 10), // Random number between 0 and 10
        categories: [data.category],
      });
      await good.save();
      goods.push(good);
    }
  }
  return goods;
}
