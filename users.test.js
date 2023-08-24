// Import des modules nécessaires
require("dotenv").config(); // Charger les variables d'environnement depuis un fichier .env
const request = require("supertest"); // Bibliothèque pour effectuer des requêtes HTTP dans les tests
const express = require("express");
const app = express();
const router = require("./routes/users"); // Import du routeur défini pour les utilisateurs
const mongoose = require("mongoose"); // Bibliothèque pour interagir avec la base de données MongoDB
const User = require("./models/users"); // Import du modèle utilisateur

// Récupérer la chaîne de connexion à la base de données depuis les variables d'environnement
const connectionString = process.env.CONNECTION_STRING;
mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected"))
  .catch((error) => console.error(error));

app.use(express.json()); // Middleware pour parser les requêtes JSON
app.use("/", router); // Utilisation du routeur pour les routes commençant par "/"

// Suite de tests pour les routes utilisateur
describe("User Routes", () => {
  // Test : Vérifier si des champs manquent ou sont vides dans la requête
let Dtoken;
  it("should return 400 if missing or empty fields", async () => {
    const response = await request(app).post("/signup").send({
      email: "citadium@citadium.com",
      password: "a",
      type: "Entreprise",
      description: null,
      phone_number: null,
      url_site: null,
      logo: null,
      longitude: 44.823624,
      latitude: -0.558806,
      longitudeDelta: 6420167.59,
      latitudeDelta: 418780.64,
    });

    // Vérifications des réponses attendues

    expect(response.status).toBe(400);
    expect(response.body.result).toBe(false);
    expect(response.body.error).toBe("Champs manquants ou vides");
  });

  it("should return 409 if user already exists", async () => {
    const existingUser = {
      email: "weorg@weorg.com",
      password: "$2b$10$H.UeGg/CAIKn6rB1O1xyeOp3fhxAmdvNHI0SeSR3CvRrE26ouLaIe",
      username: "Yllies",
      name: "We Org",
      address: "26 Rue Pasteur 33200 Bordeaux",
      siret_siren: 418096392,
      type: "Association",
      description:
        "Nous aidons les personnes victimes de phénomènes d’exclusion, les solutions qui leur permettent de redevenir acteur de leur vie",
      phone_number: "04.93.94.01.77",
      url_site: null,
      logo: null,
      longitude: 44.845021,
      latitude: -0.600557,
      longitudeDelta: 6422691.26,
      latitudeDelta: 415592.05,
    };

    const response = await request(app).post("/signup").send(existingUser);

    expect(response.status).toBe(409);
    expect(response.body.result).toBe(false);
    expect(response.body.error).toBe("L'utilisateur existe déjà");
  });

  it("should sign up a new user", async () => {
    const newUser = {
      email: "citadiuma@citadium.com",
      password: "a",
      username: "Adam",
      name: "Citadium",
      address: "28 Rue de forbin 13002 Marseille",
      siret_siren: 381532843,
      type: "Entreprise",
      description:
        "Nous sommes spécialisés dans la vente au détail de vêtements, chaussures et accessoires",
      phone_number: "04.93.94.01.77",
      url_site: null,
      logo: null,
      longitude: 43.305591,
      latitude: 5.369994,
      longitudeDelta: 6248045.87,
      latitudeDelta: 892375.64,
    };

    const response = await request(app).post("/signup").send(newUser);

    expect(response.status).toBe(200);
    expect(response.body.result).toBe(true);
    expect(response.body).toHaveProperty("token");
    Dtoken=response.body.token
  });

  it("should sign in an existing user", async () => {
    const existingUser = {
      email: "citadium@citadium.com",
      password: "a",
    };

    const response = await request(app).post("/signin").send(existingUser);
    console.log(response.body);

    expect(response.status).toBe(200);
    expect(response.body.result).toBe(true);
    expect(response.body).toHaveProperty("token");
  });

  it("should reset user password", async () => {
    const token = "_wH1qTTBPgK_68xopsGjXJF6Kv_D-FSY"; // Replace with an actual token
    const newPassword = "b";

    const response = await request(app)
      .put(`/resetPassword/${token}`)
      .send({
        email: "croixrouge@croixrouge.com",
        username: "Wissem",
        password: newPassword,
      });

    expect(response.status).toBe(200);
    expect(response.body.result).toBe(true);
    expect(response.body.message).toBe("Mot de passe réinitialisé avec succès");
  });

  //   it("should delete a user", async () => {
  //     const token = "userToken";

  //     const response = await request(app).delete(`/delete/${token}`);

  //     expect(response.status).toBe(200);
  //     expect(response.body.result).toBe(true);
  //     expect(response.body.message).toBe("User deleted");
  //   });

  it("should get user by token", async () => {
    const token = "3X3IPqw39L5S740Ey6TdWudJU05EudqH";
    const response = await request(app).get(`/${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("email");
  });

  it("should delete a user", async () => {
    const response = await request(app).delete(`/delete/${Dtoken}`);

    expect(response.status).toBe(200);
    expect(response.body.result).toBe(true);
    expect(response.body.message).toBe("Utilisateur supprimé");
  });
  afterAll(async () => {
    // Fermer la connexion à la base de données après les tests
    await mongoose.connection.close();
  });
});
