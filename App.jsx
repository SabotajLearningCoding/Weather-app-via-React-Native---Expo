import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert, Image, } from "react-native";
import { Text, Card, Title, Paragraph, ActivityIndicator, Button } from "react-native-paper";
import axios from "axios";

export default function App() {
  const [city, setCity] = useState(""); // Gemmer bynavnet
  const [weather, setWeather] = useState(null); // State til at gemme vejrdata
  const [loading, setLoading] = useState(false); // State til at håndtere indlæsning
  const [showDetails, setShowDetails] = useState(false); // State til at vise/skjule detaljer

  // Importerer billeder korrekt med require
  const Cloud = require("./assets/forecast/cloud.png");
  const Rain = require("./assets/forecast/rain.png");
  const Sun = require("./assets/forecast/sun.png");
  const Snow = require("./assets/forecast/snow.png");
  const Sky = require("./assets/forecast/clear-sky.png");
  const Location = require("./assets/location-pin.png");

  // Funktion til at hente vejrdata fra OpenWeatherMap API
  const fetchWeather = async (city) => {
    setLoading(true); // Starter indlæsning
    try {
      const response = await axios.get(
        "https://api.openweathermap.org/data/2.5/forecast/",
        {
          params: {
            q: city, // Bynavn
            appid: "8401040824d06dc01137a49ace1e6cb7", // API-nøgle
            units: "metric", // Enheder i metrisk system
          },
        }
      );
      setWeather(response.data); // Gemmer vejrdata i state
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Fejl",
        "Kunne ikke hente vejrinformation. Tjek bynavnet og prøv igen."
      );
    } finally {
      setLoading(false); // Stopper indlæsning
    }
  };


  // Funktion til at hente lokalitetsdata baseret på IP-adresse
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
      Alert.alert("Fejl", "Kunne ikke hente lokalitetsinformation.");
    }
  };

  // Bruger useEffect-hook til at hente lokalitet og vejrdata ved indledende indlæsning
  useEffect(() => {
    fetchLocation();
  }, []);

  // Funktion til at filtrere vejrudsigter for kl. 12:00 for de næste 5 dage
  const getForecasts = (list) => {
    return list.filter((item) => item.dt_txt.includes("12:00:00")).slice(0, 5);
  };

  // Funktion til at vælge billede baseret på vejrbeskrivelse
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
      return Sky; // Standardbillede hvis ingen betingelser matcher
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
          onChangeText={setCity} // Opdaterer bynavn ved ændring
          onSubmitEditing={() => fetchWeather(city)} // Henter vejrdata ved tryk på Enter
        />

        <TouchableOpacity
          onPress={() => fetchLocation()}
          style={styles.locationButton}
        >
          <Image source={Location} style={styles.locationImage} />
        </TouchableOpacity>

        {/* Vejrudsigt for nuværende dag */}
        <Card style={styles.card}>
          <Card.Content>
            {loading ? (
              <ActivityIndicator
                animating={true}
                size="large"
                color="#1E90FF"
              /> // Viser indlæsning under hentning af data
            ) : weather ? (
              <View>
                <Title style={styles.title}>
                  {weather.city.name}, {weather.city.country}
                </Title>
                {/* Flagvisning */}
                <Image
                  source={{
                    uri: `https://flagsapi.com/${weather.city.country}/shiny/64.png`,
                  }}
                  style={styles.flag}
                />
                {/* Flagvisning SLUT */}
                <View style={styles.imageContainer}>
                  <Image
                    source={getImage(weather.list[1].weather[0].main)}
                    style={styles.image}
                  />
                </View>
                <Paragraph style={styles.paragraph}>
                  {`Temperatur: ${Math.round(weather.list[1].main.temp)}°C 
                    \nH: ${Math.round(weather.list[1].main.temp_max)}°C - L: ${Math.round(weather.list[1].main.temp_min)}°C
                    \nBeskrivelse: ${weather.list[1].weather[0].main}
                  `}
                </Paragraph>
                {showDetails && (
                  <View style={styles.detailsContainer}>
                    <Text style={styles.paragraph}>
                      {`
                        \nFøles som: ${Math.round(weather.list[1].main.feels_like)}°C 
                        \nLuftfugtighed: ${weather.list[1].main.humidity}%
                        \nSigtbarhed: ${weather.list[1].visibility / 1000}km
                        \nVind: ${weather.list[1].wind.speed}m/s
                        \nVindstød: ${weather.list[1].wind.gust}m/s
                        \nLufttryk: ${weather.list[1].main.pressure}hPa
                      `}
                    </Text>
                  </View>
                )}
                <Button
                  mode="contained"
                  onPress={() => setShowDetails(!showDetails)}
                  style={styles.showMoreBtn}
                >
                  {showDetails ? "Skjul Detaljer" : "Vis Detaljer"}
                </Button>
              </View>
            ) : (
              <Paragraph>Indtast en by for at få vejrudsigt.</Paragraph>
            )}
          </Card.Content>
        </Card>
        {/* Vejrudsigt for nuværende dag SLUT */}

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
                    \nH: ${Math.round(item.main.temp_max)}°C - L: ${Math.round(item.main.temp_min)}°C
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
  showMoreBtn: {
    marginTop: 10,
    backgroundColor: "#1E90FF",
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
