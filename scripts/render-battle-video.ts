/**
 * 배틀 결과 화면을 쇼츠 규격(9:16) 영상으로 렌더링. (기본 출력: .webm, H.264 MP4는 ffmpeg 후처리로 가능)
 * 사용법: npx tsx scripts/render-battle-video.ts <battleId> [baseUrl]
 * 예: npx tsx scripts/render-battle-video.ts abc123
 * 예: npx tsx scripts/render-battle-video.ts abc123 https://www.ssulo.com
 *
 * 사전 조건: 서버가 baseUrl에서 떠 있어야 함. record=1 모드로 자동 재생 후 녹화.
 */

import { chromium } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

const BATTLE_ID = process.argv[2]
const BASE_URL = (process.argv[3] || 'http://localhost:3000').replace(/\/$/, '')
const OUT_VIDEOS = path.join(process.cwd(), 'outputs', 'videos')
const OUT_METADATA = path.join(process.cwd(), 'outputs', 'metadata')

const VIEWPORT = { width: 1080, height: 1920 }
const RECORD_READY_TIMEOUT_MS = 5 * 60 * 1000 // 5분

async function main() {
  if (!BATTLE_ID) {
    console.error('사용법: npx tsx scripts/render-battle-video.ts <battleId> [baseUrl]')
    process.exit(1)
  }

  fs.mkdirSync(OUT_VIDEOS, { recursive: true })
  fs.mkdirSync(OUT_METADATA, { recursive: true })

  const url = `${BASE_URL}/battle/${BATTLE_ID}?from=board&record=1`
  console.log('URL:', url)
  console.log('뷰포트:', VIEWPORT)
  console.log('녹화 대기 중... (재생이 끝나면 자동 저장)')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir: OUT_VIDEOS, size: VIEWPORT },
    deviceScaleFactor: 1,
  })

  const page = await context.newPage()

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })

    // 페이지에서 'ssulo:record-ready' 이벤트가 발생할 때까지 대기
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        const handler = () => {
          window.removeEventListener('ssulo:record-ready', handler)
          resolve()
        }
        window.addEventListener('ssulo:record-ready', handler)
      })
    })
    console.log('재생 완료, 결과 화면 고정 대기 중...')

    await page.waitForTimeout(1500)

    const video = page.video()
    if (!video) {
      throw new Error('녹화가 시작되지 않았습니다.')
    }
    const videoPath = await video.path()

    await context.close()

    const destPath = path.join(OUT_VIDEOS, `${BATTLE_ID}.webm`)
    if (fs.existsSync(videoPath)) {
      fs.renameSync(videoPath, destPath)
      console.log('저장:', destPath)
    } else {
      console.error('녹화 파일을 찾을 수 없습니다:', videoPath)
      process.exit(1)
    }

    const metaPath = path.join(OUT_METADATA, `${BATTLE_ID}.json`)
    fs.writeFileSync(
      metaPath,
      JSON.stringify(
        {
          battleId: BATTLE_ID,
          videoPath: destPath,
          baseUrl: BASE_URL,
          battleUrl: `${BASE_URL}/battle/${BATTLE_ID}`,
          renderedAt: new Date().toISOString(),
        },
        null,
        2
      )
    )
    console.log('메타:', metaPath)
  } catch (e) {
    await context.close().catch(() => {})
    console.error(e)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

main()
