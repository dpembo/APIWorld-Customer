FROM openjdk:8-jdk-alpine

# Add Maintainer Info
LABEL maintainer="softwareag"

# Add a volume pointing to /tmp
VOLUME /tmp

ARG PORT=8080
EXPOSE ${PORT}

# The application's jar file
ARG JAR_FILE

# Add the application's jar to the container
ADD ${JAR_FILE} service.jar

# Run the jar file 
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/service.jar"]