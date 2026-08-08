---
name: 降重
description: "论文降重多 agent 管线：按段分类→分学科策略重写→bigram 相似度校验→超阈值重试→补回引用/数字/公式。用法 /降重 <文本> [强度] [学科]"
---

# 论文降重管线

当用户调用此技能时，立即使用 Workflow 工具执行降重管线。本技能**自包含**，不依赖 jiangzhong web app、不消耗其字数额度——在对话里直接出降重结果。

## 核心理念

复用 jiangzhong 项目（`~/development/jiangzhong/engine.py`）的五阶段管线，把 web app 的能力抽成斜杠命令：
- **你提供**：要降重的论文文本（必填）、强度、学科
- **管线负责**：切段分类 → 按学科策略改写 → 相似度校验 → 超阈值重试 → 补回保留标记

## 参数

- **text**（必填）：要降重的论文文本
- **strength**：`light` / `medium`（默认）/ `deep`
  - `light` 轻度：同义词替换、语序调整，保留原句骨架
  - `medium` 中度：句式重构（主动被动互换、长短句拆合），差异明显
  - `deep` 深度：完全重组表达，差异最大化
- **discipline**：`auto`（默认，自动判断）/ `stem` / `humanities` / `medicine` / `law`
  - `stem` 理工科：术语/物理量/公式/变量逐字保留
  - `humanities` 人文社科：词汇句式可大幅变换
  - `medicine` 医学/生命科学：药名/剂量/指标逐字保留
  - `law` 法学：法规名/条款号/法条单位逐字保留

## 执行步骤

1. 从用户输入解析参数：扫描是否含强度词（light/medium/deep）与学科词（stem/humanities/medicine/law），有则取、无则用默认；其余内容作为 text。
2. 若未提供文本或文本 < 10 字，友好地请用户粘贴要降重的段落。
3. 文本 > 8000 字时提示分段。
4. 调用 Workflow 工具。**⚠️ 本环境 Workflow 的 `args` 注入失效**（直接传 args 会让脚本读不到 text、立刻报"没有收到要降重的文本"、不起任何 agent）。正确做法是把用户文本硬编码进临时副本再跑：

```
# 1) 复制脚本并注入用户文本（用 node 处理中文与特殊字符，别用 sed/echo）
node -e 'const fs=require("fs");let s=fs.readFileSync("/Users/serein/.claude/workflows/paper-dedup.js","utf8");s=s.replace("const text = (args?.text || \x27\x27).trim()","const text = (args?.text || "+JSON.stringify(用户文本)+").trim()");fs.writeFileSync("/tmp/paper-dedup-run.js",s);'

# 2) 若用户指定了 strength/discipline，同理替换这两行的默认值：
#    const strength = [...].includes(args?.strength) ? args.strength : "medium"
#    const discipline = [...].includes(args?.discipline) ? args.discipline : "auto"

# 3) 调 Workflow（不传 args）
scriptPath: /tmp/paper-dedup-run.js
```

> 临时副本在 /tmp，无需清理；原始 `paper-dedup.js` 不动。等网关 args 注入修好后可改回 `scriptPath: .../paper-dedup.js` + `args:{...}` 的标准写法。

5. 工作流完成后，向用户展示：
   - **降重后正文**（完整，可复制）
   - 整体相似度 / 覆盖率（1−相似度）
   - 触发的阶段：classify · rewrite · verify（· retry · repair）
   - 每段诊断表：类型 · 相似度 · 重试次数 · 是否修复 · 仍缺失标记

## 关于 .docx 与批量

本技能只处理贴进对话的纯文本。**上传/导出 .docx、批量处理、卡密计费**请用 web app——`/preview_start jiangzhong` 启动后开 http://127.0.0.1:8792。

## 示例调用

```
/降重 近年来，深度学习在图像识别领域取得了显著突破[1]。ResNet 通过引入残差连接解决了梯度消失问题，在 ImageNet 上达到了 95% 的 top-5 准确率。
```
→ strength=medium, discipline=auto

```
/降重 deep stem 本文提出一种基于 $E=mc^2$ 的能量估计方法，实验在 12.5 mm 的尺度下进行，频率为 50 Hz。
```
→ strength=deep, discipline=stem

```
/降重 law 根据《民法典》第3条的规定，民事主体的合法权益受法律保护。
```
→ strength=medium（默认）, discipline=law
