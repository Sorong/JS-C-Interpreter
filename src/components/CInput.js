import React from "react";
import {TextField} from "@material-ui/core/index";
import Button from '@material-ui/core/Button';
import {withStyles} from '@material-ui/core/styles';

const example = require('../assets/array.c');

const styles = theme => ({
    root: {
        margin: 5*theme.spacing.unit,
        width: '50%'
    },
    button: {
        margin: theme.spacing.unit,
    },
    input: {
        display: 'none',
    },
});

class CInput extends React.Component {
    state = {
        code: "code"//this.readFile(example)
    };
    loadExample = (url) => {
        fetch(url).then(r => r.text()).then(t => {
            this.setState({
                code: t
            });
            this.props.onClick(t);
        })
    };
    handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        });
    };



    constructor(props) {
        super(props);
        this.loadExample(example)
    }

    render() {
        const {classes} = this.props;

        //const { classes } = this.props;
        return (
            <div className={classes.root}>
                <TextField
                    id="multiline-static"
                    label="Input"
                    multiline
                    rows="20"
                    rowsMax={50}
                    value={this.state.code}
                    className={"???"}
                    margin="normal"
                    fullWidth={true}
                    onChange={this.handleChange('code')}
                />
                <Button variant="contained" className={classes.button} onClick={() => this.props.onClick(this.state.code)}>
                    Ob du das interpretieren kannst?
                </Button>
            </div>
        )
    }
}

export default withStyles(styles, {withTheme: true}) (CInput);

