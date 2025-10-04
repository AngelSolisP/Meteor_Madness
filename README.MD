# Proyecto: Meteor Madness - Análisis de Datos NASA + USGS

## Contexto del Proyecto

Este documento detalla el análisis de los conjuntos de datos proporcionados para el proyecto "Meteor Madness", una herramienta de visualización y simulación de impactos de asteroides desarrollada en el contexto de un hackathon. El objetivo principal es integrar datos de la NASA sobre asteroides con datos geológicos del USGS (terremotos, elevación y zonas de tsunami) para simular y visualizar las consecuencias de un impacto.

## Objetivos del Análisis

1.  **Inspeccionar la estructura completa** de todos los archivos de datos (JSON/GeoJSON).
2.  **Identificar campos exactos utilizables** para los cálculos requeridos.
3.  **Determinar qué datos usar y cuáles descartar** para el MVP.
4.  **Definir cálculos viables** con los datos disponibles.

## Cálculos Requeridos (Resumen)

*   **Masa del asteroide:** `π/6 × diámetro³ × 3000 kg/m³`
*   **Energía cinética:** `½mv²`
*   **Equivalente TNT:** `E / 4.184×10¹² J/megatón`
*   **Tamaño de cráter:** `scaling laws (fórmulas de Collins et al.)`
*   **Magnitud sísmica estimada.**
*   **Radio de afectación por tsunami** (si el impacto es oceánico).

---

## 1. Análisis de Estructura y Campos Clave por Dataset

### 1.1. Datos de Asteroides (NASA NEO API)

#### `nasa_neo_feed_complete.json`

Este archivo parece contener un feed completo de objetos cercanos a la Tierra (NEO).

*   **Estructura:** Objeto JSON con una clave principal `near_earth_objects` que contiene fechas como claves, y cada fecha tiene una lista de objetos NEO.
*   **Campos Clave Identificados:**
    *   `id`: Identificador único del asteroide. (String)
    *   `name`: Nombre del asteroide. (String)
    *   `nasa_jpl_url`: URL de JPL para más detalles. (String)
    *   `absolute_magnitude_h`: Magnitud absoluta. (Float