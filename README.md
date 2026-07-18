# Athena Chronicles - Full Stack Tech Blog Application

A full stack blogging platform built with Node.js, Express, Sequelize, and MySQL on the backend, and vanilla HTML, CSS, and JavaScript on the frontend. Users can register, log in, create and manage their own blog posts, and browse posts filtered by category.

## Features

- User registration, login, and logout using token based authentication (JWT)
- Users can create, read, update, and delete their own blog posts
- Blog posts can be filtered by category
- A dedicated area where any logged in user can view and manage only their own posts
- A public browsing area where anyone can view all posts, filterable by category
- Blog content is rendered dynamically in the browser based on live API responses
- Passwords are hashed before being stored, and are never returned in any API response

## Technologies Used

- Node.js and Express for the backend server and RESTful API
- Sequelize as the ORM, connected to a MySQL database
- JSON Web Tokens (JWT) for authentication
- bcrypt for password hashing
- Vanilla HTML, CSS, and JavaScript for the frontend
- dotenv for environment variable management

## Folder Structure

- config - database connection setup
- models - Sequelize models for User, Post, and Category, plus their associations
- routes - Express route handlers for users, posts, and categories
- utils - authentication helper functions (token signing and verification)
- seeds - seed data and the script used to populate the database
- public - the frontend files (index.html, style.css, script.js)
- server.js - the application entry point

## Getting Started (Local Setup)
### Prerequisites

- Node.js installed on your machine
- Access to a MySQL server (local install or a hosted MySQL database)

### Installation Steps

1. Clone this repository and navigate into the project folder.

2. Copy the example environment file and rename it:

```bash
cp .env.example .env
```

3. Open the new .env file and fill in your own values, including your MySQL database name, username, password, host, dialect, port, and a JWT secret.

4. Install dependencies:

```bash
npm install
```

5. Set up the database. Log into MySQL and run the schema file to create the database:

```bash
mysql -u root -p < db/schema.sql
```

6. Seed the database with initial data:

```bash
npm run seed
```

7. Start the application locally:

```bash
npm start
```

8. Open the application in your browser:

```
http://localhost:3001
```

## Deploying to Render

1. Push the project to a GitHub repository.
2. Set up a MySQL database with a hosting provider of your choice, since Render does not provide MySQL databases natively.
3. Create a new Web Service on Render and connect it to your GitHub repository.
4. Set the build command to `npm install` and the start command to `npm start`.
5. Add the required environment variables in the Render dashboard, matching the variables used in your local .env file.
6. Deploy the service.
7. Once deployed, run the seed script if needed to populate the live database.

## Live Deployment

Live URL: [add your Render URL here]
GitHub Repository: [add your GitHub repository URL here]

## Usage Guide

1. Register a new account using the registration form.
2. Log in using the login form.
3. Once logged in, use the Create a Post form to publish a new blog post, selecting a category from the dropdown.
4. View, edit, or delete your own posts from the My Posts section.
5. Browse all posts from every user in the Browse by Category section, and use the dropdown to filter by a specific category.
6. Log out using the Logout button when finished.
