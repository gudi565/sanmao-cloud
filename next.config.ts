import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // svg-captcha 在 require 时读取自带 TTF 字体，必须作为外部包运行
  // （不被 Turbopack 打包），否则字体相对路径解析失败。
  serverExternalPackages: ["svg-captcha"],
};

export default nextConfig;
