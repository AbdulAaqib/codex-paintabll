FROM node:24-alpine AS build
WORKDIR /app
COPY apps/server/package.json ./package.json
RUN npm install --omit=dev --ignore-scripts --no-audit --no-fund
COPY apps/server/src apps/server/src
COPY packages/shared/src packages/shared/src
ENV NODE_ENV=production PORT=3011
USER node
EXPOSE 3011
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "fetch('http://127.0.0.1:3011/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node","apps/server/src/index.ts"]
