import React from 'react'

const e = React.createElement

/** @param {number} n @param {string} sg @param {string} pl */
const pl = (n, sg, pl) => n === 1 ? `${n} ${sg}` : `${n} ${pl}`

/** @typedef {'burns'|'turns'|'hazards'|'radHazards'|'fuelSteps'} MetricKey */

/** @typedef {import('./MapData').MapData} MapData */

/** @param {{mapData: MapData, path: PathNode[]|null, weight: {burns: number, turns: number, hazards: number, radHazards: number, fuelSteps: number}, metricPriority: MetricKey[], prioritizeMetric: (metric: MetricKey) => void, cancelPath: () => void, constraints: Record<MetricKey, number|null>, setConstraint: (key: MetricKey, value: number|null) => void}} props */
function PathInfo({mapData, path, weight, metricPriority, prioritizeMetric, cancelPath, constraints, setConstraint}) {
  if (!path) return e('div')

  const sourcePoint = path ? mapData.points[path[0].node] : null
  const destinationPoint = path ? mapData.points[path[path.length - 1].node] : null

  /** @type {Record<MetricKey, {sg: string, pl: string}>} */
  const metricMeta = {
    burns: {sg: 'burn', pl: 'burns'},
    turns: {sg: 'turn', pl: 'turns'},
    hazards: {sg: 'hazard', pl: 'hazards'},
    radHazards: {sg: 'rad hazard', pl: 'rad hazards'},
    fuelSteps: {sg: 'fuel step', pl: 'fuel steps'},
  }
  const orderedMetrics = metricPriority
    .map(key => ({key, ...metricMeta[key]}))

  return e('div', {className: 'PathInfo'},
    orderedMetrics.map(({key, sg, pl: plural}) => {
      const topPriority = metricPriority[0] === key
      const constraint = constraints[key]
      const label = constraint !== null
        ? `${weight[key]} / ${constraint} ${constraint === 1 ? sg : plural}`
        : `${pl(weight[key], sg, plural)}`
      return e('div', {key, className: 'PathInfo-row'},
        e('span', {className: 'PathInfo-label' + (constraint !== null && weight[key] > constraint ? ' PathInfo-label--over' : '')}, label),
        e('input', {
          type: 'number',
          className: 'PathInfo-constraintInput',
          min: 0,
          placeholder: '--',
          value: constraint ?? '',
          onChange: (/** @type {React.ChangeEvent<HTMLInputElement>} */ ev) => {
            const val = ev.target.value
            if (val === '') {
              setConstraint(key, null)
            } else {
              const n = Number(val)
              if (Number.isFinite(n) && n >= 0) setConstraint(key, n)
            }
          },
        }),
        topPriority ? null : e('button', {
          type: 'button',
          className: 'PathInfo-priorityButton' + (topPriority ? ' selected' : ''),
          'aria-pressed': topPriority,
          onClick: () => prioritizeMetric(key),
        }, '\u2B06'),
      )
    }),
    e('div', {className: 'PathInfo-row PathInfo-destinationRow'},
      e('span', {className: 'PathInfo-destination'}, `${sourcePoint?.siteName ?? '\u2022'} \u2192 ${destinationPoint?.siteName ?? '\u2022'}`),
      e('button', {
        type: 'button',
        className: 'PathInfo-cancelButton',
        'aria-label': 'Cancel path',
        onClick: cancelPath,
      }, '\u2715'),
    ),
  )
}

const isruLevels = [0, 1, 2, 3, 4]

const siteTypeOptions = ['C', 'S', 'M', 'V', 'D', 'H']

const solarSeasonOptions = ['red', 'yellow', 'blue']

/** @param {{isru: number, setIsru: (value: number) => void, thrust: number, setThrust: (value: number) => void, enabledSiteTypes: Set<string>, toggleSiteType: (type: string) => void, solarSeason: string, setSolarSeason: (value: string) => void, fuelRateNum: number, setFuelRateNum: (value: number) => void, fuelRateDen: number, setFuelRateDen: (value: number) => void, fuelCapacity: number, setFuelCapacity: (value: number) => void, freePivot: boolean, setFreePivot: (value: boolean) => void}} param0 */
function VehicleInfo({isru, setIsru, thrust, setThrust, enabledSiteTypes, toggleSiteType, solarSeason, setSolarSeason, fuelRateNum, setFuelRateNum, fuelRateDen, setFuelRateDen, fuelCapacity, setFuelCapacity, freePivot, setFreePivot}) {
  /** @param {string} value */
  const updateThrust = (value) => {
    const n = Number(value)
    if (Number.isNaN(n)) return
    setThrust(n)
  }

  return e('details', {className: 'VehicleInfo', open: true},
    e('summary', {className: 'vehicle-info-summary'},
      e('span', {className: 'vehicle-info-icon'}, '\uD83D\uDE80'),
      e('span', {className: 'vehicle-info-title'}, 'Vehicle Info'),
    ),
    e('div', {className: 'vehicle-info-body'},
      e('div', {className: 'field', role: 'group', 'aria-label': 'Thrust'},
        e('div', {className: 'label-row'},
          e('span', {className: 'label'}, 'Thrust')
        ),
        e('div', {className: 'thrust-inputs'},
          e('input', {
            type: 'range',
            min: 1,
            max: 15,
            step: 1,
            value: thrust,
            onChange: (ev) => updateThrust(ev.target.value),
          }),
          e('input', {
            type: 'number',
            min: 1,
            max: 15,
            step: 1,
            value: thrust,
            inputMode: 'numeric',
            onChange: (ev) => updateThrust(ev.target.value),
          }),
        )
      ),
      e('div', {className: 'field', role: 'group', 'aria-label': 'Fuel Rate'},
        e('div', {className: 'label-row'},
          e('span', {className: 'label'}, 'Fuel Rate'),
        ),
        e('div', {className: 'fuel-rate-inputs'},
          e('input', {
            type: 'number',
            className: 'fuel-rate-field',
            min: 0,
            value: fuelRateNum,
            inputMode: 'numeric',
            onChange: (/** @type {React.ChangeEvent<HTMLInputElement>} */ ev) => {
              const n = Number(ev.target.value)
              if (Number.isFinite(n)) setFuelRateNum(n)
            },
          }),
          e('span', {className: 'fuel-rate-separator'}, '/'),
          e('input', {
            type: 'number',
            className: 'fuel-rate-field',
            min: 1,
            value: fuelRateDen,
            inputMode: 'numeric',
            onChange: (/** @type {React.ChangeEvent<HTMLInputElement>} */ ev) => {
              const n = Number(ev.target.value)
              if (Number.isFinite(n) && n >= 1) setFuelRateDen(n)
            },
          }),
        ),
      ),
      e('div', {className: 'field', role: 'group', 'aria-label': 'Fuel Capacity'},
        e('div', {className: 'label-row'},
          e('span', {className: 'label'}, 'Fuel Capacity (steps)'),
        ),
        e('input', {
          type: 'number',
          min: 0,
          value: fuelCapacity || '',
          placeholder: '\u221E',
          inputMode: 'numeric',
          onChange: (/** @type {React.ChangeEvent<HTMLInputElement>} */ ev) => {
            const val = ev.target.value
            if (val === '') {
              setFuelCapacity(0)
            } else {
              const n = Number(val)
              if (Number.isFinite(n)) setFuelCapacity(n)
            }
          },
        }),
      ),
      e('div', {className: 'field'},
        e('label', {className: 'checkbox-label'},
          e('input', {
            type: 'checkbox',
            checked: freePivot,
            onChange: (/** @type {React.ChangeEvent<HTMLInputElement>} */ ev) => setFreePivot(ev.target.checked),
          }),
          e('span', null, 'Free Pivot'),
        ),
      ),
      e('div', {className: 'field', role: 'group', 'aria-label': 'Solar Season'},
        e('div', {className: 'label-row'},
          e('span', {className: 'label'}, 'Solar Season'),
        ),
        e('div', {className: 'solar-season-buttons'},
          solarSeasonOptions.map(season =>
          e('button', {
            key: season,
            type: 'button',
            className: `solar-season-button solar-season-${season}` + (solarSeason === season ? ' selected' : ''),
            'aria-pressed': solarSeason === season,
            onClick: () => setSolarSeason(season),
          }, season[0].toUpperCase() + season.slice(1))
        )
        )
      ),
      e('div', {className: 'field', role: 'group', 'aria-label': 'Site Hydration'},
        e('span', {className: 'label'}, 'Site Hydration'),
        e('div', {className: 'isru-buttons'},
          isruLevels.map(level =>
            e('button', {
              key: level,
              type: 'button',
              className: 'isru-button' + (isru === level ? ' selected' : ''),
              'aria-pressed': isru === level,
              onClick: () => setIsru(level),
            }, `${level}+`)
          )
        )
      ),
      e('div', {className: 'field', role: 'group', 'aria-label': 'Spectral Type'},
        e('div', {className: 'label-row'},
          e('span', {className: 'label'}, 'Spectral Type'),
        ),
        e('div', {className: 'site-type-buttons'},
          siteTypeOptions.map(type =>
            e('button', {
              key: type,
              type: 'button',
              className: 'site-type-button' + (enabledSiteTypes.has(type) ? ' selected' : ''),
              'aria-pressed': enabledSiteTypes.has(type),
              onClick: () => toggleSiteType(type),
            }, type)
          )
        )
      )
    )
  )
}

/** @param {{mapData: MapData, path: PathNode[]|null, weight: {burns: number, turns: number, hazards: number, radHazards: number, fuelSteps: number}, metricPriority: MetricKey[], prioritizeMetric: (metric: MetricKey) => void, cancelPath: () => void, isru: number, setIsru: (value: number) => void, thrust: number, setThrust: (value: number) => void, enabledSiteTypes: Set<string>, toggleSiteType: (type: string) => void, solarSeason: string, setSolarSeason: (value: string) => void, fuelRateNum: number, setFuelRateNum: (value: number) => void, fuelRateDen: number, setFuelRateDen: (value: number) => void, fuelCapacity: number, setFuelCapacity: (value: number) => void, freePivot: boolean, setFreePivot: (value: boolean) => void, constraints: Record<MetricKey, number|null>, setConstraint: (key: MetricKey, value: number|null) => void}} props */
export function Overlay({mapData, path, weight, metricPriority, prioritizeMetric, cancelPath, isru, setIsru, thrust, setThrust, enabledSiteTypes, toggleSiteType, solarSeason, setSolarSeason, fuelRateNum, setFuelRateNum, fuelRateDen, setFuelRateDen, fuelCapacity, setFuelCapacity, freePivot, setFreePivot, constraints, setConstraint}) {
  return e(React.Fragment, null,
    PathInfo({mapData, path, weight, metricPriority, prioritizeMetric, cancelPath, constraints, setConstraint}),
    VehicleInfo({isru, setIsru, thrust, setThrust, enabledSiteTypes, toggleSiteType, solarSeason, setSolarSeason, fuelRateNum, setFuelRateNum, fuelRateDen, setFuelRateDen, fuelCapacity, setFuelCapacity, freePivot, setFreePivot}),
  )
}
