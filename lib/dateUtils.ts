/**
 * 日本時間（JST）に対応した日付ユーティリティ関数
 * タイムゾーンのずれによる日付の不整合を防ぐため
 */

// 日本のタイムゾーンオフセット（UTC+9）
const JST_OFFSET = 9 * 60 * 60 * 1000; // 9時間をミリ秒で

/**
 * 現在の日本時間のDateオブジェクトを取得
 */
export function getJSTDate(): Date {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + JST_OFFSET);
}

/**
 * 日本時間で今日の日付を YYYY-MM-DD 形式で取得
 */
export function getTodayJST(): string {
  const jstDate = getJSTDate();
  return formatDateToISO(jstDate);
}

/**
 * 日本時間で明日の日付を YYYY-MM-DD 形式で取得
 */
export function getTomorrowJST(): string {
  const jstDate = getJSTDate();
  jstDate.setDate(jstDate.getDate() + 1);
  return formatDateToISO(jstDate);
}

/**
 * 日本時間でN日後の日付を YYYY-MM-DD 形式で取得
 */
export function getDateAfterDaysJST(days: number): string {
  const jstDate = getJSTDate();
  jstDate.setDate(jstDate.getDate() + days);
  return formatDateToISO(jstDate);
}

/**
 * DateオブジェクトをYYYY-MM-DD形式に変換（タイムゾーンずれを回避）
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * YYYY-MM-DD形式の文字列から日本時間のDateオブジェクトを作成
 * タイムゾーンのずれを考慮して正確な日付を設定
 */
export function createJSTDateFromString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  // 月は0ベースなので-1する
  const date = new Date(year, month - 1, day);
  return date;
}

/**
 * YYYY-MM-DD HH:MM形式の文字列から日本時間のDateオブジェクトを作成
 */
export function createJSTDateTimeFromString(dateString: string, timeString?: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  
  let hours = 0;
  let minutes = 0;
  
  if (timeString) {
    const [h, m] = timeString.split(':').map(Number);
    hours = h;
    minutes = m;
  }
  
  // 日本時間として作成（ローカルタイムゾーンで作成）
  return new Date(year, month - 1, day, hours, minutes);
}

/**
 * 日本時間で現在時刻を HH:MM 形式で取得
 */
export function getCurrentTimeJST(): string {
  const jstDate = getJSTDate();
  const hours = String(jstDate.getHours()).padStart(2, '0');
  const minutes = String(jstDate.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 日本時間でDateオブジェクトを HH:MM 形式に変換
 */
export function formatTimeToHHMM(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 日本時間でDateオブジェクトをローカライズされた文字列に変換
 */
export function formatDateTimeJST(date: Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  return date.toLocaleString('ja-JP', defaultOptions);
}

/**
 * 日本時間で日付のみをローカライズされた文字列に変換
 */
export function formatDateJST(date: Date): string {
  return date.toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * デバッグ用：現在の時刻情報を表示
 */
export function debugTimeInfo(): void {
  const localDate = new Date();
  const jstDate = getJSTDate();
  
  console.log('🕐 時刻デバッグ情報:');
  console.log('  ローカル時刻:', localDate.toString());
  console.log('  ローカル日付:', formatDateToISO(localDate));
  console.log('  JST時刻:', jstDate.toString());
  console.log('  JST日付:', formatDateToISO(jstDate));
  console.log('  タイムゾーンオフセット:', localDate.getTimezoneOffset(), '分');
}

/**
 * 曜日名を取得（日本語）
 */
export function getWeekdayJST(date: Date): string {
  const weekdays = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
  return weekdays[date.getDay()];
}

/**
 * 指定した曜日の次の日付を取得
 */
export function getNextWeekdayJST(weekday: string): string {
  const weekdays = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
  const targetDay = weekdays.indexOf(weekday);
  
  if (targetDay === -1) {
    throw new Error(`無効な曜日です: ${weekday}`);
  }
  
  const today = getJSTDate();
  const todayDay = today.getDay();
  
  // 今日から目標曜日までの日数を計算
  let daysToAdd = targetDay - todayDay;
  if (daysToAdd <= 0) {
    daysToAdd += 7; // 来週の同じ曜日
  }
  
  return getDateAfterDaysJST(daysToAdd);
}
