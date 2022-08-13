const chai = require('chai');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const { parseAxiosError, parseAxiosResponseForError } = require('../index.js');

describe('Custom error parsing', () => {

  it('should use custom error data parsing', async function () {
    let toTest = null;
    const d = { metadata: { errCode: 3874, errMsg: 'No such bill could be found' }, bills: null };
    const o = {
      findErrorCode: (data, context) => data?.metadata?.errCode ? `ERR_${data.metadata.errCode}` : 'ERR_UNKNOWN_' + (context?.status || 'X'),
      findErrorMessage: (data, context) => data?.metadata?.errMsg ? data.metadata.errMsg : 'Unknown error',
      findErrorContext: (data, context) => { context.metadata = data?.metadata; return context; }
    };

    const a = axios.create();
    const m = new MockAdapter(a);
    m.onGet('/bills/1234').reply(404, d);

    let response = null;
    try {
      response = await a.get('/bills/1234');
    } catch (e) {
      toTest = e;
    }

    chai.expect(toTest).not.to.be.eql(null);
    const res = parseAxiosError(toTest, o);
    const exp = {
      ok: false,
      code: 'ERR_3874',
      message: 'No such bill could be found',
      context: {
        code: undefined,
        message: 'Request failed with status code 404',
        status: 404,
        request_url: '/bills/1234',
        request_data: null,
        response_data: d, 
        error: toTest,
        metadata: d.metadata
      }
    };
    this.checkResponse(res, exp, [ 'metadata' ]);
  });

  it('should use custom response data parsing', async function () {
    let toTest = null;
    const d = { metadata: { errCode: 6539, errMsg: 'No such picture could be found' }, bills: null };
    const o = {
      isReponseSuccess: (data, context) => typeof data?.metadata === 'object' && data?.metadata !== null && data.metadata.errCode === undefined,
      findErrorCode: (data, context) => data?.metadata?.errCode ? `ERR_${data.metadata.errCode}` : 'ERR_UNKNOWN_' + (context?.status || 'X'),
      findErrorMessage: (data, context) => data?.metadata?.errMsg ? data.metadata.errMsg : 'Unknown error',
      findErrorContext: (data, context) => { context.metadata = data?.metadata; return context; }
    };

    const a = axios.create();
    const m = new MockAdapter(a);
    m.onGet('/pics/kitten.jpg').reply(200, d);

    try {
      toTest = await a.get('/pics/kitten.jpg');
    } catch (e) {
      chai.expect(e).to.be.eql(undefined, 'Should not throw exception');
    }

    chai.expect(toTest).not.to.be.eql(null);
    const res = parseAxiosResponseForError(toTest, o);
    const exp = {
      ok: false,
      code: 'ERR_6539',
      message: 'No such picture could be found',
      context: {
        code: null,
        message: null,
        status: 200,
        request_url: '/pics/kitten.jpg',
        request_data: null,
        response_data: d, 
        error: toTest,
        metadata: d.metadata
      }
    };
    this.checkResponse(res, exp, [ 'metadata' ]);
  });

});
