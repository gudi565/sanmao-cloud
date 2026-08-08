# 安装说明（请先看完这篇再动手）

谢谢你购买！这是 **Claude Code 的 skill（技能包）**，3 步装好、立即能用。

---

## 你买到了什么

一个 skill 文件夹（里面有 `SKILL.md` + `templates` + `README.md`）。装进 Claude Code 后，输入一个命令就能用，它会按一套专业方法论帮你干活。

## ⚠️ 前提：你得有 Claude Code

这个 skill 只在 **Claude Code**（命令行 / 桌面 app）里能用，**不是网页版 claude.ai 聊天**。
没装 Claude Code 的话先去装（官网：claude.ai/code 或 Anthropic 官方）。

---

## 3 步安装

### 🍎 Mac

1. **解压**：双击你收到的 zip，得到一个文件夹（比如 `xiaohongshu-hit`）
2. **放进 skills 目录**：
   打开「终端」app，复制粘贴下面这行，回车：
   ```
   mkdir -p ~/.claude/skills && open ~/.claude/skills
   ```
   会弹出一个文件夹窗口 —— 把刚才解压的那个文件夹**拖进去**
3. **重启 Claude Code**，输入 `/你买的skill名`（就是文件夹名）+ 你的主题，回车

### 🪟 Windows

1. **解压**：右键 zip →「全部解压缩」
2. **放进 skills 目录**：
   - 按 `Win + R`，输入 `%USERPROFILE%\.claude\skills` 回车
   - 如果提示找不到，先打开 `%USERPROFILE%\.claude`，在里面**新建一个文件夹**叫 `skills`
   - 把解压出的文件夹拖进去
3. **重启 Claude Code**，输入 `/你买的skill名` + 你的主题，回车

---

## 怎么知道装好了？

在 Claude Code 里输入 `/`，下拉列表里能看到你的 skill 名 = 装好了。
直接输入 `/skill名 你的内容` 就开始用。

---

## 装不上 / 用不了？看这里

1. **输入 `/` 看不到这个 skill**
   → 多半是文件夹放错了，或没重启 Claude Code。确认文件夹在 `~/.claude/skills/`（Mac）/ `%USERPROFILE%\.claude\skills\`（Win）下，**并且重启了 Claude Code**。

2. **报错说找不到 skill**
   → 确认你放进去的是「skill 文件夹本身」（里面有 `SKILL.md`），**不要多套一层文件夹**。
   ✅ 正确：`~/.claude/skills/xiaohongshu-hit/SKILL.md`
   ❌ 错误：`~/.claude/skills/下载/xiaohongshu-hit/SKILL.md`（多套了一层）

3. **命令是什么？**
   → 就是文件夹名。文件夹叫 `commit-pr-cn`，命令就是 `/commit-pr-cn`。

4. **还是不行？**
   → 把「你输入的命令 + 报错截图」发给卖家，我帮你远程看。

---

## 想先了解这个 skill 能干啥？

打开同目录的 **`README.md`**（产品说明书），有完整介绍、能力清单和真实示例。
