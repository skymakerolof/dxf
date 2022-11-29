import headerHandler from './handlers/header'
import tablesHandler from './handlers/tables'
import blocksHandler from './handlers/blocks'
import entitiesHandler from './handlers/entities'
import objectsHandler from './handlers/objects'
import logger from './util/logger'

// Parse the value into the native representation
const parseValue = (type, value) => {
  if (type >= 10 && type < 60) {
    return parseFloat(value, 10)
  } else if (type >= 210 && type < 240) {
    return parseFloat(value, 10)
  } else if (type >= 60 && type < 100) {
    return parseInt(value, 10)
  } else {
    return value
  }
}

// Content lines are alternate lines of type and value
const convertToTypesAndValues = (contentLines) => {
  let state = 'type'
  let type
  const typesAndValues = []
  for (const line of contentLines) {
    if (state === 'type') {
      type = parseInt(line, 10)
      state = 'value'
    } else {
      typesAndValues.push([type, parseValue(type, line)])
      state = 'type'
    }
  }
  return typesAndValues
}

const separateSections = (tuples) => {
  let sectionTuples
  return tuples.reduce((sections, tuple) => {
    if (tuple[0] === 0 && tuple[1] === 'SECTION') {
      sectionTuples = []
    } else if (tuple[0] === 0 && tuple[1] === 'ENDSEC') {
      sections.push(sectionTuples)
      sectionTuples = undefined
    } else if (sectionTuples !== undefined) {
      sectionTuples.push(tuple)
    }
    return sections
  }, [])
}

// Each section start with the type tuple, then proceeds
// with the contents of the section
const reduceSection = (acc, section) => {
  const sectionType = section[0][1]
  const contentTuples = section.slice(1)
  switch (sectionType) {
    case 'HEADER':
      acc.header = headerHandler(contentTuples)
      break
    case 'TABLES':
      acc.tables = tablesHandler(contentTuples)
      break
    case 'BLOCKS':
      acc.blocks = blocksHandler(contentTuples)
      break
    case 'ENTITIES':
      acc.entities = entitiesHandler(contentTuples)
      break
    case 'OBJECTS':
      acc.objects = objectsHandler(contentTuples)
      break
    default:
      logger.warn(`Unsupported section: ${sectionType}`)
  }
  return acc
}

export default (string) => {
  const lines = string.split(/\r\n|\r|\n/g)
  const tuples = convertToTypesAndValues(lines)
  const sections = separateSections(tuples)
  const result = sections.reduce(reduceSection, {
    // Start with empty defaults in the event of empty sections
    header: {},
    blocks: [],
    entities: [],
    objects: { layouts: [] },
    tables: { layers: {}, styles: {}, ltypes: {} },
  })
  return result
}
