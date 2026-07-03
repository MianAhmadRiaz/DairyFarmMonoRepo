import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import EmployeeHome from 'screens/Employee/EmployeeHome'
import Employees from 'screens/Employee/Employees'
import Attendance from 'screens/Employee/Attendance'
import Tasks from 'screens/Employee/Tasks'
import AddTask from 'screens/Employee/AddTask'
import Requests from 'screens/Employee/Requests'
import Salaries from 'screens/Employee/Salaries'

const Stack = createStackNavigator()

const EmployeeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
    <Stack.Screen name="EmployeeHome" component={EmployeeHome} />
    <Stack.Screen name="Employees" component={Employees} />
    <Stack.Screen name="Attendance" component={Attendance} />
    <Stack.Screen name="Tasks" component={Tasks} />
    <Stack.Screen name="AddTask" component={AddTask} />
    <Stack.Screen name="Requests" component={Requests} />
    <Stack.Screen name="Salaries" component={Salaries} />
  </Stack.Navigator>
)

export default EmployeeStack
