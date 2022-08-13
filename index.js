const axios = require('axios');

// The structure of the parseAxiosError function is based on this excellent
// StackOverflow answer by Shubham Khatri: https://stackoverflow.com/a/44806462

const DefaultOptions = {
  throwOnNonAxios: false,
  wrapResponse: false,
  isReponseSuccess: (data, context) => data?.ok === undefined ? context?.status === 200 : data.ok,
  findErrorCode: (data, context) => data?.code || 'HTTP_STATUS_' + (context?.status || 'UNKNOWN'),
  findErrorMessage: (data, context) => data?.message || context?.message || null,
  findErrorContext: (data, context) => context,
  scrubRequestUrl: (url) => url,
  scrubRequestData: (data) => data,
  scrubResponseData: (data) => data
};

const parseAxiosResponseForError = (response, opt = {}) => {

  const options = { ...DefaultOptions, ...opt };

  let url = null;
  if (response?.config?.url && response?.config?.baseURL) {
    url = response.config.baseURL + response.config.url;
  } else if (response?.config?.url) {
    url = response.config.url;
  } else if (response?.config?.baseURL) {
    url = response.config.baseURL;
  }

  let context = {
    status: response?.status || 200,
    code: null,
    message: null,
    request_url: options.scrubRequestUrl(url),
    request_data: options.scrubRequestData(response?.config?.data || null),
    response_data: options.scrubResponseData(response?.data || null),
  };

  const ok = options.isReponseSuccess(response?.data, context);
  context.error = ok ? null : response

  return {
    ok: ok,
    code: options.findErrorCode(response?.data, context),
    message: options.findErrorMessage(response?.data, context),
    context: options.findErrorContext(response?.data, context)
  }
};

const parseAxiosError = (error, opt = {}) => {

  const options = { ...DefaultOptions, ...opt };

  let context = {
    code: null,
    message: null,
    status: null,
    request_url: null,
    request_data: null,
    response_data: null,
    error: error
  };

  if (typeof error != 'object' || (error === null) || !error.isAxiosError) {
    if (options.throwOnNonAxios) {
      throw error;
    } else {
      let msg = null;
      if (error?.message !== undefined) {
        context.message = error.message;
        if (typeof error?.message === 'string' || error?.message?.toString) {
          msg = error.message;
        }
      }
      if (error?.code !== undefined) {
        context.code = error.code;
      }
      return {
        ok: false,
        code: 'NON_AXIOS_ERROR',
        message: msg,
        context: context,
      };
    }
  }

  const info = error.toJSON();
  context.code = info.code;
  context.message = info.message;
  if (info?.config?.baseURL !== undefined) {
    context.request_url = options.scrubRequestUrl(info.config.baseURL);
  }
  if (info?.config?.data !== undefined) {
    context.request_data = options.scrubRequestData(info.config.data);
  }

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    context.status = error.response.status;
    if (error.response?.config?.url !== undefined) {
      const resUrl = error.response.config.url;
      context.request_url = info?.config?.baseURL ? options.scrubRequestUrl(info.config.baseURL + resUrl) : options.scrubRequestUrl(resUrl);
    }
    if (error.response?.data !== undefined) {
      context.response_data = options.scrubResponseData(error.response.data);
    }
    return {
      ok: false,
      code: options.findErrorCode(context.response_data, context),
      message: options.findErrorMessage(context.response_data, context),
      context: options.findErrorContext(context.response_data, context)
    };

  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    return {
      ok: false,
      code: 'NETWORK_FAILURE',
      message: context.message,
      context: context
    };

  } else {
    // Something else happened in setting up the request that triggered an error
    return {
      ok: false,
      code: 'UNKNOWN',
      message: error?.message || null,
      context: context
    };

  }
};

module.exports = { parseAxiosError, parseAxiosResponseForError };

// Allow use of default import syntax in TypeScript
module.exports.default = parseAxiosError;
