import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
      label: t('main.dashboard.healthTab.sickAnimals'),
      value: (summary?.sickAnimals ?? []).length,
      accent: COLORS.chartRed
    },
    {
      icon: '⛔',
      label: t('main.dashboard.healthTab.activeWithdrawals'),
      value: withdrawals.length,
      accent: COLORS.chartAmber
    },
    {
      icon: '💰',
      label: t('main.dashboard.common.treatmentCost'),
      value: fmtMoney(summary?.totalCost)
    },
    {
      icon: '🔬',
      label: t('main.dashboard.healthTab.topDiagnosis'),
      value: topDiagnoses[0]?.diagnosis || '—',
      sublabel: topDiagnoses[0]
        ? t('main.dashboard.healthTab.cases', {
            count: Number(topDiagnoses[0].count)
          })
        : undefined
    }
  ]

  return (
    <>
      <View style={styles.tileGrid}>
        {tiles.map(t => (
          <StatTile key={t.label} {...t} />
        ))}
      </View>

      <GlassCard title={t('main.dashboard.healthTab.treatmentsByType')}>
        {byType.length ? (
          <TrendBarChart
            labels={byType.map(b => b.type)}
            data={byType.map(b => b.count)}
            color={COLORS.chartBlue}
          />
        ) : (
          <EmptyState
            title={t('main.dashboard.healthTab.noTreatments')}
            icon="💊"
          />
        )}
      </GlassCard>

      <GlassCard title={t('main.dashboard.healthTab.topDiagnoses')}>
        {topDiagnoses.length ? (
          <HorizontalBars
            items={topDiagnoses.map(d => ({
              label: d.diagnosis,
              value: Number(d.count)
            }))}
            color={COLORS.chartRed}
          />
        ) : (
          <EmptyState
            title={t('main.dashboard.healthTab.noDiagnoses')}
            icon="🔬"
          />
        )}
      </GlassCard>

      <GlassCard title={t('main.dashboard.healthTab.activeMilkWithdrawals')}>
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
                    ? ` • ${t('main.dashboard.healthTab.meatUntil', {
                        date: fmtDate(w.meatWithdrawalUntil)
                      })}`
                    : ''}
                </AppText>
              </View>
              <View style={[styles.chip, { backgroundColor: `${COLORS.chartAmber}22` }]}>
                <AppText semiBold fontSize="10" style={{ color: COLORS.chartAmber }}>
                  {t('main.dashboard.healthTab.milkUntil', {
                    date: fmtDate(w.milkWithdrawalUntil)
                  })}
                </AppText>
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            title={t('main.dashboard.healthTab.noWithdrawals')}
            icon="✅"
          />
        )}
      </GlassCard>

      <GlassCard title={t('main.dashboard.healthTab.vaccinationTitle')}>
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
                  {t('main.dashboard.healthTab.daysShort', {
                    count: r.daysSince
                  })}
                </AppText>
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            title={t('main.dashboard.healthTab.noVaccinations')}
            icon="💉"
          />
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
