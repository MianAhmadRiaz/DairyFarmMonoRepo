import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { ScrollView } from 'react-native'
import Toast from 'react-native-toast-message'
import AppContainer from 'shared/components/AppContainer'
import AppHeader from 'shared/components/AppHeader'
import AppInput from 'shared/components/AppInput'
import Dropdown from 'shared/components/Dropdown'
import PrimaryButton from 'shared/components/PrimaryButton'
import { addTask } from 'shared/services/employee.services'
import { getNormalizedError } from 'shared/services/helper.services'
import { COLORS } from 'shared/theme'
import { RF } from 'shared/theme/responsive'

const PRIORITIES = ['low', 'medium', 'high']
const today = new Date().toISOString().split('T')[0]

const AddTask = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const [task, setTask] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [deadLine, setDeadLine] = useState('')
  const [assignDate, setAssignDate] = useState(today)
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    if (!task.trim()) {
      Toast.show({ type: 'error', text1: t('employee.common.validation'), text2: t('employee.addTask.enterTaskTitle') })
      return
    }
    try {
      setLoading(true)
      await addTask({
        task: task.trim(),
        description: description.trim() || undefined,
        priority,
        dead_line: deadLine || undefined,
        assign_date: assignDate || undefined
      })
      Toast.show({ type: 'success', text1: t('employee.common.success'), text2: t('employee.addTask.taskAdded') })
      navigation.goBack()
    } catch (e) {
      Toast.show({ type: 'error', text1: t('employee.common.error'), text2: getNormalizedError(e) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppContainer>
      <AppHeader title={t('employee.addTask.title')} showBack />
      <ScrollView contentContainerStyle={{ padding: RF(16) }}>
        <AppInput label={t('employee.addTask.taskLabel')} value={task} onChangeText={setTask} placeholder={t('employee.addTask.taskPlaceholder')} />
        <AppInput label={t('employee.common.description')} value={description} onChangeText={setDescription} placeholder={t('employee.addTask.descriptionPlaceholder')} />
        <Dropdown label={t('employee.addTask.priorityLabel')} options={PRIORITIES} value={priority} onChange={setPriority} />
        <AppInput label={t('employee.addTask.deadlineLabel')} value={deadLine} onChangeText={setDeadLine} placeholder="2026-01-01" />
        <AppInput label={t('employee.addTask.assignDateLabel')} value={assignDate} onChangeText={setAssignDate} placeholder="2026-01-01" />
        <PrimaryButton title={t('employee.addTask.saveTask')} loading={loading} loaderColor={COLORS.white} onPress={onSubmit} buttonStyle={{ marginTop: RF(16) }} />
      </ScrollView>
    </AppContainer>
  )
}

export default AddTask
