# 1) Build 스테이지: TypeScript → JavaScript 컴파일
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json, lock 파일만 먼저 복사 → 의존성 설치 레이어 캐시 활용
COPY package*.json ./
RUN npm ci

# 타입스크립트 설정 파일과 소스 코드 복사
COPY tsconfig*.json ./
COPY src ./src
COPY libs ./libs
COPY client ./client

# NestJS 빌드 (dist 폴더 생성)
RUN npm run build

# 2) Production 스테이지: 런타임 환경 구성
FROM node:18-alpine AS runner

WORKDIR /app

# 프로덕션 모드로 설치
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# 빌드된 JS 코드와 node_modules 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# 기본 포트(환경변수로 변경 가능)
EXPOSE 3000

# NestJS 애플리케이션 실행
CMD ["node", "dist/src/main.js"]
