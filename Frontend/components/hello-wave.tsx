import Animated from 'react-native-reanimated';

export function HelloWave(props: React.ComponentProps<typeof Animated.Text>) {
  return (
    <Animated.Text
      {...props}
      style={{
        fontSize: 28,
        lineHeight: 32,
        position: 'absolute',
        top: 0,
        right:0,
        marginTop:20,
        marginRight: 0,
        zIndex: 99,
        
        animationName: {
          '50%': { transform: [{ rotate: '25deg' }] },
        },
        animationIterationCount: 'infinite',
        animationDuration: '300ms',
      }}>❕</Animated.Text>
  );
}
