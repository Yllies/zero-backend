const request = require("supertest");
const express = require("express");
const app = express();
const router = require("./routes"); // Chemin vers le fichier contenant les routes
const mongoose = require("mongoose");
const User = require("./models/users");
const PostCompany = require("./models/posts_companies");
const PostAssociation = require("./models/posts_associations");
const uniqid = require("uniqid");

const connectionString = process.env.CONNECTION_STRING;
mongoose
  .connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Database connected"))
  .catch((error) => console.error(error));


app.use(express.json());
app.use("/", router);

describe('GET /posts/company', () => {
  it('should retrieve all company posts', async () => {
    const response = await request(app).get('/posts/company');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('posts');
    expect(Array.isArray(response.body.posts)).toBe(true);

  });

  it('should handle errors if the route is not defined', async () => {
    const response = await request(app).get('/posts/nonexistent');

    expect(response.status).toBe(404);
  });
});

describe('GET /charity', () => {
  it('should retrieve all charity posts', async () => {
    // Create mock data for the test
    const mockPosts = [
      { title: 'Post 1', description: 'Description 1', category: 'Category A' },
      { title: 'Post 2', description: 'Description 2', category: 'Category B' },
    ];

    // Use jest.spyOn to mock the PostAssociation.find method
    const findSpy = jest.spyOn(PostAssociation, 'find').mockResolvedValue(mockPosts);

    const response = await request(app).get('/charity');

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('posts', mockPosts);

    // Restore the original implementation of PostAssociation.find
    findSpy.mockRestore();
  });

  });
s


