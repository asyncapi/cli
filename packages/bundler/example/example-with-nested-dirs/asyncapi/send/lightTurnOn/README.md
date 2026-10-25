# Light Turn On 1.0.0 documentation


## Operations

### SEND `smartylighting/streetlights/1/0/action/{streetlightId}/turn/on` Operation

* Operation ID: `turnOn`

#### Message Turn on/off `turnOnOff`

*Command a particular streetlight to turn the lights on or off.*

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | - | - | - | **additional properties are allowed** |
| command | string | Whether to turn on or off the light. | allowed (`"on"`, `"off"`) | - | - |
| sentAt | string | Date and time when the message was sent. | - | format (`date-time`) | - |

> Examples of payload _(generated)_

```json
{
  "command": "on",
  "sentAt": "2019-08-24T14:15:22Z"
}
```



