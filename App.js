

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PinDetailScreen from './components/PinDetailScreen.js';
import MainPage from './MainPage.js';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        <Stack.Screen name="Main" component={MainPage} />
        <Stack.Screen name="PinDetail" component={PinDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export {Stack}
