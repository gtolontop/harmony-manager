import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Service Categories
  const categories = await Promise.all([
    prisma.serviceCategory.create({ data: { name: "Entretien" } }),
    prisma.serviceCategory.create({ data: { name: "Réparation" } }),
    prisma.serviceCategory.create({ data: { name: "Performance" } }),
    prisma.serviceCategory.create({ data: { name: "Esthétique" } }),
    prisma.serviceCategory.create({ data: { name: "Divers" } }),
  ]);

  console.log(`✅ Created ${categories.length} service categories`);

  // Services
  const services = [
    // Entretien
    { name: "Vidange", price: 50000, categoryId: categories[0].id },
    { name: "Vidange + Filtres", price: 100000, categoryId: categories[0].id },
    { name: "Contrôle technique", price: 75000, categoryId: categories[0].id },
    { name: "Révision complète", price: 200000, categoryId: categories[0].id },
    { name: "Remplacement liquide de frein", price: 80000, categoryId: categories[0].id },
    { name: "Purge liquide refroidissement", price: 60000, categoryId: categories[0].id },

    // Réparation
    { name: "Changement plaquettes avant", price: 150000, categoryId: categories[1].id },
    { name: "Changement plaquettes arrière", price: 150000, categoryId: categories[1].id },
    { name: "Changement disques + plaquettes AV", price: 350000, categoryId: categories[1].id },
    { name: "Changement disques + plaquettes AR", price: 300000, categoryId: categories[1].id },
    { name: "Changement amortisseurs (x4)", price: 500000, categoryId: categories[1].id },
    { name: "Remplacement embrayage", price: 400000, categoryId: categories[1].id },
    { name: "Remplacement radiateur", price: 250000, categoryId: categories[1].id },
    { name: "Remplacement alternateur", price: 200000, categoryId: categories[1].id },
    { name: "Changement courroie distribution", price: 450000, categoryId: categories[1].id },
    { name: "Réparation boîte de vitesse", price: 800000, categoryId: categories[1].id },

    // Performance
    { name: "Reprogrammation Stage 1", price: 500000, categoryId: categories[2].id },
    { name: "Reprogrammation Stage 2", price: 1000000, categoryId: categories[2].id },
    { name: "Installation turbo", price: 2000000, categoryId: categories[2].id },
    { name: "Installation supercharger", price: 2500000, categoryId: categories[2].id },
    { name: "Échappement sport", price: 600000, categoryId: categories[2].id },
    { name: "Admission directe", price: 300000, categoryId: categories[2].id },
    { name: "Suspension sport", price: 700000, categoryId: categories[2].id },
    { name: "Kit freinage performance", price: 800000, categoryId: categories[2].id },

    // Esthétique
    { name: "Polissage carrosserie", price: 200000, categoryId: categories[3].id },
    { name: "Covering partiel", price: 500000, categoryId: categories[3].id },
    { name: "Covering complet", price: 1500000, categoryId: categories[3].id },
    { name: "Pose film teinté", price: 300000, categoryId: categories[3].id },
    { name: "Débosselage", price: 150000, categoryId: categories[3].id },
    { name: "Peinture pare-choc", price: 250000, categoryId: categories[3].id },
    { name: "Peinture complète", price: 2000000, categoryId: categories[3].id },
    { name: "Nettoyage intérieur complet", price: 100000, categoryId: categories[3].id },

    // Divers
    { name: "Diagnostic électronique", price: 50000, categoryId: categories[4].id },
    { name: "Montage pneus (x4)", price: 80000, categoryId: categories[4].id },
    { name: "Équilibrage", price: 40000, categoryId: categories[4].id },
    { name: "Parallélisme", price: 100000, categoryId: categories[4].id },
    { name: "Remorquage", price: 150000, categoryId: categories[4].id },
    { name: "Main d'œuvre (heure)", price: 50000, categoryId: categories[4].id },
  ];

  await prisma.service.createMany({ data: services });
  console.log(`✅ Created ${services.length} services`);

  // Vehicles
  const vehicles = [
    // Sport
    { name: "M4", brand: "BMW", category: "Sport", basePrice: 2500000 },
    { name: "M3", brand: "BMW", category: "Sport", basePrice: 2300000 },
    { name: "RS6", brand: "Audi", category: "Sport", basePrice: 3500000 },
    { name: "RS3", brand: "Audi", category: "Sport", basePrice: 1800000 },
    { name: "C63 AMG", brand: "Mercedes", category: "Sport", basePrice: 2800000 },
    { name: "Supra MK5", brand: "Toyota", category: "Sport", basePrice: 2000000 },
    { name: "370Z", brand: "Nissan", category: "Sport", basePrice: 1500000 },
    { name: "GT-R R35", brand: "Nissan", category: "Sport", basePrice: 4000000 },
    { name: "Mustang GT", brand: "Ford", category: "Sport", basePrice: 1800000 },
    { name: "Camaro SS", brand: "Chevrolet", category: "Sport", basePrice: 1700000 },

    // SUV
    { name: "X5 M", brand: "BMW", category: "SUV", basePrice: 3000000 },
    { name: "RSQ8", brand: "Audi", category: "SUV", basePrice: 4500000 },
    { name: "GLE 63 AMG", brand: "Mercedes", category: "SUV", basePrice: 4000000 },
    { name: "Cayenne Turbo", brand: "Porsche", category: "SUV", basePrice: 5000000 },
    { name: "Urus", brand: "Lamborghini", category: "SUV", basePrice: 8000000 },
    { name: "Range Rover Sport", brand: "Land Rover", category: "SUV", basePrice: 3500000 },

    // Supercar
    { name: "488 GTB", brand: "Ferrari", category: "Supercar", basePrice: 10000000 },
    { name: "Huracán", brand: "Lamborghini", category: "Supercar", basePrice: 9000000 },
    { name: "720S", brand: "McLaren", category: "Supercar", basePrice: 12000000 },
    { name: "911 GT3", brand: "Porsche", category: "Supercar", basePrice: 6000000 },
    { name: "R8 V10", brand: "Audi", category: "Supercar", basePrice: 5500000 },

    // Berline
    { name: "M5", brand: "BMW", category: "Berline", basePrice: 2200000 },
    { name: "E63 AMG", brand: "Mercedes", category: "Berline", basePrice: 2500000 },
    { name: "RS7", brand: "Audi", category: "Berline", basePrice: 2800000 },
    { name: "Charger SRT", brand: "Dodge", category: "Berline", basePrice: 1500000 },

    // Classique
    { name: "Skyline R34", brand: "Nissan", category: "Classique", basePrice: 3500000 },
    { name: "Supra MK4", brand: "Toyota", category: "Classique", basePrice: 3000000 },
    { name: "RX-7 FD", brand: "Mazda", category: "Classique", basePrice: 2500000 },
    { name: "NSX", brand: "Honda", category: "Classique", basePrice: 2800000 },
    { name: "E30 M3", brand: "BMW", category: "Classique", basePrice: 2000000 },

    // Compact
    { name: "Golf R", brand: "Volkswagen", category: "Compact", basePrice: 1200000 },
    { name: "Civic Type R", brand: "Honda", category: "Compact", basePrice: 1100000 },
    { name: "Focus RS", brand: "Ford", category: "Compact", basePrice: 1000000 },
    { name: "A45 AMG", brand: "Mercedes", category: "Compact", basePrice: 1500000 },
    { name: "RS3 Sportback", brand: "Audi", category: "Compact", basePrice: 1600000 },
  ];

  await prisma.vehicle.createMany({ data: vehicles });
  console.log(`✅ Created ${vehicles.length} vehicles`);

  // Collaborations
  const collaborations = [
    { name: "LSPD", discountType: "percentage" as const, discountValue: 15, isActive: true },
    { name: "BCSO", discountType: "percentage" as const, discountValue: 15, isActive: true },
    { name: "EMS", discountType: "percentage" as const, discountValue: 20, isActive: true },
    { name: "Weazel News", discountType: "percentage" as const, discountValue: 10, isActive: true },
    { name: "LifeInvader", discountType: "percentage" as const, discountValue: 10, isActive: true },
    { name: "Taxi", discountType: "fixed" as const, discountValue: 100000, isActive: true },
  ];

  await prisma.collaboration.createMany({ data: collaborations });
  console.log(`✅ Created ${collaborations.length} collaborations`);

  // Candidature questions
  const questions = [
    { label: "Avez-vous déjà travaillé dans un autre garage sur le serveur ?", order: 1, isActive: true },
    { label: "Que pensez-vous pouvoir apporter à l'équipe ?", order: 2, isActive: true },
    { label: "Comment gérez-vous un client mécontent ?", order: 3, isActive: true },
  ];

  await prisma.candidatureQuestion.createMany({ data: questions });
  console.log(`✅ Created ${questions.length} candidature questions`);

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
