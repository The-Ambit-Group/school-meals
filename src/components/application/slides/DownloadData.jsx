import React, { Component, PropTypes } from 'react'
import { observer } from 'mobx-react'
import { organization } from '../../../config'
import download from 'downloadjs'



@observer
class DownloadData extends Component {

    downloadData() {
      var stringData = JSON.stringify(applicationData, undefined, 2)
      // var downloadData = json2csv({data:applicationData})
      // console.log(JSON.parse(stringData))
      // console.log(downloadData);
      download(stringData, "nslp-data.json", "text/plain");
    }

    render() {
      return (
        <div>
          <button onClick={this.downloadData}>Download Data</button>
        </div>
      )
    }
}

export default DownloadData