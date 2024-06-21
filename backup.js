import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  Image,
} from "react-native";
import {
  Text,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
} from "react-native-paper";
import axios from "axios";

export default function App() {
  const [city, setCity] = useState("Fucking"); // Standardby indstillet til Fucking, Østrig
  const [weather, setWeather] = useState(null); // Tilstand til at gemme vejrdata
  const [loading, setLoading] = useState(false); // Tilstand til at håndtere Loading

  // Importer billederne korrekt med require
  const Cloud = require("./assets/forecast/cloud.png");
  const Rain = require("./assets/forecast/rain.png");
  const Sun = require("./assets/forecast/sun.png");
  const Snow = require("./assets/forecast/snow.png");
  const Sky = require("./assets/forecast/clear-sky.png");

  // Funktion til at hente vejroplysninger fra OpenWeatherMap API
  const fetchWeather = async (city) => {
    setLoading(true); // Start Loading
    try {
      const response = await axios.get(
        "https://api.openweathermap.org/data/2.5/forecast/",
        {
          params: {
            q: city, // By navn
            appid: "8401040824d06dc01137a49ace1e6cb7", // API nøgle
            units: "metric", // Enheder i metrisk system
          },
        }
      );
      setWeather(response.data); // Gem vejrdata i tilstanden
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Fejl",
        "Kunne ikke hente vejroplysninger. Tjek bynavn og prøv igen."
      );
    } finally {
      setLoading(false); // Stop Loading
    }
  };

  // Brug useEffect hook til at hente vejrdata ved første indlæsning
  useEffect(() => {
    fetchWeather(city);
  }, []);

  // Funktion til at filtrere vejrudsigter fra kl. 12:00 de næste 5 dage
  const getForecasts = (list) => {
    return list.filter((item) => item.dt_txt.includes("12:00:00")).slice(0, 5);
  };

  // Funktion til at vælge billede baseret på vejrets beskrivelse
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
        {/* Søgefelt */}
        <Text style={styles.header}>Vejr App</Text>
        <TextInput
          style={styles.input}
          placeholder="Indtast by"
          value={city}
          onChangeText={setCity} // Opdater by tilstand ved tekstændring
        />
        <Button title="Hent vejr" onPress={() => fetchWeather(city)} />

        {/* Vejrudsigt for det nuværende dag */}
        <Card style={styles.card}>
          <Card.Content>
            {loading ? (
              <ActivityIndicator animating={true} size="large" /> // Vis loading hvis data hentes
            ) : weather ? (
              <View>
                <Title style={styles.title}>
                  {weather.city.name}, {weather.city.country}
                </Title>
                {/* Flag visning */}
                <Image
                  source={{
                    uri: `https://flagsapi.com/${weather.city.country}/shiny/64.png`,
                  }}
                  style={styles.flag}
                />
                {/* Flag visning SLUT */}
                <View style={styles.imageContainer}>
                  <Image
                    source={getImage(weather.list[1].weather[0].description)}
                    style={styles.image}
                  />
                </View>
                <Paragraph style={styles.paragraph}>
                  {`Temperatur: ${Math.round(weather.list[1].main.temp)}°C
                  \nBeskrivelse: ${weather.list[1].weather[0].description} 
                  \nH: ${Math.round(
                    weather.list[1].main.temp_max
                  )}°C - L: ${Math.round(weather.list[1].main.temp_min)}°C 
                  \nFøles som: ${Math.round(weather.list[1].main.feels_like)}°C 
                  \nLuftfugtighed: ${weather.list[1].main.humidity}%
                  \nSigtbarhed: ${weather.list[1].visibility / 1000}km
                  \nVind: ${weather.list[1].wind.speed}m/s`}
                </Paragraph>
              </View>
            ) : (
              <Paragraph>Indtast en by for at få vejret.</Paragraph>
            )}
          </Card.Content>
        </Card>
        {/* Vejrudsigt for det nuværende dag SLUT */}

        {/* Vejrudsigt for de næste 5 dage */}
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
                    \nH: ${Math.round(item.main.temp_max)}°C - L: ${Math.round(
                      item.main.temp_min
                    )}°C
                    \nBeskrivelse: ${item.weather[0].description}`}
                  </Paragraph>
                </Card.Content>
              </Card>
            ))}
        </View>
        {/* Vejrudsigt for de næste 5 dage SLUT */}
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
    paddingTop: "15%",
    paddingBottom: "15%",
    paddingLeft: "5%",
    paddingRight: "5%",
    backgroundColor: "#15719f",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
    marginHorizontal: "auto",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 16,
    width: "100%",
    backgroundColor: "white",
  },
  card: {
    minWidth: 330,
    marginTop: 20,
    backgroundColor: "#62a1c7",
    color: "#FFF",
    borderColor: "#95d6ea",
    borderWidth: "3px",
    shadowOpacity: "0%",
  },
  title: {
    fontSize: 22,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 18,
  },
  flag: {
    width: 64,
    height: 64,
    marginBottom: 10,
  },
  image: {
    width: 64,
    height: 64,
  },
  imageContainer: {
    display: "flex",
    flexDirection: "row",
    position: "relative",
    left: 120,
    bottom: 75,
    width: 64,
  },
});
