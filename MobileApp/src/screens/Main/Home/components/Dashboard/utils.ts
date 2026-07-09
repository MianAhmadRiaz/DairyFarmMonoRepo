import moment from 'moment'
import { Dimensions } from 'react-native'
import { RF } from 'shared/theme/responsive'

/** Chart width that fits inside a GlassCard on the dashboard */
export const CHART_WIDTH = Dimensions.get('window').width - RF(64)

export const fmtNum = (n: number | undefined | null, suffix = '') =>
  n === undefined || n === null
    ? '—'
    : `${Number(n).toLocaleString('en-US', { maximumFractionDigits: 1 })}${suffix}`

export const fmtMoney = (n: number | undefined | null) =>
  n === undefined || n === null
    ? '—'
    : `PKR ${Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`

export const fmtDate = (d?: string) => (d ? moment(d).format('D MMM YYYY') : '—')
