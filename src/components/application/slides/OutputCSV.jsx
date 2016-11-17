import React, { Component, PropTypes } from 'react'
import { observer } from 'mobx-react'
import { organization } from '../../../config'



@observer
class OutputCSV extends Component {
    // constructor(props, context) {
    //     super(props, context);
    //     console.log('Props:',props)
    //     console.log('Context:',context)
    // }


    downloadData() {
        var stringData = JSON.stringify(applicationData, undefined, 2)
        var downloadData = json2csv({data:applicationData})
        console.log(JSON.parse(stringData))
        // console.log(downloadData);
        download(stringData, "NSLP Data.txt", "text/plain");
    }

    render() {
        const {applicationData} = this.props

        return (
            <div>
                <button onClick={this.downloadData}>Download Data</button>
            </div>
        )
    }
}

export default OutputCSV