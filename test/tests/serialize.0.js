(function(window, exports) {
	var Class=require("../../Class").Class;
	var result=new Class("");
	result.__addAttr__(0,"integer",42,"integer");
	result.__addAttr__(1,"integer","hello world","string");
	result.__addAttr__(2,"integer",null,"null");
	result.__addAttr__("3","string",true,"boolean");
	result.__addAttr__(4,"integer",new Class(""),"array");
	result.__addAttr__(5,"integer",42.23,"float");
	exports.result=result;

})((typeof window === 'undefined') ? global : window, (typeof window === 'undefined') ? exports : (window.result= {}));

