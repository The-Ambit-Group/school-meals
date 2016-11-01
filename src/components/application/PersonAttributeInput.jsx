import React, { Component, PropTypes } from 'react'
import { observer } from 'mobx-react'
import InputField from './InputField'

@observer
class PersonAttributeInput extends Component {
  render() {
    const {
      person,
      name,
      label,
      required,
      placeholder
    } = this.props

    return(
      <InputField
          name={name}
          label={label}
          placeholder={placeholder}
          object={person}
          required={required}
      />
    )
  }
}

PersonAttributeInput.propTypes = {
  person: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool
}

PersonAttributeInput.defaultProps = {
  required: false
}

export default PersonAttributeInput
