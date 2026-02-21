/**
 * 플랫폼별 업로드 화면까지 자동 진입 및 제목/캡션/영상 입력.
 * 최종 게시 버튼은 운영자가 직접 클릭.
 *
 * 사용법: npx tsx scripts/open-publish-session.ts <battleId>
 * 사전: prepare-publish.ts 로 메타 생성, render-battle-video.ts 로 영상 생성 권장.
 */

import * as fs from 'fs'
import * as path from 'path'
import { chromium } from 'playwright'
import { PLATFORMS } from './publish-selectors'

const BATTLE_ID = process.argv[2]
const OUT_METADATA = path.join(process.cwd(), 'outputs', 'metadata')
const OUT_VIDEOS = path.join(process.cwd(), 'outputs', 'videos')

async function main() {
  if (!BATTLE_ID) {
    console.error('사용법: npx tsx scripts/open-publish-session.ts <battleId>')
    process.exit(1)
  }

  const metaPath = path.join(OUT_METADATA, `${BATTLE_ID}-publish.json`)
  if (!fs.existsSync(metaPath)) {
    console.error('메타 파일이 없습니다. 먼저 실행: npx tsx scripts/prepare-publish.ts', BATTLE_ID)
    process.exit(1)
  }

  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
  const videoPath = path.join(OUT_VIDEOS, `${BATTLE_ID}.webm`)
  if (!fs.existsSync(videoPath)) {
    console.warn('영상 파일 없음:', videoPath, '(영상 없이 캡션만 입력 시도)')
  }

  const browser = await chromium.launch({ headless: false })

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    acceptDownloads: true,
  })

  const fillYouTube = async (page: any) => {
    const { selectors } = PLATFORMS.youtube
    try {
      await page.goto(PLATFORMS.youtube.uploadUrl, { waitUntil: 'domcontentloaded', timeout: 15000 })
      await page.waitForTimeout(3000)
      const fileInput = await page.$(selectors.fileInput)
      if (fileInput && videoPath && fs.existsSync(videoPath)) {
        await fileInput.setInputFiles(videoPath)
        await page.waitForTimeout(2000)
      }
      const titleEl = await page.$(selectors.title)
      if (titleEl) await titleEl.fill(meta.youtube.title)
      const descEl = await page.$(selectors.description)
      if (descEl) await descEl.fill(meta.youtube.description)
      console.log('YouTube: 입력 시도 완료. 게시 버튼은 직접 클릭하세요.')
    } catch (e) {
      console.warn('YouTube 입력 중 오류:', (e as Error).message)
    }
  }

  const fillTikTok = async (page: any) => {
    const { selectors } = PLATFORMS.tiktok
    try {
      await page.goto(PLATFORMS.tiktok.uploadUrl, { waitUntil: 'domcontentloaded', timeout: 15000 })
      await page.waitForTimeout(3000)
      const fileInput = await page.$(selectors.fileInput)
      if (fileInput && videoPath && fs.existsSync(videoPath)) {
        await fileInput.setInputFiles(videoPath)
        await page.waitForTimeout(2000)
      }
      const captionEl = await page.$(selectors.caption)
      if (captionEl) await captionEl.fill(meta.tiktok.caption)
      console.log('TikTok: 입력 시도 완료. 게시 버튼은 직접 클릭하세요.')
    } catch (e) {
      console.warn('TikTok 입력 중 오류:', (e as Error).message)
    }
  }

  const fillX = async (page: any) => {
    const { selectors } = PLATFORMS.x
    try {
      await page.goto(PLATFORMS.x.uploadUrl, { waitUntil: 'domcontentloaded', timeout: 15000 })
      await page.waitForTimeout(3000)
      const textEl = await page.$(selectors.textArea)
      if (textEl) await textEl.fill(meta.x.text)
      const fileInput = await page.$(selectors.fileInput)
      if (fileInput && videoPath && fs.existsSync(videoPath)) {
        await fileInput.setInputFiles(videoPath)
      }
      console.log('X: 입력 시도 완료. 게시 버튼은 직접 클릭하세요.')
    } catch (e) {
      console.warn('X 입력 중 오류:', (e as Error).message)
    }
  }

  const page1 = await context.newPage()
  const page2 = await context.newPage()
  const page3 = await context.newPage()

  await fillYouTube(page1)
  await fillTikTok(page2)
  await fillX(page3)

  console.log('---')
  console.log('세 탭이 열렸습니다. 각 플랫폼에서 최종 검수 후 게시 버튼을 눌러주세요.')
  console.log('브라우저를 닫으면 세션이 종료됩니다.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
