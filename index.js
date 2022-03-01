import axios from 'axios';

// The structure of the parseAxiosError function is based on this excellent
// StackOverflow answer by Shubham Khatri: https://stackoverflow.com/a/44806462

const DefaultOptions = {
  throwOnNonAxios: false,
  isReponseSuccess: (data) => data.ok,
  findErrorCode: (data) => data.code,
  findErrorMessage: (data) => data.message,
  findErrorContext: (data, context) => context,
  scrubRequestUrl: (url) => url,
  scrubRequestData: (data) => data,
};

export const contextFromResponse = (response, opt = {}) => {
  const options = { ...DefaultOptions, opt };
  return = {
    status: response.status,
    message: null,
    request_url: options.scrubRequestUrl(response.config.baseURL + response.config.url),
    request_data: options.scrubRequestData(response.config.data)
  };
};

export const parseAxiosResponseForError = (response, opt = {}) => {

  const options = { ...DefaultOptions, opt };

  const context: {
    status: response.status,
    message: null,
    request_url: options.scrubRequestUrl(response.config.baseURL + response.config.url),
    request_data: options.scrubRequestData(response.config.data)
  };

  return {
    ok: options.isReponseSuccess(response.data),
    code: options.findErrorCode(response.data),
    message: options.findErrorMessage(response.data),
    context: options.findErrorContext(response.data, context)
  }
};

export default const parseAxiosError = (error, opt = {}) => {

  const options = { ...DefaultOptions, opt };

  if (!error.isAxiosError) {
    if (options.throwOnNonAxios) {
      throw error;
    } else {
      return {
        ok: false,
        code: 'NON_AXIOS_ERROR',
        message: error.message,
        context: { error: error },
      };
    }
  }

  let context = contextFromError(error, options);
  const info = error.toJSON();
  let context = {
    status: null,
    message: info.message,
    request_url: options.scrubRequestUrl(info.config.baseURL),
    request_data: options.scrubRequestData(info.config.data)
  };

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    context.status = error.response.status;
    context.request_url = config.request_url + options.scrubRequestUrl(error.response.config.url);
    return {
      ok: false,
      code: options.findErrorCode(error.response.data),
      message: options.findErrorMessage(error.response.data),
      context: options.findErrorContext(error.response.data, context)
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
      message: error.message,
      context: context
    };

  }
};

export default parseAxiosError;
