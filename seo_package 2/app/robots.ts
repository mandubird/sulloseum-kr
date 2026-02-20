// app/robots.ts

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'], // API와 관리자 페이지는 크롤링 차단
      },
    ],
    sitemap: 'https://www.ssulo.com/sitemap.xml',
  }
}
