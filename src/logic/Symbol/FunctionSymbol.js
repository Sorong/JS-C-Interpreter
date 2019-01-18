import Scope from "../Scope/Scope";
import Symbol from "../Symbol/Symbol";

class FunctionSymbol extends Symbol {

}
Object.assign(FunctionSymbol.prototype, Scope);
export default FunctionSymbol;