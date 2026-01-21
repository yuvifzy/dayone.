
# ZenTask: Enterprise-Grade Full-Stack App

## Architecture
- **Backend**: Spring Boot 3.2, Java 17, Spring Security (JWT), Spring Data JPA.
- **Frontend**: React 18, Vite, Tailwind CSS, Axios, Lucide Icons, Gemini AI Integration.
- **Database**: PostgreSQL.

## How to Run Local

### 1. Database Setup
Ensure PostgreSQL is running on `localhost:5432`.
Create a database named `zentask`:
```sql
CREATE DATABASE zentask;
```

### 2. Backend Setup
1. Open the `/backend` folder.
2. Ensure you have Maven and JDK 17 installed.
3. Update `src/main/resources/application.yml` with your PostgreSQL credentials.
4. Run: `mvn spring-boot:run`
5. The API will be available at `http://localhost:8080`.

### 3. Frontend Setup
1. In the project root, ensure you have Node.js 18+.
2. Install dependencies: `npm install`
3. Run: `npm run dev`
4. Access the app at `http://localhost:5173`.

## Security Implementation
- **JWT**: Stateless authentication where the server signs a token containing the user's claims.
- **BCrypt**: Passwords are never stored in plain text.
- **Auth Guard**: React routes are protected using a context-based provider.
- **CORS**: Backend is configured to specifically allow requests from the Vite port.

## Common Issues & Fixes
- **401 Unauthorized**: Check if the token is present in LocalStorage.
- **CORS Errors**: Ensure the backend's allowed origins list `http://localhost:5173`.
- **DB Connection Fail**: Verify your PostgreSQL service is active and credentials match `application.yml`.
