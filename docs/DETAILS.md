# Details 

## Primitive
```ts
number // 0
string // ""
boolean // false
boolean[] // []
void // undefined
null // null
undefined // undefined
never // undefined
```

## Interfaces
```ts
interface Person {
    id: string
    name: string 
}
/* 
{
    id: "",
    name: ""
} 
*/
```
## Interfaces with call signatures
For overload methods it will use the first one
```ts
interface Person {
    (): number
    (): string
    name: string 
}

const mock = createMock<Person>();
mock() // 0
mock.name // ""

```
## Classes
```ts
interface Person {
    private _id: string;
    name: string 
}
/* 
{
    name: ""
} 
*/
```
## Methods
``` ts
interface InterfaceWithMethod {
    method(): string
} 
/* 
{
  method: () => {
      return ""
  }
} 
*/
```

## Literal
```ts
type Data = {
    id: "I am a specific string",
    number: 2
}
/*
{
    id: "I am a specific string",
    number: 2
}
/*
```
## Enum (it will select the first value)
```ts
enum Direction {
    LEFT,
    RIGHT
}

interface WithEnum {
    direction: Direction
}
/*
{
    direction: DIRECTION.LEFT
}
/*
```
## Function
```ts
const mock = createMock<() => string>();
mock // () => ""
```

## Object
```ts
const mock = createMock<{a: string}>();
mock // { a: "" }
```

## Key in
```ts
type Keys = "a" | "b";
type myType = {[key in Keys]: string}
const mock = createMock<myType>();
mock // { a: "", b: "" }
```

## Key in keyof
```ts
type Keys = {
	a: number;
}		
type keyInKeyof = {[key in keyof Keys]: string}
const mock = createMock<keyInKeyof>();
mock // { a: "" }
```

## Optional
```ts
class MyClass {
	test?: string;
}	
const mock = createMock<MyClass>();
mock // { test: undefined }
```

## Typescript libraries (Array, Number... ecc)
This is a special case. The library try to convert to the most useful type.
```ts
class MyClass {
  array: Array<number>; // []
  number: Number; // 0;
  promise: Promise<string>// a promise that will resolve an empty string Promise.resolve("")
}	
```

## Tuple
```ts
class MyClass {
  tuple: [string, number];
}	

const mock = createMock<MyClass>();
mock // { tuple: [] }
```

## Union (it will convert to the first type)
```ts
class MyClass {
  union: string | number;
}	

const mock = createMock<MyClass>();
mock // { union: "" }
```

## Dictionary
```ts
type Dictionary<T> = {
  [key: string]: T;
}

const mock = createMock<Dictionary<Interface>>();
mock // {}
```

## Extends
```ts
interface Keys {
  a: string;
}
interface Interface extends Keys {
    b: boolean;
}

const mock = createMock<Interface>();
mock // { a: "", b: "" }
```

## Generics
```ts
interface WithGeneric<T>{
  generic: T
}

const mock = createMock<WithGeneric<string>>();
mock // { generic: "" }
```

## Intersection
```ts
interface IntersectionA {
  a: string;
}

interface IntersectionB {
  b: number;
}
interface Interface {
  intersection: IntersectionA & IntersectionB,
}

const mock = createMock<Interface>();
mock // { intersection: { a: "", b: 0 } }
```
