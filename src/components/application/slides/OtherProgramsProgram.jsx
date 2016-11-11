import React, { Component, PropTypes } from 'react'
import BooleanRadio from '../BooleanRadio'
import Checkbox from '../Checkbox'
import Checkboxes from '../Checkboxes'
import { observer } from 'mobx-react'
import { informalList, informalName, programDescription } from '../../../helpers'
import FormattedMessage from '../FormattedMessage'

@observer
class OtherProgramsProgram extends Component {
  constructor (props) {
    super(props)
    this.onIsApplicableChange = this.onIsApplicableChange.bind(this)
  }

  onIsApplicableChange(attrName, value) {
    const students = this.props.students

    this.props.applicability[attrName] = value

    if (!value) {
      for (let i = 0; i < students.length; i++) {
        students[i][attrName] = false
      }
    }
  }

  get labelPrefix() {
    const { allPeopleCollections, students } = this.props

    return <span>
      <FormattedMessage
              id="app.slides.otherProgramsProgram.doDoes"
              description="does or Do"
              defaultMessage="{studentLength}{students}"
              values={{
                studentLength: students.length === 1 ?
                      <FormattedMessage
                          id="app.slides.otherProgramsProgram.does"
                          description="Does"
                          defaultMessage="Does "
                      />
                      :
                      <FormattedMessage
                          id="app.slides.otherProgramsProgram.do"
                          description="Do"
                          defaultMessage="Do "
                      />,
                students: <strong>{informalList(students, allPeopleCollections,
                       <FormattedMessage
                          id="app.slides.otherProgramsProgram.or"
                          description="or"
                          defaultMessage=" or "
                      />
                      )}</strong>
              }}
      />
    </span>
  }

  render() {
    const { applicability, attribute, students } = this.props

    return (
      <div>
        <label>
          {this.labelPrefix} {programDescription(attribute)}?
          {this.props.children &&
           <small>
             <br />
             {this.props.children}
           </small>
          }
        </label>

        {students.length === 1 ?
         <BooleanRadio object={students[0]} name={attribute} />
         :
         <div>
           <BooleanRadio object={applicability} name={attribute}
                         onChange={this.onIsApplicableChange} />
           {applicability[attribute] &&
            <Checkboxes legend="Students">
              <label>
              <FormattedMessage
                          id="app.slides.otherProgramsProgram.whichStudents"
                          description="Which students?"
                          defaultMessage="Which students?"
              />
              </label>
              {
                students.map(student =>
                  <Checkbox object={student} name={attribute} key={student.id}>
                    {informalName(student)}
                  </Checkbox>
                )
              }
            </Checkboxes>
           }
         </div>
        }
      </div>
    )
  }
}

OtherProgramsProgram.propTypes = {
  allPeopleCollections: PropTypes.array.isRequired,
  applicability: PropTypes.object.isRequired,
  attribute: PropTypes.string.isRequired,
  students: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.object)
  ]).isRequired
}

export default OtherProgramsProgram
