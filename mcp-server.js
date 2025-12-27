#!/usr/bin/env node

/**
 * MCP Server for Hazard Map
 * Provides external API access for weather and disaster data
 *
 * Run with: node mcp-server.js
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

// API Endpoints
const API_ENDPOINTS = {
  // GDACS RSS to JSON conversion service
  gdacs: 'https://www.gdacs.org/XML/rss.xml',
  // NWS Weather Alerts (CAP format)
  nws: 'https://api.weather.gov/alerts',
  // Open-Meteo Weather API (no CORS, no API key needed)
  openmeteo: 'https://api.open-meteo.com/v1/forecast',
}

/**
 * Parse GDACS RSS feed and convert to JSON
 * Uses a public RSS to JSON converter
 */
async function fetchGDACSEvents() {
  try {
    // Use rss2json API to convert RSS to JSON
    const rssUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(API_ENDPOINTS.gdacs)}`
    const response = await fetch(rssUrl)

    if (!response.ok) {
      throw new Error(`GDACS API failed: ${response.status}`)
    }

    const data = await response.json()

    if (data.status !== 'ok') {
      return []
    }

    // Parse GDACS events from RSS items
    const events = (data.items || []).map((item, index) => {
      // Extract coordinates from GDACS description
      const latMatch = item.description?.match(/lat:\s*([-\d.]+)/i)
      const lonMatch = item.description?.match(/lon:\s*([-\d.]+)/i)
      const typeMatch = item.title?.match(/\((\w{2})\)/)

      // Extract alert level from description or title
      const alertLevelMatch = item.description?.match(/alert level:\s*(\w+)/i) ||
                             item.title?.match(/(\w+)\s+Alert/i)

      const eventType = typeMatch ? typeMatch[1] : 'DR'
      const latitude = latMatch ? parseFloat(latMatch[1]) : 0
      const longitude = lonMatch ? parseFloat(lonMatch[1]) : 0

      // Map to country from description (if available)
      const countryMatch = item.description?.match(/country:\s*([^,]+)/i) ||
                          item.title?.match(/-\s*([^,]+)/)

      return {
        id: 'gdacs_' + (item.guid || index),
        event_type: EVENT_TYPE_MAP[eventType] || 'Disaster',
        event_type_code: eventType,
        country: countryMatch ? countryMatch[1].trim() : 'Unknown',
        position: [latitude, longitude],
        alert_level: alertLevelMatch ? alertLevelMatch[1].toLowerCase() : 'green',
        date: item.pubDate,
        title: item.title,
        description: item.description,
        link: item.link,
        source: 'GDACS'
      }
    }).filter(event => event.position[0] !== 0 && event.position[1] !== 0)

    return events
  } catch (error) {
    console.error('Error fetching GDACS events:', error)
    return []
  }
}

const EVENT_TYPE_MAP = {
  'EQ': 'Earthquake',
  'TC': 'Tropical Cyclone',
  'FL': 'Flood',
  'WF': 'Wildfire',
  'VO': 'Volcanic Eruption',
  'TS': 'Tsunami',
  'DR': 'Drought'
}

/**
 * Fetch NWS Weather Alerts
 * Returns alerts in GeoJSON format
 */
async function fetchNWSAlerts() {
  try {
    const response = await fetch(API_ENDPOINTS.nws, {
      headers: {
        'Accept': 'application/geo+json',
        'User-Agent': 'HazardMap/1.0 (https://hazardmap.example.com)'
      }
    })

    if (!response.ok) {
      throw new Error(`NWS API failed: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching NWS alerts:', error)
    return { features: [] }
  }
}

/**
 * Fetch weather forecast from Open-Meteo
 */
async function fetchWeatherForecast(latitude, longitude) {
  try {
    const url = `${API_ENDPOINTS.openmeteo}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
    const response = await fetch(url)
    console.log(response)
    if (!response.ok) {
      throw new Error(`Open-Meteo API failed: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching weather forecast:', error)
    return null
  }
}

/**
 * Determine which API to call based on the request type
 * This is the "thinking" part - intelligently route requests
 */
async function routeAPIRequest(requestType, params) {
  switch (requestType) {
    case 'gdacs_events':
      return await fetchGDACSEvents()

    case 'nws_alerts':
      return await fetchNWSAlerts()

    case 'weather_forecast':
      if (!params.latitude || !params.longitude) {
        throw new Error('latitude and longitude required for weather forecast')
      }
      return await fetchWeatherForecast(params.latitude, params.longitude)

    case 'all':
      // Fetch all data in parallel
      const [events, alerts] = await Promise.all([
        fetchGDACSEvents(),
        fetchNWSAlerts()
      ])
      return { events, alerts }

    default:
      throw new Error(`Unknown request type: ${requestType}`)
  }
}

// MCP Server setup
const server = new Server(
  {
    name: 'hazard-map-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'fetch_gdacs_events',
        description: 'Fetch disaster events from GDACS (Global Disaster Alert and Coordination System)',
        inputSchema: {
          type: 'object',
          properties: {},
        }
      },
      {
        name: 'fetch_nws_alerts',
        description: 'Fetch weather alerts from NWS (National Weather Service - US only)',
        inputSchema: {
          type: 'object',
          properties: {},
        }
      },
      {
        name: 'fetch_weather_forecast',
        description: 'Fetch weather forecast for a specific location (Open-Meteo API)',
        inputSchema: {
          type: 'object',
          properties: {
            latitude: {
              type: 'number',
              description: 'Latitude coordinate'
            },
            longitude: {
              type: 'number',
              description: 'Longitude coordinate'
            }
          },
          required: ['latitude', 'longitude']
        }
      },
      {
        name: 'fetch_all_hazards',
        description: 'Fetch all hazard data (GDACS events + NWS alerts)',
        inputSchema: {
          type: 'object',
          properties: {},
        }
      }
    ]
  }
})

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    let result

    switch (name) {
      case 'fetch_gdacs_events':
        result = await fetchGDACSEvents()
        break

      case 'fetch_nws_alerts':
        result = await fetchNWSAlerts()
        break

      case 'fetch_weather_forecast':
        result = await fetchWeatherForecast(args.latitude, args.longitude)
        break

      case 'fetch_all_hazards':
        const [events, alerts] = await Promise.all([
          fetchGDACSEvents(),
          fetchNWSAlerts()
        ])
        result = { events, alerts }
        break

      default:
        throw new Error(`Unknown tool: ${name}`)
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: error.message })
        }
      ],
      isError: true
    }
  }
})

// Start the server
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Hazard Map MCP Server running on stdio')
}

main().catch(console.error)
