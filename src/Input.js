import React from "react";
import {TextField} from "@material-ui/core/index";

class Input extends React.Component {


    render() {
        return <TextField
            //className={classes.text}
            //value={this.state.text}
            //value={this.state.tag}
            //onChange={this.handleChange}
            //margin="normal"
            multiline={true}
            style={{width: "80%"}}
        />
    }
}

export default (Input);