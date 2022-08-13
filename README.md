# parse-axios-error

Personal use function for parsing axios errors

## How to use

with promises:

```
  myAxios.get('/widgets/' + widgetId)
    .then((res) => {
      const err = parseAxiosResponseForError(res, myParseConfig);
      if (err.ok) {
        // do stuff on res
      } else {
        // do stuff on err (err.code contains the code, err.message contains the
        //   message, err.context contains context details)
      }
    })
    .catch((e) => {
      const err = parseAxiosError(e, parseConfig);
      // do stuff on err (err.code contains the code, err.message contains the
      //   message, err.context contains context details)
    })
```

with async/await:

```
  var res = null;
  var err = null;
  try {
    res = await myAxios.get('/widgets/' + widgetId);
    err = parseAxiosResponseForError(res, myParseConfig);
  } catch (e) {
    err = parseAxiosError(e, parseConfig);
  }
  if (err.ok) {
    // do stuff on res
  } else {
    // do stuff on err (err.code contains the code, err.message contains the
    //   message, err.context contains context details)
  }
```

## Return spec

key | type | description
-------------------------
`ok` | boolean | whether this is a success (true) or error (false)
`code` | string | the error code (can be NON_AXIOS_ERROR, HTTP_STATUS_*, NETWORK_FAILURE, UNKNOWN, or other codes as defined by your app)
`message` | string | the error message
`context` | object | contextual information about the request/response (see below)

### Context

If your application would benefit from further context, you can add it via the `findErrorContext` option.

key | type | description
-------------------------
`code` | string | the original error code, from Axios or elsewhere
`message` | string | the original error message, from Axios or elsewhere
`status` | int | the HTTP status, if present
`request_url` | string | the URL for the request
`request_data` | object | any json data passed in the request
`response_data` | object | any json data returned in the response
`error` | Error | the original error

## Options

key | type | default | description
----------------------------------
`throwOnNonAxios` | boolean | `false` | if it's a non-axios error, throw an exception (otherwise returns code NON_AXIOS_ERROR)
`isReponseSuccess` | function | `(data, context) => data?.ok === undefined ? context.status === 200 : data.ok` | if we have data from the server, return whether it's an error
`findErrorCode` | function | `(data, context) => data?.code || 'HTTP_STATUS_' + context.status` | if we have data from the server, return an error code
`findErrorMessage` | function | `(data, context) => data?.message || context.message` | if we have data from the server, return an error message
`findErrorContext` | function | `(data, context) => context` | if we have data from the server, take the json data and the context object we have so far and return a final version of the context object
`scrubRequestUrl` | function | `(url) => url` | scrub any private data from the request URL before returning for context
`scrubRequestData` | function | `(data) => data` | scrub any private data from the request data json before returning for context
`scrubResponseData` | function | `(data) => data` | scrub any private data from the response data json before returning for context

