import axios from "axios";
import { createServerFn } from "@tanstack/react-start";

const SearchCities = createServerFn({ method: 'GET', strict: false }).validator(
    (data: { city: string }) => data,
).handler(
    async ({ data }) => {
        const city = data.city.trim();
        const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY

        if (!city) {
            return []
        }

        const response = await axios.get(
            `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=10&appid=${apiKey}`
        );

        const cities = response.data.map((result: any) => ({
            name: result.name,
            state: result.state || undefined,
            country: result.country,
            lat: result.lat,
            lon: result.lon,
        }))

        return cities
    }
);

export default SearchCities
