# 1) Build 스테이지: TypeScript → JavaScript 컴파일
FROM node:18-alpine AS builder
WORKDIR /app

# package.json만 먼저 복사 → 의존성 설치 레이어 캐시 활용
COPY package*.json ./
RUN npm ci

# 소스 전체 복사 (src, libs, client 포함)
COPY . .

# NestJS 빌드 (dist 폴더 생성) + postbuild에서 client 복사까지
RUN npm run build

 # 2) Production 스테이지: 런타임 환경 구성
 FROM node:18-alpine AS runner
 WORKDIR /app

 ENV NODE_ENV=production
 COPY package*.json ./
 RUN npm ci --only=production --ignore-scripts

 # 빌드 결과물과 모듈 복사
 COPY --from=builder /app/dist ./dist
 COPY --from=builder /app/node_modules ./node_modules

 COPY --from=builder /app/client ./client

EXPOSE 3000 
CMD ["node", "dist/src/main.js"]
