# Lighting Measured 1.0.0 documentation


## Operations

### RECEIVE `smartylighting/streetlights/1/0/event/{streetlightId}/lighting/measured` Operation

*Inform about environmental lighting conditions of a particular streetlight.*

* Operation ID: `receiveLightMeasurement`

The topic on which measured values may be produced and consumed.

#### Parameters

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| streetlightId | string | The ID of the streetlight. | - | - | **required** |


#### Message Light measured `lightMeasured`

*Inform about environmental lighting conditions of a particular streetlight.*

* Message ID: `lightMeasured`
* Content type: [application/json](https://www.iana.org/assignments/media-types/application/json)

##### Payload

| Name | Type | Description | Value | Constraints | Notes |
|---|---|---|---|---|---|
| (root) | object | - | - | - | **additional properties are allowed** |
| lumens | integer | Light intensity measured in lumens. | - | >= 0 | - |
| sentAt | string | Date and time when the message was sent. | - | format (`date-time`) | - |

> Examples of payload _(generated)_

```json
{
  "lumens": 0,
  "sentAt": "2019-08-24T14:15:22Z"
}
```



