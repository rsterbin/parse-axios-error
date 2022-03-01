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
`code` | string | the error code (can be NON_AXIOS_ERROR, NETWORK_FAILURE, UNKNOWN, along with any other codes defined by your app)
`context` | object | contextual information about the request/response (see below)

### Context

key | type | description
-------------------------
`error` | Error | if code is NON_AXIOS_ERROR, the error found during processing
`message` | string | the error message Axios reported
`status` | int | the HTTP status, if present
`request_url` | string | the URL for the request
`request_data` | object | any json data passed in the request

## Options

key | type | default | description
----------------------------------
`throwOnNonAxios` | boolean | `false` | if it's a non-axios error, throw an exception (otherwise returns code NON_AXIOS_ERROR)
`isReponseError` | function | `(data) => data.ok` | if we have data from the server, return whether it's an error
`findErrorCode` | function | `(data) => data.code` | if we have data from the server, return an error code
`findErrorMessage` | function | `(data) => data.message` | if we have data from the server, return an error message
`findErrorContext` | function | `(data, context) => context` | if we have data from the server, take the json data and the context object we have so far and return a final version of the context object
`scrubRequestUrl` | function | `(url) => url` | scrub any private data from the request URL before returning as context
`scrubRequestData` | function | `(data) => data` | scrub any private data from the request data json before returning as context

