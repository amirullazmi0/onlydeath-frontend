FROM node:22-alpine AS build

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

COPY . .

# NEXT_PUBLIC_* is baked into the browser bundle, so it has to exist at build time
ARG NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false
ENV NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=$NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION

RUN yarn build

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3400

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

EXPOSE 3400

CMD ["sh", "-c", "npx next start -H 0.0.0.0 -p 3400"]
