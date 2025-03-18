# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Expose ports
EXPOSE 3000 3001 5555

# Set default command with cleanup
CMD ["sh", "-c", "rm -rf node_modules/.cache && \
     cd backend && \
     npm pkg set dependencies.@nestjs/swagger='^7.3.0' dependencies.@nestjs/mapped-types='^2.0.5' dependencies.typeorm='^0.3.20' && \
     cd .. && \
     npm install && \
     cd backend && \
     npx prisma generate && \
     npx prisma db push --accept-data-loss && \
     cd .. && \
     npm run build && \
     cd frontend && npm run start & cd backend && npm run start:prod"] 