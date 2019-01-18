import Symbol from "./Symbol";
import Scope from "../Scope/Scope";

class ScopedSymbol extends Symbol {

}
Object.assign(ScopedSymbol.prototype, Scope);
export default ScopedSymbol;