import axios from 'axios'
import { createServerFn } from '@tanstack/react-start'

interface OpenWeatherResponse {
    list: Array<{
        dt: number
        main: {
            temp: number
            temp_max: number
            temp_min: number
            humidity: number
            pressure: number
        }
        weather: Array<{
            main: string
            description: string
            icon: string
        }>
        wind: {
            speed: number
        }
        visibility: number
    }>
    city: {
        name: string
        country: string
    }
}

const weather = createServerFn({ method: 'GET', strict: false })
    .validator((data: { lat: number; lon: number }) => data)
    .handler(async ({ data }) => {
        const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY
        const lat = data.lat
        const lon = data.lon

        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
            return []
        }

        try {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=pt_BR&appid=${apiKey}`
            );

            const weather = response.data as OpenWeatherResponse

            const days: Record<string, any> = {}
            weather.list.forEach((item) => {
                const date = new Date(item.dt * 1000)
                const dayKey = date.toLocaleDateString('pt-BR')

                // Guardar apenas o primeiro item de cada dia
                if (!days[dayKey]) {
                    days[dayKey] = {
                        date: dayKey,
                        temp: Math.round(item.main.temp),
                        tempMax: Math.round(item.main.temp_max),
                        tempMin: Math.round(item.main.temp_min),
                        description: item.weather[0].description,
                        humidity: item.main.humidity,
                        windSpeed: Math.round(item.wind.speed * 10) / 10,
                        pressure: item.main.pressure,
                        visibility: item.visibility,
                        icon: item.weather[0].icon,
                    }
                }
            })

            const forecast = Object.values(days).slice(0, 3)

            const currentResponse = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_BR&appid=${apiKey}`
            );

            const currentData = currentResponse.data;

            const current = {
                date: 'Agora',
                temp: Math.round(currentData.main.temp),
                tempMax: Math.round(currentData.main.temp_max),
                tempMin: Math.round(currentData.main.temp_min),
                description: currentData.weather[0].description,
                humidity: currentData.main.humidity,
                windSpeed: Math.round(currentData.wind.speed * 10) / 10,
                pressure: currentData.main.pressure,
                visibility: currentData.visibility,
                icon: currentData.weather[0].icon,
            }

            return {
                city: weather.city.name,
                country: weather.city.country,
                current,
                forecast,
            }
        } catch {
            return []
        }
    });

export default weather
