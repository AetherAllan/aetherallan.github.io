# aetherallan.github.io

AetherAllan 的个人网站和博客（Signal Noir），部署在 <https://aetherallan.github.io>。
黑底、Geist 字体、细线分隔。首屏的棱镜是全站唯一的特效和唯一的彩色。

- 首页（`/`）：WebGPU 实时渲染的玻璃棱镜，鼠标移动会改变入射角；不支持 WebGPU 的浏览器显示同一场景预渲染的静态图
- 博客（`/blog/`）：按年份列出全部文章，可按标签筛选
- 文章页（`/blog/<slug>/`）：正文、目录（标出当前章节）、代码高亮
- RSS：`/rss.xml`；站点地图：`/sitemap-index.xml`

用 [Astro](https://astro.build) 构建，内容全部是普通 Markdown / JSON，不绑定任何编辑工具。
棱镜场景来自 [vercel-labs/vgpu](https://github.com/vercel-labs/vgpu)（MIT），见 `src/vendor/vgpu/README.md`。

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

## 写文章

1. **网页编辑器（[Pages CMS](https://pagescms.org)，开源）**：打开 <https://app.pagescms.org>，用 GitHub 登录，
   第一次需要给本仓库安装 Pages CMS 的 GitHub App（可以只选这一个仓库），然后进入 `aetherallan.github.io`。
   - **Writing**：文章列表，右上角新建。正文是所见即所得的 Markdown 编辑器，可切换到源码模式；图片直接拖进去，
     会存到 `public/images/blog/`。
   - **Homepage & profile**：首页文字、作品、链接。
   - 新建时文件名就是网址（`/blog/<文件名>/`），用英文加连字符，保存后不再改。
   - 保存即提交到当前分支；在 `main` 上保存会自动部署，约一分钟后上线。勾选 Draft 则不发布。
   - 配置在仓库根目录的 `.pages.yml`。
2. **本地直接写 Markdown**：`npm run new -- "文章标题" my-slug` 生成草稿，用 Typora、Obsidian、VS Code 等任意编辑器写，
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

推送到 `main` 分支后，`.github/workflows/deploy.yml` 会类型检查、构建并发布到 GitHub Pages。

## 目录

```
src/
  content/blog/      文章
  data/site.json     首页内容
  components/        棱镜首屏、页头页脚、文章列表、标签筛选
  layouts/           页面骨架
  scripts/prism.ts   WebGPU 棱镜的挂载、开场动画、鼠标交互和静态图回退
  vendor/vgpu/       棱镜场景与着色器（MIT，来源见其 README）
  lib/posts.ts       文章查询、日期格式、阅读时长
  pages/             路由：首页、博客、标签、RSS、404
  styles/global.css  全站样式
.pages.yml           Pages CMS 编辑器配置
scripts/new-post.mjs 新建草稿
```
