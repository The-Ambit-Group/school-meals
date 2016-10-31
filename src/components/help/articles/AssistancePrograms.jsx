import React, { Component, PropTypes } from 'react'
import Article from '../Article'
import Topic from '../Topic'
import { organization, assistanceProgramsVar } from '../../../config'
import { schoolYear } from '../../../helpers'
import Household from '../topics/Household'
import SharedCustody from '../topics/SharedCustody'

export default class AssistancePrograms extends Component {
  render() {
    return (
      <Article>
//included
        <Topic title={`I received a letter from the school saying that my children were automatically approved for free meals for the upcoming ${schoolYear()} school year. Do I still need to complete an application`}>
          <p>
            No, but please read the letter carefully. If any children in your household were missing from your eligibility notification letter, they are also eligible for free meals, so you should contact {organization.name} ({organization.contact.phone} / {organization.contact.email} / {organization.contact.address}) immediately.
          </p>
        </Topic>
//included
        <Topic title={`My household participates in ${assistanceProgramsVar.snap.accronym} and/or ${assistanceProgramsVar.tanf.accronym}. Are my children eligible for free meals?`}>
          <p>
            All children in households are eligible for free meals when at least one household member is receiving benefits from {assistanceProgramsVar.snap.accronym}, the Food Distribution Program on Indian Reservations (FDPIR), or {assistanceProgramsVar.tanf.accronym}. If you participate in other assistance programs, contact {organization.name} ({organization.contact.phone} / {organization.contact.email} / {organization.contact.address}) to see if they qualify for you for school meal benefits.
          </p>
        </Topic>
//included
        <Topic title="I get WIC. Can my children get free meals?">
          <p>
            Participation in the Special Supplemental Nutrition Program for Women, Infants and Children, or WIC program, does not automatically qualify your children for free or reduced price school meals. You will need to qualify based on your household income by completing this application.
          </p>
        </Topic>
//included
        <Topic title="My family needs more help. Are there other programs we might apply for?">
          <p>
            To find out how to apply for {assistanceProgramsVar.snap.accronym} or other assistance benefits, contact {organization.name}.
          </p>
        </Topic>
//included
        <Topic title="My child attends head start. Is he/she eligible for free school meals and do I need to fill out an application?">
          <p>
            Yes. Children enrolled in Head Start are automatically eligible for free meals. You do not need to submit an application for school meal benefits unless you are requesting benefits for other school age children in your household.
          </p>
        </Topic>
//!!OMITTED!!
        <Household />
        <SharedCustody />
      </Article>
    )
  }
}
