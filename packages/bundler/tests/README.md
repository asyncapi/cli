# Example

I would like to create a simple example of the usecase for the bundler and what it is trying to solve. Inspired by [zbos](https://bitbucket.org/qbmt/zbos-mqtt-api/src/master/), where there are multiple asyncapi files that define one particular component. 

Consider two separate specification file that define two different interfaces. They have seperate channels and message payload for their respected interface, all bundler does is combine them together. Check the following files [audio.yml](./audio.yml), [camera.yml](./camera.yml), [base.yml](./base.yml) for examples. 

For now bundler does not refence the `$ref`s and rather does something like this ⬇️.

<details>
  <summary> camera.yml </summary>
  
  ```yaml
  components:
    messages:
      keyMessage:
        payload:
          type: object
          properties:
            key:
              type: string
              description: Required random key
        name: KeyResult
        summary: Random key
        examples:
          - payload:
              key: ABCxyz  
  ```
  
</details>

<details>
  <summary> audio.yml </summary>
  
  ```yaml
 components:
    messages:
      emptyMessage:
        payload:
          type: object
        name: EmptyMessage
        summary: Empty message
  ```
  
</details>

After combining: 
<details>
  <summary> all.yml </summary>
  
  ```yaml
  components:
    messages:
      emptyMessage:
        payload:
          type: object
        name: EmptyMessage
        summary: Empty message
      keyMessage:
        payload:
          type: object
          properties:
            key:
              type: string
              description: Required random key
        name: KeyResult
        summary: Random key
        examples:
          - payload:
              key: ABCxyz
  ```
  </details>
  
