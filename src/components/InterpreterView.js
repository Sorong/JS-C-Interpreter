import React from "react";
import COutput from "./COutput";
import CInput from "./CInput";
import withStyles from "@material-ui/core/es/styles/withStyles";
import Interpreter from "../logic/Interpreter";

const styles = theme => ({
    root: {
        flexGrow: 1,
        height: '100%',
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        width: '100%',
    }
});

class InterpreterView extends React.Component {
    interpreter = new Interpreter();
    state = {
      out : "out"
    };

    constructor(props) {
        super(props);
        this.interpret = this.interpret.bind(this);
    }

    interpret(code) {
        let result = this.interpreter.interpret(code);

        this.setState({
            out : result
        })
    }

    render() {
        const { classes } = this.props;
        return  <div className={classes.root}>
            <CInput onClick={this.interpret}/> <COutput out={this.state.out}/>
        </div>
    }
}

export default withStyles(styles, {withTheme: true}) (InterpreterView);