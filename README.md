# 🕊️ Soul Enneagram - 에니어그램 18개 날개 진단 및 맞춤 성경 말씀 웹 서비스

이 프로젝트는 10가지 정밀 질문을 통해 사용자의 에니어그램 18개 날개 유형을 판별하고, 내면의 성향에 맞는 성경 구절과 닮은 성경 인물 프로필, 묵상 및 기도문을 제공하는 웹 애플리케이션입니다.

---

## 🚀 GitHub Repository 업로드 및 GitHub Pages 웹 퍼블리싱 가이드

### 방법 1. 자동 배포 스크립트 사용 (추천)

PowerShell 환경에서 제공되는 `deploy_github.ps1` 스크립트를 사용하여 손쉽게 GitHub에 올릴 수 있습니다.

1. **GitHub 저장소 생성**
   - [GitHub.com](https://github.com) 로그인 후 `New repository` 클릭
   - Repository name 입력 (예: `soul-enneagram`) 후 `Public` 선택하여 생성 (README 생성 안함)

2. **배포 스크립트 실행**
   - PowerShell에서 `project_1` 디렉토리로 이동 후 아래 명령 실행:
     ```powershell
     .\deploy_github.ps1 -RepoUrl "https://github.com/당신의_아이디/저장소_이름.git"
     ```

3. **GitHub Pages 활성화**
   - 생성한 GitHub 저장소의 `Settings` -> `Pages` 탭으로 이동합니다.
   - **Build and deployment** 항목의 **Source**를 `GitHub Actions`로 설정합니다.
   - `.github/workflows/deploy.yml` 파일에 의해 자동으로 웹사이트가 빌드 및 퍼블리싱됩니다!

---

### 방법 2. GitHub 웹사이트 direct 웹 업로드 사용

Git CLI가 설치되어 있지 않은 경우, 웹 브라우저만으로도 손쉽게 배포할 수 있습니다.

1. [GitHub.com](https://github.com)에서 새로운 Public Repository를 생성합니다.
2. 생성된 저장소 메인 화면에서 **`uploading an existing file`** 링크를 클릭합니다.
3. `project_1` 폴더 내의 모든 파일과 폴더를 Drag & Drop하여 올립니다.
   - `index.html`
   - `css/`
   - `js/`
   - `images/`
   - `.nojekyll`
   - `.github/`
4. 화면 하단의 **Commit changes** 버튼을 클릭합니다.
5. 저장소 `Settings` -> `Pages` -> **Source**를 `GitHub Actions` (또는 `Deploy from a branch` -> `main` / `root`)로 설정하면 퍼블리싱이 완료됩니다!

---

## 💻 로컬 개발 및 테스트 실행

### PowerShell 백엔드 서버 실행
```powershell
.\run.ps1
# 또는 run.bat 클릭
```
서버 실행 후 브라우저에서 `http://localhost:8080/`으로 접속할 수 있습니다.

### 데이터 업데이트 스크립트
```powershell
.\update_data.ps1
```

---

## 📁 주요 디렉토리 구조

```
project_1/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages 자동 배포 CI/CD 워크플로우
├── css/
│   └── style.css               # 디자인 모듈 및 다크/라이트 테마
├── images/                     # 성경 인물 이미지 및 SVG 에셋
├── js/
│   ├── app.js                  # UI 컨트롤러 및 인터랙션 핸들러
│   ├── data.js                 # 10개 질문 데이터 & 18개 날개 유형 DB
│   └── enneagram.js            # 에니어그램 점수 계산 및 날개 도출 엔진
├── .gitignore                  # Git 추적 제외 파일 설정
├── .nojekyll                   # GitHub Pages Jekyll 우회 파일
├── index.html                  # 메인 HTML 페이지
├── package.json                # 프로젝트 구성 및 npm 스크립트
├── update_data.ps1             # 동적 데이터 갱신 백엔드 스크립트 (상대 경로 적용)
├── server.ps1                  # 로컬 테스트용 PowerShell HTTP 서버
├── deploy_github.ps1           # GitHub 자동 배포 도우미 스크립트
└── README.md                   # 프로젝트 사용 설명서
```
