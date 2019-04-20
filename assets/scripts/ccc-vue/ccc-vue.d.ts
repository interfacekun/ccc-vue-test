declare class Watcher { 
    express: Array <any>;
    addDep: Function;
    init(value: any);
    teardown();
}

declare class Vue {
    static bind;
}

declare class Set {
    has;
    add;
    clear;
}
  