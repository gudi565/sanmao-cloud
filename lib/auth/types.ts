/** 对外暴露的用户信息（不含密码等敏感字段） */
export type AuthUser = {
  id: string
  name: string
}
