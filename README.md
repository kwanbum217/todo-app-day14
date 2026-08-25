# Todo 풀스택 웹 애플리케이션 (Todo Full-Stack App)

> **프로젝트 개요:** Express 백엔드 서버와 Prisma ORM(SQLite), 그리고 바닐라 자바스크립트(Vanilla JS) 기반의 프론트엔드 화면을 연동하여 완성한 Todo CRUD 풀스택 웹 애플리케이션입니다.

---

## 1. 주요 기능 (Features)

- **할 일 조회 (Read)**: 데이터베이스(SQLite)에 저장된 Todo 목록을 최신순으로 조회하여 화면에 렌더링
- **할 일 추가 (Create)**: 입력창을 통해 새로운 Todo를 생성하고 즉시 목록 상단에 반영
- **완료 여부 토글 (Update)**: 체크박스 클릭 시 화면 취소선 처리 및 DB 상태(`isDone`) 동기화
- **인라인 제목 수정 (Update)**: 수정 버튼 클릭 시 인라인 입력창으로 전환되어 실시간 수정 및 저장
- **할 일 삭제 (Delete)**: 삭제 버튼 클릭 시 데이터베이스 및 화면에서 해당 항목 제거
- **진행 통계 (Summary)**: 전체 개수, 완료 개수, 진행률(%)을 실시간으로 계산하여 표시

---

## 2. 기술 스택 (Tech Stack)

| 영역 | 기술 | 설명 |
| :--- | :--- | :--- |
| **프론트엔드** | HTML5, CSS3, JavaScript (ES6+) | 시맨틱 마크업, Clean Blue & White 디자인 토큰, fetch 비동기 통신 |
| **백엔드** | Node.js, Express | RESTful API 서버 구축, express.json() 미들웨어, express.static() 정적 파일 서빙 |
| **데이터베이스 / ORM** | SQLite, Prisma ORM | 파일 기반 관계형 DB(`dev.db`), Prisma Schema 모델 정의 및 마이그레이션 |

---

## 3. 디렉토리 구조 (Directory Structure)

```
day14/
├── package.json          # 프로젝트 의존성 설정 (express, prisma, @prisma/client)
├── package-lock.json     # 의존성 잠금 파일
├── prisma.config.ts      # Prisma 설정 파일
├── server.js             # Express 서버 및 REST API 엔드포인트 라우팅
├── .env                  # 데이터베이스 접속 환경변수 (DATABASE_URL="file:./dev.db")
├── .gitignore            # Git 제외 설정 파일
├── prisma/
│   ├── schema.prisma     # 데이터베이스 스키마 정의 (Todo 모델)
│   ├── dev.db            # SQLite 데이터베이스 파일 (로컬 전용)
│   └── migrations/       # DB 마이그레이션 이력 관리 폴더
└── public/               # 프론트엔드 정적 파일 서빙 폴더
    ├── index.html        # Todo 웹 애플리케이션 화면 마크업
    ├── style.css         # Clean Blue & White 디자인 시스템 스타일시트
    └── script.js         # REST API 비동기 연동 및 UI 인터랙션 스크립트
```

---

## 4. REST API 엔드포인트 명세

| HTTP 메서드 | 엔드포인트 URL | 역할 | 요청 본문 (Request Body) | 응답 (Response) |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/todos` | 전체 Todo 목록 조회 | 없음 | `200 OK` + Todo 배열 JSON |
| **POST** | `/todos` | 신규 Todo 생성 | `{ "title": "할 일 내용" }` | `200 OK` + 생성된 Todo JSON |
| **PUT** | `/todos/:id` | Todo 수정 (제목/완료여부) | `{ "title": "수정 내용" }` 또는 `{ "isDone": true }` | `200 OK` + 수정된 Todo JSON |
| **DELETE** | `/todos/:id` | 특정 Todo 삭제 | 없음 | `200 OK` + 삭제된 Todo JSON |

---

## 5. 시작하기 및 실행 방법 (Getting Started)

### 5.1 패키지 설치
```bash
npm install
```

### 5.2 환경 변수 설정
프로젝트 루트 경로에 `.env` 파일을 생성하고 데이터베이스 URL을 설정합니다:
```env
DATABASE_URL="file:./dev.db"
```

### 5.3 데이터베이스 마이그레이션 실행
Prisma 스키마를 기반으로 SQLite 데이터베이스를 생성하고 클라이언트를 초기화합니다:
```bash
npx prisma migrate dev --name init
```

### 5.4 서버 실행
```bash
node server.js
```

서버 실행 후 웹 브라우저에서 아래 주소로 접속합니다:
- **접속 주소**: `http://localhost:3000`
