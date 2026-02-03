
# Use an official OpenJDK image as the base image
FROM eclipse-temurin:21-jdk-alpine as build
WORKDIR /app
COPY backend/pom.xml .
COPY backend/src ./src
COPY backend/.mvn ./.mvn
COPY backend/mvnw .
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# Copy the built jar to a new image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
