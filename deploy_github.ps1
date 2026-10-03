param (
    [string]$RepoUrl = ""
)

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Soul Enneagram - GitHub 배포 & 자동화 스크립트 " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. 데이터 업데이트 테스트 및 실행
Write-Host "[1/4] 데이터 업데이트 스크립트 (update_data.ps1) 실행 중..." -ForegroundColor Yellow
$updateScript = Join-Path $PSScriptRoot "update_data.ps1"
if (Test-Path $updateScript) {
    & $updateScript
    Write-Host "  -> 데이터 업데이트 완료!" -ForegroundColor Green
} else {
    Write-Host "  -> update_data.ps1 스크립트를 찾을 수 없습니다." -ForegroundColor Red
}

# 2. Git 설치 여부 확인 및 초기화
Write-Host "[2/4] Git 환경 확인 중..." -ForegroundColor Yellow
$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCmd) {
    $possibleGitPaths = @(
        "C:\Program Files\Git\cmd\git.exe",
        "C:\Program Files (x86)\Git\cmd\git.exe",
        "$env:LocalAppData\Programs\Git\cmd\git.exe"
    )
    foreach ($p in $possibleGitPaths) {
        if (Test-Path $p) {
            $gitCmd = $p
            break
        }
    }
}

if (-not $gitCmd) {
    Write-Host "  [경고] Git이 컴퓨터에 설치되어 있지 않거나 PATH에 추가되어 있지 않습니다." -ForegroundColor Red
    Write-Host "  GitHub 웹사이트(https://github.com)에서 [Add file] -> [Upload files] 버튼을 통해" -ForegroundColor Yellow
    Write-Host "  project_1 폴더 전체를 직접 업로드하셔도 됩니다!" -ForegroundColor Yellow
    Write-Host "--------------------------------------------------"
    Write-Host "GitHub Pages 설정 안내:" -ForegroundColor Cyan
    Write-Host "1. GitHub Repository 생성" -ForegroundColor White
    Write-Host "2. 프로젝트 파일 업로드" -ForegroundColor White
    Write-Host "3. 저장소 Settings -> Pages 이동" -ForegroundColor White
    Write-Host "4. Build and deployment -> Source를 'GitHub Actions'로 선택" -ForegroundColor White
    exit 0
}

$gitExec = if ($gitCmd.Path) { $gitCmd.Path } else { $gitCmd }

Set-Location $PSScriptRoot
if (-not (Test-Path ".git")) {
    Write-Host "  -> Git 저장소를 초기화합니다 (git init)..." -ForegroundColor Yellow
    & $gitExec init
    & $gitExec branch -M main
}

# 3. 변경 사항 커밋
Write-Host "[3/4] 파일 스테이징 및 커밋 생성 중..." -ForegroundColor Yellow
& $gitExec add .
& $gitExec commit -m 'Deploy project_1 static site with GitHub Actions deployment workflow'

# 4. GitHub Remote 추가 및 Push
Write-Host "[4/4] Remote 저장소 확인 중..." -ForegroundColor Yellow
$remotes = & $gitExec remote -v

if (-not $remotes -and [string]::IsNullOrWhiteSpace($RepoUrl)) {
    Write-Host ""
    $RepoUrl = Read-Host "GitHub Repository URL을 입력하세요 (예: https://github.com/사용자ID/저장소이름.git)"
}

if (-not [string]::IsNullOrWhiteSpace($RepoUrl)) {
    & $gitExec remote remove origin 2>$null
    & $gitExec remote add origin $RepoUrl
    Write-Host "  -> 원격 저장소 Remote가 설정되었습니다: $RepoUrl" -ForegroundColor Green
}

$currentRemotes = & $gitExec remote -v
if ($currentRemotes) {
    Write-Host "  -> GitHub로 코드 푸시 실행 중 (git push -u origin main)..." -ForegroundColor Yellow
    & $gitExec push -u origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 GitHub 저장소 푸시 완료!" -ForegroundColor Green
        Write-Host "==================================================" -ForegroundColor Cyan
        Write-Host "GitHub Pages 배포 설정 완료 방법:" -ForegroundColor Yellow
        Write-Host "1. GitHub 저장소 페이지 접속" -ForegroundColor White
        Write-Host "2. [Settings] -> [Pages] 탭 이동" -ForegroundColor White
        Write-Host "3. [Build and deployment] -> [Source] 항목에서 'GitHub Actions' 선택" -ForegroundColor White
        Write-Host "4. 몇 분 후 https://<username>.github.io/<repository-name>/ 주소로 퍼블리싱 됩니다!" -ForegroundColor Green
        Write-Host "==================================================" -ForegroundColor Cyan
    } else {
        Write-Host "  [!] git push 과정에서 실패했습니다. GitHub 인증 정보를 확인해 주세요." -ForegroundColor Red
    }
} else {
    Write-Host "  [!] 원격 저장소 URL이 입력되지 않아 로컬 Git 커밋만 완료되었습니다." -ForegroundColor Yellow
}
