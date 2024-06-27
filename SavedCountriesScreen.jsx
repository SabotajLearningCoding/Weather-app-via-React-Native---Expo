// SavedCountriesScreen.js
import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert, Image } from "react-native";
import { Text, Card, Title, Paragraph, ActivityIndicator } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SavedCountriesScreen() {
    const [savedCities, setSavedCities] = useState([]);
    const [weatherData, setWeatherData] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getSavedCities = async () => {
            try {
                const storedCities = await AsyncStorage.getItem('savedCities');
                const cities = storedCities ? JSON.parse(storedCities) : [];
                setSavedCities(cities);
                fetchWeatherForCities(cities);
            } catch (error) {
                console.error(error);
                Alert.alert("Error", "Could not load saved cities.");
            }
        };
        getSavedCities();
    }, []);

    const fetchWeatherForCities = async (cities) => {
        setLoading(true);
        try {
            const weatherResponses = await Promise.all(
                cities.map(city =>
                    axios.get("https://api.openweathermap.org/data/2.5/weather/", {
                        params: {
                            q: city,
                            appid: "8401040824d06dc01137a49ace1e6cb7",
                            units: "metric",
                        },
                    })
                )
            );
            const weatherData = weatherResponses.reduce((acc, response) => {
                acc[response.data.name] = response.data;
                return acc;
            }, {});
            setWeatherData(weatherData);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not fetch weather data.");
        } finally {
            setLoading(false);
        }
    };

    // Function to select image based on weather description
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
            return require("./assets/forecast/clear-sky.png"); // Default image if no conditions match
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                <Title style={styles.header}>Gemte Byer</Title>
                {loading ? (
                    <ActivityIndicator animating={true} size="large" color="#1E90FF" />
                ) : (
                    savedCities.map((city, index) => (
                        weatherData[city] && (
                            <Card key={index} style={styles.card}>
                                <Card.Content>
                                    <Title style={styles.title}>
                                        {weatherData[city].name}, {weatherData[city].sys.country}
                                    </Title>
                                    <Image
                                        source={{
                                            uri: `https://flagsapi.com/${weatherData[city].sys.country}/shiny/64.png`,
                                        }}
                                        style={styles.flag}
                                    />
                                    <View style={styles.imageContainer}>
                                        <Image
                                            source={getImage(weatherData[city].weather[0].main)}
                                            style={styles.image}
                                        />
                                    </View>
                                    <Paragraph style={styles.paragraph}>
                                        {`
                                        Temperature: ${Math.round(weatherData[city].main.temp)}°C 
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

// React Native CSS
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
    header: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1E90FF",
        marginBottom: 20,
        textAlign: "center",
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
        elevation: 5,
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
        marginBottom: 10,
    },
    imageContainer: {
        alignItems: "center",
        marginBottom: 10,
    },
    image: {
        width: 100,
        height: 100,
    },
});
