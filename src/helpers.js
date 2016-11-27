﻿export function schoolYear(startYear = new Date().getFullYear()) {
  return `${startYear}–${startYear + 1}`
}

// Retuns zero padded YYYY-MM-DD given a date object.
export function formatDate(date) {
  let dd = date.getDate().toString()
  let mm = (date.getMonth() + 1).toString()
  const yyyy = date.getFullYear().toString()

  if (dd.length === 1) {
    dd = `0${dd}`
  }

  if (mm.length === 1) {
    mm = `0${mm}`
  }

  return `${mm}/${dd}/${yyyy}`
}

export function fullName(person) {
  let result = person.firstName

  if (person.middleName) {
    result += ` ${person.middleName}`
  }

  result += ` ${person.lastName}`

  if (person.suffix) {
    result += ` ${person.suffix}`
  }

  return result
}

// Returns the shortest possible unique representation of a name.
export function informalName(person,
                             allPeopleCollections = window.applicationData.allPeopleCollections, // Quick hack to avoid passing around in context everywhere.
                             disambiguate = true) {
  let result = person.firstName

  let includeLast = false
  let includeMiddle = false
  let includeSuffix = false
  let includeDisambig = false

  for (let i = 0; i < allPeopleCollections.length; i++) {
    for (let j = 0; j < allPeopleCollections[i].items.length; j++) {
      const otherPerson = allPeopleCollections[i].items[j]

      if (person.id === otherPerson.id) {
        continue
      }

      if (person.firstName === otherPerson.firstName) {
        if (person.lastName === otherPerson.lastName) {
          if (!person.middleName ||
              person.middleName === otherPerson.middleName) {
            if (!person.suffix || person.suffix === otherPerson.suffix) {
              includeDisambig = true
            } else {
              includeSuffix = true
            }
          } else {
            includeMiddle = true
          }
        } else {
          includeLast = true
        }
      }
    }
  }

  if (includeMiddle) {
    includeLast = true
  }

  if (includeMiddle) {
    result += ` ${person.middleName}`
  }

  if (includeLast) {
    result += ` ${person.lastName}`
  }

  if (includeSuffix) {
    result += ` ${person.suffix}`
  }

  if (includeDisambig && disambiguate) {
    if (person.school && person.grade) {
      result += ` (${person.school}, grade ${person.grade})`
    } else if (person.isStudent) {
      result += ' (student)'
    } else if (person.isChild) {
      result += ' (child)'
    } else if (person.isAdult) {
      result += ' (adult)'
    } else {
      // Should never happen, but good ot have a default.
      result += ` (${person.id})`
    }
  }

  return result
}

export function hoursExceedPeriodCapacity(incomeSource) {
  const hours = incomeSource.hourlyHours || 0

  switch (incomeSource.hourlyPeriod) {
    case 'day':
      return hours > 24
    case 'week':
      return hours > 168
    case 'month':
      return hours > 730
    default:
      return false
  }
}

function incomeSourceIsValid(incomeSource) {
  return incomeSource.has === false ||
         !!(
             incomeSource.has &&
             incomeSource.amount &&
             incomeSource.frequency &&
             (
               incomeSource.frequency !== 'hourly' ||
               (incomeSource.hourlyHours && incomeSource.hourlyPeriod &&
                !hoursExceedPeriodCapacity(incomeSource))
             ) &&
             (
               !incomeSource.more ||
               incomeSource.more
                 .map(moreSource => incomeSourceIsValid(moreSource))
                 .reduce((a, b) => a && b, true)
             )
         )
}

export function incomeTypeIsValid(incomeType, mustNotBeNull = []) {
  switch (incomeType.isApplicable) {
    case true: {
      // Invalid if any of the non-nullable incomeType fields are null.
      if (mustNotBeNull.map(name => incomeType[name] == null)
        .reduce((a, b) => a || b, false)) {
        return false
      }
      const incomeSources = []
      for (const name in incomeType.sources) {
        incomeSources.push(incomeType.sources[name])
      }

      // Invalid if all are "No" for an applicable incomeType.
      if (incomeSources
        .map(incomeSource => incomeSource.has === false)
        .reduce((a, b) => a && b, true)) {
        return false
      }

      return incomeSources
        .map(incomeSource => incomeSourceIsValid(incomeSource))
        .reduce((a, b) => a && b, true)
    }
    case false:
      return true
    default:
      return false
  }
}

export function allStudentsAreFHMR(students) {
  const qualifyingAttributes = [
    'isFoster',
    'isHomeless',
    'isMigrant',
    'isRunaway'
  ]

  if (!students.length) {
    return false
  }

  return students
    .map(student => {
      return qualifyingAttributes
        .map(attr => student[attr] === true)
        .reduce((a, b) => a || b, false)
    })
    .reduce((a, b) => a && b, true)
}

export function allStudentsAreFoster(students) {
  if (!students.length) {
    return false
  }

  return students
    .map(student => student.isFoster)
    .reduce((a, b) => a && b, true)
}

export function applicableIncomeSources(person) {
  const result = []

  for (const type in person.incomeTypes) {
    const sources = person.incomeTypes[type].sources

    if (!person.incomeTypes[type].isApplicable) {
      continue
    }

    for (const sourceKey in sources) {
      const source = sources[sourceKey]

      if (!source.has) {
        continue
      }

      result.push({
        source: sourceKey,
        type,
        num: 0,
        amount: source.amount,
        frequency: source.frequency,
        hourlyHours: source.hourlyHours,
        hourlyPeriod: source.hourlyPeriod
      })

      // Add additional income sources to the total
      // User can add additional income for each sourceKey in UI
      // Example: User has 2 Salary/Wage jobs -- Uber and Waiter

      for (let i = 0, len = source.more.length; i < len; i++){
        const moreIncome = source.more[i]

        result.push({
          source: sourceKey,
          type,
          num: i + 1, // Needed for printing summary later.
          amount: moreIncome.amount,
          frequency: moreIncome.frequency,
          hourlyHours: moreIncome.hourlyHours,
          hourlyPeriod: moreIncome.hourlyPeriod
        })
      }
    }
  }

  return result
}
