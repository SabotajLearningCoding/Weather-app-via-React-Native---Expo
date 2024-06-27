// App.js
import * as React from 'react'; // Importerer React, som hjælper os med at lave vores app.
import { NavigationContainer } from '@react-navigation/native'; // Importerer noget, der hjælper os med at navigere mellem skærme.
import { createStackNavigator } from '@react-navigation/stack'; // Importerer noget, der hjælper os med at lave en stak af skærme.
import HomeScreen from './HomeScreen'; // Importerer vores startskærm.
import SavedCountriesScreen from './SavedCountriesScreen'; // Importerer skærmen med gemte lande.

const Stack = createStackNavigator(); // Opretter en stak navigator, så vi kan have flere skærme.

function App() {
    return (
        <NavigationContainer>
            {/*Dette holder styr på, hvor vi er i appen.*/}

            <Stack.Navigator initialRouteName="Home">
                {/*Starter med "Home" skærmen.*/}

                <Stack.Screen name="Home" component={HomeScreen} />
                {/*Vores startskærm hedder "Home".*/}

                <Stack.Screen name="Gemte Byer" component={SavedCountriesScreen} />
                {/*Skærmen med gemte lande hedder "Gemte Byer".*/}

            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App; // Eksporterer appen, så den kan bruges andre steder.





