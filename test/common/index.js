const chai = require('chai');

exports = module.exports = {};
exports.mochaHooks = {

  beforeAll: function() {
    this.checkResponse = (res, exp, cust) => {
      chai.expect(typeof res).to.be.eql('object');
      chai.expect(res).not.to.be.eql(null);
      chai.expect(res).to.have.property('ok');
      chai.expect(res.ok).to.be.eql(exp.ok, 'res.ok');
      chai.expect(res).to.have.property('code');
      chai.expect(res.code).to.be.eql(exp.code, 'res.code');
      chai.expect(res).to.have.property('message');
      chai.expect(res.message).to.be.eql(exp.message, 'res.message');
      chai.expect(res).to.have.property('context');
      chai.expect(res.context).to.have.property('code');
      chai.expect(res.context.code).to.be.eql(exp.context.code, 'res.context.code');
      chai.expect(res.context).to.have.property('message');
      chai.expect(res.context.message).to.be.eql(exp.context.message, 'res.context.message');
      chai.expect(res.context).to.have.property('status');
      chai.expect(res.context.status).to.be.eql(exp.context.status, 'res.context.status');
      chai.expect(res.context).to.have.property('request_url');
      chai.expect(res.context.request_url).to.be.eql(exp.context.request_url, 'res.context.request_url');
      chai.expect(res.context).to.have.property('request_data');
      chai.expect(res.context.request_data).to.be.eql(exp.context.request_data, 'res.context.request_data');
      chai.expect(res.context).to.have.property('response_data');
      chai.expect(res.context.response_data).to.be.eql(exp.context.response_data, 'res.context.response_data');
      chai.expect(res.context).to.have.property('error');
      chai.expect(res.context.error).to.be.eql(exp.context.error, 'res.context.error');
      if (Array.isArray(cust)) {
        for (const k of cust) {
          chai.expect(res.context).to.have.property(k);
          chai.expect(res.context[k]).to.be.eql(exp.context[k], `res.context.${k}`);
        }
      }
    }
  },

};
