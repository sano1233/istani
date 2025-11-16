# ISTANI Autonomous AI Agent - Docker Configuration
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install git (required for GitHub operations)
RUN apk add --no-cache git openssh-client

# Copy package files
COPY ai-agent/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy agent code
COPY ai-agent/ ./

# Create non-root user for security
RUN addgroup -g 1001 -S aiagent && \
    adduser -S aiagent -u 1001 && \
    chown -R aiagent:aiagent /app

# Switch to non-root user
USER aiagent

# Expose webhook server port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

# Start webhook server
CMD ["npm", "start"]
