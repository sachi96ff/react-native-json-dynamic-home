// src/engine/AnimationWrapper.tsx

import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

/**
 * Wraps a child component with an entry animation.
 *
 * Supported animations: fade, slide, zoom, scale, bounce.
 * Each animation runs once when the component first appears.
 */
interface AnimationWrapperProps {
  children: React.ReactNode;
  animationType?: string;
  duration?: number;
  delay?: number;
}

export const AnimationWrapper: React.FC<AnimationWrapperProps> = ({
  children,
  animationType,
  duration = 500,
  delay = 0,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current; // 30px offset
  const scaleAnim = useRef(
    new Animated.Value(animationType === 'bounce' ? 0.5 : 0.8)
  ).current;

  useEffect(() => {
    const type = animationType?.toLowerCase();
    if (!type || type === 'none') return;

    const animations: Animated.CompositeAnimation[] = [];

    switch (type) {
      case 'fade':
        animations.push(
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          })
        );
        break;

      case 'slide':
        animations.push(
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration,
              delay,
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'zoom':
      case 'scale':
        animations.push(
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration,
              delay,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              delay,
              useNativeDriver: true,
              friction: 6,
            }),
          ])
        );
        break;

      case 'bounce':
        animations.push(
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration,
              delay,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              delay,
              useNativeDriver: true,
              friction: 3,
              tension: 40,
            }),
          ])
        );
        break;

      default:
        // Default to fade
        animations.push(
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          })
        );
        break;
    }

    if (animations.length > 0) {
      Animated.parallel(animations).start();
    }
  }, [animationType]);

  const type = animationType?.toLowerCase();
  if (!type || type === 'none' || type === '') {
    return <>{children}</>;
  }

  const animatedStyle: Animated.WithAnimatedObject<ViewStyle> = {
    opacity: fadeAnim,
  };

  if (type === 'slide') {
    animatedStyle.transform = [{ translateY: slideAnim }];
  } else if (type === 'zoom' || type === 'scale' || type === 'bounce') {
    animatedStyle.transform = [{ scale: scaleAnim }];
  }

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};
