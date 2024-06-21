import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert, Image, } from "react-native";
import { Text, Card, Title, Paragraph, ActivityIndicator, } from "react-native-paper";
import axios from "axios";

export default function App() {
  const [city, setCity] = useState(""); // Default city set to empty string
  const [weather, setWeather] = useState(null); // State to store weather data
  const [loading, setLoading] = useState(false); // State to handle loading

  // Import images correctly with require
  const Cloud = require("./assets/forecast/cloud.png");
  const Rain = require("./assets/forecast/rain.png");
  const Sun = require("./assets/forecast/sun.png");
  const Snow = require("./assets/forecast/snow.png");
  const Sky = require("./assets/forecast/clear-sky.png");
  const Location = require("./assets/location-pin.png");

  // Function to fetch weather data from OpenWeatherMap API
  const fetchWeather = async (city) => {
    setLoading(true); // Start loading
    try {
      const response = await axios.get(
        "https://api.openweathermap.org/data/2.5/forecast/",
        {
          params: {
            q: city, // City name
            appid: "8401040824d06dc01137a49ace1e6cb7", // API key
            units: "metric", // Units in metric system
          },
        }
      );
      setWeather(response.data); // Store weather data in state
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error",
        "Could not fetch weather information. Check city name and try again."
      );
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Function to fetch location data based on IP address
  const fetchLocation = async () => {
    try {
      const response = await axios.get(
        "https://ipinfo.io/json?token=67977dadb97bd2"
      );
      const location = response.data;
      setCity(location.city);
      fetchWeather(location.city);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not fetch location information.");
    }
  };

  // Use useEffect hook to fetch location and weather data on initial load
  useEffect(() => {
    fetchLocation();
  }, []);

  // Function to filter forecasts for 12:00 PM for the next 5 days
  const getForecasts = (list) => {
    return list.filter((item) => item.dt_txt.includes("12:00:00")).slice(0, 5);
  };

  // Function to select image based on weather description
  const getImage = (description) => {
    if (description.includes("rain")) {
      return Rain;
    } else if (description.includes("cloud")) {
      return Cloud;
    } else if (description.includes("sun")) {
      return Sun;
    } else if (description.includes("snow")) {
      return Snow;
    } else {
      return Sky; // Default image if no conditions match
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Search Field */}
        <Text style={styles.header}>Vejr App</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter city"
          value={city}
          onChangeText={setCity} // Update city state on text change
          onSubmitEditing={() => fetchWeather(city)} // Fetch weather data on Enter key press
        />

        <TouchableOpacity
          onPress={() => fetchLocation()}
          style={styles.locationButton}
        >
          <Image source={Location} style={styles.locationImage} />
        </TouchableOpacity>

        {/* Current Day Weather Forecast */}
        <Card style={styles.card}>
          <Card.Content>
            {loading ? (
              <ActivityIndicator
                animating={true}
                size="large"
                color="#1E90FF"
              /> // Show loading if data is being fetched
            ) : weather ? (
              <View>
                <Title style={styles.title}>
                  {weather.city.name}, {weather.city.country}
                </Title>
                {/* Flag Display */}
                <Image
                  source={{
                    uri: `https://flagsapi.com/${weather.city.country}/shiny/64.png`,
                  }}
                  style={styles.flag}
                />
                {/* Flag Display END */}
                <View style={styles.imageContainer}>
                  <Image
                    source={getImage(weather.list[1].weather[0].description)}
                    style={styles.image}
                  />
                </View>
                <Paragraph style={styles.paragraph}>
                  {`Temperatur: ${Math.round(weather.list[1].main.temp)}°C
                  \nBeskrivelse: ${weather.list[1].weather[0].description} 
                  \nH: ${Math.round(weather.list[1].main.temp_max)}°C - L: ${Math.round(weather.list[1].main.temp_min)}°C 
                  \nFøles som: ${Math.round(weather.list[1].main.feels_like)}°C 
                  \nLuftfugtighed: ${weather.list[1].main.humidity}%
                  \nSigtbarhed: ${weather.list[1].visibility / 1000}km
                  \nVind: ${weather.list[1].wind.speed}m/s`}
                </Paragraph>
              </View>
            ) : (
              <Paragraph>Enter a city to get the weather.</Paragraph>
            )}
          </Card.Content>
        </Card>
        {/* Current Day Weather Forecast END */}

        {/* Next 5 Days Weather Forecast */}
        <View>
          {weather &&
            getForecasts(weather.list).map((item, index) => (
              <Card key={index} style={styles.card}>
                <Card.Content>
                  <Title style={styles.title}>
                    {new Date(item.dt_txt).toLocaleDateString()}
                  </Title>
                  <Paragraph style={styles.paragraph}>
                    {`Temperatur: ${Math.round(item.main.temp)}°C
                    \nH: ${Math.round(item.main.temp_max)}°C - L: ${Math.round(item.main.temp_min)}°C
                    \nBeskrivelse: ${item.weather[0].description}`}
                  </Paragraph>
                </Card.Content>
              </Card>
            ))}
        </View>
        {/* Next 5 Days Weather Forecast END */}
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
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 16,
    width: "100%",
    backgroundColor: "white",
    borderRadius: 5,
  },
  locationButton: {
    alignItems: "center",
    marginBottom: 20,
  },
  locationImage: {
    width: 64,
    height: 64,
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
  image: {
    width: 100,
    height: 100,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
});
