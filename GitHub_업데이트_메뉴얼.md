# 📤 GitHub 업데이트 메뉴얼

코드가 수정되면(직접 수정했거나, Cursor/AI가 수정했거나) **이 파일을 보고** 아래 순서대로 하면 됩니다.

---

## 1. 터미널 열기

- **Mac**: Cursor 하단 **터미널** 탭 클릭  
- 또는 **Terminal** 앱 실행 후, 프로젝트 폴더로 이동:
  ```bash
  cd /Users/gimmingyu/Desktop/2025/Sulloseum_KR
  ```

---

## 2. GitHub에 올리는 명령어 (3개만 기억)

코드 수정 후 **매번** 아래를 순서대로 실행하세요.

```bash
git add .
```
→ 변경된 파일 전부 선택

```bash
git commit -m "오늘 수정한 내용 한 줄 요약"
```
→ **따옴표 안(" ")을 지우고, 실제로 수정한 내용을 한 줄로 적어 넣기**  
  예: `git commit -m "메인 타이틀 줄바꿈 수정"`  
  예: `git commit -m "배틀 데미지 상향, HP 50으로 조정"`  
  예: `git commit -m "모바일 AI 구분용 VS·컬러 추가"`

```bash
git push
```
→ GitHub 저장소(mandubird/sulloseum-kr)로 업로드

---

## 3. 한 줄로 실행하고 싶을 때

```bash
git add . && git commit -m "수정 내용 요약" && git push
```
→ **"수정 내용 요약" 부분을 지우고, 오늘 한 수정을 한 줄로 적기**  
  예: `git add . && git commit -m "GitHub 메뉴얼 코멘트 보강" && git push`

---

## 4. 자주 하는 실수

| 상황 | 해결 |
|------|------|
| `git push` 했는데 Vercel 빌드가 실패함 | Vercel 대시보드에서 **환경 변수** 확인 (Supabase, OpenAI 키) |
| "nothing to commit" 나옴 | 수정한 파일이 없거나, 이미 commit 한 상태. 그냥 `git push`만 하면 됨 |
| "Permission denied" / 인증 오류 | GitHub 로그인 다시 하거나, Personal Access Token 사용 |

---

## 5. 저장소 주소 (참고)

- **GitHub**: https://github.com/mandubird/sulloseum-kr  
- **Vercel**: 푸시하면 자동 배포됨 (연동돼 있으면)

---

**정리: 수정했으면 → `git add .` → `git commit -m "메시지"` → `git push`**

이 메뉴얼은 프로젝트 폴더 **`GitHub_업데이트_메뉴얼.md`** 에 있습니다. 헷갈리면 이 파일을 열어서 보세요.
