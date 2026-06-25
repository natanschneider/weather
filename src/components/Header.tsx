import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Search } from 'lucide-react'
import SearchCities from '../repository/SearchCities'
import ThemeToggle from './ThemeToggle'

type CitySearchResult = {
  name: string
  state?: string
  country: string
  lat: number
  lon: number
}

export default function Header() {
  const searchCities = useServerFn(SearchCities)
  const [query, setQuery] = useState('')
  const [cities, setCities] = useState<Array<CitySearchResult>>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const city = query.trim()
    setHasSearched(true)
    setError(null)

    if (!city) {
      setCities([])
      return
    }

    setIsSearching(true)

    try {
      const results = await searchCities({ data: { city } })
      setCities(results)
    } catch {
      setCities([])
      setError('Could not search cities. Try again.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <h2 className="m-0 shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/"
            search={{}}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm no-underline sm:px-4 sm:py-2"
          >
            <span className="h-2 w-2 rounded-full" />
            Weather
          </Link>
        </h2>

        <form
          onSubmit={handleSearch}
          className="order-3 flex w-full min-w-0 items-center gap-2 sm:order-none sm:ml-auto sm:max-w-md"
          role="search"
        >
          <label htmlFor="city-search" className="sr-only">
            Search cities
          </label>
          <input
            id="city-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search cities"
            className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <button
            type="submit"
            disabled={isSearching}
            aria-label="Search cities"
            title="Search cities"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-input bg-background text-foreground shadow-xs transition hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
          >
            <Search size={18} />
          </button>
        </form>

        <div className="ml-auto flex items-center gap-1.5 sm:ml-0 sm:gap-2">
          <ThemeToggle />
        </div>
      </nav>

      {(hasSearched || isSearching) && (
        <div className="page-wrap pb-3">
          <div className="rounded-md border border-border bg-background/95 p-3 shadow-sm">
            {isSearching && (
              <p className="m-0 text-sm text-muted-foreground">Searching...</p>
            )}

            {!isSearching && error && (
              <p className="m-0 text-sm text-destructive">{error}</p>
            )}

            {!isSearching && !error && cities.length === 0 && (
              <p className="m-0 text-sm text-muted-foreground">
                No cities found.
              </p>
            )}

            {!isSearching && !error && cities.length > 0 && (
              <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
                {cities.map((city) => (
                  <li
                    key={`${city.name}-${city.state ?? ''}-${city.country}-${city.lat}-${city.lon}`}
                    className="min-w-0"
                  >
                    <Link
                      to="/"
                      search={{
                        city: city.name,
                        state: city.state,
                        country: city.country,
                        lat: city.lat,
                        lon: city.lon,
                      }}
                      onClick={() => setHasSearched(false)}
                      className="block min-w-0 rounded-md border border-border p-3 text-left no-underline transition hover:border-ring hover:bg-accent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      <p className="m-0 truncate text-sm font-semibold">
                        {city.name}
                        {city.state ? `, ${city.state}` : ''}
                      </p>
                      <p className="m-0 truncate text-xs text-muted-foreground">
                        {city.country} · {city.lat.toFixed(2)},{' '}
                        {city.lon.toFixed(2)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
