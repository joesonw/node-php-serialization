 php-serialization
==================
Javascript tool to unserialize php serialized data, or to serialize data the way php does. This was originally used in manipulating php session stored in redis server.

This also supports Laravel extended php session serialization (can be used to serialize/unserialize Laravel session)
Installation
------------

### Node.js

Install from npm:
```sh
npm install php-serialization
```

Usage
-----
### Unserialize
```js
var unserialize=require("php-serialization").unserialize;
var result=unserialize("a:1:{s:3:\"key\";s:11:\"hello world\"}");
console.log(result.key);
//hello world
```

### Serialize
```j
var serialize=require("php-serialization").serialize;
var Class=require("php-serialization").Class;
var c=new Class("") //array
var o=new Class("MongoId") //object
o.__addAttr__("_value","string","123efa21bc123","string");
o.__addAttr__("_private_value","string","i'm private","string","private");
o.__addAttr__("_protected_value","string","i'm protected","string","protected");
c.__addAttr__("_id","string",o,"object");
console.log(serialize(c,"array"));
//a:1:{s:3:"_id";O:7:"MongoId":3:{s:6:"_value";s:13:"123efa21bc123";s:23:"MongoId_private_value";s:11:"i'm private";s:19:"*_protected_value";s:13:"i'm protected";}}
```

### Notes

This project was originally used in manipulating sessions between Nodejs and Laravel 4. So certain code complexities were added to implement all Laravel 4 session serialization feature.

#### Breif introduction of the serialization format
######     *normal php session will work the same.

```
B       [01]
D       [0-9]
S       [a-zA-Z0-9_]
K       integer|string
V       integer|string+|float|boolean|null|class|array|object
integer i:<D+>;                                 //i:<value>;
float   d:<D+.D+>;                              //d:<value>;
string  s:<D+>:"<S+>";                          //s:<length of string>:"<string>";
boolean b:<B>;                                  //b:<true of false>; notice that it can only be either 1 or 0;
null    n;                                      //
class   c:<D+>:"<S+>":<D+>:{<S+>}               //c:<length of class name>:<class name>:<length of value>:{<value>}   notice that this is a general class, it presents the serialized valye of a class (reasons are still unknown,only seen in laravel). For general meaning class,please see *Object*
array   a:<D+>:{<[KV]+>}                        //a:<size of properties>:{<property_key><property_value>......}
object  o:<D+>:"<S+>":<D+>:{<[KV]+>}            //o:<length of object/class name>:"<object/class name>":<size of properties>:{<property_key><property_value>......}
resource r:<D+>;                                //r:<resource id>;
```

### API References
#### unserialize(str:*string*);            
####serialize(obj:\*,type:*string*);   
```
type is the value from above format list;
```
####new Class(name:*string*); 
```
if name is null,it means it's a normal array/object (not a class)
```
####Class.\_\_has\_\_(key:*string*);

####Class.\_\_addAttr\_\_(key:\*,keyType:*string*,value:\*,valueType:*string*,scope:*string*="public",getter:*Function*=default,setter:*Function*=default);
```
notice that *key* can only be integer or string;
*keyType* and *vaueType* indicates the type of key/value;
*scope* can be public,protected,private ;
*getter* and *setter* are called when getting/setting this value. default setter/getter are provided,which would be simple return/set values.(eg,without typechecking,etc);
```
####Class.\_\_typeOf\_\_(key:*string*);
####Class.\_\_keyTypeOf\_\_(key:*string*);
####Class.\_\_scopeOf\_\_(key:*string*);


