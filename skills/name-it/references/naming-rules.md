# 命名规范速查 & 代码命名反模式

## 一、各语言命名规范(惯例)

| 语言 | 变量/函数 | 类/类型 | 常量 | 文件 | 包/模块 |
|---|---|---|---|---|---|
| Python | snake_case `user_name` | PascalCase `UserProfile` | UPPER_SNAKE `MAX_RETRY` | snake_case.py | lowercase |
| JavaScript | camelCase `userName` | PascalCase `UserProfile` | UPPER_SNAKE `MAX_RETRY` | kebab-case.js / camelCase.js | — |
| TypeScript | camelCase | PascalCase | UPPER_SNAKE / const | kebab-case.ts | — |
| Java | camelCase | PascalCase | UPPER_SNAKE | PascalCase.java | lowercase |
| Go | camelCase(私有)/ PascalCase(导出) `userName`/`UserName` | PascalCase | PascalCase(导出) | lowercase.go | lowercase |
| Rust | snake_case `user_name` | PascalCase `UserProfile` | UPPER_SNAKE | snake_case.rs | lowercase |
| C#/Kotlin | camelCase / PascalCase | PascalCase | PascalCase | PascalCase.cs | — |
| SQL | snake_case `user_name` | UPPER_SNAKE(表名) | — | — | — |

**接口/布尔/集合命名额外惯例**:
- 布尔:`is/has/can/should/needs` + 形容词/名词 — `isActive`、`hasChildren`。
- 返回布尔的函数:`isValid`、`canRead`。
- 集合/复数:`users`、`items`(不是 `userList` 除非元素类型重要)。
- 数量:`userCount` / `countOfUsers`,别 `usersCount`。
- id:`userId`(外键)、`id`(主键)。
- getter/setter:`getName`/`setName`(Java 系);属性 `name`(Python/JS)。
- 事件/回调:`onSubmit`、`handleClick`、`beforeSave`。

## 二、文件/文件夹规范(跨平台安全)

- **全小写 + 连字符**:`user-profile.ts`(不用空格、不用驼峰、不用下划线以外的特殊符)。
- **避免中文/空格**:除非纯本地文档;代码资源/构建产物里坚决不用。
- **可排序前缀**:`01-intro.md`、`step-1-setup.md`、`2026-08-03-report.md`。
- **日期用 ISO**:`YYYY-MM-DD`(才能正确字典序排序;别用 `MM-DD-YYYY`)。
- **版本**:`report-v2.md` 或在内容里管理版本,别堆 `report_final_final2.md`。

## 三、代码命名反模式(见一个改一个)

| 反模式 | 问题 | 改法 |
|---|---|---|
| `data` / `info` / `temp` / `obj` | 无信息量 | 写明是什么 data:`userData`、`uploadInfo` |
| `getData` / `processData` / `doStuff` | 动作不明 | 写清取/做什么:`fetchUserProfile` |
| `cnt` / `mgr` / `svc` / `usr` | 缩写歧义 | 全拼或无歧义缩写:`count`、`manager` |
| `flag` | 不知是啥开关 | 布尔语义命名:`isActive` |
| `str1`/`str2`/`a`/`b` | 无意义 | 按角色命名 |
| `isNotEmpty` | 双重否定 | 用 `isEmpty` 取反 |
| `userList` 当默认 | 多余后缀 | `users`(集合复数即可) |
| `manageUser` (动词模糊) | manage 啥都行 | `createUser`/`updateUser` 拆清 |
| `newVariable` / `test123` | 占位没改 | 删除占位命名 |
| 同概念多词混用 | user/customer/account 乱用 | 全文统一一个词 |
| 数字结尾 `user2` | 不知区别 | 按语义:`primaryUser`/`backupUser` |
| 否定布尔 `isNotEnabled` | 读起来绕 | `isEnabled` 取反 |

## 四、长度与精简的平衡

- **作用域小可短**:循环计数器 `i`、lambda 内 `x` 没问题。
- **作用域大要长**:全局/类成员/导出 API 名要够自描述。
- **别为了短牺牲清晰**:`usr` 比 `user` 省一个字母,换来阅读成本,不值。
- **缩写只用在领域公认**:`id`、`url`、`http`、`db` 没歧义可缩;`mgr`、`cnt`、`ctx`(看团队)有歧义风险。

## 五、产品/品牌命名的可用性检查清单

定名前过一遍:
- [ ] 域名:主要 TLD(.com/.io/.ai/.dev/.app)是否可得或可买。
- [ ] 同名竞品:搜一下有没有同名产品(尤其同品类)。
- [ ] 商标:目标市场查商标数据库(中国商标网/USPTO)——重要命名必查。
- [ ] 社交账号:主流平台用户名是否被占。
- [ ] 包名:npm/PyPI/GitHub 上是否被占用(技术产品)。
- [ ] 发音/拼写:让三个人念一遍,看会不会念错/拼错。
- [ ] 谐音/歧义:中文谐音、其他语言里的意思是否冒犯。
- [ ] 联想:搜出来的首屏内容是什么(会不会淹没/关联不当)。

## 六、一句话

命名是写一次、读一百次的事。多花两分钟想清楚,后面省掉无数次困惑。
