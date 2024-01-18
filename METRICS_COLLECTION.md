# Metrics collection guideline

AsyncAPI CLI collects **anonymous metrics** .
You can find examples of the metrics we collect [here]() an [there](). 
You can always disable this by setting the environment variable BLABLA to false. 

'AsyncAPI anonymously tracks command executions to improve the specification and tools, ensuring no sensitive data reaches our servers. It aids in comprehending how AsyncAPI tools are used and adopted, facilitating ongoing improvements to our specifications and tools.

## What we collect
We are collecting the following metrics:

- asyncapi_adoption.action.invoked

- asyncapi_adoption.action.executed


## Where we collect
...

## How to disable tracking
To disable tracking, set the "ASYNCAPI_METRICS" env variable to "false" when executing the command. For instance: `ASYNCAPI_METRICS=false asyncapi validate <spec-file-path>`

Remember that keeping this tracking enabled will help AsyncAPI community to provide better specifications and tools in the future.
