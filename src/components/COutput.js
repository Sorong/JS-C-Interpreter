import React from "react";
import {TextField} from "@material-ui/core/index";
import withStyles from "@material-ui/core/es/styles/withStyles";

const styles = theme => ({
    root: {
        margin: 5 * theme.spacing.unit,
        width: '50%',
        height: '80%'
    },
    button: {
        margin: theme.spacing.unit,
    },
    input: {
        display: 'none',
    },
});

class COutput extends React.Component {

    constructor(props) {
        super(props);

    }

    setOutput = (output) => {
        this.setState({
            out: output
        });
    }

    render() {
        const {classes} = this.props;
        return (
            <div className={classes.root}>
                <TextField
                    id="multiline-static"
                    label="Result"
                    multiline
                    rows="20"
                    //rowsMax={50}
                    defaultValue="empty"
                    className={"???"}
                    margin="normal"
                    fullWidth={'100%'}
                    value={this.props.out}
                />
            </div>)
    }
}

export default withStyles(styles, {withTheme: true})(COutput);