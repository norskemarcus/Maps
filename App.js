

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PinDetailScreen from './components/PinDetailScreen.js';
import MainPage from './components/MainPage.js';
import LoginPage from './components/LoginPage.js'


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginPage">
        <Stack.Screen name="MainPage" component={MainPage} />
        <Stack.Screen name="LoginPage" component={LoginPage} />
        <Stack.Screen name="PinDetailScreen" component={PinDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export {Stack}
