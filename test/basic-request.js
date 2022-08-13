const chai = require('chai');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const { parseAxiosError, parseAxiosResponseForError } = require('../index.js');

describe('Basic: request errors', () => {

  it('should parse an axios error resulting from an actual bad call', async function () {
    let toTest = null;

    const a = axios.create();

    let response = null;
    try {
      response = await a.get('http://lksjdflkwehrlioaslndkfjnalskjg.lskd/not-real.html');
    } catch (e) {
      toTest = e;
    }

    chai.expect(toTest).not.to.be.eql(null);
    const res = parseAxiosError(toTest);
    const exp = {
      ok: false,
      code: 'NETWORK_FAILURE',
      message: 'getaddrinfo ENOTFOUND lksjdflkwehrlioaslndkfjnalskjg.lskd',
      context: {
        code: 'ENOTFOUND',
        message: 'getaddrinfo ENOTFOUND lksjdflkwehrlioaslndkfjnalskjg.lskd',
        status: null,
        request_url: null,
        request_data: null,
        response_data: null,
        error: toTest
      }
    };
    this.checkResponse(res, exp);
  });

  it('should parse an axios error resulting from some other failure', async function () {
    let toTest = null;

    const a = axios.create();
    const m = new MockAdapter(a);
    // NB: this is an axios error, but not a request-no-response error like the one we check for above
    m.onGet('/bad-call').networkError();

    let response = null;
    try {
      response = await a.get('/bad-call');
    } catch (e) {
      toTest = e;
    }

    chai.expect(toTest).not.to.be.eql(null);
    const res = parseAxiosError(toTest);
    const exp = {
      ok: false,
      code: 'UNKNOWN',
      message: 'Network Error',
      context: {
        code: undefined,
        message: 'Network Error',
        status: null,
        request_url: null,
        request_data: null,
        response_data: null,
        error: toTest
      }
    };
    this.checkResponse(res, exp);
  });

  it('should parse an axios error resulting from a non-200 status and no data', async function () {
    let toTest = null;

    const a = axios.create();
    const m = new MockAdapter(a);
    m.onGet('/non-200').reply(500);

    let response = null;
    try {
      response = await a.get('/non-200');
    } catch (e) {
      toTest = e;
    }

    chai.expect(toTest).not.to.be.eql(null);
    const res = parseAxiosError(toTest);
    const exp = {
      ok: false,
      code: 'HTTP_STATUS_500',
      message: 'Request failed with status code 500',
      context: {
        code: undefined,
        message: 'Request failed with status code 500',
        status: 500,
        request_url: '/non-200',
        request_data: null,
        response_data: null, 
        error: toTest
      }
    };
    this.checkResponse(res, exp);
  });

  it('should parse an axios error resulting from a non-200 status with data', async function () {
    let toTest = null;
    const d = { code: 'POST_NOT_FOUND', message: 'Post #1234 was not found' };

    const a = axios.create();
    const m = new MockAdapter(a);
    m.onGet('/posts/1234').reply(404, d);

    let response = null;
    try {
      response = await a.get('/posts/1234');
    } catch (e) {
      toTest = e;
    }

    chai.expect(toTest).not.to.be.eql(null);
    const res = parseAxiosError(toTest);
    const exp = {
      ok: false,
      code: 'POST_NOT_FOUND',
      message: 'Post #1234 was not found',
      context: {
        code: undefined,
        message: 'Request failed with status code 404',
        status: 404,
        request_url: '/posts/1234',
        request_data: null,
        response_data: d, 
        error: toTest
      }
    };
    this.checkResponse(res, exp);
  });

  it('should parse an axios error from a 200 status, if requested', async function () {
    let toTest = null;
    const d = { code: 'SUCCESS', user: { name: 'Testy McTest', email: 'testy@example.com' } };

    const a = axios.create();
    const m = new MockAdapter(a);
    m.onGet('/users/1234').reply(200, d);

    try {
      toTest = await a.get('/users/1234');
    } catch (e) {
      chai.expect(e).to.be.eql(undefined, 'Should not throw exception');
    }

    chai.expect(toTest).not.to.be.eql(null);
    const res = parseAxiosResponseForError(toTest);
    const exp = {
      ok: true,
      code: 'SUCCESS',
      message: null,
      context: {
        code: null,
        message: null,
        status: 200,
        request_url: '/users/1234',
        request_data: null,
        response_data: d,
        error: null
      }
    };
    this.checkResponse(res, exp);
  });


// TODO: error with baseURL
// TODO: response with baseURL

});
