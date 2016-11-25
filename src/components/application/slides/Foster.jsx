import React, { Component, PropTypes } from 'react'
import Slide from '../Slide'
import InformalNameList from '../InformalNameList'
import OtherProgramsProgram from './OtherProgramsProgram'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { organization } from '../../../config'
import { FormattedMessage } from 'react-intl'

@observer
class Foster extends Component {
  @observable applicability = {
    isFoster: null
  }

  constructor (props) {
    super(props)
    this.onChange = this.onChange.bind(this)
  }

  onChange(fieldName, value, student) {
    student[fieldName] = value

    if (value) {
      student.isHomeless = null
      student.isMigrant = null
      student.isRunaway = null
    }
  }

  get isValid() {
    const students = this.props.students

    if (students.length === 1) {
      for (let key in this.applicability) {
        if (students.first[key] == null) {
          return false
        }
      }
    } else {
      for (let key in this.applicability) {
        switch(this.applicability[key]) {
          case null:
            return false
          case true:
            if (students
              .map(student => student[key] !== true)
              .reduce((a, b) => a && b, true)) {
              return false
            }
        }
      }
    }

    return true
  }

  render() {
    const { allPeopleCollections, students } = this.props
    const contact = `${organization.name} (${organization.contact.phone} / ${organization.contact.email} / ${organization.contact.address})`
    const studentCount = students.length
    const props = {
      students: students.items,
      allPeopleCollections,
      applicability: this.applicability,
      attribute: 'isFoster',
      onChange: this.onChange,
      label: <FormattedMessage
                 id="app.slides.foster.label"
                 description="Question asking if student in foster care."
                 defaultMessage="{studentCount, plural, one {Does} other {Do}} {studentNames} live with you under a formal (court-ordered) foster care arrangement?"
                 values={{
                   studentCount,
                   studentNames: <InformalNameList people={students} intersection={true} />,
                 }}
             />
    }

    return (
      <Slide nextDisabled={!this.isValid} id="foster">
        <p className="usa-font-lead">
          <FormattedMessage
              id="app.slides.foster.confirm"
              description="No problem."
              defaultMessage="No problem! There are other ways to qualify."
          />

        </p>

        <OtherProgramsProgram {...props} />
      </Slide>
    )
  }
}

Foster.propTypes = {
  allPeopleCollections: PropTypes.array.isRequired,
  students: PropTypes.object.isRequired
}

export default Foster
