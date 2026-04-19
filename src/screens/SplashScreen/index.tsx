import React, {useEffect, useRef} from 'react'
import {Animated, Image, StyleSheet, View} from 'react-native'

import {AppScreen} from '../../components/common'
import type {SplashScreenProps} from '../../navigation/types'
import {theme} from '../../theme'

export default function SplashScreen({navigation}: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current

  useEffect(() => {
    // Phase 1: Entry Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start()

    // Phase 2: Wait then Navigate
    const timer = setTimeout(() => {
      navigation.replace('Home')
    }, 2500)

    return () => clearTimeout(timer)
  }, [fadeAnim, scaleAnim, navigation])

  return (
    <AppScreen style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{scale: scaleAnim}],
            },
          ]}
        >
          <Image
            source={require('../../assets/images/attentap.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </AppScreen>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 440,
    height: 440,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
})
