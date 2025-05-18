# Authentication Server (NestJS)

NestJS 기반의 인증 서버로, Google OAuth2 로그인을 처리하고 API 서버와 클라이언트 간의 안전한 통신을 위한 JWT 토큰을 전달합니다.

---

## Links

* Swagger UI: [Swagger UI](https://authentication.image-converter.yubinshin.com/docs)
* Architecture Overview: [Project README](https://github.com/yubin-image-converter/k8s)

---

## Directory Structure

```bash
.
├── src
│   ├── auth                # OAuth2 컨트롤러 및 DTO
│   ├── config
│   │   ├── security        # Helmet 및 보안 설정
│   │   └── validation      # Joi 기반 환경변수 스키마
│   └── main.ts             # 애플리케이션 부트스트랩
├── libs/service            # 재사용 가능한 비즈니스 로직 모듈
│   ├── auth                # Google 인증 서비스, 상수, 인터페이스
│   └── ulid                # ULID 생성기 모듈
├── client/public           # 리디렉션 처리를 위한 정적 자산
├── Dockerfile              # 컨테이너 설정
├── test                    # E2E 테스트 설정 (구현 예정)
```

---

## Tech Stack

- **프레임워크**: NestJS
- **인증 방식**: Google OAuth2
- **토큰 처리**: JWT (access token 클라이언트 전달)
- **환경 설정 검증**: Joi 스키마 기반
- **보안 모듈**: Helmet 적용
- **고유 ID 생성**: 커스텀 ULID 서비스 모듈

---

## Features

- Google OAuth2 로그인 엔드포인트
  - `/auth/signin?provider=google`
- 콜백 처리 및 사용자 정보 수신
   - `/auth/callback/google`
- API 서버에서 발급한 JWT accessToken을 클라이언트에 전달
- 토큰 기반 리디렉션으로 클라이언트 인증 상태 통합

---

## Testing

* Jest + Supertest 기반 테스트 환경 구성 예정

---

## Deployment & Operations

* GitHub Actions + Docker 기반 CI 파이프라인 구성
* Docker Hub 이미지 빌드 및 푸시
* Argo CD 기반 GKE GitOps 배포
* Sealed Secrets를 통한 Kubernetes 보안 구성

---

## Design Highlights

- 인증 전용 서버로 API 서버와 명확히 분리된 구조
- NestJS 모듈 시스템에 최적화된 OAuth2 플로우 구성
- OAuth 및 JWT 인증으로 프론트엔드 인증 상태 간소화
- `libs/service`로 인증 및 유틸 서비스의 재사용성 극대화
- Helmet 적용을 통한 보안 헤더 관리 독립화

---

## Why use `libs/service`?

이 디렉토리는 인증, ULID 생성 등 재사용 가능한 서비스 로직을 애플리케이션 레이어와 분리하여 제공합니다. 동일 모노레포 내 여러 NestJS 애플리케이션에서 임포트하여 사용할 수 있도록 설계되어 있어, 코드 재사용성과 도메인-프레임워크 분리를 통한 유지보수성 및 확장성을 확보할 수 있습니다.

---

## Author

**Yubin Shin**
OAuth 인증 흐름 구현, 보안 아키텍처 설계, JWT 기반 로그인 처리 담당

---

## License

MIT © Yubin Shin
