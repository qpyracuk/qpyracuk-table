# @qpyracuk/table

A universal iterator for **complex** objects.
JavaScript out of the box supports iterating over object fields only at the first nesting level.
Perhaps you once needed to traverse the entire object in order to find a specific value, or for custom serialization. To do this, each time I had to write my own iterator.
This library solves exactly this problem!
It supports primitive types and data structures such as objects, arrays, Map and Set.
When traversed, the iterator uses non-recursive traversal algorithms, so you don't have to worry about **call stack overflows**!

## Installation

This is a JS library available through the npm registry.
Before installation, you need to download and install `Node.js`.
Requires `Node.js v0.1.0 or higher`.

If this is a completely new project, be sure to create a `package.json` file using the npm init command.

To install the package, enter the `npm install @qpyracuk/iterator` command in the console.

```sh
npm install @qpyracuk/iterator
```

## Features

- Creating a `depth-first` iterator;
- Creating a `breadth-first` iterator;
- Receiving a ready sequence of nodes in the order corresponding to the selected bypass algorithm;
- Obtaining a ready-made sequence of primitive values stored in nodes in the order corresponding to the selected traversal algorithm;
- Takes into account link loops;
- `Non-recursive` traversal algorithm;
- Does not change the structure and data in the original object;
- Support for data structures such as `Object`, `Array`, `Map`, `Set`;
- Support for `CommonJS` and `ESMAScript` modules.

## Quick Start

After installing the package, import the library.

For ESMAScript modules:

```js
import Iterator from '@qpyracuk/iterator';
```

For CommonJS modules:

```js
const Iterator = require('@qpyracuk/iterator');
```

### Usage example

#### We create an object that needs to be traversed

```js
const object = {
  primitive: '1',
  object: {
    primitive: 3,
    set: new Set([1, 2, new Map([['key', { field: { value: 100 } }]])]),
    map: new Map([['key', { value: 10 }]])
  }
};
```

#### Traversal in depth

```js
// Create depth-first iterator
const depthIterator = Iterator.createDepthIterator(object);
// Traversal of all nodes
while (depthIterator.has()) {
  console.log('depth', depthIterator.next());
}
// Resetting the current iterator state
depthIterator.reset();
// Traversing the primitive values of all nodes
while (depthIterator.has()) {
  console.log('depth-primitive', depthIterator.nextLiaf());
}
```

#### Traversal in breadth

```js
// Create breadth-first iterator
const breadthIterator = Iterator.createBreadthIterator(object);
// Traversal of all nodes
while (breadthIterator.has()) {
  console.log('breadth', breadthIterator.next());
}
// Resetting the current iterator state
breadthIterator.reset();
// Traversing the primitive values of all nodes
while (breadthIterator.has()) {
  console.log('breadth-primitive', breadthIterator.nextLiaf());
}
```

#### Getting ready sequences

```js
// The sequence of all nodes of an object during depth-first traversal
console.log(createDepthFirstSequenceNode(object));
// The sequence of all nodes of an object during a breadth-first traversal
console.log(createBreadthFirstSequenceNode(object));
// Sequence of all PRIMITIVE VALUES, in depth-first traversal
console.log(createDepthFirstSequenceLiaf(object));
// Sequence of all PRIMITIVE VALUES, in a breadth-first traversal
console.log(createBreadthFirstSequenceLiaf(object));
```

### Return value

Iterators return an object corresponding to the internal interface `INode`.

```ts
interface INode {
  value: any; // Node value.
  key: string; // Name of the object field (for the root object key === 'root').
  level: number; // Nesting level of the current value.
  type:
    | 'string' // If the current value is a string.
    | 'number' // If the current value is a number.
    | 'boolean' // If the current value is a boolean type.
    | 'symbol' // If the current value is a character.
    | 'bigint' // If the current value is BigInt.
    | 'undefined' // If the current value is undefined.
    | 'null' // If the current value is null.
    | 'object' // If the current node is an object.
    | 'map' // If the current node is a key-value map.
    | 'set' // If the current node is a Set collection.
    | 'array' // If the current node is an array.
    | 'function' // If the current node is a function.
    | ''; // May return in case of unknown data type.
}
```

### Iterator builder methods

All methods take 2 parameters as input
`root` - any value _(required)_.
`depth` - maximum depth level when traversing _(default: "Infinity")_.

#### createDepthFirstIterator(root, depth): `DepthFirstIterator`

Creates a `depth-first` traversal iterator object.

#### createBreadthFirstIterator(root, depth): `BreadthFirstIterator`

Creates a `breadth-first` traversal iterator object.

#### createDepthFirstSequenceNode(root, depth): `INode[]`

Creates an array of INode interface objects. The array is a linear sequence of **ALL NODES** obtained during a `depth-first` traversal of the object tree.

#### createBreadthFirstSequenceNode(root, depth): `INode[]`

Creates an array of INode interface objects. The array is a linear sequence of **ALL NODES** obtained during a `breadth-first` traversal of the object tree.

#### createDepthFirstSequenceLiaf(root, depth): `INode[]`

Creates an array of INode interface objects. An array is a linear sequence of **ALL PRIMITIVE VALUES** obtained from a `depth-first` traversal of the object tree.

#### createBreadthFirstSequenceLiaf(root, depth): `INode[]`

Creates an array of INode interface objects. An array is a linear sequence of all **PRIMITIVE VALUES** obtained from a `breadth-first` traversal of the object tree.

### Iterator methods

#### has(): `boolean`

Checks whether the end of the traversal has been reached.
`true` - the end of the tree has not been reached.
`false` - the end of the tree has been reached.

#### next(): `INode | undefined`

Returns an INode object or undefined if the end of the tree is reached.

#### nextLiaf(): `INode | undefined`

Returns an INode object corresponding only to the primitive values within the object, or undefined if the end of the tree is reached.

#### get(): `INode | undefined`

Returns the last node of an object or undefined if the end of the tree is reached.

#### reset(): `void`

Resets the iterator state to the initial state

### Traversal depth

Each Iterator class method takes a second parameter, `depth`.
By default it is set to `"Infinity"`, which tells the iterator to iterate over the object completely.
But you can artificially limit the traversal depth by specifying a numerical value `depth > 0`.

## Algorithms

Iterators implement two `non-recursive` traversal algorithms:

1. Depth-first graph traversal using a stack;
2. Breadth-first graph traversal using a queue.

Due to the fact that the iterator does not use recursion, it is guaranteed that there is no possibility of a call stack overflow.

### Protection against reference loops

You don't have to worry about the iterator going into a loop if two objects refer to each other. Since each “vertex of the graph” is written into the Set structure, and if the iterator hits an already processed vertex, the iterator switches to processing the next one.

## Author

The author of the library is Pobedinskiy David.

## Bugs

If you encounter unexpected errors, please let me know.
By e-mail [qpyracuk@gmail.com](qpyracuk@gmail.com) or in [Telegram](https://t.me/qpyracuk).

## Support the author

If my work has helped you make your life easier, you can support me with your donations.

[Boosty](https://boosty.to/qpyracuk)
[Patreon](https://patreon.com/qpyracuk)

Search npm for other libraries with the @qpyracuk prefix. Perhaps you will find something useful for your project.
