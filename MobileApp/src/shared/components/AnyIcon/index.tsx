import React from 'react'
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import Feather from 'react-native-vector-icons/Feather'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import Fontisto from 'react-native-vector-icons/Fontisto'
import Foundation from 'react-native-vector-icons/Foundation'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Octicons from 'react-native-vector-icons/Octicons'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'

export const Icons = {
  MaterialCommunityIcons,
  MaterialIcons,
  Ionicons,
  Feather,
  FontAwesome,
  FontAwesome5,
  AntDesign,
  Entypo,
  SimpleLineIcons,
  Octicons,
  Foundation,
  EvilIcons,
  Fontisto
}

interface Props {
  viewStyle?: StyleProp<ViewStyle>
  type?: any
  name?: string
  size?: any
  style?: any
  color?: string
  disabled?: boolean
  onPress?: () => void
}

const AnyIcon = (props: Props) => {
  const { type, name, size, style, color, disabled, onPress, viewStyle } = props
  const Tag = type
  return (
    <>
      {type && name && (
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={disabled}
          style={[{ padding: 1 }, viewStyle]}
          onPress={() => {
            onPress ? onPress() : console.log('Nothing to act')
          }}
        >
          <Tag name={name} size={size} color={color} style={style} />
        </TouchableOpacity>
      )}
    </>
  )
}

export default AnyIcon
