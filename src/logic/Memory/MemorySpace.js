class MemorySpace {
    name;
    members = {};
    constructor(name) {
        this.name = name;
        this.members = {};
    }
    put(name, v) {
        this.members[name] = v;
    }
    get(name) {
        return this.members[name] !== undefined ? this.members[name] : null;
    }

}

export default MemorySpace;