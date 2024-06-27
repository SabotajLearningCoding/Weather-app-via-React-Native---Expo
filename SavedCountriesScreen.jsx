// SavedCountriesScreen.js

// Importerer nødvendige komponenter og biblioteker fra React Native.
import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert, Image } from "react-native";
import { Text, Card, Title, Paragraph, ActivityIndicator } from "react-native-paper";
import axios from "axios"; // Importerer Axios til HTTP-anmodninger.
import AsyncStorage from "@react-native-async-storage/async-storage"; // Importerer AsyncStorage til lokal datalagring.

// Hovedfunktionen for skærmen der viser gemte byer.
export default function SavedCountriesScreen() {
    const [savedCities, setSavedCities] = useState([]); // Tilstand til at gemme de gemte byer.
    const [weatherData, setWeatherData] = useState({}); // Tilstand til at gemme vejrdata for de gemte byer.
    const [loading, setLoading] = useState(false); // Tilstand til at håndtere indlæsning.

    // Effektfunktion til at hente gemte byer og deres vejrdata ved indlæsning af komponenten.
    useEffect(() => {
        const getSavedCities = async () => {
            try {
                const storedCities = await AsyncStorage.getItem('savedCities'); // Henter gemte byer fra AsyncStorage.
                const cities = storedCities ? JSON.parse(storedCities) : []; // Konverterer JSON-data til array eller bruger en tom array hvis ingen gemte byer findes.
                setSavedCities(cities); // Opdaterer tilstanden med de gemte byer.
                fetchWeatherForCities(cities); // Henter vejrdata for de gemte byer.
            } catch (error) {
                console.error(error);
                Alert.alert("Error", "Could not load saved cities."); // Hvis der opstår en fejl under hentning af gemte byer, vises en fejlmeddelelse.
            }
        };
        getSavedCities(); // Kalder funktionen til at hente gemte byer ved indlæsning af komponenten.
    }, []); // Tomt array som anden parameter sikrer at effektfunktionen kun køres én gang ved indlæsning.

    // Funktion til at hente vejrdata for de gemte byer fra OpenWeatherMap API.
    const fetchWeatherForCities = async (cities) => {
        setLoading(true); // Starter indlæsning.
        try {
            // Foretager en parallel anmodning for hvert gemt bynavn for at hente vejrdata.
            const weatherResponses = await Promise.all(
                cities.map(city =>
                    axios.get("https://api.openweathermap.org/data/2.5/weather/", {
                        params: {
                            q: city,
                            appid: "8401040824d06dc01137a49ace1e6cb7", // API-nøgle.
                            units: "metric", // Enheder i metrisk system.
                        },
                    })
                )
            );
            // Samler vejrdata for hver by i et objekt med bynavnet som nøgle.
            const weatherData = weatherResponses.reduce((acc, response) => {
                acc[response.data.name] = response.data;
                return acc;
            }, {});
            setWeatherData(weatherData); // Opdaterer tilstanden med vejrdata for de gemte byer.
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not fetch weather data."); // Hvis der opstår en fejl under hentning af vejrdata, vises en fejlmeddelelse.
        } finally {
            setLoading(false); // Stopper indlæsning.
        }
    };

    // Funktion til at vælge billede baseret på vejrbeskrivelse.
    const getImage = (description) => {
        if (description.includes("rain")) {
            return require("./assets/forecast/rain.png");
        } else if (description.includes("cloud")) {
            return require("./assets/forecast/cloud.png");
        } else if (description.includes("sun")) {
            return require("./assets/forecast/sun.png");
        } else if (description.includes("snow")) {
            return require("./assets/forecast/snow.png");
        } else if (description.includes("clear")) {
            return require("./assets/forecast/clear-sky.png");
        } else {
            return require("./assets/forecast/clear-sky.png"); // Standardbillede hvis ingen betingelser matcher.
        }
    };

    // Returnerer JSX (brugergrænseflade) til visning i appen.
    return (
        <View style={styles.container}>
            <ScrollView>
                {loading ? (
                    <ActivityIndicator animating={true} size="large" color="#1E90FF" /> // Viser indlæsning under hentning af data.
                ) : (
                    savedCities.map((city, index) => (
                        weatherData[city] && ( // Tjekker om vejrdata for den gemte by findes.
                            <Card key={index} style={styles.card}>
                                <Card.Content>
                                    <Title style={styles.title}>
                                        {weatherData[city].name}, {weatherData[city].sys.country}
                                    </Title>
                                    {/* Viser flag for landet baseret på sys.country */}
                                    <Image
                                        source={{
                                            uri: `https://flagsapi.com/${weatherData[city].sys.country}/shiny/64.png`,
                                        }}
                                        style={styles.flag}
                                    />
                                    <View style={styles.imageContainer}>
                                        {/* Viser vejrikon baseret på vejrbeskrivelse */}
                                        <Image source={getImage(weatherData[city].weather[0].description)} style={styles.image} />
                                    </View>
                                    <Paragraph style={styles.paragraph}>
                                        {`Temperature: ${Math.round(weatherData[city].main.temp)}°C 
                                        \nH: ${Math.round(weatherData[city].main.temp_max)}°C - L: ${Math.round(weatherData[city].main.temp_min)}°C
                                        \nDescription: ${weatherData[city].weather[0].main}
                                        `}
                                    </Paragraph>
                                </Card.Content>
                            </Card>
                        )
                    ))
                )}
            </ScrollView>
        </View>
    );
}

// Stildefinitioner (CSS) for komponenten.
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: "10%",
        paddingBottom: "10%",
        paddingLeft: "5%",
        paddingRight: "5%",
        backgroundColor: "#f0f0f0",
    },
    card: {
        minWidth: 330,
        marginTop: 20,
        backgroundColor: "#ffffff",
        color: "#000",
        borderColor: "#1E90FF",
        borderWidth: 1,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 10,
    },
    title: {
        fontSize: 22,
        marginBottom: 10,
        color: "#1E90FF",
    },
    paragraph: {
        fontSize: 18,
        color: "#333",
    },
    flag: {
        width: 64,
        height: 64,
    },
    imageContainer: {
        position: "relative",
        maxWidth: 100,
        maxHeight: 100,
        left: 180,
        top: 90,
    },
    image: {
        width: 100,
        height: 100,
    },
});

