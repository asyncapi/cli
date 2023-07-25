---
title: 'Introduction'
weight: 20
---


The AsyncAPI CLI is a command-line tool that provides developers with a set of commands for working with AsyncAPI documents. AsyncAPI is a specification for describing asynchronous APIs, which allows developers to define the structure of messages exchanged between different parts of their application. The AsyncAPI CLI simplifies the process of creating, validating, bundling, and manipulating AsyncAPI documents, making it easier to work with asynchronous APIs.

## Features

The AsyncAPI CLI offers the following key features:

* Creation: New AsyncAPI documents can be created from scratch using the CLI, which is useful when starting a new project or needing to create a new version of an existing API.

* Validation: AsyncAPI documents can be quickly and easily validated using the [AsyncAPI Parser](https://github.com/asyncapi/parser-js), which ensures that the documents conform to the AsyncAPI specification and catches errors early in the development process.

* Conversion: The AsyncAPI CLI can be used to convert AsyncAPI documents from one version to another. This is useful for migrating APIs to a newer version of the AsyncAPI specification.

* Difference: The AsyncAPI CLI can be used to find the differences between two AsyncAPI documents. This is useful for comparing different versions of an API or for identifying changes that have been made to an API.
  
* Generation: The AsyncAPI CLI leverages AsyncAPI libraries like [Generator](https://github.com/asyncapi/generator) and [Modelina](https://github.com/asyncapi/modelina), which allow you to generate various types of documentation, applications, and models in different programming languages. This feature can save a significant amount of time and effort when creating new APIs.

* Optimize: Using [Optimizer](https://github.com/asyncapi/optimizer/) the AsyncAPI CLI can be used to optimize an AsyncAPI specification file which can optimize structure of the AsyncAPI document to make it basically smaller and without repetition.

* Start: The AsyncAPI CLI can be used to start [AsyncAPI Studio](https://studio.asyncapi.com/) locally. This is a web-based tool that can be used to view, edit, and test AsyncAPI documents.
  
* Format Conversion: The AsyncAPI CLI offers seamless conversion of AsyncAPI documents between different formats, such as YAML and JSON, through integration with the [AsyncAPI Converter](https://github.com/asyncapi/converter-js). This feature is helpful when working with tools that require a specific document format.
  
To summarize, the AsyncAPI CLI offers the following features and process flow, as shown in the diagram below:

```mermaid
graph TD;
A[AsyncAPI Document]
B[Creation]
J[Studio - Editor]
I[Optimization]
D[Validation]
C[Generation]
F[Apps/Docs]
G[Models]
H[Diff]
K[Bundling]
E[Conversion]
A-->B;
A-->D;
A-->C;
C-->F
C-->G
A-->H;
A-->I;
A-->J;
A-->E;
A-->K;
```

## CLI flow

The following flowchart illustrates the process flow of the AsyncAPI CLI:

```mermaid
graph TD;
A[Start] --> B[User runs the AsyncAPI CLI]
B --> C[User issues a command]
C --> D[CLI processes the command and runs the corresponding operation]
D --> |Is the operation successful?| E{Yes}
D --> |Is the operation recoverable?| F{Yes}
E --> G[CLI returns the results of the operation to the user]
F --> |Operation Error| H[CLI displays an error message and suggests possible next steps]
G --> J[User receives the results]
H --> I[User follows suggested steps to recover]
I --> C[User reissues the corrected command]
I --> J
J[User terminates the AsyncAPI CLI] --> K[End]
```

This flowchart shows the high-level process that occurs when using the AsyncAPI CLI. The user starts by running a command (such as `validate`, `generate`, or `start`), which is processed by the CLI. The CLI then performs the corresponding operation (such as validating or generating an AsyncAPI document), and returns the results to the user. If an error occurs, the CLI displays an error message and suggests possible next steps for the user to take.
