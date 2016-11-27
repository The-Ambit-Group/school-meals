import React, { PropTypes } from 'react'
import shortid from 'shortid'
import { FormattedMessage } from 'react-intl'
import { action, computed, observable } from 'mobx'
import { assistancePrograms as assistanceProgramNames,
         assistanceProgramsVarArray } from '../config'
import { allStudentsAreFHMR,
         allStudentsAreFoster,
         applicableIncomeSources,
         formatDate } from '../helpers'

export default class ApplicationData {
  students = new StudentCollection()
  assistancePrograms = new AssistancePrograms()
  otherChildren = new OtherChildrenCollection()
  adults = new AdultCollection()

  @observable certifiedCorrect = false
  @observable electToProvideIncome = null

  @observable attestation = {
    date: formatDate(new Date(Date.now()))
  }

  @computed get attestor() {
    return this.adults.items.filter(adult => adult.isAttestor)[0]
  }

  @observable contact = {
    phone: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: ''
  }

  @observable signature = {
    noSsn: null,
    ssnLastFour: ''
  }

  @computed get allPeopleCollections() {
    return [this.students,
            this.otherChildren,
            this.adults]
  }

  @computed get totalHouseholdMembers() {
    return this.allPeopleCollections
               .map(collection => collection.length)
               .reduce((a, b) => a + b, 0)
  }

  @computed get allIncomes() {
    return this.allPeopleCollections
               .map(collection =>
                 collection.items
                           .map(person => applicableIncomeSources(person))
                           .reduce((a, b) => a.concat(b), [])
               )
               .reduce((a, b) => a.concat(b), [])
  }

  @computed get totalAnnualHouseholdIncome() {
    function toAnnual(income) {
      let amount = parseFloat(income.amount, 10)

      switch (income.frequency) {
        case 'annually':
          return amount * 1.0
        case 'monthly':
          return amount * 12.0
        case 'twicePerMonth':
          return amount * 24.0
        case 'everyTwoWeeks':
          return amount * 26.0
        case 'weekly':
          return amount * 52.0
        case 'hourly':
          let hours = parseFloat(income.hourlyHours, 10)

          switch (income.hourlyPeriod) {
            case 'day':
              return amount * hours * 365.0
            case 'week':
              return amount * hours * 52.0
            case 'month':
              return amount * hours * 12.0
            default:
              return 0.0
          }
        default:
          return 0.0
      }
    }

    return this.allIncomes
               .map(income => toAnnual(income))
               .reduce((a, b) => a + b, 0)
  }

  @computed get totalMonthlyHouseholdIncome() {
    return this.totalAnnualHouseholdIncome / 12.0
  }

  @computed get skipHousehold() {
    return this.assistancePrograms.hasAny ||
           allStudentsAreFoster(this.students) ||
           (
             allStudentsAreFHMR(this.students) &&
             this.electToProvideIncome === false
           )
  }

  @computed get showHousehold() {
    return !this.skipHousehold
  }

  @computed get cleaned() {
    return this
  }

  @action addIncomeSource(source) {
    source.more.push({ has: true, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '' })
  }

  @action removeIncomeSource(source, i) {
    if (i < source.more.length) {
      source.more.splice(i, 1)
    }
  }
}

export class AssistancePrograms {
  @observable items

  constructor(items = null) {
    if (items) {
      this.items = items
    } else {
      this.items = assistanceProgramNames.map((programName, i) => {
        return {
          isApplicable: null,
          id: shortid.generate(),
          name: programName,
          accronym: assistanceProgramsVarArray[i].accronym,
          caseNumber: ''
        }
      })
    }
  }

  tojson() {
    return this.items.toJSON()
  }

  map(func) {
    return this.items.map(func)
  }

  @computed get hasAny() {
    return this.items
               .map(item => item.isApplicable)
               .reduce((a, b) => a || b, false)
  }

  @computed get applicable() {
    return this.items.filter(item => item.isApplicable)
  }

  @computed get length() {
    return this.items.length
  }

  @computed get isValid() {
    return this.applicable
               .map(item => !!item.caseNumber)
               .reduce((a, b) => a && b, true)
  }
}

class PersonCollection {
  @observable items

  constructor(items = []) {
    this.items = items
  }

  get fields() {
    return [
      { name: 'firstName',
        label:
              <FormattedMessage
                  id="applicationData.person.firstName.label"
                  description="The label used for form fields."
                  defaultMessage="First name"
              />,
        required: true },
      { name: 'middleName',
        label:
              <FormattedMessage
                  id="applicationData.person.middleName.label"
                  description="The label used for form fields."
                  defaultMessage="Middle name"
              />
      },
      { name: 'lastName',
        label:
              <FormattedMessage
                  id="applicationData.person.lastName.label"
                  description="The label used for form fields."
                  defaultMessage="Last name"
              />,
        required: true },
      { name: 'suffix',
        label:
              <FormattedMessage
                  id="applicationData.person.suffix.label"
                  description="The label used for form fields."
                  defaultMessage="Suffix (e.g. Jr., Sr., I, II, III)"
              />
      }
    ]
  }

  // kind of ugly -- observable properties to track that aren't part of
  // the visible properties that #fields returns for person creation
  get propertiesOtherThanFields() {
    return {
      id: shortid.generate()
    }
  }

  get newItem() {
    let item = this.propertiesOtherThanFields

    for (let field of this.fields) {
      item[field.name] = ''
    }

    return item
  }

  toJSON() {
    return this.items.toJSON()
  }

  map(func) {
    return this.items.map(func)
  }

  @computed get hasAnyIncome() {
    for (let i = 0; i < this.items.length; i++) {
      let person = this.items[i]

      for (let type in person.incomeTypes) {
        let sources = person.incomeTypes[type].sources

        if (person.incomeTypes[type].isApplicable) {
          return true
        }
      }
    }

    return false
  }

  @computed get first() {
    return this.items[0]
  }

  @computed get length() {
    return this.items.length
  }

  @computed get isValid() {
    const requiredFieldNames =
      this.fields.filter(f => f.required).map(f => f.name)

    return this.items.map(function(item) {
      return requiredFieldNames.map(fieldName => !!item[fieldName].length)
    }).reduce((a, b) => a.concat(b), []).reduce((a, b) => a && b, true)
  }

  @action add(props = {}) {
    this.items.push(Object.assign(this.newItem, props))
  }

  @action remove(item) {
    this.items.remove(item)
  }

  @action empty() {
    this.items = []
  }

  @action clearAllIncomes() {
    for (let i = 0; i < this.items.length; i++) {
      let person = this.items[i]

      for (let typeKey in person.incomeTypes) {
        let type = person.incomeTypes[typeKey]
        let sources = type.sources

        type.isApplicable = null

        for (let sourceKey in sources) {
          sources[sourceKey] = { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] }
        }
      }
    }
  }
}

class AdultCollection extends PersonCollection {
  constructor(props) {
    super(props)

    if (!this.length) {
      this.add({ isAttestor: true })
    }
  }

  get propertiesOtherThanFields() {
    return Object.assign({}, super.propertiesOtherThanFields, {
      isAdult: true,
      isAttestor: false,
      incomeTypes: {
        military: {
          isApplicable: null,
          isDeployed: null,
          sources: {
            'basic':     { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] },
            'cashBonus': { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] },
            'allowance': { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] }
          }
        },
        employment: {
          isApplicable: null,
          sources: {
            'salaryWages':    { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] },
            'tips':           { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] },
            'commission':     { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] },
            'cashBonus':      { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] },
            'selfEmployment': { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] }
          }
        },
        publicAssistance: {
          isApplicable: null,
          sources: {
            'ssi':        { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] },
            'stateLocal': { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] }
          }
        },
        spousal: {
          isApplicable: null,
          sources: {
            'alimony':      { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] },
            'childSupport': { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] }
          }
        },
        unemployment: {
          isApplicable: null,
          sources: {
            'unemployment': { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] },
            'workersComp':  { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] },
            'strike':       { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] },
            'ssdi':         { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] },
            'veteran':      { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] }
          }
        },
        retirement: {
          isApplicable: null,
          sources: {
            'socialSecurity': { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] },
            'privatePension': { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] }
          }
        },
        other: {
          isApplicable: null,
          sources: {
            'regularCashPayments': { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] },
            'rentalIncome':        { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] },
            'earnedInterest':      { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] },
            'investmentIncome':    { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] },
            'annuity':             { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] },
            'other':               { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] }
          }
        }
      }
    })
  }

  get isValid() {
    return this.items.length >= 1 && super.isValid
  }
}

class ChildCollection extends PersonCollection {
  get propertiesOtherThanFields() {
    return Object.assign({}, super.propertiesOtherThanFields, {
      isChild: true,
      incomeTypes: {
        child: {
          isApplicable: null,
          sources: {
            'job':                 { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] },
            'socialSecurity':      { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] },
            'friendsFamily':       { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] },
            'pensionAnnuityTrust': { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] },
            'other':               { has: null, amount: '', frequency: '', hourlyHours: '', hourlyPeriod: '', more: [] }
          }
        }
      }
    })
  }
}

class OtherChildrenCollection extends ChildCollection {
  get fields() {
    return super.fields.concat([
      { name: 'isFoster',
        label:
              <FormattedMessage
                  id="applicationData.otherChild.isFoster.label"
                  description="The label used for form fields."
                  defaultMessage="Foster child"
              />,
        dataType: PropTypes.bool }
    ])
  }
}

class StudentCollection extends ChildCollection {
  constructor(props) {
    super(props)

    if (!this.length) {
      this.add()
    }
  }

  get fields() {
    return super.fields.concat([
      { name: 'school',
        label:
              <FormattedMessage
                  id="applicationData.student.school.label"
                  description="The label used for form fields."
                  defaultMessage="School"
              />
      },
      { name: 'grade',
        label:
              <FormattedMessage
                  id="applicationData.student.grade.label"
                  description="The label used for form fields."
                  defaultMessage="Grade"
              />
      }
    ])
  }

  get propertiesOtherThanFields() {
    return Object.assign({}, super.propertiesOtherThanFields, {
      isStudent: true,
      isFoster: null,
      isHomeless: null,
      isMigrant: null,
      isRunaway: null,
      demographics: {
        isNativeAmerican: null,
        isAsian: null,
        isBlack: null,
        isPacificIslander: null,
        isWhite: null,
        isHispanicLatino: null
      }
    })
  }

  get isValid() {
    return this.items.length >= 1 && super.isValid
  }

  @action clearSpecialStatuses() {
    for (let i = 0; i < this.items.length; i++) {
      let student = this.items[i]

      student.isFoster = null
      student.isHomeless = null
      student.isMigrant = null
      student.isRunaway = null
    }
  }
}
