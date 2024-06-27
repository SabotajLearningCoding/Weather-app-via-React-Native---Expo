import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert, Image, TouchableOpacity } from "react-native";
import { Card, Title, Paragraph, ActivityIndicator } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SavedCitiesScreen() {
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
            return require("./assets/forecast/clear-sky.png");
        }
    };

    const Remove = require("./assets/remove.png");
    const unsaveLocation = async (cityToRemove) => {
        try {
            const storedCities = await AsyncStorage.getItem('savedCities');
            const cities = storedCities ? JSON.parse(storedCities) : [];
            const newCities = cities.filter(savedCity => savedCity !== cityToRemove);
            await AsyncStorage.setItem('savedCities', JSON.stringify(newCities));
            Alert.alert('Success', `${cityToRemove} has been removed.`);
            setSavedCities(newCities);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not remove the city.');
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView>
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
                                    <TouchableOpacity onPress={() => unsaveLocation(city)} style={styles.unsaveButton}>
                                        <Image source={Remove} style={styles.unsaveImage} />
                                    </TouchableOpacity>
                                    <Image
                                        source={{
                                            uri: `https://flagsapi.com/${weatherData[city].sys.country}/shiny/64.png`,
                                        }}
                                        style={styles.flag}
                                    />
                                    <View style={styles.imageContainer}>
                                        <Image source={getImage(weatherData[city].weather[0].description)} style={styles.image} />
                                    </View>
                                    <Paragraph style={styles.paragraph}>
                                        {`Temperature: ${Math.round(weatherData[city].main.temp)}°C 
                                        \nH: ${Math.round(weatherData[city].main.temp_max)}°C - L: ${Math.round(weatherData[city].main.temp_min)}°C
                                        \nDescription: ${weatherData[city].weather[0].main}
                                        `}
                                    </Paragraph>
                                    {/* Additional information can be added here */}
                                </Card.Content>
                            </Card>
                        )
                    ))
                )}
            </ScrollView>
        </View>
    );
}

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
    unsaveButton: {
        marginBottom: 20,
    },
    unsaveImage: {
        width: 50,
        height: 50,
    },
});
