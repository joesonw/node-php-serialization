var expect = require("chai").expect;
var serialize = require("..").serialize;
var Class = require("../Class").Class;

function test_serialize(i) {
	var	obj = require("./tests/serialize."+i+".js").result;
	expect(obj).to.have.property(0);
	expect(obj[0]).to.be.a("number");
	expect(obj[0]).to.eql(42);
	expect(obj).to.have.property(1);
	expect(obj[1]).to.be.a("string");
	expect(obj[1]).to.eql("hello world");
	expect(obj).to.have.property(2);
	expect(obj[2]).to.eql(null);
	expect(obj).to.have.property("3");
	expect(obj["3"]).to.be.a("boolean");
	expect(obj["3"]).to.eql(true);
	expect(obj).to.have.property(4);
	expect(obj[4]).to.be.a("Object");
	expect(obj).to.have.property(5);
	expect(obj[5]).to.be.a("number");
	expect(obj[5]).to.eql(42.23);
	var str = require("./tests/unserialize."+i+".json").result;
	expect(serialize(obj,"array")).to.eql(str);
}

describe("serialize()",function() {
	it("should serialize test data set #0", function(done) {
		test_serialize(0);
		done();
	});
});
