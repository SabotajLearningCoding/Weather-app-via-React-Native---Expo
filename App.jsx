// App.js
import * as React from 'react'; // Importerer React
import { NavigationContainer } from '@react-navigation/native'; // Importerer noget, der hjælper os med at navigere mellem skærme.
import { createStackNavigator } from '@react-navigation/stack'; // Importerer noget, der hjælper os med at lave en stak af skærme.
import HomeScreen from './HomeScreen'; // Importerer vores startskærm.
import SavedCitiesScreen from './SavedCitiesScreen'; // Importerer skærmen med gemte Byer.

const Stack = createStackNavigator(); // Opretter en stak navigator, så vi kan have flere sidere.

export default function App() {
    return (
        <NavigationContainer>
            {/*Dette holder styr på, hvor vi er i appen.*/}

            <Stack.Navigator initialRouteName="Home">
                {/*Starter med "Home" siden.*/}

                <Stack.Screen name="Home" component={HomeScreen} />
                {/*Vores startskærm hedder "Home".*/}

                <Stack.Screen name="Gemte Byer" component={SavedCitiesScreen} />
                {/*Siden med gemte lande hedder "Gemte Byer".*/}

            </Stack.Navigator>
        </NavigationContainer>
    );
}





