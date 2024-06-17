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
  const [city, setCity] = useState("København"); // Standardby indstillet til København
  const [weather, setWeather] = useState(null); // Tilstand til at gemme vejrdata
  const [loading, setLoading] = useState(false); // Tilstand til at håndtere indlæsningsindikator

  // Funktion til at hente vejroplysninger fra OpenWeatherMap API
  const fetchWeather = async (city) => {
    setLoading(true); // Start indlæsningsindikator
    try {
      const response = await axios.get(
        "https://api.openweathermap.org/data/2.5/forecast",
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
      setLoading(false); // Stop indlæsningsindikator
    }
  };

  // Brug effekt hook til at hente vejrdata ved første indlæsning
  useEffect(() => {
    fetchWeather(city);
  }, []);

  // Funktion til at filtrere vejrudsigter kl. 15:00 de næste 5 dage
  const getNoonForecasts = (list) => {
    return list.filter((item) => item.dt_txt.includes("15:00:00")).slice(0, 5);
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
              <ActivityIndicator animating={true} size="large" /> // Vis indlæsningsindikator hvis data hentes
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
                <Paragraph style={styles.paragraph}>
                  {`Temperatur: ${weather.list[0].main.temp}°C
                  \nBeskrivelse: ${weather.list[0].weather[0].description} 
                  \n
                  \nH: ${weather.list[0].main.temp_max}°C - L: ${weather.list[0].main.temp_min}°C 
                  \nFøles som: ${weather.list[0].main.feels_like}°C 
                  \nLuftfugtighed: ${weather.list[0].main.humidity}%`}
                </Paragraph>
              </View>
            ) : (
              <Paragraph>Indtast en by for at få vejret.</Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Vejrudsigt for de næste 5 dage */}
        <View>
          {weather &&
            getNoonForecasts(weather.list).map((item, index) => (
              <Card key={index} style={styles.card}>
                <Card.Content>
                  <Title style={styles.title}>
                    {new Date(item.dt_txt).toLocaleDateString()}
                  </Title>
                  <Paragraph style={styles.paragraph}>
                    {`Temperatur: ${item.main.temp}°C
                    \nH: ${item.main.temp_max}°C - L: ${item.main.temp_min}°C
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
    padding: 16,
    marginTop: "15%",
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
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
    width: "100%",
    marginTop: 20,
    borderColor: "#EEE",
    borderWidth: 1,
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
});
