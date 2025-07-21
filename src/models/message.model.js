/**
 * Message 模型定義
 * @typedef {Object} Message
 * @property {string} id - 訊息唯一識別碼
 * @property {string} text - 訊息內容
 * @property {string} sender - 發送者名稱
 * @property {Date} timestamp - 訊息時間戳
 * @property {boolean} isOwn - 是否為自己發送的訊息
 */

/**
 * 創建新的訊息對象
 * @param {string} text - 訊息內容
 * @param {string} sender - 發送者名稱
 * @param {boolean} isOwn - 是否為自己發送的訊息
 * @returns {Message} 新的訊息對象
 */
export function createMessage(text, sender, isOwn = false) {
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    text,
    sender,
    timestamp: new Date(),
    isOwn
  }
}

/**
 * 格式化時間為 HH:MM 格式
 * @param {Date} timestamp - 時間戳
 * @returns {string} 格式化後的時間字符串
 */
export function formatTime(timestamp) {
  return `${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}`
}
