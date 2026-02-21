/**
 * 플랫폼별 업로드 화면 셀렉터.
 * UI가 바뀌면 이 파일만 수정하면 됨. 주기적으로 점검 필요.
 */

export const PLATFORMS = {
  youtube: {
    name: 'YouTube Shorts',
    uploadUrl: 'https://studio.youtube.com/',
    /** Shorts 업로드는 Studio에서 "만들기" → "쇼츠 영상 업로드" 후 표시되는 폼 기준 */
    selectors: {
      fileInput: 'input[type="file"][accept*="video"]',
      title: '#textbox[aria-label="제목 추가"]',
      description: '#textbox[aria-label="설명 추가"]',
      // 실제 DOM은 자주 바뀌므로 필요 시 수정
    },
  },
  tiktok: {
    name: 'TikTok',
    uploadUrl: 'https://www.tiktok.com/upload',
    selectors: {
      fileInput: 'input[type="file"][accept*="video"]',
      caption: '[data-e2e="caption-input"], .DraftEditor-root, [contenteditable="true"]',
    },
  },
  x: {
    name: 'X (Twitter)',
    uploadUrl: 'https://twitter.com/compose/post',
    selectors: {
      fileInput: 'input[type="file"][data-testid="fileInput"]',
      textArea: '[data-testid="tweetTextarea_0"], [contenteditable="true"][aria-label*="트윗"]',
    },
  },
} as const
