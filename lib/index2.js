'use strict';

const headerHandler = require('./handlers2/header');

const toLines = (string) => {
  const lines = string.split(/\r\n|\r|\n/g);
  const contentLines = lines.filter((l) => {
    return l.trim !== 'EOF';
  });
  return contentLines;
};

// Parse the value into the native representation
const parseValue = (type, value) => {
  if ((type >= 10) && (type < 60)) {
    return parseFloat(value, 10);
  } else if ((type >= 60) && (type < 100)) {
    return parseInt(value, 10);
  } else {
    return value;
  }
};

// Content lines are alternate lines of type and value
const convertToTypesAndValues = (contentLines) => {
  let state = 'type';
  let type;
  const typesAndValues = [];
  for(let line of contentLines) {
    if (state === 'type') {
      type = parseInt(line, 10);
      state = 'value';
    } else {
      typesAndValues.push([type, parseValue(type, line)]);
      state = 'type';
    }
  }
  return typesAndValues;
};


const separateSections = (tuples) => {
  let sectionTuples;
  return tuples.reduce((sections, tuple) => {
    if ((tuple[0] === 0) && (tuple[1] === 'SECTION')) {
      sectionTuples = [];
    } else if ((tuple[0] === 0) && (tuple[1] === 'ENDSEC')) {
      sections.push(sectionTuples);
      sectionTuples = undefined;
    } else if (sectionTuples !== undefined) {
      sectionTuples.push(tuple);
    }
    return sections;
  }, []);
};


const reduceSection = (acc, tuples) => {
  console.log('*', tuples[0]);
  switch(tuples[0][1]) {
    case 'HEADER':
      acc.header = headerHandler(tuples.slice(1));
      break;
    default:
  }
  return acc;
};

module.exports.parseString = (string) => {
  const lines = toLines(string);
  const tuples = convertToTypesAndValues(lines);
  console.log('0', tuples.length);
  const sections = separateSections(tuples);
  const result = sections.reduce(reduceSection, {});

  console.log('2', result);
  return result;
};
