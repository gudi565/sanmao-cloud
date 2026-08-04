export const BRAND = {
  name: "三猫云",
  fullName: "三猫云人工智能科技有限公司",
  enName: "Sanmao Cloud AI",
  slogan: "让每个人都能用好 AI",
  beian: "粤ICP备2026000000号-1", // 占位，上线前替换
  email: "hello@sanmao.cloud", // 占位
};

export type NavLink = { href: string; label: string };

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "首页" },
  { href: "/courses", label: "课程" },
  { href: "/tools", label: "AI 工具" },
  { href: "/membership", label: "会员" },
  { href: "/about", label: "关于我们" },
];

export const FOOTER_LINKS: { title: string; items: NavLink[] }[] = [
  {
    title: "学习",
    items: [
      { href: "/courses", label: "全部课程" },
      { href: "/courses", label: "学习路径" },
      { href: "/courses", label: "免费试听" },
    ],
  },
  {
    title: "产品",
    items: [
      { href: "/tools", label: "AI 工具" },
      { href: "/membership", label: "会员权益" },
      { href: "/tools", label: "使用场景" },
    ],
  },
  {
    title: "公司",
    items: [
      { href: "/about", label: "关于三猫云" },
      { href: "/about", label: "企业文化" },
      { href: "/about", label: "加入我们" },
    ],
  },
];
