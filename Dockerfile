
# Use an official OpenJDK image as the base image
FROM eclipse-temurin:21-jdk-alpine as build
WORKDIR /app
# Install Maven manually since mvnw is missing
RUN apk add --no-cache maven

COPY backend/pom.xml .
COPY backend/src ./src

# Build using the installed maven
RUN mvn clean package -DskipTests

# Copy the built jar to a new image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
