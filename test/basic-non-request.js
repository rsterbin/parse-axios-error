const chai = require('chai');
const axios = require('axios');

const { parseAxiosError, parseAxiosResponseForError } = require('../index.js');

describe('Basic: non-request errors', () => {

  it('should parse correctly with a non-object', function () {
    const toTest = 'error';
    const res = parseAxiosError(toTest);
    const exp = {
      ok: false,
      code: 'NON_AXIOS_ERROR',
      message: null,
      context: {
        code: null,
        message: null,
        status: null,
        request_url: null,
        request_data: null,
        response_data: null,
        error: toTest
      }
    };
    this.checkResponse(res, exp);
  });

  it('should parse correctly with an empy object', function () {
    const toTest = {};
    const res = parseAxiosError(toTest);
    const exp = {
      ok: false,
      code: 'NON_AXIOS_ERROR',
      message: null,
      context: {
        code: null,
        message: null,
        status: null,
        request_url: null,
        request_data: null,
        response_data: null,
        error: toTest
      }
    };
    this.checkResponse(res, exp);
  });

  it('should parse correctly with an object that has error-like keys', function () {
    const toTest = { code: '12345', message: 'Not an axios error' };
    const res = parseAxiosError(toTest);
    const exp = {
      ok: false,
      code: 'NON_AXIOS_ERROR',
      message: 'Not an axios error',
      context: {
        code: '12345',
        message: 'Not an axios error',
        status: null,
        request_url: null,
        request_data: null,
        response_data: null,
        error: toTest
      }
    };
    this.checkResponse(res, exp);
  });

  it('should parse correctly with an Error object', function () {
    const toTest = new Error('Plain js error');
    const res = parseAxiosError(toTest);
    const exp = {
      ok: false,
      code: 'NON_AXIOS_ERROR',
      message: 'Plain js error',
      context: {
        code: null,
        message: 'Plain js error',
        status: null,
        request_url: null,
        request_data: null,
        response_data: null,
        error: toTest
      }
    };
    this.checkResponse(res, exp);
  });

  it('should parse correctly with a subclassed Error object', function () {
    class MyCustomError extends Error {
      constructor(code, message) { super(message); this.code = code; }
    }
    const toTest = new MyCustomError('MY_CUSTOM_ERROR', 'Custom error');
    const res = parseAxiosError(toTest);
    const exp = {
      ok: false,
      code: 'NON_AXIOS_ERROR',
      message: 'Custom error',
      context: {
        code: 'MY_CUSTOM_ERROR',
        message: 'Custom error',
        status: null,
        request_url: null,
        request_data: null,
        response_data: null,
        error: toTest
      }
    };
    this.checkResponse(res, exp);
  });

  it('should parse a simple axios error', function () {
    const toTest = new axios.AxiosError('an error message', 'ERR_INVALID_URL');
    const res = parseAxiosError(toTest);
    const exp = {
      ok: false,
      code: 'UNKNOWN',
      message: 'an error message',
      context: {
        code: 'ERR_INVALID_URL',
        message: 'an error message',
        status: null,
        request_url: null,
        request_data: null,
        response_data: null,
        error: toTest
      }
    };
    this.checkResponse(res, exp);
  });

});
