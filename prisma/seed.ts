import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Services (ServiceCustomisation)
  const services = [
    // Entretien
    { name: "Vidange", category: "Entretien", price: 50000 },
    { name: "Vidange + Filtres", category: "Entretien", price: 100000 },
    { name: "Contrôle technique", category: "Entretien", price: 75000 },
    { name: "Révision complète", category: "Entretien", price: 200000 },
    { name: "Remplacement liquide de frein", category: "Entretien", price: 80000 },
    { name: "Purge liquide refroidissement", category: "Entretien", price: 60000 },

    // Réparation
    { name: "Changement plaquettes avant", category: "Réparation", price: 150000 },
    { name: "Changement plaquettes arrière", category: "Réparation", price: 150000 },
    { name: "Changement disques + plaquettes AV", category: "Réparation", price: 350000 },
    { name: "Changement disques + plaquettes AR", category: "Réparation", price: 300000 },
    { name: "Changement amortisseurs (x4)", category: "Réparation", price: 500000 },
    { name: "Remplacement embrayage", category: "Réparation", price: 400000 },
    { name: "Remplacement radiateur", category: "Réparation", price: 250000 },
    { name: "Remplacement alternateur", category: "Réparation", price: 200000 },
    { name: "Changement courroie distribution", category: "Réparation", price: 450000 },
    { name: "Réparation boîte de vitesse", category: "Réparation", price: 800000 },

    // Performance
    { name: "Reprogrammation Stage 1", category: "Performance", price: 500000 },
    { name: "Reprogrammation Stage 2", category: "Performance", price: 1000000 },
    { name: "Installation turbo", category: "Performance", price: 2000000 },
    { name: "Installation supercharger", category: "Performance", price: 2500000 },
    { name: "Échappement sport", category: "Performance", price: 600000 },
    { name: "Admission directe", category: "Performance", price: 300000 },
    { name: "Suspension sport", category: "Performance", price: 700000 },
    { name: "Kit freinage performance", category: "Performance", price: 800000 },

    // Esthétique
    { name: "Polissage carrosserie", category: "Esthétique", price: 200000 },
    { name: "Covering partiel", category: "Esthétique", price: 500000 },
    { name: "Covering complet", category: "Esthétique", price: 1500000 },
    { name: "Pose film teinté", category: "Esthétique", price: 300000 },
    { name: "Débosselage", category: "Esthétique", price: 150000 },
    { name: "Peinture pare-choc", category: "Esthétique", price: 250000 },
    { name: "Peinture complète", category: "Esthétique", price: 2000000 },
    { name: "Nettoyage intérieur complet", category: "Esthétique", price: 100000 },

    // Divers
    { name: "Diagnostic électronique", category: "Divers", price: 50000 },
    { name: "Montage pneus (x4)", category: "Divers", price: 80000, hasQuantity: true },
    { name: "Équilibrage", category: "Divers", price: 40000 },
    { name: "Parallélisme", category: "Divers", price: 100000 },
    { name: "Remorquage", category: "Divers", price: 150000 },
    { name: "Main d'œuvre (heure)", category: "Divers", price: 50000, hasQuantity: true },
  ];

  await prisma.serviceCustomisation.createMany({ data: services });
  console.log(`✅ Created ${services.length} services`);

  // Vehicles
  const vehicles = [
    // Sport
    { name: "BMW M4", category: "Sport" },
    { name: "BMW M3", category: "Sport" },
    { name: "Audi RS6", category: "Sport" },
    { name: "Audi RS3", category: "Sport" },
    { name: "Mercedes C63 AMG", category: "Sport" },
    { name: "Toyota Supra MK5", category: "Sport" },
    { name: "Nissan 370Z", category: "Sport" },
    { name: "Nissan GT-R R35", category: "Sport" },
    { name: "Ford Mustang GT", category: "Sport" },
    { name: "Chevrolet Camaro SS", category: "Sport" },

    // SUV
    { name: "BMW X5 M", category: "SUV" },
    { name: "Audi RSQ8", category: "SUV" },
    { name: "Mercedes GLE 63 AMG", category: "SUV" },
    { name: "Porsche Cayenne Turbo", category: "SUV" },
    { name: "Lamborghini Urus", category: "SUV" },
    { name: "Range Rover Sport", category: "SUV" },

    // Supercar
    { name: "Ferrari 488 GTB", category: "Supercar" },
    { name: "Lamborghini Huracán", category: "Supercar" },
    { name: "McLaren 720S", category: "Supercar" },
    { name: "Porsche 911 GT3", category: "Supercar" },
    { name: "Audi R8 V10", category: "Supercar" },

    // Berline
    { name: "BMW M5", category: "Berline" },
    { name: "Mercedes E63 AMG", category: "Berline" },
    { name: "Audi RS7", category: "Berline" },
    { name: "Dodge Charger SRT", category: "Berline" },

    // Classique
    { name: "Nissan Skyline R34", category: "Classique" },
    { name: "Toyota Supra MK4", category: "Classique" },
    { name: "Mazda RX-7 FD", category: "Classique" },
    { name: "Honda NSX", category: "Classique" },
    { name: "BMW E30 M3", category: "Classique" },

    // Compact
    { name: "Volkswagen Golf R", category: "Compact" },
    { name: "Honda Civic Type R", category: "Compact" },
    { name: "Ford Focus RS", category: "Compact" },
    { name: "Mercedes A45 AMG", category: "Compact" },
    { name: "Audi RS3 Sportback", category: "Compact" },
  ];

  await prisma.vehicle.createMany({ data: vehicles });
  console.log(`✅ Created ${vehicles.length} vehicles`);

  // Collaborations
  const collaborations = [
    { name: "LSPD", advantageType: "percentage", discountPercent: 15 },
    { name: "BCSO", advantageType: "percentage", discountPercent: 15 },
    { name: "EMS", advantageType: "percentage", discountPercent: 20 },
    { name: "Weazel News", advantageType: "percentage", discountPercent: 10 },
    { name: "LifeInvader", advantageType: "percentage", discountPercent: 10 },
    { name: "Taxi", advantageType: "percentage", discountPercent: 5 },
  ];

  await prisma.collaboration.createMany({ data: collaborations });
  console.log(`✅ Created ${collaborations.length} collaborations`);

  // Recruitment questions
  const questions = [
    { label: "Avez-vous déjà travaillé dans un autre garage sur le serveur ?", fieldName: "experience_garage", sortOrder: 1 },
    { label: "Que pensez-vous pouvoir apporter à l'équipe ?", fieldName: "apport_equipe", sortOrder: 2 },
    { label: "Comment gérez-vous un client mécontent ?", fieldName: "gestion_client", sortOrder: 3 },
  ];

  await prisma.recruitmentQuestion.createMany({ data: questions });
  console.log(`✅ Created ${questions.length} recruitment questions`);

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
