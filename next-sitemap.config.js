/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://gruposhort.com.ar',
  generateRobotsTxt: false, // Ya tenemos robots.txt manual
  generateIndexSitemap: false,
  exclude: ['/admin', '/debug'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    additionalSitemaps: [
      'https://gruposhort.com.ar/sitemap.xml',
    ],
  },
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
} 