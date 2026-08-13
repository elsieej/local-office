/**
 * Mã lỗi thật do Better Auth trả về (field `error.code` trong response),
 * gán tên gợi nhớ để dùng trong code thay vì gõ lại chuỗi thô.
 */
export const AUTH_ERROR_CODE = {
  DUPLICATE_EMAIL: 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL',
  INVALID_CREDENTIALS: 'INVALID_EMAIL_OR_PASSWORD',
} as const

/**
 * Thông điệp hiển thị cho người dùng ứng với từng mã lỗi ở trên — ghi đè
 * thông điệp gốc từ Better Auth khi cần diễn đạt lại (vd. gộp "user not
 * found" và "wrong password" thành một câu chung, không tiết lộ email nào
 * tồn tại).
 */
export const AUTH_ERROR_MESSAGE: Record<string, string> = {
  [AUTH_ERROR_CODE.INVALID_CREDENTIALS]: 'Invalid email or password.',
}
