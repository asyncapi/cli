## Classes

<dl>
<dt><a href="#Optimizer">Optimizer</a></dt>
<dd><p>this class is the starting point of the library.
user will only interact with this class. here we generate different kind of reports using optimizers, apply changes and return the results to the user.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#findAllComponents">findAllComponents(optimizableComponentGroup)</a> ⇒</dt>
<dd></dd>
<dt><a href="#findDuplicateComponents">findDuplicateComponents(optimizableComponentGroup)</a> ⇒</dt>
<dd></dd>
<dt><a href="#hasParent">hasParent()</a></dt>
<dd><p>Checks if a component&#39;s parent is a ref or not.</p>
</dd>
<dt><a href="#isEqual">isEqual(component1, component2, referentialEqualityCheck)</a> ⇒</dt>
<dd></dd>
<dt><a href="#isInComponents">isInComponents()</a></dt>
<dd><p>checks if a component is located in <code>components</code> section of an asyncapi document.</p>
</dd>
<dt><a href="#isInChannels">isInChannels()</a></dt>
<dd><p>checks if a component is located in <code>channels</code> section of an asyncapi document.</p>
</dd>
<dt><a href="#toJS">toJS()</a></dt>
<dd><p>Converts JSON or YAML string object.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Rules">Rules</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#DisableOptimizationFor">DisableOptimizationFor</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#Options">Options</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="Optimizer"></a>

## Optimizer
this class is the starting point of the library.
user will only interact with this class. here we generate different kind of reports using optimizers, apply changes and return the results to the user.

**Kind**: global class  
**Access**: public  

* [Optimizer](#Optimizer)
    * [new Optimizer(YAMLorJSON)](#new_Optimizer_new)
    * [.getReport()](#Optimizer+getReport) ⇒ <code>Report</code>
    * [.getOptimizedDocument([Options])](#Optimizer+getOptimizedDocument) ⇒ <code>string</code>

<a name="new_Optimizer_new"></a>

### new Optimizer(YAMLorJSON)

| Param | Type | Description |
| --- | --- | --- |
| YAMLorJSON | <code>any</code> | YAML or JSON document that you want to optimize. You can pass Object, YAML or JSON version of your AsyncAPI document here. |

<a name="Optimizer+getReport"></a>

### optimizer.getReport() ⇒ <code>Report</code>
**Kind**: instance method of [<code>Optimizer</code>](#Optimizer)  
**Returns**: <code>Report</code> - an object containing all of the optimizations that the library can do.  
<a name="Optimizer+getOptimizedDocument"></a>

### optimizer.getOptimizedDocument([Options]) ⇒ <code>string</code>
This function is used to get the optimized document after seeing the report.

**Kind**: instance method of [<code>Optimizer</code>](#Optimizer)  
**Returns**: <code>string</code> - returns an stringified version of the YAML output.  

| Param | Type | Description |
| --- | --- | --- |
| [Options] | [<code>Options</code>](#Options) | the options are a way to customize the final output. |

<a name="findAllComponents"></a>

## findAllComponents(optimizableComponentGroup) ⇒
**Kind**: global function  
**Returns**: A list of optimization report elements.  

| Param | Description |
| --- | --- |
| optimizableComponentGroup | all AsyncAPI Specification-valid components. |

<a name="findDuplicateComponents"></a>

## findDuplicateComponents(optimizableComponentGroup) ⇒
**Kind**: global function  
**Returns**: A list of optimization report elements.  

| Param | Description |
| --- | --- |
| optimizableComponentGroup | all AsyncAPI Specification-valid components that you want to analyze for duplicates. |

<a name="hasParent"></a>

## hasParent()
Checks if a component's parent is a ref or not.

**Kind**: global function  
<a name="isEqual"></a>

## isEqual(component1, component2, referentialEqualityCheck) ⇒
**Kind**: global function  
**Returns**: whether the two components are equal.  

| Param | Description |
| --- | --- |
| component1 | The first component that you want to compare with the second component. |
| component2 | The second component. |
| referentialEqualityCheck | If `true` the function will return true if the two components have referential equality OR they have the same structure. If `false` the it will only return true if they have the same structure but they are NOT referentially equal. |

<a name="isInComponents"></a>

## isInComponents()
checks if a component is located in `components` section of an asyncapi document.

**Kind**: global function  
<a name="isInChannels"></a>

## isInChannels()
checks if a component is located in `channels` section of an asyncapi document.

**Kind**: global function  
<a name="toJS"></a>

## toJS()
Converts JSON or YAML string object.

**Kind**: global function  
<a name="Rules"></a>

## Rules : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [reuseComponents] | <code>Boolean</code> | whether to reuse components from `components` section or not. Defaults to `true`. |
| [removeComponents] | <code>Boolean</code> | whether to remove un-used components from `components` section or not. Defaults to `true`. |
| [moveAllToComponents] | <code>Boolean</code> | whether to move all AsyncAPI Specification-valid components to the `components` section or not. Defaults to `true`. |
| [moveDuplicatesToComponents] | <code>Boolean</code> | whether to move duplicated components to the `components` section or not. Defaults to `false`. |

<a name="DisableOptimizationFor"></a>

## DisableOptimizationFor : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [schema] | <code>Boolean</code> | whether object `schema` should be excluded from the process of optimization (`true` instructs **not** to add calculated `schemas` to the optimized AsyncAPI Document.) |

<a name="Options"></a>

## Options : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [rules] | [<code>Rules</code>](#Rules) | the list of rules that specifies which type of optimizations should be applied. |
| [output] | <code>String</code> | specifies which type of output user wants, `'JSON'` or `'YAML'`. Defaults to `'YAML'`; |
| [disableOptimizationFor] | [<code>DisableOptimizationFor</code>](#DisableOptimizationFor) | the list of objects that should be excluded from the process of optimization. |

