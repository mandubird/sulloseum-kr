'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import html2canvas from 'html2canvas'
import { Download, Share2, X, Copy, Check } from 'lucide-react'

interface ScreenshotShareProps {
  battleId: string
  arenaRef: React.RefObject<HTMLDivElement>
  onClose: () => void
}

export default function ScreenshotShare({ battleId, arenaRef, onClose }: ScreenshotShareProps) {
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [copied, setCopied] = useState(false)

  const captureScreenshot = async () => {
    if (!arenaRef.current) return

    setIsCapturing(true)
    try {
      const canvas = await html2canvas(arenaRef.current, {
        backgroundColor: null,
        scale: 2,
      })

      const imageData = canvas.toDataURL('image/png')
      setScreenshot(imageData)
    } catch (error) {
      console.error('Error capturing screenshot:', error)
      alert('스크린샷 생성에 실패했습니다.')
    } finally {
      setIsCapturing(false)
    }
  }

  const downloadScreenshot = () => {
    if (!screenshot) return

    const link = document.createElement('a')
    link.href = screenshot
    link.download = `sulloseum-battle-${battleId}.png`
    link.click()
  }

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/battle/${battleId}`
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareToSNS = (platform: 'twitter' | 'facebook' | 'kakao') => {
    const shareLink = `${window.location.origin}/battle/${battleId}`
    const text = '썰로세움에서 AI 떡밥 배틀을 즐겨보세요!'

    let url = ''
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareLink)}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`
        break
      case 'kakao':
        // Kakao share would require Kakao SDK initialization
        alert('카카오톡 공유는 추후 지원 예정입니다.')
        return
    }

    window.open(url, '_blank', 'width=600,height=400')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-display mb-2">🎉 배틀 종료!</h2>
          <p className="text-gray-600">전투 결과를 저장하고 공유하세요</p>
        </div>

        {/* Screenshot Preview */}
        {screenshot ? (
          <div className="mb-6">
            <img src={screenshot} alt="Battle Screenshot" className="w-full rounded-xl shadow-lg" />
          </div>
        ) : (
          <div className="mb-6 text-center">
            <button
              onClick={captureScreenshot}
              disabled={isCapturing}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isCapturing ? '캡처 중...' : '📸 스크린샷 캡처하기'}
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          {/* Download */}
          {screenshot && (
            <button
              onClick={downloadScreenshot}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors"
            >
              <Download className="w-5 h-5" />
              이미지 다운로드
            </button>
          )}

          {/* Copy Link */}
          <button
            onClick={copyShareLink}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                링크 복사됨!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                배틀 링크 복사
              </>
            )}
          </button>

          {/* SNS Share */}
          <div>
            <p className="text-sm text-gray-600 mb-3">SNS 공유:</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => shareToSNS('twitter')}
                className="px-4 py-3 bg-blue-400 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
              >
                𝕏 Twitter
              </button>
              <button
                onClick={() => shareToSNS('facebook')}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors"
              >
                f Facebook
              </button>
              <button
                onClick={() => shareToSNS('kakao')}
                className="px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl font-bold transition-colors"
              >
                💬 Kakao
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
