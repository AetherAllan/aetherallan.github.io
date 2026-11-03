# aetherallan.github.io

AetherAllan 的个人网站和博客，月相主题，部署在 <https://aetherallan.github.io>。

- 首页（`/`）：介绍、工作方向、作品、最新文章，右侧是按访问者当天时间绘制的“今晚的月亮”
- 博客（`/blog/`）：按年份列出全部文章，每篇标注写作当晚的月相，可按标签筛选
- 文章页（`/blog/<slug>/`）：正文、目录、代码高亮；右下角的小月亮随阅读进度从新月盈到满月
- 夜间（默认）/白昼两套配色，右上角切换
- RSS：`/rss.xml`；站点地图：`/sitemap-index.xml`

用 [Astro](https://astro.build) 构建，内容全部是普通 Markdown / JSON，不绑定任何编辑工具。

## 内容在哪里

| 内容 | 位置 |
| --- | --- |
| 博客文章 | `src/content/blog/*.md`（文件名就是网址） |
| 首页文字、作品、链接 | `src/data/site.json` |
| 头像 | `src/assets/avatar.png` |
| 文章图片 | `public/images/blog/`（文中写 `/images/blog/xxx.png`） |

文章的 frontmatter：

```yaml
---
title: "标题"
description: "一两句话的简介，显示在列表和 RSS 里"
pubDate: 2026-11-03T21:00:00+08:00
updatedDate: 2026-11-04T10:00:00+08:00   # 可选
tags: ["Web3", "CTF"]
lang: zh            # en 或 zh
draft: false        # true 时不会发布
---
```

## 写文章的三种方式

1. **网页后台（Sveltia CMS）**：打开 <https://aetherallan.github.io/admin/>，选 “Sign In Using Access Token”，
   填一个只授权本仓库、Contents 读写权限的 GitHub fine-grained token。保存即提交到 `v5`，自动部署。
   （“Sign In with GitHub” 需要另外部署 OAuth 服务，这里没有配置，用 token 即可。）
2. **本地后台**：`npm run dev` 后用 Chrome / Edge 打开 <http://localhost:4321/admin/index.html>，
   选 “Work with Local Repository”，选中本仓库目录。改动直接写进本地文件，自己提交推送。
3. **直接写 Markdown**：`npm run new -- "文章标题" my-slug` 生成草稿，用 VS Code、Obsidian 等任意编辑器写，
   把 `draft` 改成 `false` 后提交推送。

## 本地开发

需要 Node 24（见 `.node-version`）。

```sh
npm ci
npm run dev      # http://localhost:4321
npm run check    # 类型检查
npm run build    # 输出到 dist/
npm run preview  # 预览构建结果
```

## 部署

推送到 `v5` 分支后，`.github/workflows/deploy.yml` 会类型检查、构建并发布到 GitHub Pages。

## 目录

```
src/
  content/blog/      文章
  data/site.json     首页内容
  components/        月相图标、今晚的月亮、文章列表等
  layouts/           页面骨架
  lib/moon.ts        月相计算和绘制（无外部依赖）
  lib/posts.ts       文章查询、日期格式、阅读时长
  pages/             路由：首页、博客、标签、RSS、404
  styles/global.css  全站样式与两套配色
public/admin/        Sveltia CMS 后台配置
scripts/new-post.mjs 新建草稿
```
