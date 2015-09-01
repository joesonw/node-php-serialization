(function(window, exports) {
    var Class=require("./Class").Class;
    var util=require("util")
    var bigdecimal=require("bigdecimal");
    exports.unserialize = unserialize;
    exports.serialize=serialize;
	exports.Class=Class;


    function read(string,length) {
        var counter=0;
        var buf='';
        var scope='public';
        var i=0;

        if (string.charCodeAt(0)===0) {
            if (string.charAt(1).charCodeAt(0)===42) {
                scope="protected";
                length-=3;
                string=string.substr(3);
            } else {
                scope="private";
            }
        }
        for (;counter<length;i++,counter++) {
            var c=string.charCodeAt(i);
            if (c===0 && scope==="private") {
                continue;
            }
            if (c>255) {
                counter+=2;
            }
            buf+=String.fromCharCode(c);
        }
        return {result:buf,scope:scope,length:counter};
    }





    function readUntil(string, delimiter,delimiter2) {
        var buf = "";
        if (delimiter2==undefined) {
            delimiter2=delimiter;
        }
        var counter = 0;
        for (; ; counter++) {
            var rawc = string.charCodeAt(counter);
            var c;
            if (rawc==0) {
                continue;
            }
            c=String.fromCharCode(rawc);
            if (c == delimiter || c==delimiter2) {
                break;
            }
            buf += c;
        }
        string = string.substr(buf.length + 1);
        return {result: buf, buffer: string};
    }
    function unserialize_item(string) {
        var result = "";
        var buf = string;
        var copy=buf;
        var typeResult = readUntil(buf, ':',';');
        buf = typeResult.buffer;
        var type = typeResult.result;
        var buf2, buf2Result;
        switch (type.toLowerCase()) {
            case 's':
            case 'a':
            case 'o':
            case 'c':
                buf2Result = readUntil(buf, ':');
                buf = buf2Result.buffer;
                buf2 = buf2Result.result;
                break;
            case 'd':
            case 'i':
            case 'b':
            case 'r':
                buf2Result = readUntil(buf, ';');
                buf = buf2Result.buffer;
                buf2 = buf2Result.result;
                break;
        }
        var length,val;
        switch (type.toLowerCase()) {
            case 's':   //s:len<string>:"<string>";
                length = parseInt(buf2);  //string length;
                var valResult=read(buf.substr(1),length);
                val = valResult.result;
                var valScope=valResult.scope;

                if (valScope==="protected") {
                    buf=buf.substr(1+val.length+3+2);
                } else if (valScope==="private") {
                    buf=buf.substr(1+val.length+2+2);
                } else {
                    buf=buf.substr(1+val.length+2);
                }
                result={result:val,type:"string",scope:valScope};
                break;
            case 'i':   //i:<integer>;
                val = parseInt(buf2);
                result={result:val,type:"integer"};
                break;
            case 'd':    //d:<float>;
                val = new bigdecimal.BigDecimal(buf2);
                result={result:val,type:'float'};
                break;
            case 'r':    //r:<integer>;
                val=parseInt(buf2);
                result={result:val,type:'resource'};
                break;
            case 'a':    //a:len<array>:{<key>;<val>.....}
                var tmpResult = unserialize_array(buf, parseInt(buf2));
                buf = tmpResult.buffer;
                result = {result:tmpResult.result,type:'array'};
                break;
            case 'o':    //o:len<object_class_name>:<object_class_name>:len<object>:{<key>;<val>....}
                length = parseInt(buf2);  // object name length
                var objectNameResult=read(buf.substr(1),length);
                var objectName=objectNameResult.result;
                buf=buf.substr(1+objectNameResult.length+2);
                var buf3Result=readUntil(buf,':'); //properties size
                var buf3=buf3Result.result;
                buf=buf3Result.buffer;

                var tmpResult=unserialize_object(buf,parseInt(buf3),objectName);
                buf=tmpResult.buffer;

                result={result:tmpResult.result,type:'object'};
                break;
            case 'c':     //c:len<class_name>:"<class_name>":len<val>:{<val>}
                length=parseInt(buf2); //class name length
                var className=buf.substr(1,length);
                buf=buf.substr(1+length+2);
                var valueLengthBuffer=readUntil(buf,':');
                var valueLength=parseInt(valueLengthBuffer.result);
                buf=valueLengthBuffer.buffer;
                var value=buf.substr(1,valueLength);
                buf=buf.substr(1+valueLength+1);
                result={result:value,type:'class'+className};
                break;
            case 'n':   //n;
                result={result:null,type:'null'};
                break;
            case 'b':   //b:<digit>;  digit is either 1 or 0
                result={result:buf2==="1", type:'boolean'};
                break;
            default:
                console.log(copy);
                throw new Error("unknown token:"+type);
                break;
        }
        return {result: result, buffer: buf};
    }
    function unserialize_object(string,size,namespace) {
        if (size===0) {
            return {result:{},buffer:string.substr(2)};
        }
        var buf = string.substr(1);
        var result=new Class(namespace);
        for (var i = 0; i < size; i++) {
            var keyResult = unserialize_item(buf);

            var key=keyResult.result.result;
            if (keyResult.result.scope==="private") {
                key=key.substr(namespace.length);
            }
            buf=keyResult.buffer;
            var valResult = unserialize_item(buf);
            var val=valResult.result;
            buf=valResult.buffer;
            result.__addAttr__(key,keyResult.result.type,val.result,val.type,keyResult.result.scope);
        }
        buf=buf.substr(1);
        return {result:result,buffer:buf};
    }
    function unserialize_array(string, size) {
        if (size===0) {
            return {result:{},buffer:string.substr(2)};
        }
        var buf = string.substr(1);
        var result=new Class("");
        for (var i = 0; i < size; i++) {
            var keyResult = unserialize_item(buf);
            var key=keyResult.result.result;
            buf=keyResult.buffer;
            var valResult = unserialize_item(buf);
            var val=valResult.result;
            buf=valResult.buffer;
            result.__addAttr__(key,keyResult.result.type,val.result,val.type);
        }
        buf=buf.substr(1);
        return {result:result,buffer:buf};
    }
    function unserialize(body) {
        return unserialize_item(body).result.result;
    }

    ///serialize;

    function lenString(string) {
        var length=0;
        for (var i=0;i<string.length;i++,length++) {
            var c=string.charCodeAt(i);
            if (c>255) {
                length+=2;
            }
        }
        return length;
    }

    function serialize_item(body,type,namespace) {
        switch (type) {
            case "string":
                return util.format("s:%d:\"%s\";",lenString(body.toString()),body.toString());
            case "integer":
                return util.format("i:%d;",parseInt(body));
            case "float":
                return util.format("d:%s;",body.toString());
            case "resource":
                return util.format("r:%d;",parseInt(body));
            case "boolean":
                return util.format("b:%d;",body===true?1:0);
            case "null":
                return "N;";
            case "array":
                var buf="";
                var count=0;
                for (k in body.__attr__) {

                    if (k==undefined) continue;
                    buf+=serialize_item(k,body.__keyTypeOf__(k));
                    buf+=serialize_item(body[k],body.__typeOf__(k));
                    count++;
                }
                return util.format("a:%d:{%s}",count,buf);
            case "object":
                var buf="";
                var count=0;
                for (k in body.__attr__) {
                    if (k==undefined) continue;
                    var key=k;
                    switch (body.__scopeOf__(k)) {
                        case "private":
                            key=String.fromCharCode(0)+body.__name__+String.fromCharCode(0)+key;
                            break;
                        case "protected":
                            key=String.fromCharCode(0)+"*"+String.fromCharCode(0)+key;
                            break;
                    }

                    buf+=serialize_item(key,body.__keyTypeOf__(k));
                    buf+=serialize_item(body[k],body.__typeOf__(k));
                    count++;
                }
                return util.format("O:%d:\"%s\":%d:{%s}",lenString(body.__name__),body.__name__,count,buf);
            default:
                if (type.substr(0,5)=="class") {
                    return util.format("C:%d:\"%s\":%d:{%s}",lenString(type)-5,type.substr(5),lenString(body),body);
                }
                throw new Error("Unknown type:"+type);
                break;
        }
    }

    function serialize(body,type) {
        return serialize_item(body,type);
    }
})((typeof window === 'undefined') ? global : window, (typeof window === 'undefined') ? exports : (window.PhpSerialization= {}));
