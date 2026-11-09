---
title: markdown Claude 跨端地区检测机制调查手记
description: Claude 跨端地区检测机制调查手记
pubDate: 2026-11-09T00:37:00Z
lang: en
draft: false
---
```markdown
# Claude 跨端地区检测机制调查手记

> 逆向分析参考：[AetherAllan/clauderev](https://github.com/AetherAllan/clauderev)  
> 分析样本：Claude Desktop 3.1623.0（macOS / Windows）、Claude Code CLI 2.1.306、Claude Android 1.261019.20

平时大家聊起 Claude 封号或者「所在地区不可用」，很多人第一反应就是「梯子节点不干净」或者「IP 飘了」。但只要你把各端客户端解包、把源码拉出来看一下，就会发现事情根本不是这么回事。

这篇文章，我们就顺着开源逆向仓库里的证据，带大家把 Android、macOS、Windows 以及终端命令行（Claude Code CLI）逐端拆解透彻，看看客户端到底背着我们给服务端上报了哪些数据，以及服务端究竟是凭什么一眼识破你的。

---

## 核心结论：先给大伙儿交个底

在深入代码之前，我们先把四个最核心的结论摆在这儿，大家心里好有个底：

1. **客户端根本不配做决策**：所有客户端里压根没有任何国家名单或者封禁规则。客户端做的事情只有两件——**采集你系统里各种改不掉的硬信号上报**，以及**把服务端甩回来的错误码翻译成 UI 弹窗**。
2. **挂梯子为什么总是不管用**：VPN 只能改变网络最外层的出口 IP。但客户端报上去的时区、语言、SIM 运营商、Play 商店国家全是真实系统的底细。当「美国机房 IP」遇上「东八区时区 + 中文语言」，服务端不用任何高深算法，直接判定冲突拒绝。
3. **强烈建议弃用 Android 端**：如果说桌面端只是暗戳戳地漏几项配置，那 Android 端简直就是把你的家底全盘托出。在受限地区用 Android 客户端，无异于直接向风控系统自首。
4. **换号不等于解封，清本地指纹有代价**：换设备密钥会消耗服务端的设备登记配额；如果账号和组织已经被标记，在同一台机器上频繁换密钥注册新号，反而会触发更严格的风控连坐。

---

## 第一部分：Android 逆向拆解 —— 为什么劝你立刻卸载？

先从大家最关心的 Android 端说起。反编译完分包 APK（`com.anthropic.claude` 1.261019.20，jadx 扫出来 4 万多个类），我们发现移动端的环境复杂程度远超预期。

### 目录
- [1. 显式查询：RegionSupport 到底在查什么？](#1-显式查询regionsupport-到底在查什么)
- [2. 服务端下发的拒绝码：各路闸门一览](#2-服务端下发的拒绝码各路闸门一览)
- [3. 梯子根本动不了的底层硬信号](#3-梯子根本动不了的底层硬信号)
  - [3.1 Google Play 账户国家：底层的终身烙印](#31-google-play-账户国家底层的终身烙印)
  - [3.2 手机号归属地：一票否决](#32-手机号归属地一票否决)
  - [3.3 SIM 运营商：Datadog RUM 悄悄上报](#33-sim-运营商datadog-rum-悄悄上报)
  - [3.4 设备密钥证明与现场签名挑战](#34-设备密钥证明与现场签名挑战)
- [4. 登录期 Attestation 与 Play Integrity](#4-登录期-attestation-与-play-integrity)
- [5. 5 秒一次的高频动态配置（remote_config）](#5-5-秒一次的高频动态配置remote_config)
- [6. 强制下线：服务端说踢就踢](#6-强制下线服务端说踢就踢)

---

### 1. 显式查询：RegionSupport 到底在查什么？

你在手机上点开注册或验证，客户端并不会在本地判断你的地区，而是老老实实向后端发送一个名为 `SendPhoneVerificationCodeRequest` 的请求（定义在 `defpackage/j5w.java`）。

服务端给它返回的结构体长这样（`defpackage/y9t.java`）：

```java
// defpackage/y9t.java
PluginGeneratedSerialDescriptor pluginGeneratedSerialDescriptor =
    new PluginGeneratedSerialDescriptor(
        "com.anthropic.claude.api.verification.RegionSupport", y9tVar, 2);
pluginGeneratedSerialDescriptor.l("claudeai_supported", true);
pluginGeneratedSerialDescriptor.l("phone_verification_supported", true);
descriptor = pluginGeneratedSerialDescriptor;
```

大家注意看，服务端把 `claudeai_supported`（ClaudeAI 服务是否支持）和 `phone_verification_supported`（手机号验证是否支持）拆成了两个独立的布尔值。这就意味着哪怕你的 IP 看上去能用，只要手机号归属地不在支持列表里，后一个布尔值直接为 false，整个验证流立马卡死。

---

### 2. 服务端下发的拒绝码：各路闸门一览

客户端拿到服务端的判定后，会去查本地的错误枚举。代码里把拒绝原因分得清清楚楚：

- **账号与地区闸门（`defpackage/j08.java`）**：
  - `signups_disabled_in_region`：该地区禁止注册；
  - `region_missing`：地区判定失败（一般意味着服务端拿到的特征太混乱，判不出来）；
  - `account_banned` / `account_needs_verification`：账号被封或需要人工/KYC 审核。
- **手机号闸门（`defpackage/m08.java`）**：
  - `unsupported_phone_number_geo`：只要号码所属国家不对，直接阻断。
- **设备证明闸门**：
  - `missing_client_attestation` / `trusted_device_attestation_failed`：设备签名对不上。

---

### 3. 梯子根本动不了的底层硬信号

看到这儿你可能会想：「我手机挂全局代理，把定位权限关了不就得了吗？」  
别天真了，来看看客户端真正读的是什么：

#### 3.1 Google Play 账户国家：底层的终身烙印
在 `defpackage/l4j.java`（case 18）里，有这么一段调用：

```java
// defpackage/l4j.java
try {
    if (l6hVar.b(this) == npbVar18) return npbVar18;
} catch (Throwable th2) {
    SilentException.a(new SilentException(
        "Play Store country lookup failed: ".concat(lbj.e(th2))), null, null, 7);
}
```

这里它调的是 Google Play 官方内购库的 `IInAppBillingGetBillingConfigCallback`，直接抓取你 Google 账号绑定的 **`BillingConfig.countryCode`**。  
这个国家代码是由 Google 官方服务器维护的，每年只允许改一次。你代理挂到火星，Google Play 报上来的依然是你绑卡/注册时的老家。

#### 3.2 手机号归属地：一票否决
没啥好说的，只要注册流程里提交了非支持国家的手机号，触发 `unsupported_phone_number_geo`，当前流程当场暴毙。

#### 3.3 SIM 运营商：Datadog RUM 悄悄上报
在 Datadog RUM 的设备上下文中，客户端采集了这一长串设备参数：

```text
brand, architecture, locale, locales, time_zone,
carrier_name, cellular, total_ram, is_low_ram ...
```

请大家看清楚：**`carrier_name`（运营商名字，比如中国移动/联通）和 `cellular`（蜂窝网络制式）是白纸黑字写在采集列表里的。** 桌面端可没有插 SIM 卡这回事，但手机端后台直接把运营商名字送了过去。

#### 3.4 设备密钥证明与现场签名挑战
客户端不仅上报静态数据，还引入了一套基于设备公私钥的证明体系（`session_reattest/device_key`）。服务端一旦怀疑设备异常，就会下发 Challenge，客户端必须用底层存储的设备密钥现场签名回传（`anthropic.reattest.v1`）。

---

### 4. 登录期 Attestation 与 Play Integrity

有些朋友以为 Play Integrity 只用于内购防作弊，其实反编译代码显示，Google 登录校验阶段也直接带上了证明：

```java
// defpackage/py20.java (VerifyGoogleRequest)
pluginGeneratedSerialDescriptor.l("code", false);
pluginGeneratedSerialDescriptor.l("redirect_uri", false);
pluginGeneratedSerialDescriptor.l("play_integrity_token", false);
pluginGeneratedSerialDescriptor.l("client_attestation", true);
pluginGeneratedSerialDescriptor.l("source", true);
```

登入验证的时候，`client_attestation` 和可选的 `play_integrity_token` 都是随包发出的。

---

### 5. 5 秒一次的高频动态配置（remote_config）

在 `defpackage/cda.java` 里，Android 端跑着一个叫 `remote_config` 的定时轮询任务：

- 默认轮询间隔仅为 **5.0 秒**（`poll_interval.seconds = 5.0f`）；
- 载荷支持高达 5 MiB，且带有服务端的签名验签（`rc.targets.key`）。

这意味着什么？意味着 Anthropic 的风控团队根本不需要给应用商店推新版本，在云端改一下配置，手机端每 5 秒同步一次，新规则立马原地生效。

---

### 6. 强制下线：服务端说踢就踢

翻看 `defpackage/w7l.java` 里的 `LogoutReason` 枚举，你会发现除了正常的用户主动登出（`user_initiated`）之外，还赫然列着：

```text
server_session_invalid, endpoint_changed, trusted_device_relogin, account_restricted
```

一旦服务端通过上面那些蛛丝马迹判定你违规，就会下发 `account_restricted`，客户端立刻强制踢你下线，并跳转到 `defpackage/tb.java` 渲染的账号受限申诉页。

---

## 第二部分：桌面端（macOS & Windows）拆解 —— 隐秘伏兵与死代码

聊完 Android，我们再来看看大家用得最多的桌面端（Electron 架构）。很多开发者觉得电脑端没有 SIM 卡、不查 Play 商店，肯定安全很多。

确实，桌面端权限克制了不少，但它暗中布置的埋伏却很有意思。

---

### 1. 最致命的一招：时区直接注入 Prompt `<env>`

在解包后的 `index.chunk-BfOAx4v9.js` 里，我们找到了每一次与大模型交互时的环境变量拼装模板：

```text
<env>
Today's date: {{currentDateTime}} (for more granularity, use bash)
Timezone: {{currentTimezone}}
Model: {{modelName}}
User name: {{accountName}}
User selected a folder: {{folderSelected}}
</env>
{{modelIdentity}}
```

这里的 `{{currentTimezone}}`，是客户端直接通过本地环境读取的 IANA 时区（比如 `Asia/Shanghai`）。

你品品这个逻辑：**这玩意儿根本不走请求头，而是直接作为环境上下文硬编码塞进了你的 Prompt 里面！**  
哪怕你的网络节点在西雅图，你发出的每一条请求都在公屏上大喊：「我来自 Asia/Shanghai」。这就直接把你的物理位置交待给了模型和审核链路。

---

### 2. macOS 专属特权：本地扫描 VPN 虚拟网卡与名称

我们在 macOS 的原生调用模块里，发现了这组探针函数（`I2r`、`L2r` 等）：

```js
// 匹配虚拟网卡
(await of("/sbin/ifconfig", [])).stdout.match(/^(utun\d+|ppp\d+|ipsec\d+|tun\d+):/gm);

// 获取当前连上的 VPN 配置名字
(await of("/usr/sbin/scutil", ["--nc", "list"])).stdout
  .matchAll(/^[^\S\n]*\*\s*\(Connected\).*"([^"]+)"/gm);

// 探测是否启用了共享与虚拟桥接
(await of("/usr/bin/pgrep", ["-x", "bootpd"]));
```

它不仅用 `ifconfig` 抓你的 `utun*` 虚拟网卡，还用 macOS 专有的 `scutil --nc list` 直接去抓你网络设置里 VPN 叫什么名字！

在虚拟机工作区启动失败时，这些信息会被打包进 `lam_vm_startup_failed` 遥测事件。虽然官方初衷是为了排查容器路由冲突，但代码明明白白证明了一点：**macOS 客户端完全具备探测你本地代理软件的能力。**

---

### 3. Windows 端的「早退死代码」

看完了 macOS，很多用 Windows 的朋友肯定坐不住了：Windows 版是不是也这么狠？

答案是：**Windows 版在网卡探测上直接「躺平」了。**  
在 Windows 的 MSIX 解包代码中，同样存在上述那套针对 VPN 的扫描函数，但第一行代码就把大伙儿看乐了：

```js
// Windows 端的对应实现
if (process.platform !== "darwin") {
    return { vpnActive: false, vpnInterfaces: [], connectedVPNs: [] };
}
```

因为这套命令（`scutil`、`ifconfig`）是针对 Unix/macOS 的，Windows 下根本没这套命令，开发团队直接加了个判断早退了。也就是说，**Windows 版没有去扫描你系统里的虚拟网卡和 VPN 适配器名字**。

---

### 4. 逃不掉的 8 个专有请求头与系统语言泄露

虽然 Windows 逃过了网卡扫描，但 Electron 通用的指纹逻辑是一致的：

#### 4.1 每次请求必带的 8 个客户端指纹头
桌面端只要向 Anthropic 发请求（比如 GrowthBook 拉配置、OAuth 授权），`Kv()` 函数都会拼装出这 8 个头：

```text
anthropic-client-platform:        "desktop_app"
anthropic-client-app:             "com.anthropic.claudefordesktop"
anthropic-client-version:         3.1623.0
anthropic-client-device-class:    <由总内存派生的等级>
anthropic-client-total-memory-gb: 32
anthropic-client-os-platform:     "darwin" 或 "win32"
anthropic-client-os-version:      15.1 或 10.0.26100
anthropic-device-id:              <来自 ant-did 文件>
```

#### 4.2 前端直接暴露系统语言列表
客户端启动时，会通过 `--desktop-managed-config=` 参数把系统的语言首选项注入渲染进程。前端页面通过 `window.desktopPreferredLanguages` 可以直接拿到一个纯净的系统语言数组（如 `["zh-CN", "en-US"]`），远端网页一读便知。

---

### 5. 极其狡猾的兜底逻辑：Body 文本模糊匹配

这是我们在逆向桌面端（`index.chunk-DWOgY7DF.js @4866`）时发现的最有意思的细节之一：

通常我们认为客户端处理错误是看 HTTP Status 和 JSON 里的 `error.code`。但 Claude 桌面端加了一层**极其暴力的自然语言兜底**：

```js
// 伪代码还原 index.chunk-DWOgY7DF.js 中的 ye() 函数
switch (e) {
    case "account_banned": return { errorCode: r.AccountBanned };
    case "account_needs_verification": return { errorCode: r.NeedsVerification };
    // ...
    case void 0: // 服务端根本没给结构化 code，只回了一段字符串
        return n.includes("account_needs_verification") ? { errorCode: r.NeedsVerification }
             : n.includes("disabled for your organization") ? { errorCode: r.OrgDisabled }
             : n.includes("not available for this organization") ? { errorCode: r.OrgBlocked }
             : n.includes("Organization mismatch") ? { errorCode: r.OrgMismatch }
             : n.includes("user_mismatch") ? { errorCode: r.UserMismatch }
             : {};
}
```

你看，即使服务端接口因为版本迭代没有返回规范的错误码，**只要返回的网页或报错信息里包含了这几句英文句子，客户端也能立马识别并映射成封号或受限状态！**

---

## 第三部分：Claude Code CLI 命令行端拆解 —— 极客工具里的密码学锁链

很多人可能以为：终端工具总归干净了吧？没有 Electron，没有 WebView，用 Node/Bun 跑个 CLI 难道还能定位我？

扒开 Claude Code CLI（版本 2.1.306，Bun 打包的单文件二进制）的明文字符串，你会发现终端端的防线走的是硬核的**现代密码学与策略下发路线**。

---

### 1. ECDSA P-256 硬件密钥与单账号设备硬上限

CLI 启动后，并不只是拿你的 token 发请求。它会在系统的 Keychain（或者降级写在本地 `~/.claude/.device-keys`）里生成一对 **prime256v1（ECDSA P-256）** 椭圆曲线密钥。

随后，它会调用接口把设备登记到服务端：
`POST /api/organizations/:orgUUID/cowork/remote_devices`

这一步直接引出了两个终端级状态：
- **`cowork_remote_device_limit_reached`**：单个组织或账号绑定的设备有严格的硬上限；
- **`cowork_remote_device_registration_revoked`**：一旦服务端标记设备被吊销（`revoked_at` 不为空），该公钥会被永久拒之门外。

很多开发者以为在终端里删掉 `.device-keys` 就能「洗白」，但服务端记录的是公钥历史。你每删一次重新生成，在服务端眼里就是「同一账号在短时间内不断接入全新设备」，不仅很快撞上设备配额上限，还会直接引爆风控预警。

---

### 2. 24 小时策略拉取与合规污染（compliance_taints）

CLI 内部自带一个独立的策略同步模块（`index.chunk-DIjipm-e.js`）。启动时，它会向 `/api/claude_code/policy_limits` 发起带有 Bearer Token 的请求，拉取限制策略并**在本地缓存 24 小时**（落盘在 `policy-limits.json`）。

返回的载荷中有一个核心字段叫 **`compliance_taints`（合规污染标记）**。
一旦你的账号或 IP 触碰了某些受限法域（Regime），服务端会直接下发污染标记，连配置文件里的环境变量展开都会被受限。

---

### 3. 辖区拒绝重试（[regime-refusal]）与模型静默降级

在 CLI 的错误处理集合中，有一类终端性拒绝叫 `restricted_regime_endpoint`（受限辖区端点）。

代码里设计了一套特殊的恢复流程：
```text
api_request_regime_features_refused     ← 遥测事件记录
[regime-refusal] resending the refused request, rebuilt under the organization policy now loaded
```
服务端拒绝后，客户端会试图加载组织策略重新打包再发一次。

如果最终判定你在当前地区无法使用某款模型，**它甚至不会向你报错，而是触发静默降级**：
```text
model_access_refused
tengu_api_model_not_found_fallback_triggered
{ original_model: "claude-3-5-sonnet-...", fallback_model: "...", reason: "model_access_refused" }
```
很多开发者明明选了最新的主力模型，用着用着感觉变笨了，其实在后台已经被静默回退到了低阶默认模型。

---

## 第四部分：深度辟谣 —— 代码证实「不存在」的民间传言

在各大论坛和社交媒体上，关于 Claude 的风控机制流传着各种耸人听闻的玄学说法。通过对全端源码与原生模块符号的检索，我们可以负责任地为大家辟谣以下四条：

### 辟谣 1：桌面端偷偷开 GPS 定位？
- **传言**：「Claude 电脑客户端在后台调用了系统的位置服务，知道你在哪个城市。」
- **事实**：使用 `otool -L` 检查 macOS 原生模块 `claude-native-binding.node` 与 `computer_use.node`，依赖项只有 Security、CoreFoundation、CoreGraphics、AppKit 等基础库，**根本没有链接苹果的 `CoreLocation.framework`**。代码里的位置权限声明只是为了给网页 Artifact 的 iframe 做权限门控，桌面端完全没有地理定位能力。

### 辟谣 2：Android 接入了牛逼的第三方风控/反欺诈 SDK？
- **传言**：「手机端集成了银行级的反欺诈 SDK（如 ThreatMetrix、AppsFlyer、Forter），能查所有 App 和底层硬件。」
- **事实**：jadx 扫描整个 APK，这些大名鼎鼎的风控 SDK **一个都没有**。Anthropic 的遥测栈非常朴素：Sentry（错误收集）+ Datadog RUM（性能与设备画像）+ Segment + GrowthBook（动态配置）。

### 辟谣 3：SIM 卡国家码（MCC/MNC）参与了封区判定？
- **传言**：「只要插着国内 SIM 卡，系统读到 MCC 460 就直接封号。」
- **事实**：代码检索证实，`getNetworkCountryIso()` / `getSimCountryIso()` 唯一出现的位置是 WebRTC 语音通话模块（`defpackage/xp0.java:413`），仅作为音频编码协商失败时的国家码回退，**完全没有送到 `RegionSupport` 或地区判定逻辑里**。真正上报的只是 Datadog RUM 里的运营商名字（`carrier_name`）。

### 辟谣 4：客户端在偷偷扫描证件做 KYC 验证？
- **传言**：「Claude 客户端有人脸比对和证件 OCR 功能。」
- **事实**：根据 `claude-kyc-analysis.md` 的逆向分析，客户端在 KYC 上就是一个纯纯的「甩手掌柜」。源码（`defpackage/asj.java`）里只维护了一个 9 种状态的状态机（`NOT_REQUIRED`, `VERIFIED`, `IN_PROGRESS`, `MANUAL_REVIEW`, `DENIED` 等）。它只做三件事：查状态、拉起服务端下发的第三方托管网页（如 Persona 或 Stripe）、轮询最终判定结果。**证件照和个人隐私信息根本不经过 Anthropic 客户端本地。**

---

## 第五部分：设备级 Ban 到底能不能解？关于「清痕迹」的真相

很多朋友遭遇过这样的惨剧：一个号被封了，心想「我重新注册一个不就得了」，结果新号刚登进去，几分钟内连环被封。这就是所谓的「设备级连坐」。

那么，所谓的设备 Ban 究竟是怎么回事？本地删文件到底管不管用？

### 1. 先搞清两个概念：本地 Token vs 服务端设备行
在代码里，设备凭据分为两层：
- **本地层**：macOS/Win 的 `userData/ant-did`、CLI 的 `Claude Code-device-keys`；
- **服务端层**：服务端数据库里的 `device registry`（关联在 `:orgUUID` 或账号下，记录了公钥、首次登记时间、吊销时间 `revoked_at`）。

### 2. 删本地文件会发生什么？
当你把本地的 `ant-did` 删掉，或者把 Keychain 里的私钥清空：
1. 客户端在下次启动时由于找不到文件，会触发 `relearn` 逻辑；
2. 本地重新生成一个随机 UUID 或全新 ECDSA P-256 密钥对；
3. 客户端带着新密钥向服务端发起注册。

**关键在于服务端的反应**：
- 如果你仅仅是本地 token 坏了，重新注册一行设备，没问题；
- 但如果你的旧设备在服务端已经被标记为 `revoked_at`（违规吊销），或者同一个账号在很短时间内**反复申请新设备公钥**，不仅会快速耗尽单账号的设备配额（`cowork_remote_device_limit_reached`），而且「短时间内频繁更换硬件指纹」本身就是反欺诈系统里权重极高的异常行为。

**结论**：删本地文件能解决「旧指纹被直接认出」的问题，但无法解决「新指纹因为操作异常被再次盯上」的问题。被封后的彻底重建，必须连同网络环境、系统时区、登录账号全套推倒重来。

---

## 第六部分：四端横向全景对照与避坑实操

最后，我们把 Android、macOS、Windows 以及 Claude Code CLI 的所有底细汇聚成一张全景对照表：

| 探测维度 | macOS 桌面端 | Windows 桌面端 | Claude Code CLI | Android 移动端 |
|---|---|---|---|---|
| **系统时区** | 注入 Prompt `<env>` 明文 | 注入 Prompt `<env>` 明文 | 注入 Prompt `- Local timezone:` | Datadog RUM `time_zone` 上报 |
| **系统语言** | 注入 `window` 全局对象 | 注入 `window` 全局对象 | 基础遥测事件采集 | Datadog RUM `locale` 数组上报 |
| **网络代理探测** | ✅ **命令扫描 `utun*` 与配置名** | ❌ 早退死代码，不探测 | ❌ 无命令扫描 | ❌ 无命令扫描 |
| **SIM / 运营商** | ❌ 无 | ❌ 无 | ❌ 无 | ✅ **上报 `carrier_name` 与基站制式** |
| **应用商店法域** | ❌ 无 | ❌ 无 | ❌ 无 | ✅ **抓取 `BillingConfig.countryCode`** |
| **手机号地理拦截** | ❌ 客户端不强校验 | ❌ 客户端不强校验 | ❌ 客户端不强校验 | ✅ **`RegionSupport` 显式校验并拒绝** |
| **设备硬件密钥** | 本地 `ant-did` 追踪 | 本地 `ant-did` 追踪 | **ECDSA P-256 密钥与配额** | 设备公私钥挑战（`reattest`） |
| **策略下发机制** | 启动拉取 | 启动拉取 | **24 小时缓存（`policy_limits`）** | **每 5 秒高频轮询（`remote_config`）** |
| **受限处置行为** | 弹窗报错 | 弹窗报错 | **辖区重试 / 静默降级模型** | 强制下线跳转申诉页 |

---

### 给开发者的三条实操建议：

1. **把手机端的 Claude 卸载掉。**  
   别在 Android 上折腾任何代理和定位欺骗软件了。Google 账户国家、手机号归属、SIM 卡运营商三位一体，全是改不动的硬指标，在手机上用就是白白送号。
2. **桌面端必须保持「环境自洽」**：  
   如果你真想稳定使用，不要只把精力花在找所谓的「纯净住宅 IP」上。检查一下你的**系统时区**（改成节点对应的时区，比如 `America/Los_Angeles`）、**首选语言**（英文优先），别让客户端在 Prompt 里直接把 `Asia/Shanghai` 送进服务端的日志系统。
3. **换号必须清设备指纹与注册表**：  
   如果不幸被封了号，在电脑上注册新号前，务必把应用数据目录下的 `ant-did` 彻底删干净，或者直接在新系统用户/虚拟机里登录，千万别顶着同一个设备 ID 连环送人头。

```

