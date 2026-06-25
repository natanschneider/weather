import { useEffect, useState, type ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import {
  CloudSun,
  Droplets,
  Eye,
  Gauge,
  LoaderCircle,
  MapPin,
  Search,
  Thermometer,
  Wind,
} from 'lucide-react'
import weather from '../repository/Weather'

type WeatherSearch = {
  city?: string
  state?: string
  country?: string
  lat?: number
  lon?: number
}

type WeatherDay = {
  date: string
  temp: number
  tempMax: number
  tempMin: number
  description: string
  humidity: number
  windSpeed: number
  pressure: number
  visibility: number
  icon: string
  hourly: Array<WeatherHour>
}

type WeatherHour = {
  time: string
  temp: number
  description: string
  icon: string
}

type WeatherData = {
  city: string
  country: string
  current: WeatherDay
  forecast: Array<WeatherDay>
}

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): WeatherSearch => ({
    city: typeof search.city === 'string' ? search.city : undefined,
    state: typeof search.state === 'string' ? search.state : undefined,
    country: typeof search.country === 'string' ? search.country : undefined,
    lat: parseCoordinate(search.lat),
    lon: parseCoordinate(search.lon),
  }),
  component: App,
})

function App() {
  const search = Route.useSearch()
  const getWeather = useServerFn(weather)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const navigate = Route.useNavigate()

  const hasSelectedCity =
    typeof search.lat === 'number' && typeof search.lon === 'number'

  useEffect(() => {
    if (!hasSelectedCity) {
      setWeatherData(null)
      setError(null)
      return
    }

    let isCurrent = true
    setIsLoading(true)
    setError(null)

    getWeather({ data: { lat: search.lat!, lon: search.lon! } })
      .then((data) => {
        if (!isCurrent) {
          return
        }

        if (Array.isArray(data)) {
          setWeatherData(null)
          setError('Could not load weather for this city.')
          return
        }

        setWeatherData(data)
      })
      .catch(() => {
        if (isCurrent) {
          setWeatherData(null)
          setError('Could not load weather for this city.')
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [getWeather, hasSelectedCity, search.lat, search.lon])

  function handleUseCurrentLocation() {
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError('Your browser does not support current location search.')
      return
    }

    setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false)
        void navigate({
          search: {
            city: 'Current location',
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
        })
      },
      () => {
        setIsLocating(false)
        setLocationError('Could not access your current location.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    )
  }

  return (
    <main className="min-h-[calc(100vh-7rem)] bg-background">
      <section className="page-wrap py-8 sm:py-12">
        {!hasSelectedCity && (
          <EmptyState
            isLocating={isLocating}
            locationError={locationError}
            onUseCurrentLocation={handleUseCurrentLocation}
          />
        )}

        {hasSelectedCity && (
          <div className="grid gap-5">
            <div className="flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="m-0 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <MapPin size={16} />
                  {formatSelectedCity(search)}
                </p>
                <h1 className="m-0 mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Weather
                </h1>
              </div>
              {isLoading && (
                <p className="m-0 text-sm text-muted-foreground">Loading...</p>
              )}
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {!error && weatherData && (
              <>
                <CurrentWeather data={weatherData} />
                <Forecast days={weatherData.forecast} />
              </>
            )}
          </div>
        )}
      </section>
    </main>
  )
}

function parseCoordinate(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value !== 'string') {
    return undefined
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function formatSelectedCity(search: WeatherSearch) {
  return [search.city, search.state, search.country].filter(Boolean).join(', ')
}

function formatVisibility(visibility: number) {
  return `${Math.round(visibility / 100) / 10} km`
}

function EmptyState({
  isLocating,
  locationError,
  onUseCurrentLocation,
}: {
  isLocating: boolean
  locationError: string | null
  onUseCurrentLocation: () => void
}) {
  return (
    <div className="flex min-h-[26rem] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
        <Search size={24} />
      </div>
      <div className="max-w-md">
        <h1 className="m-0 text-3xl font-semibold tracking-tight sm:text-4xl">
          Search for a city
        </h1>
        <p className="m-0 mt-3 text-sm leading-6 text-muted-foreground">
          Use the city search in the header and select a result to see current
          conditions and the next forecast days.
        </p>
      </div>
      <button
        type="button"
        onClick={onUseCurrentLocation}
        disabled={isLocating}
        className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition hover:bg-primary/80 disabled:pointer-events-none disabled:opacity-60"
      >
        {isLocating ? (
          <LoaderCircle className="animate-spin" size={17} />
        ) : (
          <MapPin size={17} />
        )}
        {isLocating ? 'Finding location...' : 'Use current location'}
      </button>
      {locationError && (
        <p className="m-0 max-w-md text-sm text-destructive">{locationError}</p>
      )}
    </div>
  )
}

function CurrentWeather({ data }: { data: WeatherData }) {
  const current = data.current

  return (
    <section className="grid gap-4 rounded-md border border-border bg-card p-5 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
      <div className="flex min-w-0 items-center gap-4">
        <img
          src={`https://openweathermap.org/img/wn/${current.icon}@2x.png`}
          alt=""
          className="h-20 w-20 shrink-0"
        />
        <div className="min-w-0">
          <p className="m-0 text-sm font-medium text-muted-foreground">
            {data.city}, {data.country}
          </p>
          <p className="m-0 mt-1 text-5xl font-semibold tracking-tight">
            {current.temp}°C
          </p>
          <p className="m-0 mt-2 capitalize text-muted-foreground">
            {current.description}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:min-w-80">
        <Metric
          icon={<Thermometer size={17} />}
          label="High / Low"
          value={`${current.tempMax}° / ${current.tempMin}°`}
        />
        <Metric
          icon={<Droplets size={17} />}
          label="Humidity"
          value={`${current.humidity}%`}
        />
        <Metric
          icon={<Wind size={17} />}
          label="Wind"
          value={`${current.windSpeed} m/s`}
        />
        <Metric
          icon={<Gauge size={17} />}
          label="Pressure"
          value={`${current.pressure} hPa`}
        />
        <Metric
          icon={<Eye size={17} />}
          label="Visibility"
          value={formatVisibility(current.visibility)}
        />
      </div>
    </section>
  )
}

function Forecast({ days }: { days: Array<WeatherDay> }) {
  const [selectedDate, setSelectedDate] = useState(days[0]?.date ?? '')
  const selectedDay =
    days.find((day) => day.date === selectedDate) ?? days[0] ?? null

  useEffect(() => {
    if (!days.some((day) => day.date === selectedDate)) {
      setSelectedDate(days[0]?.date ?? '')
    }
  }, [days, selectedDate])

  return (
    <section className="grid gap-4">
      <h2 className="m-0 mb-3 text-lg font-semibold tracking-tight">
        Forecast
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {days.map((day) => (
          <button
            key={`${day.date}-${day.icon}`}
            type="button"
            onClick={() => setSelectedDate(day.date)}
            aria-pressed={selectedDay?.date === day.date}
            className="rounded-md border border-border bg-card p-4 text-left shadow-sm transition hover:border-ring hover:bg-accent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none aria-pressed:border-ring aria-pressed:bg-accent"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="m-0 text-sm font-semibold">{day.date}</p>
              <img
                src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                alt=""
                className="h-10 w-10"
              />
            </div>
            <p className="m-0 mt-2 text-3xl font-semibold">{day.temp}°C</p>
            <p className="m-0 mt-1 min-h-10 capitalize text-sm text-muted-foreground">
              {day.description}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <CloudSun size={16} />
              {day.tempMax}° / {day.tempMin}°
            </div>
          </button>
        ))}
      </div>
      {selectedDay && <HourlyGraph day={selectedDay} />}
    </section>
  )
}

function HourlyGraph({ day }: { day: WeatherDay }) {
  const temperatures = day.hourly.map((hour) => hour.temp)
  const minTemp = Math.min(...temperatures)
  const maxTemp = Math.max(...temperatures)
  const range = Math.max(maxTemp - minTemp, 1)
  const width = 640
  const height = 220
  const paddingX = 36
  const paddingY = 34
  const graphWidth = width - paddingX * 2
  const graphHeight = height - paddingY * 2
  const points = day.hourly.map((hour, index) => {
    const x =
      paddingX +
      (day.hourly.length === 1
        ? graphWidth / 2
        : (index / (day.hourly.length - 1)) * graphWidth)
    const y = paddingY + ((maxTemp - hour.temp) / range) * graphHeight

    return { ...hour, x, y }
  })
  const line = points.map((point) => `${point.x},${point.y}`).join(' ')

  return (
    <article className="rounded-md border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="m-0 text-base font-semibold tracking-tight">
            Hourly forecast
          </h3>
          <p className="m-0 mt-1 text-sm text-muted-foreground">{day.date}</p>
        </div>
        <p className="m-0 text-sm font-medium text-muted-foreground">
          {minTemp}° to {maxTemp}°C
        </p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Hourly temperature forecast for ${day.date}`}
          className="h-56 min-w-[38rem] w-full"
        >
          {[0, 0.5, 1].map((ratio) => {
            const y = paddingY + ratio * graphHeight
            const label = Math.round(maxTemp - ratio * range)

            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  x2={width - paddingX}
                  y1={y}
                  y2={y}
                  className="stroke-border"
                  strokeDasharray="4 6"
                />
                <text
                  x={0}
                  y={y + 4}
                  className="fill-muted-foreground text-[12px]"
                >
                  {label}°
                </text>
              </g>
            )
          })}
          <polyline
            points={line}
            fill="none"
            className="stroke-foreground"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {points.map((point) => (
            <g key={`${point.time}-${point.temp}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                className="fill-background stroke-foreground"
                strokeWidth="2"
              />
              <text
                x={point.x}
                y={point.y - 10}
                textAnchor="middle"
                className="fill-foreground text-[12px] font-semibold"
              >
                {point.temp}°
              </text>
              <text
                x={point.x}
                y={height - 8}
                textAnchor="middle"
                className="fill-muted-foreground text-[12px]"
              >
                {point.time}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </article>
  )
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-background p-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-xs text-muted-foreground">{label}</span>
        <span className="block truncate text-sm font-semibold">{value}</span>
      </span>
    </div>
  )
}
