/**
 * Tiny translation layer. Kept free of store/React imports so anything
 * (including date helpers) can use it without an import cycle.
 */
export type Lang = 'en' | 'he'

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'he', label: 'עברית' },
]

const en = {
  // common
  'common.back': 'Back',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.continue': 'Continue',
  'common.start': 'Start',
  'common.add': 'Add',
  'common.on': 'On',
  'common.off': 'Off',
  'common.of': 'of',

  // onboarding
  'onb.tagline': 'Win back control of your money, one day at a time.',
  'onb.welcomeTitle': 'Small daily wins become long-term freedom.',
  'onb.welcomeBody':
    'No complex budgets or charts. Just one number, and one simple daily habit: stay aware of what you spend.',
  'onb.getStarted': 'Get started',
  'onb.currencyTitle': 'Choose your currency',
  'onb.currencySub': 'You can change this anytime in settings',
  'onb.budgetHeading': 'What’s your daily spending budget?',
  'onb.apply': 'Apply',
  'onb.notifTitle': 'Stay aware, daily',
  'onb.notifBody':
    'One gentle daily reminder is all it takes to keep the habit alive. No noise, no pressure.',
  'onb.enableNotif': 'Enable notifications',
  'onb.maybeLater': 'Maybe later',
  'onb.allSetTitle': 'You’re all set',
  'onb.allSetBody': 'Your daily budget is ready. From today, every small choice counts.',

  // balance screen
  'bal.available': 'Available balance',
  'bal.availableSub': 'Available',
  'bal.perDay': 'Per Day',
  'bal.expense': 'Expense',
  'bal.addFunds': 'Add funds',

  // status captions
  'caption.overDaily': 'Over today’s budget · ease back tomorrow',
  'caption.runningLow': 'Running low · {amount} left for today',
  'caption.monthOver': 'Over this month’s budget by {amount}',
  'caption.monthLeft': '{amount} left this month',
  'caption.freshDay': 'Today’s budget added · no expenses yet',
  'caption.limits': 'Daily budget {daily} · Monthly budget {monthly}',

  // add expense / toasts
  'exp.new': 'New expense',
  'exp.whatWasIt': 'What was it? (optional)',
  'exp.added': 'Expense added',
  'exp.fundsAdded': 'Funds added',
  'exp.newBalance': 'New balance {amount}',
  'exp.addedFunds': 'Added funds',

  // categories
  'cat.Food & drink': 'Food & drink',
  'cat.Groceries': 'Groceries',
  'cat.Transport': 'Transport',
  'cat.Shopping': 'Shopping',
  'cat.Bills': 'Bills',
  'cat.Other': 'Other',
  'cat.Top-up': 'Top-up',

  // history
  'hist.title': 'History',
  'hist.spentThisMonth': 'Spent this month',
  'hist.leftThisMonth': '{amount} left this month',
  'hist.overBy': 'Over by {amount}',
  'hist.emptyTitle': 'No expenses yet',
  'hist.emptyBody': 'Log your first expense from the balance screen to see it here.',
  'hist.today': 'Today',
  'hist.yesterday': 'Yesterday',

  // expense detail
  'det.date': 'Date',
  'det.time': 'Time',
  'det.category': 'Category',
  'det.amount': 'Amount',
  'det.note': 'Note',

  // budget editor
  'edit.heading': 'Edit daily budget',
  'edit.save': 'Save changes',

  // settings
  'set.title': 'Settings',
  'set.dailyBudget': 'Daily budget',
  'set.monthlyBudget': 'Monthly budget',
  'set.monthlySub': '{daily} × {days} days',
  'set.currency': 'Currency',
  'set.monthEnd': 'Month end behavior',
  'set.notifications': 'Notifications',
  'set.appearance': 'Appearance',
  'set.language': 'Language',
  'set.light': 'Light',
  'set.dark': 'Dark',
  'set.reset': 'Reset',
  'set.carryOver': 'Carry over',
  'set.data': 'Data',
  'set.backup': 'Back up your data',
  'set.backupSub': 'Save every entry to a file',
  'set.restore': 'Restore from backup',
  'set.restoreSub': 'Replaces everything on this device',
  'set.resetBalance': 'Reset balance',
  'set.backupSaved': 'Backup saved to your device.',
  'set.backupFailed': 'Could not save the backup.',
  'set.restored': 'Restored {count} entries.',
  'set.restoreTitle': 'Restore this backup?',
  'set.restoreBody':
    'Everything currently on this device — balance, entries and settings — will be replaced.',
  'set.restoreAction': 'Restore',
  'set.resetTitle': 'Reset balance?',
  'set.resetBody': 'This sets your available balance to {amount}. This action can’t be undone.',

  // month end behaviour
  'me.title': 'Month end behavior',
  'me.sub': 'Choose what happens when a new month begins',
  'me.resetTitle': 'Reset balance each month',
  'me.resetDesc': 'Your balance resets to 0 at the start of each new month',
  'me.carryTitle': 'Carry over to next month',
  'me.carryDesc': 'Your remaining balance carries forward into the new month',

  // new month
  'nm.title': 'A fresh month begins',
  'nm.reset': 'Your balance was reset to {amount}.',
  'nm.carried': 'Your remaining balance carried over.',
  'nm.body': '{msg} This month you have {amount} to spend mindfully.',
  'nm.daily': 'Daily',
  'nm.monthly': 'Monthly',

  // currency names
  'cur.ILS': 'Israeli Shekel',
  'cur.USD': 'US Dollar',
  'cur.EUR': 'Euro',
  'cur.GBP': 'British Pound',

  // install prompt
  'inst.addToHome': 'Add Calm Spend to your home screen',
  'inst.iosHint': 'Install: tap Share, then Add to Home Screen',
  'inst.install': 'Install',
  'inst.dismiss': 'Dismiss',
} as const

export type TKey = keyof typeof en

const he: Record<TKey, string> = {
  'common.back': 'חזרה',
  'common.cancel': 'ביטול',
  'common.save': 'שמירה',
  'common.delete': 'מחיקה',
  'common.edit': 'עריכה',
  'common.continue': 'המשך',
  'common.start': 'התחלה',
  'common.add': 'הוספה',
  'common.on': 'פועל',
  'common.off': 'כבוי',
  'common.of': 'מתוך',

  'onb.tagline': 'להחזיר שליטה על הכסף שלך, יום אחד בכל פעם.',
  'onb.welcomeTitle': 'ניצחונות קטנים כל יום הופכים לחופש בגדול.',
  'onb.welcomeBody':
    'בלי תקציבים מסובכים ובלי גרפים. רק מספר אחד, והרגל יומי פשוט: להיות מודע למה שאתה מוציא.',
  'onb.getStarted': 'בואו נתחיל',
  'onb.currencyTitle': 'בחירת מטבע',
  'onb.currencySub': 'אפשר לשנות בכל רגע בהגדרות',
  'onb.budgetHeading': 'מה התקציב היומי שלך?',
  'onb.apply': 'אישור',
  'onb.notifTitle': 'להישאר מודע, כל יום',
  'onb.notifBody': 'תזכורת יומית עדינה אחת היא כל מה שצריך כדי לשמר את ההרגל. בלי רעש, בלי לחץ.',
  'onb.enableNotif': 'הפעלת התראות',
  'onb.maybeLater': 'אולי מאוחר יותר',
  'onb.allSetTitle': 'הכול מוכן',
  'onb.allSetBody': 'התקציב היומי שלך מוכן. מהיום, כל בחירה קטנה נחשבת.',

  'bal.available': 'יתרה זמינה',
  'bal.availableSub': 'זמין',
  'bal.perDay': 'ליום',
  'bal.expense': 'הוצאה',
  'bal.addFunds': 'הוספת כסף',

  'caption.overDaily': 'חריגה מהתקציב היומי · תאט קצת מחר',
  'caption.runningLow': 'נשאר מעט · {amount} להיום',
  'caption.monthOver': 'חריגה מהתקציב החודשי ב-{amount}',
  'caption.monthLeft': 'נשארו {amount} החודש',
  'caption.freshDay': 'תקציב היום נוסף · עדיין אין הוצאות',
  'caption.limits': 'תקציב יומי {daily} · תקציב חודשי {monthly}',

  'exp.new': 'הוצאה חדשה',
  'exp.whatWasIt': 'על מה? (לא חובה)',
  'exp.added': 'ההוצאה נוספה',
  'exp.fundsAdded': 'הכסף נוסף',
  'exp.newBalance': 'יתרה חדשה {amount}',
  'exp.addedFunds': 'הפקדה',

  'cat.Food & drink': 'אוכל ושתייה',
  'cat.Groceries': 'מכולת',
  'cat.Transport': 'תחבורה',
  'cat.Shopping': 'קניות',
  'cat.Bills': 'חשבונות',
  'cat.Other': 'אחר',
  'cat.Top-up': 'הפקדה',

  'hist.title': 'היסטוריה',
  'hist.spentThisMonth': 'הוצאת החודש',
  'hist.leftThisMonth': 'נשארו {amount} החודש',
  'hist.overBy': 'חריגה של {amount}',
  'hist.emptyTitle': 'אין עדיין הוצאות',
  'hist.emptyBody': 'רשום את ההוצאה הראשונה במסך היתרה והיא תופיע כאן.',
  'hist.today': 'היום',
  'hist.yesterday': 'אתמול',

  'det.date': 'תאריך',
  'det.time': 'שעה',
  'det.category': 'קטגוריה',
  'det.amount': 'סכום',
  'det.note': 'הערה',

  'edit.heading': 'עריכת התקציב היומי',
  'edit.save': 'שמירת השינויים',

  'set.title': 'הגדרות',
  'set.dailyBudget': 'תקציב יומי',
  'set.monthlyBudget': 'תקציב חודשי',
  'set.monthlySub': '{daily} × {days} ימים',
  'set.currency': 'מטבע',
  'set.monthEnd': 'התנהגות בסוף חודש',
  'set.notifications': 'התראות',
  'set.appearance': 'מראה',
  'set.language': 'שפה',
  'set.light': 'בהיר',
  'set.dark': 'כהה',
  'set.reset': 'איפוס',
  'set.carryOver': 'העברה',
  'set.data': 'נתונים',
  'set.backup': 'גיבוי הנתונים',
  'set.backupSub': 'שמירת כל הרשומות לקובץ',
  'set.restore': 'שחזור מגיבוי',
  'set.restoreSub': 'מחליף את כל מה שיש במכשיר',
  'set.resetBalance': 'איפוס היתרה',
  'set.backupSaved': 'הגיבוי נשמר במכשיר.',
  'set.backupFailed': 'לא הצלחתי לשמור את הגיבוי.',
  'set.restored': 'שוחזרו {count} רשומות.',
  'set.restoreTitle': 'לשחזר את הגיבוי הזה?',
  'set.restoreBody': 'כל מה שנמצא עכשיו במכשיר — יתרה, רשומות והגדרות — יוחלף.',
  'set.restoreAction': 'שחזור',
  'set.resetTitle': 'לאפס את היתרה?',
  'set.resetBody': 'הפעולה מאפסת את היתרה הזמינה ל-{amount}. אי אפשר לבטל אותה.',

  'me.title': 'התנהגות בסוף חודש',
  'me.sub': 'בחר מה קורה כשמתחיל חודש חדש',
  'me.resetTitle': 'איפוס היתרה בכל חודש',
  'me.resetDesc': 'היתרה מתאפסת ל-0 בתחילת כל חודש חדש',
  'me.carryTitle': 'העברה לחודש הבא',
  'me.carryDesc': 'היתרה שנשארה עוברת אל החודש החדש',

  'nm.title': 'חודש חדש מתחיל',
  'nm.reset': 'היתרה שלך אופסה ל-{amount}.',
  'nm.carried': 'היתרה שנשארה הועברה.',
  'nm.body': '{msg} החודש יש לך {amount} להוציא בתשומת לב.',
  'nm.daily': 'יומי',
  'nm.monthly': 'חודשי',

  'cur.ILS': 'שקל חדש',
  'cur.USD': 'דולר אמריקאי',
  'cur.EUR': 'אירו',
  'cur.GBP': 'לירה שטרלינג',

  'inst.addToHome': 'הוסיפו את Calm Spend למסך הבית',
  'inst.iosHint': 'להתקנה: שיתוף ואז "הוסף למסך הבית"',
  'inst.install': 'התקנה',
  'inst.dismiss': 'סגירה',
}

const DICTS: Record<Lang, Record<TKey, string>> = { en, he }

export function translate(
  lang: Lang,
  key: TKey,
  vars?: Record<string, string | number>,
): string {
  let out: string = DICTS[lang]?.[key] ?? en[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.split(`{${k}}`).join(String(v))
    }
  }
  return out
}

/** Category values are stored in English; translate them only for display. */
export function translateCategory(lang: Lang, category: string): string {
  const key = `cat.${category}` as TKey
  return key in en ? translate(lang, key) : category
}

export const isRtl = (lang: Lang) => lang === 'he'
export const localeFor = (lang: Lang) => (lang === 'he' ? 'he-IL' : 'en-US')

/** First-run guess from the device language. */
export function detectLang(): Lang {
  try {
    return navigator.language?.toLowerCase().startsWith('he') ? 'he' : 'en'
  } catch {
    return 'en'
  }
}
