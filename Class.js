(function(window, exports) {
    exports.Class=Class;
    function Class(name) {
        this.__name__=name;
        this.__attr__={};
    }
    Class.prototype.__has__=function(k) {
        return (k in this.__attr__);
    }
    Class.prototype.__addAttr__=function(name,kType,val,type,scope,getter,setter) {
        var _getter=getter;
        var _setter=setter;
        if (scope==undefined) {
            scope="public";
        }
        if (_getter==undefined) {
            _getter=function() {
                return val;
            }
        }
        if (_setter==undefined) {
            _setter=function(v) {
                val=v;
            }
        }
        this.__attr__[name]={val:val,type:type,scope:scope,get:_getter,set:_setter,kType:kType}
        Object.defineProperty(this,name,{
            get:function() {
                return this.__attr__[name].get();
            },
            set:function(v) {
                this.__attr__[name].set(v);
            }
        });
    }
    Class.prototype.__typeOf__=function(name) {
        return this.__attr__[name].type;
    }
    Class.prototype.__keyTypeOf__=function(name) {
        return this.__attr__[name].kType;
    }
    Class.prototype.__scopeOf__=function(name) {
        return this.__attr__[name].scope;
    }
    Class.prototype.toString=function() {
        var result=this.__name__+":Class";
        for (k in this.__attr__) {
            var attr=this.__attr__[k]
            var val=attr.constructor;
            result+=k+"-";
            result+=attr.scope+":";
            result+=val.__type__.toString();
            result+=val.get().toString();
        }
        return result;
    }
    
})((typeof window === 'undefined') ? global : window, (typeof window === 'undefined') ? exports : (window.Class = {}));
