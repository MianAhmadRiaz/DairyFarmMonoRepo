import { SafeAreaView } from 'react-native'
import { COLORS } from 'shared/theme'

const AppContainer: React.FC<{
  gradient?: boolean
  includeBottomEdge?: boolean
  children?: React.ReactNode
}> = ({ gradient, includeBottomEdge, children, ...rest }) => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.background
      }}
      {...rest} // Spread only valid SafeAreaView props
    >
      {children}
    </SafeAreaView>
  )
}

export default AppContainer
