import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import AppText from 'shared/components/AppText/AppText'
import {
  fetchTreatmentSummary,
  fetchWithdrawals,
  TreatmentSummary,
  Withdrawal
} from 'shared/services/dashboard.services'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'
import EmptyState from '../EmptyState'
import GlassCard from '../GlassCard'
import HorizontalBars from '../HorizontalBars'
import StatTile from '../StatTile'
import TabLoader from '../TabLoader'
import TrendBarChart from '../TrendBarChart'
import { fmtDate, fmtMoney } from '../utils'

interface Props {
  refreshKey: number
}

const daysChipColor = (days: number) =>
  days > 365 ? COLORS.chartRed : days > 180 ? COLORS.chartAmber : COLORS.labelGrey

/**
 * Health & Disease tab — mirrors the web HealthTab: 4 KPI tiles,
 * treatments-by-type chart, top diagnoses, active milk withdrawals and
 * days-since-vaccination lists (tables adapted to mobile rows).
 */
const HealthTab = ({ refreshKey }: Props) => {
  const [summary, setSummary] = useState<TreatmentSummary | null>(null)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetchTreatmentSummary().catch(() => null),
      fetchWithdrawals().catch(() => [] as Withdrawal[])
    ])
      .then(([s, w]) => {
        setSummary(s)
        setWithdrawals(w ?? [])
      })
      .finally(() => setLoading(false))
  }, [refreshKey])

  if (loading) return <TabLoader />

  const byType = (summary?.byType ?? []).map(t => ({
    type: t.treatmentType,
    count: Number(t.count || 0)
  }))
  const topDiagnoses = summary?.topDiagnoses ?? []
  const vaccinations = (summary?.daysSinceLastVaccinationOrDeworming ?? []).slice(0, 15)

  const tiles = [
    {
      icon: '🩺',
      label: 'Sick Animals',
      value: (summary?.sickAnimals ?? []).length,
      accent: COLORS.chartRed
    },
    {
      icon: '⛔',
      label: 'Active Withdrawals',
      value: withdrawals.length,
      accent: COLORS.chartAmber
    },
    { icon: '💰', label: 'Treatment Cost', value: fmtMoney(summary?.totalCost) },
    {
      icon: '🔬',
      label: 'Top Diagnosis',
      value: topDiagnoses[0]?.diagnosis || '—',
      sublabel: topDiagnoses[0] ? `${topDiagnoses[0].count} cases` : undefined
    }
  ]

  return (
    <>
      <View style={styles.tileGrid}>
        {tiles.map(t => (
          <StatTile key={t.label} {...t} />
        ))}
      </View>

      <GlassCard title="Treatments by Type">
        {byType.length ? (
          <TrendBarChart
            labels={byType.map(t => t.type)}
            data={byType.map(t => t.count)}
            color={COLORS.chartBlue}
          />
        ) : (
          <EmptyState title="No treatments recorded yet" icon="💊" />
        )}
      </GlassCard>

      <GlassCard title="Top Diagnoses">
        {topDiagnoses.length ? (
          <HorizontalBars
            items={topDiagnoses.map(d => ({
              label: d.diagnosis,
              value: Number(d.count)
            }))}
            color={COLORS.chartRed}
          />
        ) : (
          <EmptyState title="No diagnoses recorded yet" icon="🔬" />
        )}
      </GlassCard>

      <GlassCard title="Active Milk Withdrawals">
        {withdrawals.length ? (
          withdrawals.map((w, i) => (
            <View key={w.uuid ?? i} style={[styles.row, i > 0 && styles.rowBorder]}>
              <View style={{ flex: 1 }}>
                <AppText semiBold fontSize="subtitle" color="darkestGrey" numberOfLines={1}>
                  {w.animal?.name || w.animal?.tagName || '—'}
                </AppText>
                <AppText fontSize="11" medium color="labelGrey" numberOfLines={1}>
                  {w.diagnosis || w.treatmentType || '—'}
                  {w.meatWithdrawalUntil
                    ? ` • meat until ${fmtDate(w.meatWithdrawalUntil)}`
                    : ''}
                </AppText>
              </View>
              <View style={[styles.chip, { backgroundColor: `${COLORS.chartAmber}22` }]}>
                <AppText semiBold fontSize="10" style={{ color: COLORS.chartAmber }}>
                  milk until {fmtDate(w.milkWithdrawalUntil)}
                </AppText>
              </View>
            </View>
          ))
        ) : (
          <EmptyState title="No animals under withdrawal right now" icon="✅" />
        )}
      </GlassCard>

      <GlassCard title="Days Since Last Vaccination / Deworming">
        {vaccinations.length ? (
          vaccinations.map((r, i) => (
            <View key={i} style={[styles.row, i > 0 && styles.rowBorder]}>
              <View style={{ flex: 1 }}>
                <AppText semiBold fontSize="subtitle" color="darkestGrey" numberOfLines={1}>
                  {r.animal?.name || r.animal?.tagName || '—'}
                </AppText>
                <AppText
                  fontSize="11"
                  medium
                  color="labelGrey"
                  numberOfLines={1}
                  style={{ textTransform: 'capitalize' }}
                >
                  {r.treatmentType} • {fmtDate(r.lastDate)}
                </AppText>
              </View>
              <View
                style={[styles.chip, { backgroundColor: `${daysChipColor(r.daysSince)}22` }]}
              >
                <AppText
                  semiBold
                  fontSize="10"
                  style={{ color: daysChipColor(r.daysSince) }}
                >
                  {r.daysSince}d
                </AppText>
              </View>
            </View>
          ))
        ) : (
          <EmptyState title="No vaccination/deworming records yet" icon="💉" />
        )}
      </GlassCard>
    </>
  )
}

const styles = StyleSheet.create({
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: RF(8)
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGrey
  },
  chip: {
    paddingHorizontal: RF(8),
    paddingVertical: RF(4),
    borderRadius: RF(10),
    marginLeft: RF(8)
  }
})

export default HealthTab
