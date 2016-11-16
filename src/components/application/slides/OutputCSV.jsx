import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { organization } from '../../../config'



// @observer
class OutputCSV extends Component{
    constructor(props) {
        super(props);
    }

    downloadData(){
        var _dataTest =[['Bryan'],['Jacob']];
        console.log(_dataTest);
        console.log(this.props.applicationData);
        var csv = Papa.unparse(_dataTest);
        var downloadUri = 'data:Application/octet-stream,' + encodeURIComponent(csv);
        var download = window.open(downloadUri, 'Final Data Set');
    }

    render() {
        return (
            <button onClick={this.downloadData}>Download Data as CSV</button>
        )
    }
}

export default OutputCSV