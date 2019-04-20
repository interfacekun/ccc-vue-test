export default class Set{
    set: Object;
    constructor () {
      this.set = Object.create(null)
    }
    has (key: string | number) {
      return this.set[key] === true
    }
    add (key: string | number) {
      this.set[key] = true
    }
    clear () {
      this.set = Object.create(null)
    }
}


// export default class Set {
//     items = null;
//     constructor() {
//         this.items = {};
//     }
//     size = function () {
//         return Object.keys(this.items).length
//     }
//     has = function (value) {
//         this.items.hasOwnProperty(value)
//     }

//     add = function (value) {
//         if (!this.has[value]) {
//             this.items[value] = value
//             return true
//         }
//         return false
//     }

//     keys = function () {
//         return Object.keys(this.items)
//     }

//     values = function () {
//         return Object.values(this.items)
//     }

//     clear = function () {
//         this.items = {}
//     }
    
//     delete = function (value) {
//         if (this.has(value)) {
//             delete this.items[value]
//             return true
//         }
//         return false
//     }
// }