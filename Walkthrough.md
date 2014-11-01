

## Why Typescript?

Typescript avoids changing the syntax of Javascript as much as possible.

All Javascript is perfectly valid Typescript. Typescript outputs human-readable Javascript.

Typescript adds one feature that is missing from Javascript - Type Definitions.


## What is a type?

Type systems have existed in computing for longer than I've been alive.

They are one of the only things keeping your code working.

They translate this:
    var boxCounter = 5;

To this value in RAM:
    00000000 00000000 00000000 00000101


## Strong / Weak types

To demonstrate the differences between strong & weak types in languages, look at this code snippet:

    // Javascript:
    // This is a variable. It could be anything.
    var boxCounter;         // Allocate an arbitrary amount of RAM.
    boxCounter = 5;         // Store a value of 5.
    boxCounter = 'cinco';   // Store an array of 16-bit Unicode Characters.

    // C++:
    // This is a 64-bit integer.
    // It can be anything from –2,147,483,648 to 2,147,483,647
    long boxCounter;            // Allocate 8 bytes in RAM.
    boxCounter = 5;             // Set the value to 5.
    boxCounter = 'no bueno';    // This code won't even work.


## Why do Static Typing?

There are many benefits to statically typed languages:
 - IDE support for auto-completion / closer teamwork.
 - Ability to quickly find errors
 - Faster code execution
 - Less run-time errors

## Objections to Static Types:

Programmers who come from a Javascript/Python/Ruby background can have objections to type systems:

 - Type systems add complicated syntax to my code
 - It takes longer for me to write code in C++, Java, etc...
 - I want to accept multiple types of inputs for my function.
 - I like to quack when I work. 'Duck Typing' please.


## Best of Both Worlds

Typescript provides an answer to the Javascript developer who is looking to have all the benefits
of statically typed systems, without the headaches associated with a complicated type syntax.

Types are optional - All Javascript is perfectly valid Typescript.


# Types and Interfaces

We use types all the time - A Javascript developer commonly recognizes five types:

    Number
    String
    Boolean
    Object
    Function

# Default types in Typescript

Like Javascript, Typescript supports some basic types:

    number
    boolean
    string

Plus, some new types:
    void
    any

What happened to Object and Function?

# Compilers

In reality, Object and Function are much more complicated than they appear.
An object could be anything, and it can change over time.

    // Perfectly valid (and insane) Javascript:
    var object = {};
    object.value = 'The fruit bowl has the following: ';
    object.value = function () { return 'Apple';}
    object['value'] = object.value() + "'s and oranges.";
    object.value = (function() {
                return object.value + ' And banannas.';
                })();

How is a compiler to know which is which?

How can an IDE provide you with reliable code hinting in this situation?

'Duck Typing' works great for developers, but how do you tell a compiler what a duck is?


## Interfaces

Interfaces tell Typescript what to expect when it sees your custom object.

    // Duck interface
    interface Duck {
        age: number;
        name: string;
        secretIdentity: string;

        walk(distance:number): void;
        fly(destination:string) : void;
        quack(volume: number): void;
    }

## Generic Types

For a typical SPA, we might see something like this:

    interface Resource<T> {
        route: string;
        get(): T;
        post(value:T): boolean;
        put(values: any): boolean;
        delete(value: T): boolean;
    }

<T> represents a generic type. It gets defined as you use it.

Example:

    interface Chicken{
        id: number;
        name: string;
        breed: string;
        weight: number;
    }

    class ChickenResource implements Resource<Chicken>
    {

    }



# Setting Up Typescript

Setting up Typescript requires a working knowledge of NPM. We'll also be covering Grunt-TS,
and how this can be used to compile Typescript files on a project basis.

## NPM Package

    npm install -g typescript

This installs the Typescript compiler globally. The latest version is 1.1.0-1, which we'll be using.

## Typescript Compiler

    tsc [options] [file]

Unfortunately, this doesn't watch entire folders, like SASS. However, this can be fixed quickly with Grunt-TS.
